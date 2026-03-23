import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import RunWorkflow from "./pages/RunWorkflow";
import Tasks from "./pages/Tasks";
import AgentActivity from "./pages/AgentActivity";
import AuditLogs from "./pages/AuditLogs";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const ProfileDummy = () => <AppLayout title="Profile"><div className="text-white p-4">Profile Content Coming Soon</div></AppLayout>;
const SettingsDummy = () => <AppLayout title="Settings"><div className="text-white p-4">Settings Content Coming Soon</div></AppLayout>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/workflow" element={<ProtectedRoute><RunWorkflow /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><AgentActivity /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileDummy /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsDummy /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
