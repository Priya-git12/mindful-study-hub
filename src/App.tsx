import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import StudyTracker from "./pages/StudyTracker";
import EmotionAnalyzer from "./pages/EmotionAnalyzer";
import ScheduleGenerator from "./pages/ScheduleGenerator";
import Wellbeing from "./pages/Wellbeing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tracker" element={<StudyTracker />} />
            <Route path="/emotions" element={<EmotionAnalyzer />} />
            <Route path="/schedule" element={<ScheduleGenerator />} />
            <Route path="/wellbeing" element={<Wellbeing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
