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
            className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/10"
            style={{ animation: "float-up 0.3s ease-out forwards" }}
          >
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-destructive">Escalation Triggered</p>
              <p className="text-xs text-muted-foreground">"{escalation}" has been marked as delayed. Escalation Agent has notified the project manager.</p>
            </div>
          </div>
        )}

        <div className="jarvis-card overflow-hidden" style={{ animation: "float-up 0.5s ease-out forwards", opacity: 0 }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deadline</th>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors duration-150">
                    <td className="p-4 font-medium text-foreground">{task.name}</td>
                    <td className="p-4 text-muted-foreground">{task.owner}</td>
                    <td className="p-4"><span className={priorityClass[task.priority]}>{task.priority}</span></td>
                    <td className="p-4 text-muted-foreground text-mono text-xs">{task.deadline}</td>
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
