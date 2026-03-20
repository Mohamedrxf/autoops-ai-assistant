import { AppLayout } from "@/components/layout/AppLayout";
import { ListTodo, CheckCircle2, GitBranch, AlertTriangle, Brain, Bot, UserCheck, Eye, Bell } from "lucide-react";

const kpis = [
  { label: "Tasks Created", value: "47", icon: ListTodo, trend: "+12 today" },
  { label: "Tasks Completed", value: "38", icon: CheckCircle2, trend: "81% rate" },
  { label: "Active Workflows", value: "3", icon: GitBranch, trend: "2 pending" },
  { label: "Escalations", value: "5", icon: AlertTriangle, trend: "1 critical" },
];

const recentActivity = [
  { time: "2 min ago", agent: "Decision Agent", action: "Extracted 4 key decisions from Q4 Planning meeting", icon: Brain, color: "text-primary" },
  { time: "3 min ago", agent: "Task Agent", action: "Created 6 tasks with priorities and deadlines", icon: Bot, color: "text-emerald-400" },
  { time: "5 min ago", agent: "Assignment Agent", action: "Assigned tasks to 4 team members based on expertise", icon: UserCheck, color: "text-amber-400" },
  { time: "8 min ago", agent: "Monitoring Agent", action: "Flagged 2 tasks approaching deadline", icon: Eye, color: "text-sky-400" },
  { time: "12 min ago", agent: "Escalation Agent", action: "Escalated overdue task to project manager", icon: Bell, color: "text-red-400" },
  { time: "18 min ago", agent: "Decision Agent", action: "Processed Sprint Review transcript — 3 action items", icon: Brain, color: "text-primary" },
];

export default function Dashboard() {
  return (
    <AppLayout title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <div
              key={kpi.label}
              className="p-5 transition-all duration-300 border-b border-primary/10"
              style={{ animation: `float-up 0.5s ease-out ${i * 0.1}s forwards`, opacity: 0 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>{kpi.label}</p>
                  <p className="text-4xl font-bold mt-2 jarvis-glow-text">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1.5" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>{kpi.trend}</p>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'hsla(199, 89%, 48%, 0.1)' }}>
                  <kpi.icon className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 6px hsl(199, 89%, 48%))' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{ animation: "float-up 0.5s ease-out 0.4s forwards", opacity: 0 }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>Recent Agent Activity</h2>
          <div className="space-y-1">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'hsla(217, 33%, 17%, 0.3)' }}>
                  <item.icon className={`w-4 h-4 ${item.color}`} style={{ filter: 'drop-shadow(0 0 4px currentColor)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>{item.agent}</span>
                    <span className="text-xs text-muted-foreground" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{item.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
