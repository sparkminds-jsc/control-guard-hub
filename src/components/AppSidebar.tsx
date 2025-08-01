import {
  FileText,
  History,
  Building,
  Scale,
  Shield,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    titleKey: "nav.framework",
    url: "/",
    icon: FileText,
  },
  {
    titleKey: "nav.history",
    url: "/history",
    icon: History,
  },
  {
    titleKey: "nav.company_info",
    url: "/company-info",
    icon: Building,
  },
  {
    titleKey: "nav.company_laws",
    url: "/company-laws",
    icon: Scale,
  },
  {
    titleKey: "nav.company_control",
    url: "/company-control",
    icon: Shield,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useLanguage();

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="w-72" collapsible="icon">
      <SidebarContent className="bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent rounded-md p-2" />
        </div>
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 text-sidebar-foreground font-bold text-base transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}