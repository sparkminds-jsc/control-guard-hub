import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const AppHeader = () => {
  return (
    <header className="h-16 bg-header border-b flex items-center justify-between px-4">
      <div className="flex items-center">
        <SidebarTrigger className="mr-4" />
        <h1 className="text-header-foreground font-bold">Control Framework Management</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" alt="User Avatar" />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};