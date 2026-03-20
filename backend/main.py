"""
main.py — AutoOps FastAPI server
"""

import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from db import db, flush_sync_queue, init_sqlite
from orchestrator import run_monitoring_cycle, run_workflow

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s"
)
logger = logging.getLogger("autoops.api")

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ───────────────────────────────────────────────────────────────
    await init_sqlite()
    logger.info("SQLite initialised")

    # Sync flush every 30 seconds
    scheduler.add_job(
        flush_sync_queue,
        "interval",
        seconds=30,
        id="sync_flush"
    )

    # Monitoring cycle every 5 minutes
    scheduler.add_job(
        run_monitoring_cycle,
        "interval",
        minutes=5,
        id="monitoring_cycle"
    )

    scheduler.start()
    logger.info("Scheduler started — sync=30s, monitor=5min")

    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    scheduler.shutdown(wait=False)


app = FastAPI(
    title="AutoOps API",
    description="Autonomous Meeting-to-Execution Engine — Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Request schemas
# ─────────────────────────────────────────────────────────────────────────────
class RunWorkflowRequest(BaseModel):
    title:      str
    transcript: str
    metadata:   dict = {}


class UpdateTaskRequest(BaseModel):
    status:   str = None
    owner:    str = None
    priority: str = None
    due_date: str = None


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    sync = await db.get_sync_status()
    return {"status": "ok", "db_sync": sync}


@app.post("/run-workflow")
async def api_run_workflow(
    req: RunWorkflowRequest,
    background_tasks: BackgroundTasks
):
    """
    Creates a workflow record immediately and kicks off the
    agent pipeline in the background. Returns workflow_id
    right away so the frontend can start polling.
    """
    wf = await db.create_workflow(
        title=req.title,
        transcript=req.transcript,
        metadata=req.metadata,
    )
    background_tasks.add_task(
        _run_and_catch,
        wf["id"],
        req.transcript,
        req.title,
    )
    return {
        "workflow_id": wf["id"],
        "status":      "running",
        "message":     "Pipeline started"
    }


async def _run_and_catch(workflow_id: str, transcript: str, title: str):
    """Wrapper so background task errors are logged cleanly."""
    try:
        await run_workflow(workflow_id, transcript, title)
    except Exception as e:
        logger.error(f"Pipeline error for {workflow_id}: {e}")


@app.get("/workflows")
async def list_workflows():
    workflows = await db.list_workflows()
    return {"workflows": workflows, "count": len(workflows)}


@app.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    wf = await db.get_workflow(workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf


@app.get("/workflows/{workflow_id}/tasks")
async def get_tasks(workflow_id: str):
    tasks = await db.get_tasks(workflow_id)
    return {"tasks": tasks, "count": len(tasks)}


@app.get("/workflows/{workflow_id}/audit")
async def get_audit(workflow_id: str):
    logs = await db.get_audit_logs(workflow_id)
    return {"logs": logs, "count": len(logs)}


@app.get("/workflows/{workflow_id}/decisions")
async def get_decisions(workflow_id: str):
    decisions = await db.get_decisions(workflow_id)
    return {"decisions": decisions, "count": len(decisions)}


@app.get("/tasks")
async def list_all_tasks():
    """Flat list of all tasks across all workflows."""
    workflows = await db.list_workflows()
    all_tasks = []
    for wf in workflows:
        tasks = await db.get_tasks(wf["id"])
        all_tasks.extend(tasks)
    return {"tasks": all_tasks, "count": len(all_tasks)}


@app.patch("/tasks/{task_id}")
async def update_task(task_id: str, req: UpdateTaskRequest):
    updates = req.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.update_task(task_id, **updates)
    return {"task_id": task_id, "updated": updates}


@app.get("/sync/status")
async def sync_status():
    return await db.get_sync_status()


@app.post("/sync/flush")
async def sync_flush():
    await flush_sync_queue()
    status = await db.get_sync_status()
    return {"message": "Sync flush triggered", "status": status}

class CreateTaskRequest(BaseModel):
    workflow_id: str
    title:       str
    description: str = ""
    owner:       str = ""
    priority:    str = "medium"
    due_date:    str = None
    metadata:    dict = {}


@app.post("/tasks")
async def create_task(req: CreateTaskRequest):
    task = await db.create_task(
        workflow_id=req.workflow_id,
        title=req.title,
        description=req.description,
        owner=req.owner,
        priority=req.priority,
        due_date=req.due_date,
        metadata=req.metadata,
    )
    return task

