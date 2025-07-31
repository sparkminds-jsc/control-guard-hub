import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import GenerateControlFramework from "./pages/GenerateControlFramework";
import ControlFrameworkHistory from "./pages/ControlFrameworkHistory";
import CompanyInfoFeedback from "./pages/CompanyInfoFeedback";
import CompanyLawsFeedback from "./pages/CompanyLawsFeedback";
import CompanyControlFeedback from "./pages/CompanyControlFeedback";
import CompanyDetails from "./pages/CompanyDetails";
import ControlFrameworkDetail from "./pages/ControlFrameworkDetail";
import LawRegulationDetail from "./pages/LawRegulationDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <AppHeader />
              <main className="flex-1 bg-background">
          <Routes>
            <Route path="/" element={<GenerateControlFramework />} />
            <Route path="/history" element={<ControlFrameworkHistory />} />
            <Route path="/company-info" element={<CompanyInfoFeedback />} />
            <Route path="/company-laws" element={<CompanyLawsFeedback />} />
            <Route path="/company-control" element={<CompanyControlFeedback />} />
            <Route path="/company-details/:id" element={<CompanyDetails />} />
          <Route path="/control-framework/:id" element={<ControlFrameworkDetail />} />
          <Route path="/law-regulation/:id" element={<LawRegulationDetail />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
