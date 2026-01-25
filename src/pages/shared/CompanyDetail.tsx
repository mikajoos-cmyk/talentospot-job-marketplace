import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Building2, Globe, ArrowLeft, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { mockCompanies } from '@/data/mockCompanies';
import { mockJobs } from '@/data/mockJobs';

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const company = mockCompanies.find(c => c.id === id);
  const companyJobs = mockJobs.filter(job => job.company === company?.name);

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-h2 font-heading text-foreground mb-4">Company Not Found</h2>
          <Button onClick={() => navigate(-1)} className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal"
          >
            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Back to Jobs
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="space-y-8">
          <Card className="p-8 md:p-12 border border-border bg-card">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <img
                src={company.logo}
                alt={company.name}
                className="w-32 h-32 rounded-lg object-cover shadow-md"
                loading="lazy"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h1 className="text-h1 font-heading text-foreground">{company.name}</h1>
                  {company.openForRefugees && (
                    <span className="px-3 py-1 bg-accent/10 text-accent text-body-sm rounded-full border border-accent/30">
                      Open for Refugees
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center text-body text-foreground">
                    <Building2 className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                    <span>{company.industry}</span>
                  </div>
                  <div className="flex items-center text-body text-foreground">
                    <Users className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                    <span>{company.size} employees</span>
                  </div>
                  <div className="flex items-center text-body text-foreground">
                    <MapPin className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                    <span>{company.location}</span>
                  </div>
                  {company.website && (
                    <div className="flex items-center text-body text-foreground">
                      <Globe className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 border border-border bg-card">
            <h2 className="text-h2 font-heading text-foreground mb-6">About Us</h2>
            <p className="text-body text-foreground leading-relaxed whitespace-pre-line">
              {company.description}
            </p>
          </Card>

          <Card className="p-8 border border-border bg-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h2 font-heading text-foreground">Active Positions</h2>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <span className="text-body font-medium text-foreground">{companyJobs.length} open positions</span>
              </div>
            </div>

            {companyJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-body text-muted-foreground">No active positions at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {companyJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-6 border border-border rounded-lg hover:shadow-md transition-all duration-normal hover:-translate-y-1 cursor-pointer bg-background"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-h4 font-heading text-foreground mb-2">{job.title}</h3>
                        <p className="text-body-sm text-foreground mb-3 line-clamp-2">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center text-body-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center text-body-sm text-muted-foreground">
                            <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            <span>{job.salary}</span>
                          </div>
                          <div className="flex items-center text-body-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            <span>Posted {new Date(job.datePosted).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {job.attributes?.entryBonus && (
                          <div className="mt-3 inline-block px-3 py-1 bg-warning/10 text-warning text-caption rounded-md border border-warning/30">
                            Entry Bonus: €{job.attributes.entryBonus.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/jobs/${job.id}`);
                        }}
                        className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
