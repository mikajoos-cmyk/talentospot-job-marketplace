import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { Heart, MapPin, Briefcase, Users, Building2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { mockFollowing, mockFollowers } from '@/data/mockInvitations';
import { mockCompanies } from '@/data/mockCompanies';

const Network: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useUser();
  const [following, setFollowing] = React.useState(mockFollowing);

  const handleUnfollow = (companyId: string, companyName: string) => {
    setFollowing(following.filter(f => f.companyId !== companyId));
    showToast({
      title: 'Unfollowed',
      description: `You unfollowed ${companyName}`,
    });
  };

  const isPremium = user.packageTier === 'premium';

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">My Network</h1>
          <p className="text-body text-muted-foreground">
            Manage your professional connections and followers.
          </p>
        </div>

        <Tabs defaultValue="following" className="w-full">
          <TabsList className="bg-muted">
            <TabsTrigger value="following" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Heart className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Following ({following.length})
            </TabsTrigger>
            <TabsTrigger value="followers" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Users className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Followers ({mockFollowers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="mt-6">
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
            )}
          </TabsContent>

          <TabsContent value="followers" className="mt-6">
            {!isPremium ? (
              <Card className="p-12 border border-border bg-card text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
                    <Users className="w-10 h-10 text-warning" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-h2 font-heading text-foreground mb-4">Premium Feature</h3>
                  <p className="text-body-lg text-foreground mb-2">
                    <span className="font-bold text-primary">{mockFollowers.length} companies</span> are interested in your profile
                  </p>
                  <p className="text-body text-muted-foreground mb-8">
                    Upgrade to Premium to see which companies have shortlisted you.
                  </p>
                  <Button 
                    onClick={() => navigate('/candidate/packages')}
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal h-12 px-8"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockFollowers.map((follower) => {
                  const company = mockCompanies.find(c => c.id === follower.companyId);
                  return (
                    <Card key={follower.id} className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={company?.logo || 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png'}
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Network;
