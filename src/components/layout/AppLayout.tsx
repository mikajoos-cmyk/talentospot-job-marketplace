import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import AdminSidebar from './AdminSidebar';
import PublicHeader from './PublicHeader'; // Wichtig: Für den Guest-Mode
import Footer from './Footer'; // Wichtig: Für den Guest-Mode
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

interface AppLayoutProps {
  children: React.ReactNode;
  fullHeight?: boolean;
  noPadding?: boolean;
  isPublic?: boolean;
  maxWidthOverride?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, fullHeight, noPadding, isPublic, maxWidthOverride }) => {
  const { user, isAuthenticated, loading } = useUser();
  const { contentMaxWidth } = useSettings();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Determine the max width to apply
  const activeMaxWidth = maxWidthOverride || contentMaxWidth;

  // 1. Loading State: Verhindert "Flackern" des falschen Layouts beim Laden
  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
  }

  // 2. GUEST MODE: Layout für nicht eingeloggte Nutzer (wie Landing Page)
  if (!isAuthenticated || isPublic) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
          <PublicHeader />
          <main className="flex-1">
            {/* Container sorgt dafür, dass Dashboard-Seiten (die auf AppLayout vertrauen)
              auch hier ordentlich zentriert angezeigt werden */}
            <div className={cn(
                "w-full mx-auto",
                activeMaxWidth,
                !noPadding && "p-4 md:p-8"
            )}>
              {children}
            </div>
          </main>
          {!noPadding && !isAuthenticated && <Footer />}
        </div>
    );
  }

  // 3. AUTHENTICATED MODE: Dashboard Layout mit Sidebar
  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Wähle die passende Sidebar basierend auf der Rolle
  const SidebarComponent = user?.role === 'admin' ? AdminSidebar : AppSidebar;

  // Berechne Breiten für die Animation
  const sidebarWidthClass = sidebarCollapsed ? "lg:w-16" : "lg:w-64";
  const mainContentPaddingClass = sidebarCollapsed ? "lg:pl-16" : "lg:pl-64";

  return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header (nur für eingeloggte User sichtbar hier) */}
        <div className="lg:hidden p-4 border-b border-border flex items-center justify-between bg-card sticky top-0 z-50">
          <div className="font-bold text-xl text-primary">TalentoSpot</div>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              {/* Mobile Sidebar immer ausgeklappt */}
              <SidebarComponent collapsed={false} onToggle={() => {}} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex h-screen overflow-hidden pt-[0px] lg:pt-0">
          {/* Desktop Sidebar (Fixed) */}
          <div className={cn(
              "hidden lg:flex flex-col fixed inset-y-0 z-50 transition-all duration-300",
              sidebarWidthClass
          )}>
            <SidebarComponent
                collapsed={sidebarCollapsed}
                onToggle={handleSidebarToggle}
            />
          </div>

          {/* Main Content Area */}
          <div className={cn(
              "flex-1 flex flex-col h-full transition-all duration-300",
              mainContentPaddingClass
          )}>
            <AppHeader />
            <main className={cn(
                "flex-1 overflow-y-auto bg-background/50",
                !noPadding && "p-4 md:p-8"
            )}>
              <div className={cn(
                  "w-full mx-auto",
                  activeMaxWidth,
                  !noPadding && "pb-10",
                  fullHeight && "h-full"
              )}>
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
  );
};

export default AppLayout;