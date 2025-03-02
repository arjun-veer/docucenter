
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useExams } from "./lib/store";
import Index from "./pages/Index";
import Exams from "./pages/Exams";
import ExamDetails from "./pages/ExamDetails";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import DocumentProcessor from "./pages/DocumentProcessor";
import { toast } from "sonner";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { fetchExams } = useExams();

  // Fetch initial data on app load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchExams();
      } catch (error) {
        console.error("Failed to fetch initial exam data:", error);
        toast.error("Could not load exam data. Please try again later.");
      }
    };
    
    loadInitialData();
  }, [fetchExams]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/exams" element={<Exams />} />
      <Route path="/exams/:examId" element={<ExamDetails />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/document-processor" element={<DocumentProcessor />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
