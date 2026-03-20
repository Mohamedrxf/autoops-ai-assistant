import { AppLayout } from "@/components/layout/AppLayout";
import { Brain, Bot, UserCheck, Eye, Bell } from "lucide-react";

const logs = [
  { timestamp: "2025-10-15 10:32:14", agent: "Decision Agent", action: "Extracted decision", reason: "Detected explicit task assignment in transcript: 'Mark, can you handle that?'", icon: Brain },
  { timestamp: "2025-10-15 10:32:45", agent: "Decision Agent", action: "Extracted decision", reason: "Found deadline reference: 'by end of week' — parsed as Oct 18, 2025", icon: Brain },
  { timestamp: "2025-10-15 10:33:02", agent: "Task Agent", action: "Created task", reason: "Action item 'Update API documentation' detected with explicit owner and deadline", icon: Bot },
  { timestamp: "2025-10-15 10:33:15", agent: "Task Agent", action: "Set priority: High", reason: "Keyword 'prioritize' and 'High priority' detected in speaker's statement", icon: Bot },
  { timestamp: "2025-10-15 10:33:28", agent: "Task Agent", action: "Created task", reason: "PR review request identified — 'PR #142 needs a review' with deadline 'by tomorrow'", icon: Bot },
  { timestamp: "2025-10-15 10:34:01", agent: "Assignment Agent", action: "Assigned to Mark Chen", reason: "Speaker directly addressed: 'Mark, can you handle that?' — high confidence match", icon: UserCheck },
  { timestamp: "2025-10-15 10:34:12", agent: "Assignment Agent", action: "Assigned to Lisa Park", reason: "Speaker confirmed availability: 'Yes, I can review it by tomorrow'", icon: UserCheck },
  { timestamp: "2025-10-15 10:35:00", agent: "Monitoring Agent", action: "Activated tracking", reason: "5 tasks with deadlines detected — monitoring intervals set to 4 hours", icon: Eye },
  { timestamp: "2025-10-15 11:15:00", agent: "Monitoring Agent", action: "Flagged at-risk task", reason: "Task 'Update API docs' is 30% complete with 48 hours remaining — risk threshold exceeded", icon: Eye },
  { timestamp: "2025-10-15 11:16:00", agent: "Escalation Agent", action: "Escalated to manager", reason: "At-risk task triggered escalation policy: notify owner + project manager when completion < 50% within 48h of deadline", icon: Bell },
];

const textShadow = '0 1px 6px rgba(0,0,0,0.8)';

export default function AuditLogs() {
  return (
    <AppLayout title="Audit Logs">
      <div className="max-w-7xl mx-auto" style={{ animation: "float-up 0.5s ease-out forwards", opacity: 0 }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/15">
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ textShadow }}>Timestamp</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ textShadow }}>Agent</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ textShadow }}>Action</th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ textShadow }}>Reason (AI Explanation)</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={i}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-150"
                  style={{ animation: `float-up 0.4s ease-out ${i * 0.04}s forwards`, opacity: 0 }}
                >
                  <td className="p-4 text-muted-foreground font-mono text-xs whitespace-nowrap" style={{ textShadow }}>{log.timestamp}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <log.icon className="w-3.5 h-3.5 text-primary" style={{ filter: 'drop-shadow(0 0 4px hsl(199, 89%, 48%))' }} />
                      <span className="text-foreground font-semibold whitespace-nowrap" style={{ textShadow }}>{log.agent}</span>
                    </div>
                  </td>
                  <td className="p-4 text-foreground whitespace-nowrap" style={{ textShadow }}>{log.action}</td>
                  <td className="p-4 text-muted-foreground max-w-md" style={{ textShadow }}>{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
