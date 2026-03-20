import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  name: string;
  owner: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  status: "Pending" | "In Progress" | "Completed" | "Delayed";
}

const initialTasks: Task[] = [
  { id: "1", name: "Update API documentation", owner: "Mark Chen", priority: "High", deadline: "Oct 18, 2025", status: "In Progress" },
  { id: "2", name: "Review PR #142", owner: "Lisa Park", priority: "Medium", deadline: "Oct 16, 2025", status: "Completed" },
  { id: "3", name: "Set up staging pipeline", owner: "Jake Rivera", priority: "High", deadline: "Oct 18, 2025", status: "In Progress" },
  { id: "4", name: "Coordinate UX research sessions", owner: "Lisa Park", priority: "Medium", deadline: "Oct 22, 2025", status: "Pending" },
  { id: "5", name: "Migrate database schema", owner: "Mark Chen", priority: "High", deadline: "Oct 20, 2025", status: "In Progress" },
];

const priorityClass: Record<string, string> = {
  High: "jarvis-badge-warning",
  Medium: "jarvis-badge-info",
  Low: "jarvis-badge-pending",
};

const statusClass: Record<string, string> = {
  Pending: "jarvis-badge-pending",
  "In Progress": "jarvis-badge-running",
  Completed: "jarvis-badge-completed",
  Delayed: "jarvis-badge-delayed",
};

const textShadow = '0 1px 6px rgba(0,0,0,0.8)';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [escalation, setEscalation] = useState<string | null>(null);

  const markDelayed = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "Delayed" as const } : t));
    setEscalation(tasks.find(t => t.id === id)?.name || "");
    setTimeout(() => setEscalation(null), 4000);
  };

  return (
    <AppLayout title="Tasks">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Escalation Alert */}
        {escalation && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30"
            style={{ animation: "float-up 0.3s ease-out forwards", background: 'hsla(0, 72%, 51%, 0.08)', backdropFilter: 'blur(8px)' }}
          >
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" style={{ filter: 'drop-shadow(0 0 6px hsl(0, 72%, 51%))' }} />
            <div>
              <p className="text-sm font-semibold text-destructive" style={{ textShadow: '0 0 8px hsla(0, 72%, 51%, 0.4)' }}>Escalation Triggered</p>
              <p className="text-xs text-muted-foreground" style={{ textShadow }}>"{escalation}" has been marked as delayed. Escalation Agent has notified the project manager.</p>
            </div>
          </div>
        )}

        <div style={{ animation: "float-up 0.5s ease-out forwards", opacity: 0 }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/15">
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ textShadow }}>Task</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ textShadow }}>Owner</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ textShadow }}>Priority</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ textShadow }}>Deadline</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ textShadow }}>Status</th>
                  <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ textShadow }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-150">
                    <td className="p-4 font-semibold text-foreground" style={{ textShadow }}>{task.name}</td>
                    <td className="p-4 text-muted-foreground" style={{ textShadow }}>{task.owner}</td>
                    <td className="p-4"><span className={priorityClass[task.priority]}>{task.priority}</span></td>
                    <td className="p-4 text-muted-foreground text-mono text-xs" style={{ textShadow }}>{task.deadline}</td>
                    <td className="p-4"><span className={statusClass[task.status]}>{task.status}</span></td>
                    <td className="p-4 text-right">
                      {task.status !== "Completed" && task.status !== "Delayed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markDelayed(task.id)}
                          className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Mark Delayed
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
