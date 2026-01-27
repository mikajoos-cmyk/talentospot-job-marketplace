import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { LayoutDashboard, User, Briefcase, Settings, Users, Building2, ChevronLeft, ChevronRight, CreditCard, Bookmark, Mail, MessageSquare, Network as NetworkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, onToggle }) => {
  const { user } = useUser();
  const location = useLocation();

  const candidateMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/candidate/dashboard' },
    { icon: User, label: 'My Profile', path: '/candidate/profile' },
    { icon: Briefcase, label: 'Find Jobs', path: '/candidate/jobs' },
    { icon: Bookmark, label: 'Saved Jobs', path: '/candidate/saved' },
    { icon: Mail, label: 'Invitations', path: '/candidate/invitations' },
    { icon: MessageSquare, label: 'Messages', path: '/candidate/messages' },
    { icon: NetworkIcon, label: 'My Network', path: '/candidate/network' },
    { icon: CreditCard, label: 'Packages', path: '/candidate/packages' },
    { icon: Settings, label: 'Settings', path: '/candidate/settings' },
  ];

  const employerMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/employer/dashboard' },
    { icon: Users, label: 'Find Candidates', path: '/employer/candidates' },
    { icon: Briefcase, label: 'My Jobs', path: '/employer/jobs' },
    { icon: Building2, label: 'Company Profile', path: '/employer/profile' },
    { icon: MessageSquare, label: 'Messages', path: '/employer/messages' },
    { icon: NetworkIcon, label: 'My Network', path: '/employer/network' },
    { icon: CreditCard, label: 'Packages', path: '/employer/packages' },
    { icon: Settings, label: 'Settings', path: '/employer/settings' },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const menuItems = user.role === 'candidate'
    ? candidateMenuItems
    : user.role === 'admin'
      ? adminMenuItems
      : employerMenuItems;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-secondary text-secondary-foreground transition-all duration-normal z-40 ${collapsed ? 'w-16' : 'w-64'
        }`}
    >
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-hover">
          {!collapsed ? (
            <img
              src="/src/assets/logo.png"
              alt="TalentoSpot"
              className="h-8 w-auto"
            />
          ) : (
            <img
              src="/src/assets/logo.png"
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
          </ul>
        </nav>

        <Separator className="bg-secondary-hover" />

        <div className="p-4">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
              {user.name.charAt(0)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-medium text-secondary-foreground truncate">{user.name}</p>
                <p className="text-caption text-muted-foreground capitalize">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
