import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, ArrowRight, Users, Briefcase, TrendingUp, Building2, Calendar } from 'lucide-react';
import { mockCandidates } from '@/data/mockCandidates';
import { mockJobs } from '@/data/mockJobs';
import { mockCompanies } from '@/data/mockCompanies';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUser();

  useEffect(() => {
    if (isAuthenticated) {
      const dashboardPath = user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard';
      navigate(dashboardPath);
    }
  }, [isAuthenticated, user.role, navigate]);

  const previewCandidates = mockCandidates.slice(0, 6);
  const featuredJobs = mockJobs.filter(job => job.featured).slice(0, 6);
  const topCompanies = mockCompanies.slice(0, 6);

  const handleViewProfile = () => {
    navigate('/login');
  };

  const handleViewJob = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <img
            src="https://c.animaapp.com/mktjfn7fdsCv0P/img/uploaded-asset-1769361458695-0.png"
            alt="TalentoSpot"
            className="h-10 w-auto"
          />
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const dashboardPath = user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard';
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

      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-h1 md:text-[48px] font-heading text-foreground mb-6 leading-tight">
            Discover Top Talent
          </h2>
          <p className="text-body-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with skilled professionals and find the perfect match for your team.
            Join thousands of companies building their dream teams.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal h-12 px-8"
            >
              Start Hiring <ArrowRight className="ml-2 w-5 h-5" strokeWidth={2} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/register')}
              className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal h-12 px-8"
            >
              Find Jobs
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-h4 font-heading text-foreground mb-2">10,000+ Talents</h3>
              <p className="text-body-sm text-muted-foreground">Verified professionals ready to join your team</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="text-h4 font-heading text-foreground mb-2">5,000+ Companies</h3>
              <p className="text-body-sm text-muted-foreground">Leading employers trust our platform</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-info/10 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-info" strokeWidth={1.5} />
              </div>
              <h3 className="text-h4 font-heading text-foreground mb-2">95% Success Rate</h3>
              <p className="text-body-sm text-muted-foreground">Successful placements and satisfied clients</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-h2 font-heading text-foreground mb-4">Latest Opportunities</h3>
            <p className="text-body text-muted-foreground">
              Explore exciting job openings from top companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {featuredJobs.map((job) => (
              <Card
                key={job.id}
                className="p-5 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1"
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex items-start justify-between">
                    <img
                      src={job.image}
                      alt={job.company}
                      className="w-12 h-12 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <span className="px-2 py-1 bg-primary/10 text-primary text-caption rounded-md">
                      Featured
                    </span>
                  </div>

                  <div>
                    <h4 className="text-h4 font-heading text-foreground mb-1">{job.title}</h4>
                    <p className="text-body-sm text-muted-foreground">{job.company}</p>
                  </div>

                  <p className="text-body-sm text-foreground line-clamp-2">{job.description}</p>

                  <div className="space-y-1.5">
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <DollarSign className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
                      <span>{new Date(job.datePosted).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {job.attributes?.entryBonus && (
                    <div className="bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
                      <span className="text-body-sm font-medium text-warning">
                        Entry Bonus: €{job.attributes.entryBonus.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Button
                    onClick={handleViewJob}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-medium text-body-sm h-9"
                  >
                    View Job
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              View All Jobs <ArrowRight className="ml-2 w-5 h-5" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-h2 font-heading text-foreground mb-4">Top Employers</h3>
            <p className="text-body text-muted-foreground">
              Join leading companies hiring on TalentoSpot
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-7xl mx-auto">
            {topCompanies.map((company) => (
              <Card
                key={company.id}
                className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1 text-center"
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-16 h-16 mx-auto mb-3 rounded-lg object-cover"
                  loading="lazy"
                />
                <h4 className="text-body font-medium text-foreground mb-1">{company.name}</h4>
                <p className="text-caption text-muted-foreground mb-2">{company.activeJobs} jobs</p>
                {company.openForRefugees && (
                  <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-caption rounded-md">
                    Open for Refugees
                  </span>
                )}
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              View All Companies <ArrowRight className="ml-2 w-5 h-5" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-h2 font-heading text-foreground mb-4">Featured Talent</h3>
            <p className="text-body text-muted-foreground">
              Preview our talented professionals. Sign up to view full profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {previewCandidates.map((candidate) => (
              <Card
                key={candidate.id}
                className="p-5 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1"
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="w-14 h-14 blur-md">
                        <AvatarImage src={candidate.avatar} alt={candidate.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      {candidate.isRefugee && (
                        <span className="inline-block px-2 py-0.5 bg-accent/10 text-accent text-caption rounded-md mb-1">
                          Refugee/Immigrant
                        </span>
                      )}
                      <h4 className="text-h4 font-heading text-foreground truncate">
                        Candidate #{candidate.id.padStart(3, '0')}
                      </h4>
                      <p className="text-body-sm text-muted-foreground">{candidate.title}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
                      <span>{candidate.location}</span>
                    </div>
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <DollarSign className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
                      <span>
                        ${candidate.salary.min.toLocaleString()} - ${candidate.salary.max.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill.name}
                        className="px-2 py-0.5 bg-muted text-foreground text-caption rounded-md"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="px-2 py-0.5 bg-muted text-foreground text-caption rounded-md">
                        +{candidate.skills.length - 3}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={handleViewProfile}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-medium text-body-sm h-9"
                  >
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              View All Candidates <ArrowRight className="ml-2 w-5 h-5" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-secondary text-secondary-foreground py-12 border-t border-secondary-hover">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img
                src="https://c.animaapp.com/mktjfn7fdsCv0P/img/uploaded-asset-1769361458695-0.png"
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
                    onClick={() => navigate('/register')}
                    className="text-body-sm text-muted-foreground hover:text-secondary-foreground transition-colors"
                  >
                    Find Talent
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/register')}
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
              © 2024 TalentoSpot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
