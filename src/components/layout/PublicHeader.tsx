import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import logoImg from '@/assets/logo.png';

const PublicHeader: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useUser();

    return (
        <header className="sticky top-0 z-50 bg-card border-b border-border">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <img
                        src={logoImg}
                        alt="TalentoSpot"
                        className="h-10 w-auto cursor-pointer"
                        onClick={() => navigate('/')}
                    />
                    <nav className="flex items-center space-x-1 sm:space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/candidates')}
                            className="bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal"
                        >
                            Candidates
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/jobs')}
                            className="bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal"
                        >
                            Jobs
                        </Button>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    const dashboardPath = user?.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard';
                                    navigate(dashboardPath);
                                }}
                                className="bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal"
                            >
                                Dashboard
                            </Button>
                            <Button
                                onClick={logout}
                                variant="outline"
                                className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/login')}
                                className="bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal"
                            >
                                Sign In
                            </Button>
                            <Button
                                onClick={() => navigate('/register')}
                                className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                            >
                                Get Started
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default PublicHeader;
