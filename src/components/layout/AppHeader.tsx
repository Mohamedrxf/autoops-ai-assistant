import { SidebarTrigger } from "@/components/ui/sidebar";
import { User, Wifi } from "lucide-react";

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border/10 backdrop-blur-sm" style={{ background: 'hsla(222, 47%, 6%, 0.1)' }}>
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="jarvis-badge-active flex items-center gap-1.5">
          <Wifi className="w-3 h-3" />
          <span>System Active</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
      </div>
    </header>
  );
}
