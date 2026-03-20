"""
db.py — Dual-database layer
Primary: Supabase (PostgreSQL via REST)
Fallback: SQLite (aiosqlite)
Sync: Auto-reconcile SQLite → Supabase when Supabase comes back online
"""

import json
import logging
import os
import time
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

import aiosqlite
import httpx
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("autoops.db")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
SQLITE_PATH = os.getenv("SQLITE_PATH", "autoops_fallback.db")

# ─────────────────────────────────────────────────────────────────────────────
# Health tracking
# ─────────────────────────────────────────────────────────────────────────────
_supabase_online: bool = False
_last_health_check: float = 0.0
HEALTH_CHECK_INTERVAL = 15  # seconds


async def check_supabase_health() -> bool:
    global _supabase_online, _last_health_check
    now = time.time()
    if now - _last_health_check < HEALTH_CHECK_INTERVAL:
        return _supabase_online

    _last_health_check = now

    if not SUPABASE_URL or not SUPABASE_KEY:
        _supabase_online = False
        return False

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(
                f"{SUPABASE_URL}/rest/v1/workflows?select=id&limit=1",
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}"
                },
            )
            _supabase_online = r.status_code < 500
    except Exception:
        _supabase_online = False

    logger.info(f"Supabase health: {'ONLINE' if _supabase_online else 'OFFLINE'}")
    return _supabase_online


def is_supabase_online() -> bool:
    return _supabase_online


# ─────────────────────────────────────────────────────────────────────────────
# SQLite table definitions
# ─────────────────────────────────────────────────────────────────────────────
CREATE_TABLES = """
CREATE TABLE IF NOT EXISTS workflows (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    transcript  TEXT,
    status      TEXT DEFAULT 'pending',
    metadata    TEXT DEFAULT '{}',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    synced      INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    title       TEXT NOT NULL,
    description TEXT,
    owner       TEXT,
    priority    TEXT DEFAULT 'medium',
    status      TEXT DEFAULT 'pending',
    due_date    TEXT,
    metadata    TEXT DEFAULT '{}',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    synced      INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          TEXT PRIMARY KEY,
    workflow_id TEXT,
    task_id     TEXT,
    agent       TEXT NOT NULL,
    action      TEXT NOT NULL,
    details     TEXT DEFAULT '{}',
    created_at  TEXT NOT NULL,
    synced      INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS decisions (
    id          TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    content     TEXT NOT NULL,
    confidence  REAL DEFAULT 0.0,
    source      TEXT,
    created_at  TEXT NOT NULL,
    synced      INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sync_queue (
    id          TEXT PRIMARY KEY,
    table_name  TEXT NOT NULL,
    record_id   TEXT NOT NULL,
    operation   TEXT NOT NULL,
    payload     TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    attempts    INTEGER DEFAULT 0,
    last_error  TEXT
);
"""


async def init_sqlite():
    async with aiosqlite.connect(SQLITE_PATH) as db:
        await db.executescript(CREATE_TABLES)
        await db.commit()
    logger.info(f"SQLite initialised at {SQLITE_PATH}")


# ─────────────────────────────────────────────────────────────────────────────
# Supabase REST helpers
# ─────────────────────────────────────────────────────────────────────────────
def _sb_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


async def _sb_upsert(table: str, payload: dict) -> bool:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                f"{SUPABASE_URL}/rest/v1/{table}",
                headers={
                    **_sb_headers(),
                    "Prefer": "resolution=merge-duplicates,return=representation"
                },
                json=payload,
            )
            return r.status_code in (200, 201)
    except Exception as e:
        logger.error(f"Supabase upsert error on {table}: {e}")
        return False


async def _sb_select(table: str, filters: dict = None, limit: int = 100) -> Optional[list]:
    try:
        params = {"limit": limit, "select": "*"}
        if filters:
            for k, v in filters.items():
                params[k] = f"eq.{v}"
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"{SUPABASE_URL}/rest/v1/{table}",
                headers=_sb_headers(),
                params=params,
            )
            if r.status_code == 200:
                return r.json()
    except Exception as e:
        logger.error(f"Supabase select error on {table}: {e}")
    return None


async def _sb_update(table: str, record_id: str, payload: dict) -> bool:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.patch(
                f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{record_id}",
                headers=_sb_headers(),
                json=payload,
            )
            return r.status_code in (200, 204)
    except Exception as e:
        logger.error(f"Supabase update error: {e}")
        return False


# ─────────────────────────────────────────────────────────────────────────────
# Sync queue helpers
# ─────────────────────────────────────────────────────────────────────────────
async def _enqueue_sync(table: str, record_id: str, operation: str, payload: dict):
    entry_id = str(uuid4())
    now = _now()
    async with aiosqlite.connect(SQLITE_PATH) as db:
        await db.execute(
            """INSERT OR REPLACE INTO sync_queue
               (id, table_name, record_id, operation, payload, created_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (entry_id, table, record_id, operation, json.dumps(payload), now),
        )
        await db.commit()


async def flush_sync_queue():
    online = await check_supabase_health()
    if not online:
        return

    async with aiosqlite.connect(SQLITE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT 100"
        )
        rows = await cursor.fetchall()

    if not rows:
        return

    logger.info(f"Flushing {len(rows)} queued sync operations to Supabase...")

    for row in rows:
        payload  = json.loads(row["payload"])
        op       = row["operation"]
        table    = row["table_name"]
        record_id = row["record_id"]

        ok = False
        if op in ("INSERT", "UPSERT"):
            ok = await _sb_upsert(table, payload)
        elif op == "UPDATE":
            ok = await _sb_update(table, record_id, payload)

        if ok:
            async with aiosqlite.connect(SQLITE_PATH) as db:
                await db.execute(
                    f"UPDATE {table} SET synced=1 WHERE id=?", (record_id,)
                )
                await db.execute(
                    "DELETE FROM sync_queue WHERE id=?", (row["id"],)
                )
                await db.commit()
        else:
            async with aiosqlite.connect(SQLITE_PATH) as db:
                await db.execute(
                    """UPDATE sync_queue
                       SET attempts = attempts + 1,
                           last_error = 'upsert_failed'
                       WHERE id = ?""",
                    (row["id"],),
                )
                await db.commit()

    logger.info("Sync flush complete.")


# ─────────────────────────────────────────────────────────────────────────────
# Utility
# ─────────────────────────────────────────────────────────────────────────────
def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ─────────────────────────────────────────────────────────────────────────────
# DB class — unified interface for the rest of the app
# ─────────────────────────────────────────────────────────────────────────────
class DB:

    # ── WORKFLOWS ──────────────────────────────────────────────────────────────
    async def create_workflow(
        self,
        title: str,
        transcript: str,
        metadata: dict = None
    ) -> dict:
        wf = {
            "id":         str(uuid4()),
            "title":      title,
            "transcript": transcript,
            "status":     "running",
            "metadata":   json.dumps(metadata or {}),
            "created_at": _now(),
            "updated_at": _now(),
            "synced":     0,
        }

        # Always write to SQLite first
        async with aiosqlite.connect(SQLITE_PATH) as db:
            await db.execute(
                """INSERT INTO workflows
                   (id, title, transcript, status, metadata,
                    created_at, updated_at, synced)
                   VALUES (:id, :title, :transcript, :status, :metadata,
                           :created_at, :updated_at, :synced)""",
                wf,
            )
            await db.commit()

        # Then try Supabase
        online = await check_supabase_health()
        sb_payload = {**wf, "metadata": metadata or {}}
        if online:
            ok = await _sb_upsert("workflows", sb_payload)
            if ok:
                async with aiosqlite.connect(SQLITE_PATH) as db:
                    await db.execute(
                        "UPDATE workflows SET synced=1 WHERE id=?", (wf["id"],)
                    )
                    await db.commit()
        else:
            await _enqueue_sync("workflows", wf["id"], "UPSERT", sb_payload)

        wf["metadata"] = metadata or {}
        return wf

    async def update_workflow_status(self, workflow_id: str, status: str):
        now = _now()
        async with aiosqlite.connect(SQLITE_PATH) as db:
            await db.execute(
                "UPDATE workflows SET status=?, updated_at=?, synced=0 WHERE id=?",
                (status, now, workflow_id),
            )
            await db.commit()

        payload = {"status": status, "updated_at": now}
        online = await check_supabase_health()
        if online:
            await _sb_update("workflows", workflow_id, payload)
        else:
            await _enqueue_sync("workflows", workflow_id, "UPDATE", payload)

    async def get_workflow(self, workflow_id: str) -> Optional[dict]:
        online = await check_supabase_health()
        if online:
            rows = await _sb_select("workflows", {"id": workflow_id}, limit=1)
            if rows:
                return rows[0]

        async with aiosqlite.connect(SQLITE_PATH) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute(
                "SELECT * FROM workflows WHERE id=?", (workflow_id,)
            )
            row = await cur.fetchone()
            if row:
                d = dict(row)
                d["metadata"] = json.loads(d.get("metadata") or "{}")
                return d
        return None

    async def list_workflows(self, limit: int = 50) -> list:
        online = await check_supabase_health()
        if online:
            rows = await _sb_select("workflows", limit=limit)
            if rows is not None:
                return rows

        async with aiosqlite.connect(SQLITE_PATH) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute(
                "SELECT * FROM workflows ORDER BY created_at DESC LIMIT ?",
                (limit,)
            )
            rows = await cur.fetchall()
            result = []
            for r in rows:
                d = dict(r)
                d["metadata"] = json.loads(d.get("metadata") or "{}")
                result.append(d)
            return result

    # ── TASKS ──────────────────────────────────────────────────────────────────
    async def create_task(
        self,
        workflow_id: str,
        title: str,
        description: str = "",
        owner: str = "",
        priority: str = "medium",
        due_date: str = None,
        metadata: dict = None
    ) -> dict:
        task = {
            "id":          str(uuid4()),
            "workflow_id": workflow_id,
            "title":       title,
            "description": description,
            "owner":       owner,
            "priority":    priority,
            "status":      "pending",
            "due_date":    due_date or "",
            "metadata":    json.dumps(metadata or {}),
            "created_at":  _now(),
            "updated_at":  _now(),
            "synced":      0,
        }

        async with aiosqlite.connect(SQLITE_PATH) as db:
            await db.execute(
                """INSERT INTO tasks
                   (id, workflow_id, title, description, owner, priority,
                    status, due_date, metadata, created_at, updated_at, synced)
                   VALUES (:id, :workflow_id, :title, :description, :owner,
                           :priority, :status, :due_date, :metadata,
                           :created_at, :updated_at, :synced)""",
                task,
            )
            await db.commit()

        online = await check_supabase_health()
        sb_payload = {**task, "metadata": metadata or {}}
        if online:
            await _sb_upsert("tasks", sb_payload)
        else:
            await _enqueue_sync("tasks", task["id"], "UPSERT", sb_payload)

        task["metadata"] = metadata or {}
        return task

    async def update_task(self, task_id: str, **kwargs):
        kwargs["updated_at"] = _now()
        kwargs["synced"]     = 0

        set_clause = ", ".join(f"{k}=?" for k in kwargs)
        vals = list(kwargs.values()) + [task_id]

        async with aiosqlite.connect(SQLITE_PATH) as db:
            await db.execute(
                f"UPDATE tasks SET {set_clause} WHERE id=?", vals
            )
            await db.commit()

        sb_payload = {k: v for k, v in kwargs.items() if k != "synced"}
        online = await check_supabase_health()
        if online:
            await _sb_update("tasks", task_id, sb_payload)
        else:
            await _enqueue_sync("tasks", task_id, "UPDATE", sb_payload)

    async def get_tasks(self, workflow_id: str) -> list:
        online = await check_supabase_health()
        if online:
            rows = await _sb_select("tasks", {"workflow_id": workflow_id})
            if rows is not None:
                return rows

        async with aiosqlite.connect(SQLITE_PATH) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute(
                "SELECT * FROM tasks WHERE workflow_id=? ORDER BY created_at",
                (workflow_id,)
            )
            rows = await cur.fetchall()
            result = []
            for r in rows:
                d = dict(r)
                d["metadata"] = json.loads(d.get("metadata") or "{}")
                result.append(d)
            return result

    # ── AUDIT LOGS ─────────────────────────────────────────────────────────────
    async def add_audit_log(
        self,
        agent: str,
        action: str,
        workflow_id: str = None,
        task_id: str = None,
        details: dict = None
    ) -> dict:
        log = {
            "id":          str(uuid4()),
            "workflow_id": workflow_id or "",
            "task_id":     task_id or "",
            "agent":       agent,
            "action":      action,
            "details":     json.dumps(details or {}),
            "created_at":  _now(),
            "synced":      0,
        }

        async with aiosqlite.connect(SQLITE_PATH) as db:
            await db.execute(
                """INSERT INTO audit_logs
                   (id, workflow_id, task_id, agent, action,
                    details, created_at, synced)
                   VALUES (:id, :workflow_id, :task_id, :agent, :action,
                           :details, :created_at, :synced)""",
                log,
            )
            await db.commit()

        online = await check_supabase_health()
        sb_payload = {**log, "details": details or {}}
        if online:
            await _sb_upsert("audit_logs", sb_payload)
        else:
            await _enqueue_sync("audit_logs", log["id"], "UPSERT", sb_payload)

        log["details"] = details or {}
        return log

    async def get_audit_logs(self, workflow_id: str) -> list:
        online = await check_supabase_health()
        if online:
            rows = await _sb_select("audit_logs", {"workflow_id": workflow_id})
            if rows is not None:
                return rows

        async with aiosqlite.connect(SQLITE_PATH) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute(
                "SELECT * FROM audit_logs WHERE workflow_id=? ORDER BY created_at",
                (workflow_id,)
            )
            rows = await cur.fetchall()
            result = []
            for r in rows:
                d = dict(r)
                d["details"] = json.loads(d.get("details") or "{}")
                result.append(d)
            return result

    # ── DECISIONS ──────────────────────────────────────────────────────────────
    async def save_decision(
        self,
        workflow_id: str,
        content: str,
        confidence: float = 0.0,
        source: str = ""
    ) -> dict:
        dec = {
            "id":          str(uuid4()),
            "workflow_id": workflow_id,
            "content":     content,
            "confidence":  confidence,
            "source":      source,
            "created_at":  _now(),
            "synced":      0,
        }

        async with aiosqlite.connect(SQLITE_PATH) as db:
            await db.execute(
                """INSERT INTO decisions
                   (id, workflow_id, content, confidence, source, created_at, synced)
                   VALUES (:id, :workflow_id, :content, :confidence,
                           :source, :created_at, :synced)""",
                dec,
            )
            await db.commit()

        online = await check_supabase_health()
        if online:
            await _sb_upsert("decisions", dec)
        else:
            await _enqueue_sync("decisions", dec["id"], "UPSERT", dec)

        return dec

    async def get_decisions(self, workflow_id: str) -> list:
        online = await check_supabase_health()
        if online:
            rows = await _sb_select("decisions", {"workflow_id": workflow_id})
            if rows is not None:
                return rows

        async with aiosqlite.connect(SQLITE_PATH) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute(
                "SELECT * FROM decisions WHERE workflow_id=? ORDER BY created_at",
                (workflow_id,)
            )
            rows = await cur.fetchall()
            return [dict(r) for r in rows]

    # ── SYNC STATUS ────────────────────────────────────────────────────────────
    async def get_sync_status(self) -> dict:
        online = await check_supabase_health()
        async with aiosqlite.connect(SQLITE_PATH) as db:
            cur = await db.execute("SELECT COUNT(*) FROM sync_queue")
            (pending,) = await cur.fetchone()
        return {
            "supabase_online":   online,
            "pending_sync_ops":  pending,
            "sqlite_path":       SQLITE_PATH,
            "last_health_check": _last_health_check,
        }


# Singleton instance — import this everywhere
db = DB()