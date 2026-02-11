import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowRight, Loader2, Star, Briefcase } from 'lucide-react';
import { jobsService } from '../services/jobs.service';
import { employerService } from '../services/employer.service';
import { candidateService } from '../services/candidate.service';
import PublicHeader from '../components/layout/PublicHeader';
import MainHeroFilter from '../components/landing/MainHeroFilter';
import QuickAccessStatus from '../components/landing/QuickAccessStatus';
import CandidateListCard from '../components/landing/CandidateListCard';
import JobListCard from '../components/landing/JobListCard';
import Footer from '../components/layout/Footer';
import { Globe } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();

  useEffect(() => {
    if (isAuthenticated) {
      const dashboardPath = user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard';
      navigate(dashboardPath);
    }
  }, [isAuthenticated, user.role, navigate]);

  const [latestJobs, setLatestJobs] = useState<any[]>([]);
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

        const featuredPromise = jobsService.getFeaturedJobs(3).catch(err => {
          console.error('Failed to fetch featured jobs:', err);
          return [];
        });

        const [jobs, companies, candidates, featured] = await Promise.all([
          jobsPromise,
          companiesPromise,
          candidatesPromise,
          featuredPromise
        ]);

        setLatestJobs(jobs);
        setTopCompanies(companies);
        setPreviewCandidates(candidates);
        setFeaturedJobs(featured);
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
          <div className="absolute top-4 right-4 md:top-8 md:right-6 flex flex-col items-end gap-2 z-20">
            <Button
              size="sm"
              onClick={() => navigate('/register')}
              className="px-4 bg-primary/10 text-primary hover:bg-primary/20 font-bold h-9 rounded-full border border-primary/20 shadow-none text-xs uppercase tracking-wider"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/how-it-works')}
              className="px-4 text-muted-foreground hover:bg-muted font-bold h-9 rounded-full border border-transparent hover:border-border text-xs uppercase tracking-wider"
            >
              How it works
            </Button>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20 animate-fade-in">
            <Star className="w-3 h-3 fill-primary" />
            The Future of Recruitment
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading text-foreground mb-6 leading-[1.1] tracking-tight">
            <span>Connecting</span> <span className="text-primary italic">Ambition</span> <br className="hidden md:block" /> <span>with Opportunity.</span>
          </h1>
          <p className="text-body-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            <span>Discover a world of talented professionals and leading employers.</span>
            <br />
            <span>Automated matching, verified profiles, and seamless communication.</span>
          </p>

          <MainHeroFilter />

          <QuickAccessStatus />

          {/* Registration Prompts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mt-8 mb-12">
            <Card
              className="p-6 border-2 border-primary/20 hover:border-primary/40 bg-white/50 backdrop-blur-sm cursor-pointer group transition-all duration-300 hover:-translate-y-1"
              onClick={() => navigate('/register?role=candidate')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-foreground">For Candidates</h3>
                  <p className="text-sm text-muted-foreground">Find your dream job now</p>
                </div>
                <ArrowRight className="ml-auto w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>

            <Card
              className="p-6 border-2 border-accent/20 hover:border-accent/40 bg-white/50 backdrop-blur-sm cursor-pointer group transition-all duration-300 hover:-translate-y-1"
              onClick={() => navigate('/register?role=employer')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-foreground">For Employers</h3>
                  <p className="text-sm text-muted-foreground">Hire top talent today</p>
                </div>
                <ArrowRight className="ml-auto w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Talent Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-4">Featured Talents</h2>
              <p className="text-muted-foreground">Discover skilled professionals available for hire.</p>
            </div>
            <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold" onClick={() => navigate('/candidates')}>
              View All Candidates
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {previewCandidates.map((candidate) => (
              <CandidateListCard
                key={candidate.id}
                candidate={candidate}
                onViewProfile={(id) => navigate(`/candidates/${id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <section className="py-24 bg-primary/5">
          <div className="container mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-4">Featured Jobs</h2>
                <p className="text-muted-foreground">Top opportunities selected for you.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {featuredJobs.map((job) => (
                <JobListCard
                  key={job.id}
                  job={job}
                  onViewDetail={(id) => navigate(`/jobs/${id}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Employers Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-4">Top Employers</h2>
            <p className="text-muted-foreground">Work with industry leaders and innovative companies.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topCompanies.map((company) => (
              <Card key={company.id} className="p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 group cursor-pointer bg-white overflow-hidden relative" onClick={() => navigate(`/companies/${company.id}`)}>
                <div className="flex items-center gap-4 mb-4 blur-md select-none">
                  <div className="w-16 h-16 rounded-xl bg-primary/5 flex items-center justify-center p-2 border border-primary/5 group-hover:bg-primary/10 transition-colors overflow-hidden">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.company_name} className="w-full h-full object-contain" />
                    ) : (
                      <Globe className="w-8 h-8 text-primary/40" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{company.company_name}</h3>
                    <p className="text-sm text-muted-foreground">{company.industry || 'Technology & Software'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 absolute bottom-6 right-6">
                  View Company Profile
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-4">Latest Opportunities</h2>
              <p className="text-muted-foreground">Explore the most recent job postings.</p>
            </div>
            <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold" onClick={() => navigate('/jobs')}>
              Browse All Jobs
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {latestJobs.map((job) => (
              <JobListCard
                key={job.id}
                job={job}
                onViewDetail={(id) => navigate(`/jobs/${id}`)}
              />
            ))}
          </div>
        </div>
      </section>
      
      {!isAuthenticated && <Footer />}
    </div>
  );
};

export default LandingPage;
