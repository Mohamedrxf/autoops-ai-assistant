import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
const bgVideoUrl = "/__l5e/assets-v1/1a10c9ea-6565-42c8-8813-0cfbc86ebd55/jarvis-bg.mp4";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        {/* Background Video */}
        <div className="fixed inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ opacity: 0.3 }}
          >
            <source src={bgVideoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-background/70" />
        </div>

        <AppSidebar />

        <div className="flex-1 flex flex-col relative z-10">
          <AppHeader title={title} />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
