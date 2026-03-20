"""
orchestrator.py — Coordinates the agent pipeline for a single workflow run.
NOTE: Agent functions are currently stubs — real implementation pending.
"""

import logging

from agents import (
    assignment_agent,
    decision_agent,
    escalation_agent,
    monitoring_agent,
    task_agent,
)
from db import db

logger = logging.getLogger("autoops.orchestrator")


async def run_workflow(workflow_id: str, transcript: str, title: str):
    """
    Full pipeline:
      1. Decision Agent   → extract decisions
      2. Task Agent       → generate tasks from decisions
      3. Assignment Agent → assign owners to tasks
      4. Save everything  → persist to DB
      5. Monitoring Agent → health check
      6. Escalation Agent → handle alerts
    """

    # Shortcut helper so every log line is clean
    async def log(agent, action, details=None):
        await db.add_audit_log(
            agent=agent,
            action=action,
            workflow_id=workflow_id,
            details=details or {},
        )

    try:
        # ── Step 1: Decision Extraction ───────────────────────────────────────
        await log("DecisionAgent", "STARTED", {"step": 1})

        decision_result = await decision_agent(transcript)
        decisions = decision_result.get("decisions", [])
        summary   = decision_result.get("summary", "")

        for dec in decisions:
            await db.save_decision(
                workflow_id=workflow_id,
                content=dec.get("content", ""),
                confidence=dec.get("confidence", 0.0),
                source=dec.get("source", ""),
            )

        await log("DecisionAgent", "COMPLETED", {
            "decisions_found": len(decisions),
            "summary": summary,
        })

        # ── Step 2: Task Generation ───────────────────────────────────────────
        await log("TaskAgent", "STARTED", {"step": 2, "input_decisions": len(decisions)})

        task_result = await task_agent(transcript, decisions)
        raw_tasks   = task_result.get("tasks", [])

        await log("TaskAgent", "COMPLETED", {"tasks_generated": len(raw_tasks)})

        # ── Step 3: Assignment ────────────────────────────────────────────────
        await log("AssignmentAgent", "STARTED", {"step": 3})

        assign_result = await assignment_agent(raw_tasks, transcript)
        assignments   = {
            a["task_title"]: a
            for a in assign_result.get("assignments", [])
        }

        await log("AssignmentAgent", "COMPLETED", {
            "assignments": len(assignments)
        })

        # ── Step 4: Persist Tasks ─────────────────────────────────────────────
        saved_tasks = []
        for t in raw_tasks:
            assignment  = assignments.get(t["title"], {})
            owner       = assignment.get("owner", "Unassigned")
            task_record = await db.create_task(
                workflow_id=workflow_id,
                title=t.get("title", ""),
                description=t.get("description", ""),
                owner=owner,
                priority=t.get("priority", "medium"),
                due_date=t.get("due_date"),
                metadata={
                    "estimated_hours":       t.get("estimated_hours"),
                    "dependencies":          t.get("dependencies", []),
                    "tags":                  t.get("tags", []),
                    "assignment_confidence": assignment.get("confidence", 0.0),
                    "assignment_reasoning":  assignment.get("reasoning", ""),
                },
            )
            saved_tasks.append(task_record)

        # ── Step 5: Monitoring ────────────────────────────────────────────────
        await log("MonitoringAgent", "STARTED", {"step": 5})

        monitor_result = await monitoring_agent(
            saved_tasks,
            {"title": title, "summary": summary, "workflow_id": workflow_id},
        )
        health = monitor_result.get("health", "green")
        alerts = monitor_result.get("alerts", [])

        await log("MonitoringAgent", "COMPLETED", {
            "health":       health,
            "alerts":       len(alerts),
            "progress_pct": monitor_result.get("overall_progress_pct", 0),
            "summary":      monitor_result.get("summary", ""),
        })

        # ── Step 6: Escalation ────────────────────────────────────────────────
        critical_alerts    = [
            a for a in alerts
            if a.get("severity") in ("high", "critical")
        ]
        escalation_result  = {
            "escalations":    [],
            "auto_resolved":  [],
            "requires_human": [],
        }

        if critical_alerts:
            await log("EscalationAgent", "STARTED", {
                "step": 6,
                "critical_alerts": len(critical_alerts),
            })
            escalation_result = await escalation_agent(
                critical_alerts, saved_tasks, workflow_id
            )
            await log("EscalationAgent", "COMPLETED", {
                "escalations":    len(escalation_result.get("escalations", [])),
                "requires_human": escalation_result.get("requires_human", []),
            })
        else:
            await log("EscalationAgent", "SKIPPED", {
                "reason": "No critical alerts"
            })

        # ── Finalise ──────────────────────────────────────────────────────────
        final_status = "completed" if health != "red" else "completed_with_issues"
        await db.update_workflow_status(workflow_id, final_status)
        await log("Orchestrator", "WORKFLOW_COMPLETE", {
            "status":      final_status,
            "health":      health,
            "tasks":       len(saved_tasks),
            "decisions":   len(decisions),
            "escalations": len(escalation_result.get("escalations", [])),
        })

        return {
            "workflow_id":    workflow_id,
            "status":         final_status,
            "health":         health,
            "summary":        summary,
            "decisions":      decisions,
            "tasks":          saved_tasks,
            "alerts":         alerts,
            "escalations":    escalation_result.get("escalations", []),
            "requires_human": escalation_result.get("requires_human", []),
            "monitor":        monitor_result,
        }

    except Exception as e:
        logger.exception(f"Workflow {workflow_id} failed: {e}")
        await db.update_workflow_status(workflow_id, "failed")
        await log("Orchestrator", "WORKFLOW_FAILED", {"error": str(e)})
        raise


async def run_monitoring_cycle():
    """
    Background task — runs every 5 minutes via APScheduler.
    Checks all active workflows and triggers monitoring + escalation.
    """
    workflows = await db.list_workflows()
    active    = [
        w for w in workflows
        if w.get("status") in ("running", "completed_with_issues")
    ]
    logger.info(f"Monitoring cycle: {len(active)} active workflows")

    for wf in active:
        wf_id = wf["id"]
        tasks = await db.get_tasks(wf_id)
        if not tasks:
            continue

        monitor_result = await monitoring_agent(
            tasks,
            {"title": wf.get("title", ""), "workflow_id": wf_id},
        )
        health = monitor_result.get("health", "green")
        alerts = monitor_result.get("alerts", [])

        await db.add_audit_log(
            agent="MonitoringAgent",
            action="CYCLE_CHECK",
            workflow_id=wf_id,
            details={"health": health, "alerts": len(alerts)},
        )

        critical = [
            a for a in alerts
            if a.get("severity") in ("high", "critical")
        ]
        if critical:
            esc = await escalation_agent(critical, tasks, wf_id)
            await db.add_audit_log(
                agent="EscalationAgent",
                action="CYCLE_ESCALATION",
                workflow_id=wf_id,
                details=esc,
            )