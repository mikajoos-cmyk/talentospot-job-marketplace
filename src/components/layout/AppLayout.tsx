import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';

import AppHeader from './AppHeader';
import MobileNav from './MobileNav';
import ScrollToTop from './ScrollToTop';
import PublicHeader from './PublicHeader';
import { useUser } from '@/contexts/UserContext';

interface AppLayoutProps {
  children: React.ReactNode;
  fullHeight?: boolean;
  noPadding?: boolean;
  isPublic?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, fullHeight = false, noPadding = false, isPublic: isPublicProp }) => {
  const { user } = useUser();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isPublicRoute = ['/jobs', '/candidates', '/'].includes(location.pathname);
  const isPublic = isPublicProp ?? (user.role === 'guest' && isPublicRoute);

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
    <div className={`min-h-screen bg-background text-foreground ${fullHeight ? 'h-screen overflow-hidden' : ''} ${isPublic ? 'bg-gradient-to-br from-primary/5 via-background to-accent/5' : ''}`}>

      {!isMobile && !isPublic && (
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      <div className={`${!isMobile && !isPublic ? (sidebarCollapsed ? 'md:ml-16' : 'md:ml-64') : ''} transition-all duration-normal ${fullHeight ? 'h-screen flex flex-col' : ''}`}>
        {isPublic ? <PublicHeader /> : <AppHeader />}

        <main className={`${noPadding ? 'p-0' : 'p-6 md:p-8'} ${fullHeight ? 'flex-1 overflow-hidden' : 'pb-24 md:pb-8'} ${isPublic ? 'container mx-auto max-w-[1600px] pt-12' : ''}`}>
          {children}
        </main>
      </div>


      {isMobile && <MobileNav />}
      <ScrollToTop />
    </div>
  );
};

export default AppLayout;
