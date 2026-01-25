import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Briefcase, Heart } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { mockFollowing } from '@/data/mockInvitations';
import { mockCompanies } from '@/data/mockCompanies';

const Following: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [following, setFollowing] = useState(mockFollowing);

  const handleUnfollow = (companyId: string, companyName: string) => {
    setFollowing(following.filter(f => f.companyId !== companyId));
    showToast({
      title: 'Unfollowed',
      description: `You unfollowed ${companyName}`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">Following</h1>
          <p className="text-body text-muted-foreground">
            Companies you're following to stay updated on their opportunities.
          </p>
        </div>

        {following.length === 0 ? (
          <Card className="p-12 border border-border bg-card text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
            <h3 className="text-h3 font-heading text-foreground mb-2">Not Following Anyone Yet</h3>
            <p className="text-body text-muted-foreground mb-6">
              Start following companies to get updates on their job postings.
            </p>
            <Button 
              onClick={() => navigate('/candidate/jobs')}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              Discover Companies
            </Button>
          </Card>
        ) : (
          <div>
            <p className="text-body text-foreground mb-6">
              <span className="font-medium">{following.length}</span> companies
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {following.map((follow) => {
                const company = mockCompanies.find(c => c.id === follow.companyId);
                return (
                  <Card key={follow.id} className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <img
                          src={follow.companyLogo}
                          alt={follow.companyName}
                          className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          loading="lazy"
                          onClick={() => navigate(`/companies/${follow.companyId}`)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnfollow(follow.companyId, follow.companyName)}
                          className="bg-transparent text-error hover:bg-error/10 hover:text-error"
                          aria-label="Unfollow"
                        >
                          <Heart className="w-5 h-5" strokeWidth={1.5} fill="currentColor" />
                        </Button>
                      </div>

                      <div>
                        <h3 
                          className="text-h4 font-heading text-foreground mb-1 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => navigate(`/companies/${follow.companyId}`)}
                        >
                          {follow.companyName}
                        </h3>
                        {company && (
                          <>
                            <p className="text-body-sm text-muted-foreground mb-3">{company.industry}</p>
                            <div className="space-y-2">
                              <div className="flex items-center text-body-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
                                <span>{company.location}</span>
                              </div>
                              <div className="flex items-center text-body-sm text-muted-foreground">
                                <Briefcase className="w-4 h-4 mr-2" strokeWidth={1.5} />
                                <span>{company.activeJobs} active jobs</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <Button 
                        onClick={() => navigate(`/companies/${follow.companyId}`)}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                      >
                        View Company
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Following;
