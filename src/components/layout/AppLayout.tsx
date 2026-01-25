import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import MobileNav from './MobileNav';
import ScrollToTop from './ScrollToTop';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isMobile && (
        <AppSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      )}
      
      <div className={`${!isMobile ? (sidebarCollapsed ? 'md:ml-16' : 'md:ml-64') : ''} transition-all duration-normal`}>
        <AppHeader />
        
        <main className="p-6 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {isMobile && <MobileNav />}
      <ScrollToTop />
    </div>
  );
};

export default AppLayout;
