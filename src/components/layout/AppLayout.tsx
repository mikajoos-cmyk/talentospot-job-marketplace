import React, { useState, useEffect } from 'react';
import AppSidebar from './AppSidebar';

import AppHeader from './AppHeader';
import MobileNav from './MobileNav';
import ScrollToTop from './ScrollToTop';

interface AppLayoutProps {
  children: React.ReactNode;
  fullHeight?: boolean;
  noPadding?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, fullHeight = false, noPadding = false }) => {
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
    <div className={`min-h-screen bg-background text-foreground ${fullHeight ? 'h-screen overflow-hidden' : ''}`}>

      {!isMobile && (
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      <div className={`${!isMobile ? (sidebarCollapsed ? 'md:ml-16' : 'md:ml-64') : ''} transition-all duration-normal ${fullHeight ? 'h-screen flex flex-col' : ''}`}>
        <AppHeader />

        <main className={`${noPadding ? 'p-0' : 'p-6 md:p-8'} ${fullHeight ? 'flex-1 overflow-hidden' : 'pb-24 md:pb-8'}`}>
          {children}
        </main>
      </div>


      {isMobile && <MobileNav />}
      <ScrollToTop />
    </div>
  );
};

export default AppLayout;
