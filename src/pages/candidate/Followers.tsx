import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Lock, Star, Building2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { mockFollowers } from '../../data/mockInvitations';
import { mockCompanies } from '../../data/mockCompanies';
import { CandidateFollower } from '../../types/invitation';

const Followers: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const isPremium = user.packageTier === 'premium';

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">Companies Interested in You</h1>
          <p className="text-body text-muted-foreground">
            See which companies have shortlisted your profile.
          </p>
        </div>

        {!isPremium ? (
          <Card className="p-12 border border-border bg-card text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
                <Lock className="w-10 h-10 text-warning" strokeWidth={1.5} />
              </div>
              <h3 className="text-h2 font-heading text-foreground mb-4">Premium Feature</h3>
              <p className="text-body-lg text-foreground mb-2">
                <span className="font-bold text-primary">{mockFollowers.length} companies</span> are interested in your profile
              </p>
              <p className="text-body text-muted-foreground mb-8">
                Upgrade to Premium to see which companies have shortlisted you and get direct access to opportunities.
              </p>

              <div className="bg-muted/50 rounded-lg p-8 mb-8 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="blur-sm">
                      <div className="flex items-center space-x-3 p-4 bg-background rounded-lg">
                        <div className="w-12 h-12 rounded-lg bg-muted"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => navigate('/candidate/packages')}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal h-12 px-8"
              >
                <Star className="w-5 h-5 mr-2" strokeWidth={2} fill="currentColor" />
                Upgrade to Premium
              </Button>
            </div>
          </Card>
        ) : (
          <div>
            <p className="text-body text-foreground mb-6">
              <span className="font-medium">{mockFollowers.length}</span> companies are following you
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockFollowers.map((follower: CandidateFollower) => {
                const company = mockCompanies.find((c: any) => c.id === follower.companyId);
                return (
                  <Card key={follower.id} className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={company?.logo || 'https://ui-avatars.com/api/?name=' + company?.name + '&background=6366f1&color=fff'}
                          alt={follower.companyName}
                          className="w-16 h-16 rounded-lg object-cover"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <h3 className="text-h4 font-heading text-foreground mb-1">{follower.companyName}</h3>
                          {company && (
                            <p className="text-body-sm text-muted-foreground">{company.industry}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center text-caption text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        <span>Shortlisted {new Date(follower.followedDate).toLocaleDateString()}</span>
                      </div>

                      <Button
                        onClick={() => navigate(`/companies/${follower.companyId}`)}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                      >
                        <Building2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
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

export default Followers;
