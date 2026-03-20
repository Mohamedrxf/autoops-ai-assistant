import { LayoutDashboard, Play, ListTodo, Activity, ScrollText, Zap } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Run Workflow", url: "/workflow", icon: Play },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
  { title: "Agent Activity", url: "/activity", icon: Activity },
  { title: "Audit Logs", url: "/audit", icon: ScrollText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/10"
      style={{ background: 'transparent' }}
    >
      <SidebarContent className="pt-4" style={{ background: 'hsla(222, 47%, 5%, 0.12)', backdropFilter: 'blur(6px)' }}>
        {/* Logo */}
        <div className="px-4 pb-6 pt-2 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 0 12px hsla(199, 89%, 48%, 0.3)' }}>
            <Zap className="w-4 h-4 text-primary" style={{ filter: 'drop-shadow(0 0 6px hsl(199, 89%, 48%))' }} />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-foreground" style={{ textShadow: '0 0 12px rgba(0,0,0,0.8)' }}>
              Auto<span className="text-primary" style={{ textShadow: '0 0 10px hsla(199, 89%, 48%, 0.5)' }}>Ops</span>
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`sidebar-icon-glow flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        activeClassName="text-primary"
                        style={isActive ? {
                          background: 'hsla(199, 89%, 48%, 0.08)',
                          textShadow: '0 0 10px hsla(199, 89%, 48%, 0.5)',
                        } : {}}
                      >
                        <item.icon
                          className={`sidebar-glow-icon w-4 h-4 flex-shrink-0 transition-all duration-300 ${
                            isActive ? 'text-primary' : ''
                          }`}
                          style={isActive ? { filter: 'drop-shadow(0 0 8px hsl(199, 89%, 48%)) drop-shadow(0 0 16px hsla(199, 89%, 48%, 0.4))' } : {}}
                        />
                        {!collapsed && (
                          <span className="text-sm font-medium" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                            {item.title}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
