import { useNavigate } from 'react-router-dom';
import React from 'react';
import {
  Bell,
  Globe,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Info,
  Users,
  Briefcase,
  ArrowRight,
  CreditCard,
  HelpCircle,
  FileText,
  Shield,
  Scale,
  Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

const AppHeader: React.FC = () => {
  const { user, logout } = useUser();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.id && user.role !== 'guest') {
        try {
          // Dynamic import to avoid circular dependencies if any
          const { notificationService } = await import('@/services/notification.service');
          const data = await notificationService.getNotifications(user.id, user.role);
          setNotifications(data);
          setUnreadCount(data.length); // Assuming all fetched are unread for this demo
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      }
    };

    fetchNotifications();
    // Poll every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const platformLinks = [
    { name: 'How it Works', path: '/how-it-works', icon: <ArrowRight className="w-4 h-4 mr-2" /> },
    { name: 'About Us', path: '/about', icon: <Info className="w-4 h-4 mr-2" /> },
    { name: 'Pricing Plans', path: '/pricing', icon: <CreditCard className="w-4 h-4 mr-2" /> },
    { name: 'FAQ', path: '/faq', icon: <HelpCircle className="w-4 h-4 mr-2" /> },
  ];

  const legalLinks = [
    { name: 'Imprint', path: '/imprint', icon: <FileText className="w-4 h-4 mr-2" /> },
    { name: 'Privacy Policy', path: '/privacy', icon: <Shield className="w-4 h-4 mr-2" /> },
    { name: 'Terms of Service', path: '/terms', icon: <Scale className="w-4 h-4 mr-2" /> },
    { name: 'Contact Support', path: '/contact', icon: <Headphones className="w-4 h-4 mr-2" /> },
  ];

  const searchLinks = [
    { name: 'Find Talent', path: '/candidates', icon: <Users className="w-4 h-4 mr-2" /> },
    { name: 'Find Jobs', path: '/jobs', icon: <Briefcase className="w-4 h-4 mr-2" /> },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center px-6 md:px-8 shadow-sm">
      <div className="flex items-center flex-1 space-x-4">
        {/* Hamburger Menu Links */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-lg">
              <Menu className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-card border-border shadow-xl rounded-xl p-2 mt-2 max-h-[85vh] overflow-y-auto">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Search</DropdownMenuLabel>
              {searchLinks.map((link) => (
                <DropdownMenuItem
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-muted transition-colors"
                >
                  {link.icon}
                  <span className="font-medium text-sm">{link.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-border my-2" />

            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform</DropdownMenuLabel>
              {platformLinks.map((link) => (
                <DropdownMenuItem
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-muted transition-colors"
                >
                  {link.icon}
                  <span className="font-medium text-sm">{link.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-border my-2" />

            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Legal</DropdownMenuLabel>
              {legalLinks.map((link) => (
                <DropdownMenuItem
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-muted transition-colors"
                >
                  {link.icon}
                  <span className="font-medium text-sm">{link.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language Selection */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-1.5 px-3 py-2 hover:bg-muted rounded-lg font-medium text-foreground"
              aria-label="Change language"
            >
              <Globe className="w-4 h-4" strokeWidth={1.5} />
              <span className="uppercase text-xs font-bold">{language}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border shadow-xl rounded-xl p-1 mt-2">
            <DropdownMenuItem
              onClick={() => setLanguage('en')}
              className={`cursor-pointer rounded-lg px-4 py-2 ${language === 'en' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'}`}
            >
              English (EN)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLanguage('de')}
              className={`cursor-pointer rounded-lg px-4 py-2 ${language === 'de' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground'}`}
            >
              Deutsch (DE)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <nav className="hidden lg:flex items-center space-x-1 ml-4 border-l border-border pl-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/how-it-works')}
            className="text-foreground hover:bg-muted font-medium rounded-lg text-sm"
          >
            How it works
          </Button>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {user.role !== 'guest' && (
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative bg-transparent text-foreground hover:bg-muted hover:text-foreground rounded-lg"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-card"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border shadow-xl rounded-xl p-0 mt-2 w-80 max-h-[400px] overflow-y-auto">
              <div className="px-4 py-3 border-b border-border bg-muted/5 sticky top-0 backdrop-blur-sm z-10">
                <h4 className="font-bold text-sm">Notifications</h4>
              </div>
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((notif: any) => (
                    <DropdownMenuItem
                      key={notif.id}
                      className="p-4 cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
                      onClick={() => {
                        if (notif.link) navigate(notif.link);
                        setIsOpen(false);
                      }}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{notif.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground pt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-muted p-1 rounded-lg transition-colors group">
              <Avatar className="w-10 h-10 border border-border group-hover:border-primary/20 transition-colors">
                <AvatarImage src={user?.avatar} alt={user?.name || 'Guest'} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {user?.name ? user.name.charAt(0) : 'G'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-body-sm font-bold text-foreground leading-none mb-1">{user?.name || 'Guest'}</p>
                <p className="text-caption text-muted-foreground capitalize leading-none">{user?.role || 'Visitor'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors hidden md:block" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border shadow-xl rounded-xl p-2 mt-2 w-52">
            <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">My Account</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate(user.role === 'candidate' ? '/candidate/profile' : '/employer/profile')}
              className="cursor-pointer text-foreground hover:bg-muted rounded-lg px-3 py-2.5"
            >
              <User className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(user.role === 'candidate' ? '/candidate/settings' : '/employer/settings')}
              className="cursor-pointer text-foreground hover:bg-muted rounded-lg px-3 py-2.5"
            >
              <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border my-2" />
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="cursor-pointer text-error hover:bg-error/10 rounded-lg px-3 py-2.5"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="font-bold">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
