import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { LayoutDashboard, Briefcase, User, Menu } from 'lucide-react';

const MobileNav: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();

  const candidateTabs = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/candidate/dashboard' },
    { icon: Briefcase, label: 'Jobs', path: '/candidate/jobs' },
    { icon: User, label: 'Profile', path: '/candidate/profile' },
    { icon: Menu, label: 'More', path: '/candidate/settings' },
  ];

  const employerTabs = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/employer/dashboard' },
    { icon: User, label: 'Candidates', path: '/employer/candidates' },
    { icon: Briefcase, label: 'Jobs', path: '/employer/jobs' },
    { icon: Menu, label: 'More', path: '/employer/settings' },
  ];

  const tabs = user.role === 'candidate' ? candidateTabs : employerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" strokeWidth={1.5} />
              <span className="text-caption">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
