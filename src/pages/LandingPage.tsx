import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowRight, Users, Briefcase, TrendingUp, Loader2, Star } from 'lucide-react';
import { jobsService } from '../services/jobs.service';
import { employerService } from '../services/employer.service';
import { candidateService } from '../services/candidate.service';
import PublicHeader from '../components/layout/PublicHeader';
import MainHeroFilter from '../components/landing/MainHeroFilter';
import QuickAccessStatus from '../components/landing/QuickAccessStatus';
import CandidateListCard from '../components/landing/CandidateListCard';
import JobListCard from '../components/landing/JobListCard';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();

  useEffect(() => {
    if (isAuthenticated) {
      const dashboardPath = user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard';
      navigate(dashboardPath);
    }
  }, [isAuthenticated, user.role, navigate]);

  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [previewCandidates, setPreviewCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const jobsPromise = jobsService.getLatestJobs(6).catch(err => {
          console.error('Failed to fetch jobs:', err);
          return [];
        });

        const companiesPromise = employerService.getTopCompanies(6).catch(err => {
          console.error('Failed to fetch companies:', err);
          return [];
        });

        const candidatesPromise = candidateService.getFeaturedTalent(6).catch(err => {
          console.error('Failed to fetch candidates:', err);
          return [];
        });

        const [jobs, companies, candidates] = await Promise.all([
          jobsPromise,
          companiesPromise,
          candidatesPromise
        ]);

        setFeaturedJobs(jobs);
        setTopCompanies(companies);
        setPreviewCandidates(candidates);
      } catch (error) {
        console.error('Error fetching landing page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Modern Hero Section */}
      <section className="relative pt-24 pb-40 md:pt-32 md:pb-52 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5 -z-10"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-accent/5 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2 -z-10"></div>

        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20 animate-fade-in">
            <Star className="w-3 h-3 fill-primary" />
            The Future of Recruitment
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading text-foreground mb-6 leading-[1.1] tracking-tight">
            Connecting <span className="text-primary italic">Ambition</span> <br className="hidden md:block" /> with Opportunity.
          </h1>
          <p className="text-body-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover a world of talented professionals and leading employers.
            Automated matching, verified profiles, and seamless communication.
          </p>

          <MainHeroFilter />
          <QuickAccessStatus />
        </div>
      </section>

      {/* Redesigned Sections: List Layouts */}
      <section className="py-24 bg-background border-t border-border/40">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-4">Featured Talents</h2>
              <p className="text-muted-foreground">Premium professionals currently looking for their next challenge. Quick matching guaranteed.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/candidates')}
              className="group border-primary/20 text-primary hover:bg-primary/5 font-bold"
            >
              Explore All Talents
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="flex flex-col gap-6">
            {previewCandidates.map((candidate) => (
              <CandidateListCard
                key={candidate.id}
                candidate={candidate}
                onViewProfile={() => navigate('/login')}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/20 border-y border-border/40">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-4">Latest Jobs</h2>
              <p className="text-muted-foreground">High-impact roles at innovative companies. Updated daily with fresh opportunities.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/jobs')}
              className="group border-primary/20 text-primary hover:bg-primary/5 font-bold"
            >
              Browse All Jobs
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {featuredJobs.map((job) => (
              <JobListCard
                key={job.id}
                job={job}
                onViewDetail={() => navigate('/login')}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-4">Top Employers</h2>
              <p className="text-muted-foreground">Shape your career at these market leaders. Vetted for culture and excellence.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/register')}
              className="group border-primary/20 text-primary hover:bg-primary/5 font-bold"
            >
              All Companies
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCompanies.map((company) => (
              <Card
                key={company.id}
                className="group p-6 border border-border/60 hover:border-primary/40 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-white shadow-sm border border-border/40 p-1 blur-md select-none">
                    <img
                      src={company.logo_url || "https://via.placeholder.com/64"}
                      alt={company.company_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors truncate blur-md select-none">{company.company_name}</h4>
                    <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      {company.industry}
                    </p>
                    {company.open_for_refugees && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider rounded border border-accent/20">
                        Open for Refugees
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary/10 border-y border-secondary/20 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-heading text-foreground mb-2">10,000+</h3>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Professionals</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent shadow-lg shadow-accent/30 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-300">
                <Briefcase className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-heading text-foreground mb-2">5,000+</h3>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Companies</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-info shadow-lg shadow-info/30 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-heading text-foreground mb-2">95%</h3>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-foreground text-background py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-background/10 pb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg"></div>
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
                <li><button onClick={() => navigate('/login')} className="text-sm text-background/80 hover:text-white transition-colors">Candidate Sign In</button></li>
                <li><button onClick={() => navigate('/login')} className="text-sm text-background/80 hover:text-white transition-colors">Employer Portal</button></li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary">Platforms</h5>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-background/80 hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="text-sm text-background/80 hover:text-white transition-colors">Pricing Plans</a></li>
                <li><a href="#" className="text-sm text-background/80 hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="text-sm text-background/80 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary">Connect</h5>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-background/80 hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-sm text-background/80 hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="text-sm text-background/80 hover:text-white transition-colors">Twitter (X)</a></li>
                <li><a href="#" className="text-sm text-background/80 hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-background/40">© 2026 TalentoSpot. Engineering Excellence in Recruitment.</p>
            <div className="flex gap-8">
              <a href="#" className="text-xs text-background/40 hover:text-white transition-colors font-medium underline-offset-4 hover:underline">Imprint</a>
              <a href="#" className="text-xs text-background/40 hover:text-white transition-colors font-medium underline-offset-4 hover:underline">Privacy Policy</a>
              <a href="#" className="text-xs text-background/40 hover:text-white transition-colors font-medium underline-offset-4 hover:underline">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
