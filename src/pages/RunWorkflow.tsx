import { useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Brain, Bot, UserCheck, Eye, Bell, Upload, Play, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentStep {
  id: string;
  name: string;
  icon: typeof Brain;
  description: string;
  logs: string[];
  status: "idle" | "running" | "completed";
}

const initialAgents: AgentStep[] = [
  { id: "decision", name: "Decision Agent", icon: Brain, description: "Extract decisions from transcript", logs: [], status: "idle" },
  { id: "task", name: "Task Agent", icon: Bot, description: "Create actionable tasks", logs: [], status: "idle" },
  { id: "assignment", name: "Assignment Agent", icon: UserCheck, description: "Assign owners to tasks", logs: [], status: "idle" },
  { id: "monitoring", name: "Monitoring Agent", icon: Eye, description: "Set up deadline tracking", logs: [], status: "idle" },
  { id: "escalation", name: "Escalation Agent", icon: Bell, description: "Configure escalation rules", logs: [], status: "idle" },
];

const agentLogs: Record<string, string[]> = {
  decision: ["Parsing transcript...", "Found 3 key decisions", "Identified action items with owners"],
  task: ["Creating task: 'Update API docs' — High Priority", "Creating task: 'Review PR #142' — Medium", "5 tasks created successfully"],
  assignment: ["Analyzing team availability...", "Matched tasks to expertise profiles", "4 team members assigned"],
  monitoring: ["Setting deadline alerts for 5 tasks", "Configured 48-hour warning threshold", "Monitoring active"],
  escalation: ["Checking for overdue items...", "1 task approaching deadline", "Escalation rule configured for manager"],
};

const sampleTranscript = `Meeting: Q4 Sprint Planning — Oct 15, 2025

Sarah: We need the API documentation updated by end of week. Mark, can you handle that?
Mark: Sure, I'll prioritize it. High priority.
Sarah: Also, PR #142 needs a review before we merge. Lisa, are you available?
Lisa: Yes, I can review it by tomorrow. Medium priority.
Sarah: Great. And Jake, please set up the staging deployment pipeline by Friday.
Jake: On it. I'll need access to the CI/CD config.
Sarah: Let's also plan the user research sessions. Lisa, can you coordinate with the UX team?
Lisa: I'll schedule it for next week.
Sarah: One more thing — we need to migrate the database schema. Mark, work with Jake on that. Deadline is next Wednesday.`;

export default function RunWorkflow() {
  const [transcript, setTranscript] = useState(sampleTranscript);
  const [agents, setAgents] = useState<AgentStep[]>(initialAgents);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const runWorkflow = useCallback(async () => {
    if (isRunning || !transcript.trim()) return;
    setIsRunning(true);
    setAgents(initialAgents);

    for (let i = 0; i < initialAgents.length; i++) {
      setCurrentStep(i);
      setAgents(prev => prev.map((a, idx) => idx === i ? { ...a, status: "running" } : a));

      // Simulate log entries appearing
      const logs = agentLogs[initialAgents[i].id];
      for (let j = 0; j < logs.length; j++) {
        await new Promise(r => setTimeout(r, 600));
        setAgents(prev => prev.map((a, idx) =>
          idx === i ? { ...a, logs: [...a.logs, logs[j]] } : a
        ));
      }

      await new Promise(r => setTimeout(r, 400));
      setAgents(prev => prev.map((a, idx) => idx === i ? { ...a, status: "completed" } : a));
    }

    setCurrentStep(initialAgents.length);
    setIsRunning(false);
  }, [isRunning, transcript]);

  return (
    <AppLayout title="Run Workflow">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Input Panel */}
        <div className="jarvis-card p-6" style={{ animation: "float-up 0.5s ease-out forwards", opacity: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Meeting Transcript</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Upload className="w-3.5 h-3.5" />
              <span>Paste or upload transcript</span>
            </div>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full h-40 bg-secondary/30 border border-border/50 rounded-lg p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
            placeholder="Paste meeting transcript here..."
          />
          <div className="mt-4 flex justify-end">
            <Button
              onClick={runWorkflow}
              disabled={isRunning || !transcript.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 gap-2"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isRunning ? "Running..." : "Run Autonomous Workflow"}
            </Button>
          </div>
        </div>

        {/* Agent Pipeline */}
        <div className="jarvis-card p-6" style={{ animation: "float-up 0.5s ease-out 0.15s forwards", opacity: 0 }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Agent Execution Pipeline</h2>

          <div className="space-y-3">
            {agents.map((agent, i) => (
              <div
                key={agent.id}
                className={`rounded-xl border p-4 transition-all duration-500 ${
                  agent.status === "running"
                    ? "border-primary/40 bg-primary/5 animate-agent-pulse"
                    : agent.status === "completed"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-border/30 bg-secondary/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                      agent.status === "running"
                        ? "bg-primary/20"
                        : agent.status === "completed"
                        ? "bg-emerald-500/20"
                        : "bg-secondary/50"
                    }`}>
                      <agent.icon className={`w-5 h-5 transition-colors duration-300 ${
                        agent.status === "running"
                          ? "text-primary"
                          : agent.status === "completed"
                          ? "text-emerald-400"
                          : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>
                  <div>
                    {agent.status === "running" && <span className="jarvis-badge-running">Running</span>}
                    {agent.status === "completed" && (
                      <span className="jarvis-badge-completed flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                    {agent.status === "idle" && <span className="jarvis-badge-pending">Waiting</span>}
                  </div>
                </div>

                {agent.logs.length > 0 && (
                  <div className="mt-3 pl-13 space-y-1">
                    {agent.logs.map((log, j) => (
                      <p
                        key={j}
                        className="text-xs text-muted-foreground font-mono pl-[52px]"
                        style={{ animation: "float-up 0.3s ease-out forwards" }}
                      >
                        → {log}
                      </p>
                    ))}
                  </div>
                )}

                {/* Connector line */}
                {i < agents.length - 1 && (
                  <div className="flex justify-center mt-3">
                    <div className={`w-px h-4 transition-colors duration-500 ${
                      agent.status === "completed" ? "bg-emerald-500/40" : "bg-border/30"
                    }`} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {currentStep >= initialAgents.length && (
            <div className="mt-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center"
              style={{ animation: "float-up 0.5s ease-out forwards" }}
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-emerald-400">Workflow Complete</p>
              <p className="text-xs text-muted-foreground mt-1">All agents have finished processing. Tasks are ready for review.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
