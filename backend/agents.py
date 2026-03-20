"""
agents.py — STUB VERSION
Agent logic is handled by a separate team member.
These stubs return realistic dummy data so the pipeline
and DB layer can be tested independently.
"""

import logging

logger = logging.getLogger("autoops.agents")


async def decision_agent(transcript: str) -> dict:
    """
    STUB — Real implementation pending.
    Will extract decisions from meeting transcript using LLM.
    """
    logger.info("[STUB] DecisionAgent called")
    return {
        "decisions": [
            {
                "content": "STUB: Decision extraction not yet implemented",
                "confidence": 0.0,
                "source": "stub",
                "speaker": "stub"
            }
        ],
        "summary": "STUB: Agent not yet configured. This is placeholder data."
    }


async def task_agent(transcript: str, decisions: list) -> dict:
    """
    STUB — Real implementation pending.
    Will generate actionable tasks from decisions using LLM.
    """
    logger.info("[STUB] TaskAgent called")
    return {
        "tasks": [
            {
                "title": "STUB: Task generation not yet implemented",
                "description": "This is a placeholder task created by the stub agent.",
                "priority": "medium",
                "estimated_hours": 0,
                "due_date": None,
                "dependencies": [],
                "tags": ["stub"]
            }
        ]
    }


async def assignment_agent(tasks: list, transcript: str) -> dict:
    """
    STUB — Real implementation pending.
    Will assign owners to tasks based on transcript context using LLM.
    """
    logger.info("[STUB] AssignmentAgent called")
    return {
        "assignments": [
            {
                "task_title": t.get("title", ""),
                "owner": "Unassigned",
                "reasoning": "STUB: Assignment agent not yet configured",
                "confidence": 0.0
            }
            for t in tasks
        ]
    }


async def monitoring_agent(tasks: list, workflow_metadata: dict) -> dict:
    """
    STUB — Real implementation pending.
    Will analyze task states and produce health report using LLM.
    """
    logger.info("[STUB] MonitoringAgent called")
    return {
        "health": "green",
        "overall_progress_pct": 0,
        "alerts": [],
        "recommendations": ["STUB: Monitoring agent not yet configured"],
        "summary": "STUB: No real monitoring performed yet."
    }


async def escalation_agent(alerts: list, tasks: list, workflow_id: str) -> dict:
    """
    STUB — Real implementation pending.
    Will handle critical alerts and produce escalation plans using LLM.
    """
    logger.info("[STUB] EscalationAgent called")
    return {
        "escalations": [],
        "auto_resolved": [],
        "requires_human": []
    }