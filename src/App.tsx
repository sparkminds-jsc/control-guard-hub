import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { LanguageProvider } from "@/hooks/useLanguage";
import GenerateControlFramework from "./pages/GenerateControlFramework";
import ControlFrameworkHistory from "./pages/ControlFrameworkHistory";
import CompanyInfoFeedback from "./pages/CompanyInfoFeedback";
import CompanyLawsFeedback from "./pages/CompanyLawsFeedback";
import CompanyControlFeedback from "./pages/CompanyControlFeedback";
import CompanyDetails from "./pages/CompanyDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ControlFrameworkDetail from "./pages/ControlFrameworkDetail";
import LawRegulationDetail from "./pages/LawRegulationDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth routes without sidebar and header */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main app routes with sidebar and header */}
          <Route path="/*" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full relative">
                <AppSidebar />
                {/* Floating SidebarTrigger */}
                <SidebarTrigger className="fixed left-[18rem] top-1/2 -translate-y-1/2 z-50 bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent rounded-full p-3 shadow-lg transition-all duration-200 data-[state=collapsed]:left-16" />
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
                      <Route path="/company/:companyId/control-frameworks" element={<ControlFrameworkHistory />} />
                      <Route path="/control-framework/:id" element={<ControlFrameworkDetail />} />
                      <Route path="/law-regulation/:id" element={<LawRegulationDetail />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </SidebarProvider>
          } />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
