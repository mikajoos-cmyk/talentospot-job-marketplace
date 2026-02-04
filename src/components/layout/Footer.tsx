import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

const Footer: React.FC = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-foreground text-background py-20 mt-16">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-background/10 pb-16">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <img src={logoImg} alt="TalentoSpot" className="h-8 w-auto brightness-0 invert" />
                            <span className="text-2xl font-heading font-black tracking-tighter">TalentoSpot</span>
                        </div>
                        <p className="text-sm text-background/60 leading-relaxed">
                            Empowering the next generation of global talent through smart technology and human-centric design.
                        </p>
                    </div>

                    <div>
                        <h5 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary">Explore</h5>
                        <ul className="space-y-4">
                            <li><button onClick={() => navigate('/candidates')} className="text-sm text-background/80 hover:text-white transition-colors">Find Talent</button></li>
                            <li><button onClick={() => navigate('/jobs')} className="text-sm text-background/80 hover:text-white transition-colors">Find Jobs</button></li>
                            <li><button onClick={() => navigate('/login')} className="text-sm text-background/80 hover:text-white transition-colors">Sign In</button></li>
                            <li><button onClick={() => navigate('/register')} className="text-sm text-background/80 hover:text-white transition-colors">Get Started</button></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary">Platform</h5>
                        <ul className="space-y-4">
                            <li><button onClick={() => navigate('/how-it-works')} className="text-sm text-background/80 hover:text-white transition-colors">How it Works</button></li>
                            <li><button onClick={() => navigate('/about')} className="text-sm text-background/80 hover:text-white transition-colors">About Us</button></li>
                            <li><button onClick={() => navigate('/pricing')} className="text-sm text-background/80 hover:text-white transition-colors">Pricing Plans</button></li>
                            <li><button onClick={() => navigate('/faq')} className="text-sm text-background/80 hover:text-white transition-colors">FAQ</button></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary">Legal</h5>
                        <ul className="space-y-4">
                            <li><button onClick={() => navigate('/imprint')} className="text-sm text-background/80 hover:text-white transition-colors">Imprint</button></li>
                            <li><button onClick={() => navigate('/privacy')} className="text-sm text-background/80 hover:text-white transition-colors">Privacy Policy</button></li>
                            <li><button onClick={() => navigate('/terms')} className="text-sm text-background/80 hover:text-white transition-colors">Terms of Service</button></li>
                            <li><button onClick={() => navigate('/contact')} className="text-sm text-background/80 hover:text-white transition-colors">Contact Support</button></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-background/40">© 2026 TalentoSpot. Engineering Excellence in Recruitment.</p>
                    <div className="flex gap-8">
                        <button onClick={() => navigate('/linkedin')} className="text-xs text-background/40 hover:text-white transition-colors font-medium">LinkedIn</button>
                        <button onClick={() => navigate('/instagram')} className="text-xs text-background/40 hover:text-white transition-colors font-medium">Instagram</button>
                        <button onClick={() => navigate('/twitter')} className="text-xs text-background/40 hover:text-white transition-colors font-medium">Twitter (X)</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
