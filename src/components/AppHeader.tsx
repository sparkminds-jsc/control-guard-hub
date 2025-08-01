import { SidebarTrigger } from "@/components/ui/sidebar";

export const AppHeader = () => {
  return (
    <header className="h-16 bg-header border-b flex items-center justify-between px-4">
      <div className="flex items-center">
        <SidebarTrigger className="text-primary hover:bg-primary/10 rounded-md p-2" />
      </div>
      <div className="flex items-center space-x-4">
        {/* Additional header content can go here */}
      </div>
    </header>
  );
};