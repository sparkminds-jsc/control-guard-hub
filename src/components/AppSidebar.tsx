import {
  FileText,
  History,
  Building,
  Scale,
  Shield,
  User,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Generate Control Framework",
    url: "/",
    icon: FileText,
  },
  {
    title: "Control Framework History",
    url: "/history",
    icon: History,
  },
  {
    title: "Company Info Feedback",
    url: "/company-info",
    icon: Building,
  },
  {
    title: "Company Laws Feedback",
    url: "/company-laws",
    icon: Scale,
  },
  {
    title: "Company Control Feedback",
    url: "/company-control",
    icon: Shield,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const isCollapsed = state === "collapsed";

  // Load user information
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Get user profile from users table
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('email', session.user.email)
          .single();
        
        setUserProfile(profile);
      }
    };

    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUser();
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Sidebar className="w-72" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" alt="User Avatar" />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground font-medium text-sm truncate">
                {userProfile?.full_name || 'User'}
              </p>
              <p className="text-sidebar-foreground/70 text-xs truncate">
                {userProfile?.email || user?.email}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
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
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
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