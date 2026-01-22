import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { EndOfDaySummary } from "@/components/EndOfDaySummary";
import { useEndOfDaySummary } from "@/hooks/useEndOfDaySummary";
import { Menu } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { summary, showPopup, dismissSummary } = useEndOfDaySummary();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex items-center px-6">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
          </header>
          <main className="flex-1 p-6 md:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* End of Day Summary Popup */}
      <EndOfDaySummary
        summary={summary}
        isOpen={showPopup}
        onClose={dismissSummary}
      />
    </SidebarProvider>
  );
}
