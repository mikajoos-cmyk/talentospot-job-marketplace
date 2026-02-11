import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LayoutDashboard, User, Briefcase, Settings, Users, Building2, ChevronLeft, ChevronRight, CreditCard, Bookmark, Mail, MessageSquare, Network as NetworkIcon, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import logoImg from '@/assets/logo.png';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useUser();
  const { t } = useLanguage();
  const location = useLocation();

  const candidateMenuItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/candidate/dashboard' },
    { icon: User, label: t('nav.profile'), path: '/candidate/profile' },
    { icon: Briefcase, label: t('nav.jobs'), path: '/candidate/jobs' },
    { icon: Bell, label: t('nav.alerts'), path: '/candidate/alerts' },
    { icon: Bookmark, label: t('nav.saved'), path: '/candidate/saved' },
    { icon: Mail, label: t('nav.invitations'), path: '/candidate/invitations' },
    { icon: MessageSquare, label: t('nav.messages'), path: '/candidate/messages' },
    { icon: NetworkIcon, label: t('nav.network'), path: '/candidate/network' },
    { icon: CreditCard, label: t('nav.packages'), path: '/candidate/packages' },
    { icon: Settings, label: t('nav.settings'), path: '/candidate/settings' },
  ];

  const employerMenuItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/employer/dashboard' },
    { icon: Users, label: t('nav.candidates'), path: '/employer/candidates' },
    { icon: Bell, label: t('nav.alerts'), path: '/employer/alerts' },
    { icon: Briefcase, label: t('nav.myJobs'), path: '/employer/jobs' },
    { icon: Building2, label: t('nav.companyProfile'), path: '/employer/profile' },
    { icon: MessageSquare, label: t('nav.messages'), path: '/employer/messages' },
    { icon: NetworkIcon, label: t('nav.network'), path: '/employer/network' },
    { icon: CreditCard, label: t('nav.packages'), path: '/employer/packages' },
    { icon: Settings, label: t('nav.settings'), path: '/employer/settings' },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/admin/dashboard' },
    { icon: Users, label: t('nav.users'), path: '/admin/users' },
    { icon: Settings, label: t('nav.settings'), path: '/admin/settings' },
  ];

  const guestMenuItems = [
    { icon: Briefcase, label: t('nav.jobs'), path: '/jobs' },
    { icon: Users, label: t('nav.candidates'), path: '/candidates' },
  ];

  const menuItems = user.role === 'guest'
    ? guestMenuItems
    : user.role === 'candidate'
      ? candidateMenuItems
      : user.role === 'admin'
        ? adminMenuItems
        : employerMenuItems;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-secondary text-secondary-foreground transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-64'
        }`}
    >
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-hover">
          {!collapsed ? (
            <img
              src={logoImg}
              alt="TalentoSpot"
              className="h-8 w-auto"
            />
          ) : (
            <img
              src={logoImg}
              alt="TalentoSpot"
              className="h-6 w-auto mx-auto"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="bg-transparent text-secondary-foreground hover:bg-secondary-hover hover:text-secondary-foreground"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center h-11 px-4 rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-primary/10 text-primary border-l-3 border-primary'
                      : 'text-secondary-foreground hover:bg-secondary-hover hover:text-secondary-foreground'
                      }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                    {!collapsed && (
                      <span className="ml-3 text-body">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
            {/* Logout Button in Menu List under Settings if desired, but sticking to bottom area or end of list */}
            {user.role !== 'guest' && (
              <li>
                <button
                  onClick={logout}
                  className="w-full flex items-center h-11 px-4 rounded-lg transition-all duration-200 text-error hover:bg-error/10"
                  title={collapsed ? t('common.logout') : undefined}
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                  {!collapsed && (
                    <span className="ml-3 text-body font-bold">{t('common.logout')}</span>
                  )}
                </button>
              </li>
            )}
          </ul>
        </nav>

        <Separator className="bg-secondary-hover" />

        <div className="p-4">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
              {user?.name ? user.name.charAt(0) : 'G'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-medium text-secondary-foreground truncate">{user?.name || 'Guest'}</p>
                <p className="text-caption text-muted-foreground capitalize">{user?.role || 'Visitor'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
