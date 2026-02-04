import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
    Menu,
    Globe,
    ChevronDown,
    Info,
    Users,
    Briefcase,
    LogIn,
    UserPlus,
    ArrowRight,
    CreditCard,
    HelpCircle,
    FileText,
    Shield,
    Scale,
    Headphones
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import logoImg from '@/assets/logo.png';

const PublicHeader: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useUser();
    const { language, setLanguage } = useLanguage();

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
        <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 md:space-x-8">
                    <img
                        src={logoImg}
                        alt="TalentoSpot"
                        className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate('/')}
                    />

                    <nav className="hidden md:flex items-center space-x-1">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/candidates')}
                            className="text-foreground hover:bg-muted font-medium rounded-lg"
                        >
                            Candidates
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/jobs')}
                            className="text-foreground hover:bg-muted font-medium rounded-lg"
                        >
                            Jobs
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/how-it-works')}
                            className="text-foreground hover:bg-muted font-medium rounded-lg"
                        >
                            How it works
                        </Button>
                    </nav>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* Hamburger Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-lg">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 bg-card border-border shadow-xl rounded-xl p-2 mt-2 max-h-[85vh] overflow-y-auto">
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

                            {!isAuthenticated && (
                                <>
                                    <DropdownMenuSeparator className="bg-border my-2" />
                                    <DropdownMenuItem onClick={() => navigate('/login')} className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-muted">
                                        <LogIn className="w-4 h-4 mr-2" />
                                        <span className="font-medium text-sm">Sign In</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/register')} className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-primary/10 text-primary">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        <span className="font-bold text-sm">Get Started</span>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Language Selection */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-1.5 px-3 py-2 hover:bg-muted rounded-lg font-medium"
                            >
                                <Globe className="w-4 h-4" />
                                <span className="uppercase text-xs font-bold">{language}</span>
                                <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border shadow-xl rounded-xl p-1 mt-2">
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

                    <div className="hidden sm:flex items-center space-x-3">
                        {isAuthenticated ? (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        const dashboardPath = user?.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard';
                                        navigate(dashboardPath);
                                    }}
                                    className="text-foreground hover:bg-muted font-medium rounded-lg"
                                >
                                    Dashboard
                                </Button>
                                <Button
                                    onClick={logout}
                                    variant="outline"
                                    className="border-border text-foreground hover:bg-muted font-medium rounded-lg"
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/login')}
                                    className="text-foreground hover:bg-muted font-medium rounded-lg"
                                >
                                    Sign In
                                </Button>
                                <Button
                                    onClick={() => navigate('/register')}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 rounded-lg shadow-sm shadow-primary/20"
                                >
                                    Get Started
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default PublicHeader;
