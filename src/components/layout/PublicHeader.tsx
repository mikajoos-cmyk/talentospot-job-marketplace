import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react'; // Für Ladezustand
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
import { Button } from '@/components/ui/button';
import logoImg from '@/assets/logo.png';

const PublicHeader: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useUser();
    const { language, setLanguage, availableLanguages, isLoading, t } = useLanguage();

    // Helper um den vollen Namen der aktuellen Sprache anzuzeigen
    const currentLangName = availableLanguages.find(l => l.code === language)?.name || language;

    const platformLinks = [
        { name: t('nav.howItWorks'), path: '/how-it-works', icon: <ArrowRight className="w-4 h-4 mr-2" /> },
        { name: t('nav.aboutUs'), path: '/about', icon: <Info className="w-4 h-4 mr-2" /> },
        { name: t('nav.pricing'), path: '/pricing', icon: <CreditCard className="w-4 h-4 mr-2" /> },
        { name: t('nav.faq'), path: '/faq', icon: <HelpCircle className="w-4 h-4 mr-2" /> },
    ];

    const legalLinks = [
        { name: t('nav.imprint'), path: '/imprint', icon: <FileText className="w-4 h-4 mr-2" /> },
        { name: t('nav.privacy'), path: '/privacy', icon: <Shield className="w-4 h-4 mr-2" /> },
        { name: t('nav.terms'), path: '/terms', icon: <Scale className="w-4 h-4 mr-2" /> },
        { name: t('nav.contact'), path: '/contact', icon: <Headphones className="w-4 h-4 mr-2" /> },
    ];

    const searchLinks = [
        { name: t('nav.candidates'), path: '/candidates', icon: <Users className="w-4 h-4 mr-2" /> },
        { name: t('nav.jobs'), path: '/jobs', icon: <Briefcase className="w-4 h-4 mr-2" /> },
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
                            className="text-foreground hover:bg-primary/10 hover:text-foreground font-medium rounded-lg"
                        >
                            {t('nav.candidates')}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/jobs')}
                            className="text-foreground hover:bg-primary/10 hover:text-foreground font-medium rounded-lg"
                        >
                            {t('nav.jobs')}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/how-it-works')}
                            className="text-foreground hover:bg-primary/10 hover:text-foreground font-medium rounded-lg"
                        >
                            {t('nav.howItWorks')}
                        </Button>
                    </nav>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* Hamburger Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-lg hover:bg-primary/10 hover:text-foreground">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 bg-card border-border shadow-xl rounded-xl p-2 mt-2 max-h-[85vh] overflow-y-auto">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('nav.search')}</DropdownMenuLabel>
                                {searchLinks.map((link) => (
                                    <DropdownMenuItem
                                        key={link.path}
                                        onClick={() => navigate(link.path)}
                                        className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-primary/10 hover:text-foreground transition-colors"
                                    >
                                        {link.icon}
                                        <span className="font-medium text-sm">{link.name}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator className="bg-border my-2" />

                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('nav.platform')}</DropdownMenuLabel>
                                {platformLinks.map((link) => (
                                    <DropdownMenuItem
                                        key={link.path}
                                        onClick={() => navigate(link.path)}
                                        className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-primary/10 hover:text-foreground transition-colors"
                                    >
                                        {link.icon}
                                        <span className="font-medium text-sm">{link.name}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator className="bg-border my-2" />

                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('nav.legal')}</DropdownMenuLabel>
                                {legalLinks.map((link) => (
                                    <DropdownMenuItem
                                        key={link.path}
                                        onClick={() => navigate(link.path)}
                                        className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-primary/10 hover:text-foreground transition-colors"
                                    >
                                        {link.icon}
                                        <span className="font-medium text-sm">{link.name}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>

                            {!isAuthenticated && (
                                <>
                                    <DropdownMenuSeparator className="bg-border my-2" />
                                    <DropdownMenuItem onClick={() => navigate('/login')} className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-primary/10 hover:text-foreground">
                                        <LogIn className="w-4 h-4 mr-2" />
                                        <span className="font-medium text-sm">{t('common.login')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/register')} className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-primary/10 hover:text-primary text-primary">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        <span className="font-bold text-sm">{t('common.getStarted')}</span>
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
                                className="flex items-center gap-1.5 px-3 py-2 hover:bg-primary/10 hover:text-foreground rounded-lg font-medium"
                            >
                                <Globe className="w-4 h-4" />
                                <span className="uppercase text-xs font-bold truncate max-w-[80px]">
                                    {isLoading ? '...' : language.toUpperCase()}
                                </span>
                                <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border shadow-xl rounded-xl p-1 mt-2 max-h-[300px] overflow-y-auto">
                            {isLoading ? (
                                <div className="p-2 flex justify-center"><Loader2 className="w-4 h-4 animate-spin" /></div>
                            ) : (
                                availableLanguages.map((lang) => (
                                    <DropdownMenuItem
                                        key={lang.code}
                                        onClick={() => setLanguage(lang.code)}
                                        className={`cursor-pointer rounded-lg px-4 py-2 text-sm transition-colors ${
                                            language === lang.code 
                                            ? 'bg-primary/10 text-primary font-bold hover:bg-primary/20 hover:text-primary' 
                                            : 'text-foreground hover:bg-primary/10 hover:text-foreground'
                                        }`}
                                    >
                                        <span className="flex items-center justify-between w-full">
                                            {lang.name}
                                            {/* Kennzeichnung für manuell übersetzte Sprachen */}
                                            {(lang.code === 'de' || lang.code === 'en') && (
                                                <span className="ml-2 text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                                                    Official
                                                </span>
                                            )}
                                        </span>
                                    </DropdownMenuItem>
                                ))
                            )}
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
                                    className="text-foreground hover:bg-primary/10 font-medium rounded-lg"
                                >
                                    Dashboard
                                </Button>
                                <Button
                                    onClick={logout}
                                    variant="outline"
                                    className="border-border text-foreground hover:bg-primary/10 font-medium rounded-lg"
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/login')}
                                    className="text-foreground hover:bg-primary/10 hover:text-foreground font-medium rounded-lg"
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
