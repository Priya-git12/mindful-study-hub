import { Home, Clock, Heart, Calendar, Sparkles, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStudySession } from "@/hooks/useStudySession";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Study Tracker", url: "/tracker", icon: Clock },
  { title: "Emotion Analyzer", url: "/emotions", icon: Heart },
  { title: "Schedule Generator", url: "/schedule", icon: Calendar },
  { title: "Well-being", url: "/wellbeing", icon: Sparkles },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, signOut } = useAuth();
  const { endSession, currentSession } = useStudySession();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (currentSession) {
      await endSession();
    }
    await signOut();
    toast({
      title: "Signed Out",
      description: "See you next time!",
    });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              {open && (
                <span className="font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  MindSync
                </span>
              )}
            </div>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`
                          transition-all duration-300 rounded-lg
                          ${isActive ? 'bg-sidebar-accent shadow-soft' : 'hover:bg-sidebar-accent/50'}
                        `}
                      >
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                        {open && <span className={isActive ? 'font-medium' : ''}>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {user && (
          <div className="space-y-3">
            {open && (
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            )}
            <Button
              variant="ghost"
              size={open ? "default" : "icon"}
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              {open && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
