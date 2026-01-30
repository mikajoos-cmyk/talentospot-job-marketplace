import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

const Footer: React.FC = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-secondary text-secondary-foreground py-12 border-t border-secondary-hover mt-16">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <img
                            src={logoImg}
                            alt="TalentoSpot"
                            className="h-8 w-auto mb-4 brightness-0 invert"
                        />
                        <p className="text-body-sm text-muted-foreground">
                            Connecting talented professionals with leading companies worldwide.
                        </p>
                    </div>
                    <div>
                        <h5 className="text-body font-medium text-secondary-foreground mb-4">Explore</h5>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => navigate('/candidates')}
                                    className="text-body-sm text-muted-foreground hover:text-secondary-foreground transition-colors"
                                >
                                    Find Talent
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => navigate('/jobs')}
                                    className="text-body-sm text-muted-foreground hover:text-secondary-foreground transition-colors"
                                >
                                    Find Jobs
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-body-sm text-muted-foreground hover:text-secondary-foreground transition-colors"
                                >
                                    Sign In
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-body font-medium text-secondary-foreground mb-4">Company</h5>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-body-sm text-muted-foreground hover:text-secondary-foreground transition-colors">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-body-sm text-muted-foreground hover:text-secondary-foreground transition-colors">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-body-sm text-muted-foreground hover:text-secondary-foreground transition-colors">
                                    Privacy Policy
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-secondary-hover text-center">
                    <p className="text-caption text-muted-foreground">
                        © 2026 TalentoSpot. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
