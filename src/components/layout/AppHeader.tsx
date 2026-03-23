import { SidebarTrigger } from "@/components/ui/sidebar";
import { User, Wifi, Settings, LogOut, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border/10 backdrop-blur-sm" style={{ background: 'hsla(222, 47%, 6%, 0.1)' }}>
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-lg font-semibold text-foreground" style={{ textShadow: '0 0 12px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)' }}>{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="jarvis-badge-active flex items-center gap-1.5">
          <Wifi className="w-3 h-3" />
          <span>System Active</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors cursor-pointer border border-primary/20 shadow-[0_0_10px_hsla(199,89%,48%,0.2)]">
              <User className="w-4 h-4 text-primary" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800">
            <DropdownMenuLabel className="text-slate-300">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer transition-colors" onClick={() => navigate('/profile')}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer transition-colors" onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem className="text-red-400 focus:bg-red-400/10 focus:text-red-300 cursor-pointer transition-colors" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
