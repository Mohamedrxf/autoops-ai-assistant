import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
const bgVideoUrl = "/videos/jarvis-bg.mp4";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        {/* Background Video — more visible */}
        <div className="fixed inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ opacity: 0.55 }}
          >
            <source src={bgVideoUrl} type="video/mp4" />
          </video>
          {/* Gradient overlay: darker at top/bottom for text, lighter in middle for video visibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, hsla(222, 47%, 6%, 0.50) 0%, hsla(222, 47%, 6%, 0.20) 30%, hsla(222, 47%, 6%, 0.15) 60%, hsla(222, 47%, 6%, 0.45) 100%)",
            }}
          />
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
