import { AppLayout } from "@/components/layout/AppLayout";
import { Brain, Bot, UserCheck, Eye, Bell } from "lucide-react";

const timeline = [
  { time: "10:32 AM", agent: "Decision Agent", action: "Extracted 3 decisions from Q4 Planning transcript", icon: Brain, color: "bg-primary/20 text-primary" },
  { time: "10:33 AM", agent: "Task Agent", action: "Created 5 tasks with priorities and deadlines assigned", icon: Bot, color: "bg-emerald-500/20 text-emerald-400" },
  { time: "10:34 AM", agent: "Assignment Agent", action: "Assigned tasks to Mark, Lisa, Jake based on expertise matching", icon: UserCheck, color: "bg-amber-500/20 text-amber-400" },
  { time: "10:35 AM", agent: "Monitoring Agent", action: "Activated deadline tracking for 5 tasks — next check in 4 hours", icon: Eye, color: "bg-sky-500/20 text-sky-400" },
  { time: "10:36 AM", agent: "Escalation Agent", action: "No overdue tasks detected. System nominal.", icon: Bell, color: "bg-muted text-muted-foreground" },
  { time: "11:15 AM", agent: "Monitoring Agent", action: "Flagged 'Update API docs' — 48 hours to deadline, 30% complete", icon: Eye, color: "bg-sky-500/20 text-sky-400" },
  { time: "11:16 AM", agent: "Escalation Agent", action: "Sent warning notification to Mark Chen and project manager", icon: Bell, color: "bg-red-500/20 text-red-400" },
  { time: "02:00 PM", agent: "Decision Agent", action: "Processed Sprint Review meeting — identified 3 new action items", icon: Brain, color: "bg-primary/20 text-primary" },
  { time: "02:01 PM", agent: "Task Agent", action: "Created 3 additional tasks from Sprint Review decisions", icon: Bot, color: "bg-emerald-500/20 text-emerald-400" },
  { time: "02:02 PM", agent: "Assignment Agent", action: "Auto-assigned new tasks based on current team workload", icon: UserCheck, color: "bg-amber-500/20 text-amber-400" },
];

export default function AgentActivity() {
  return (
    <AppLayout title="Agent Activity">
      <div className="max-w-3xl mx-auto">
        <div className="jarvis-card p-6" style={{ animation: "float-up 0.5s ease-out forwards", opacity: 0 }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Activity Timeline</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/30" />

            <div className="space-y-1">
              {timeline.map((item, i) => (
                <div
                  key={i}
                  className="relative flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors duration-200"
                  style={{ animation: `float-up 0.4s ease-out ${i * 0.05}s forwards`, opacity: 0 }}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 z-10 ${item.color.split(' ')[0]}`}>
                    <item.icon className={`w-4 h-4 ${item.color.split(' ')[1]}`} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{item.agent}</span>
                      <span className="text-xs text-muted-foreground font-mono">{item.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
