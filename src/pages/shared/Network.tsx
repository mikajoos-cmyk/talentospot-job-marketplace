import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { Heart, MapPin, Users, Building2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { followsService } from '@/services/follows.service';
import { shortlistsService } from '@/services/shortlists.service';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Network: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useUser();
  const [following, setFollowing] = React.useState<any[]>([]);
  const [followers, setFollowers] = React.useState<any[]>([]);
  const [shortlistedCandidates, setShortlistedCandidates] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const isEmployer = user?.role === 'employer';
  const isCandidate = user?.role === 'candidate';

  React.useEffect(() => {
    const fetchData = async () => {
      if (!user?.profile?.id) return;

      try {
        setLoading(true);

        if (isCandidate) {
          // Fetch companies I follow
          const followingData = await followsService.getFollowingEmployers(user.profile.id);
          setFollowing(followingData || []);

          // Fetch companies that shortlisted me (followers)
          const followersData = await shortlistsService.getCompaniesShortlistingCandidate(user.profile.id);
          setFollowers(followersData || []);
        } else if (isEmployer) {
          // Fetch candidates I shortlisted
          const shortlistedData = await shortlistsService.getShortlist(user.profile.id);
          setShortlistedCandidates(shortlistedData || []);

          // Fetch candidates who follow me (via follows table)
          const followersData = await followsService.getFollowerCandidates(user.profile.id);
          setFollowers(followersData || []);
        }

      } catch (error) {
        console.error('Error fetching network data:', error);
        showToast({
          title: 'Error',
          description: 'Failed to load network data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.profile?.id) {
      fetchData();
    }
  }, [user?.profile?.id, user?.role, isCandidate, isEmployer]);

  const handleUnfollow = async (companyId: string, companyName: string) => {
    if (!user?.profile?.id) return;

    try {
      await followsService.unfollowEmployer(user.profile.id, companyId);
      setFollowing(prev => prev.filter(f => f.employer_id !== companyId));
      showToast({
        title: 'Unfollowed',
        description: `You unfollowed ${companyName}`,
      });
    } catch (error) {
      console.error('Error unfollowing:', error);
      showToast({
        title: 'Error',
        description: 'Failed to unfollow',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveFromShortlist = async (candidateId: string, candidateName: string) => {
    if (!user?.profile?.id) return;

    try {
      await shortlistsService.removeFromShortlist(user.profile.id, candidateId);
      setShortlistedCandidates(prev => prev.filter(s => s.candidate_id !== candidateId));
      showToast({
        title: 'Removed',
        description: `${candidateName} removed from shortlist`,
      });
    } catch (error) {
      console.error('Error removing from shortlist:', error);
      showToast({
        title: 'Error',
        description: 'Failed to remove from shortlist',
        variant: 'destructive',
      });
    }
  };

  const isPremium = isEmployer
    ? user.packageTier === 'premium'
    : (user.packageTier === 'starting' || user.packageTier === 'standard' || user.packageTier === 'premium');

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">My Network</h1>
          <p className="text-body text-muted-foreground">
            {user.role === 'candidate'
              ? 'Manage your professional connections and followers.'
              : 'View candidates you have shortlisted.'}
          </p>
        </div>

        <Tabs defaultValue={isCandidate ? "following" : "shortlisted"} className="w-full">
          <TabsList className="bg-muted">
            {isCandidate && (
              <TabsTrigger value="following" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                <Heart className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Following ({following.length})
              </TabsTrigger>
            )}
            {isEmployer && (
              <TabsTrigger value="shortlisted" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                <Heart className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Shortlisted ({shortlistedCandidates.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="followers" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Users className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Followers ({followers.length})
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
                  const company = follow.employer_profiles;
                  // Handle case where company profile might be missing or deleted
                  if (!company) return null;

                  return (
                    <Card key={follow.id} className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <img
                            src={company.logo_url || "https://via.placeholder.com/64"}
                            alt={company.company_name}
                            className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            loading="lazy"
                            onClick={() => navigate(`/companies/${company.id}`)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUnfollow(company.id, company.company_name)}
                            className="bg-transparent text-error hover:bg-error/10 hover:text-error"
                            aria-label="Unfollow"
                          >
                            <Heart className="w-5 h-5" strokeWidth={1.5} fill="currentColor" />
                          </Button>
                        </div>

                        <div>
                          <h3
                            className="text-h4 font-heading text-foreground mb-1 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => navigate(`/companies/${company.id}`)}
                          >
                            {company.company_name}
                          </h3>
                          <p className="text-body-sm text-muted-foreground mb-3">{company.industry}</p>
                          <div className="space-y-2">
                            <div className="flex items-center text-body-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
                              <span>{company.headquarters_city}, {company.headquarters_country}</span>
                            </div>
                            <div className="flex items-center text-body-sm text-muted-foreground">
                              <Building2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                              <span>{company.company_size} employees</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => navigate(`/companies/${company.id}`)}
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

          {/* Shortlisted Candidates Tab (Employer only) */}
          {isEmployer && (
            <TabsContent value="shortlisted" className="mt-6">
              {shortlistedCandidates.length === 0 ? (
                <Card className="p-12 border border-border bg-card text-center">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                  <h3 className="text-h3 font-heading text-foreground mb-2">No Shortlisted Candidates</h3>
                  <p className="text-body text-muted-foreground mb-6">
                    Start shortlisting candidates to keep track of potential hires.
                  </p>
                  <Button
                    onClick={() => navigate('/employer/candidates')}
                    className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                  >
                    Find Candidates
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shortlistedCandidates.map((shortlist) => {
                    const candidate = shortlist.candidate_profiles;
                    if (!candidate) return null;

                    return (
                      <Card key={shortlist.id} className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div
                              className="flex items-center space-x-3 cursor-pointer flex-1"
                              onClick={() => navigate(`/employer/candidates/${candidate.id}`)}
                            >
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={candidate.profiles?.avatar_url} alt={candidate.profiles?.full_name} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-h4 font-heading">
                                  {candidate.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-h4 font-heading text-foreground hover:text-primary transition-colors">
                                  {candidate.profiles?.full_name || 'Anonymous'}
                                </h3>
                                <p className="text-body-sm text-muted-foreground">{candidate.job_title}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFromShortlist(candidate.id, candidate.profiles?.full_name || 'Candidate')}
                              className="bg-transparent text-error hover:bg-error/10 hover:text-error"
                              aria-label="Remove from shortlist"
                            >
                              <Heart className="w-5 h-5" strokeWidth={1.5} fill="currentColor" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center text-body-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
                              <span>{candidate.city}, {candidate.country}</span>
                            </div>
                            <div className="flex items-center text-caption text-muted-foreground">
                              <Users className="w-4 h-4 mr-2" strokeWidth={1.5} />
                              <span>Shortlisted {new Date(shortlist.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => navigate(`/employer/candidates/${candidate.id}`)}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                          >
                            View Profile
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="followers" className="mt-6">
            {isCandidate && !isPremium ? (
              <Card className="p-12 border border-border bg-card text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
                    <Users className="w-10 h-10 text-warning" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-h2 font-heading text-foreground mb-4">Premium Feature</h3>
                  <p className="text-body-lg text-foreground mb-2">
                    <span className="font-bold text-primary">{followers.length} companies</span> are interested in your profile
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
            ) : followers.length === 0 ? (
              <Card className="p-12 border border-border bg-card text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground mb-2">No Followers Yet</h3>
                <p className="text-body text-muted-foreground">
                  {isCandidate
                    ? "When companies shortlist you, they will appear here."
                    : "When candidates follow your company, they will appear here."}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {followers.map((item) => {
                  if (isCandidate) {
                    // Item is a shortlist entry with employer_profiles
                    const company = item.employer_profiles;
                    if (!company) return null;

                    return (
                      <Card key={item.id} className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                            <img
                              src={company.logo_url || "https://via.placeholder.com/64"}
                              alt={company.company_name}
                              className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                              loading="lazy"
                              onClick={() => navigate(`/companies/${company.id}`)}
                            />
                            <div className="flex-1 min-w-0">
                              <h3
                                className="text-h4 font-heading text-foreground mb-1 truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={() => navigate(`/companies/${company.id}`)}
                              >
                                {company.company_name}
                              </h3>
                              <p className="text-body-sm text-muted-foreground truncate">{company.industry}</p>
                            </div>
                          </div>

                          <div className="flex items-center text-caption text-muted-foreground">
                            <Users className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            <span>Interested since {new Date(item.created_at).toLocaleDateString()}</span>
                          </div>

                          <Button
                            onClick={() => navigate(`/companies/${company.id}`)}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                          >
                            <Building2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            View Company
                          </Button>
                        </div>
                      </Card>
                    );
                  } else {
                    // User is Employer, item is a follow entry with candidate_profiles
                    const candidate = item.candidate_profiles;
                    if (!candidate) return null;

                    return (
                      <Card key={item.id} className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                            <Avatar
                              className="w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => navigate(`/employer/candidates/${candidate.id}`)}
                            >
                              <AvatarImage src={candidate.profiles?.avatar_url} alt={candidate.profiles?.full_name} />
                              <AvatarFallback className="bg-primary/10 text-primary text-h4 font-heading">
                                {candidate.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3
                                className="text-h4 font-heading text-foreground mb-1 truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={() => navigate(`/employer/candidates/${candidate.id}`)}
                              >
                                {candidate.profiles?.full_name || 'Candidate'}
                              </h3>
                              <p className="text-body-sm text-muted-foreground truncate">{candidate.job_title || 'No Title'}</p>
                            </div>
                          </div>

                          <div className="flex items-center text-caption text-muted-foreground">
                            <Users className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            <span>Following since {new Date(item.followed_at || item.created_at).toLocaleDateString()}</span>
                          </div>

                          <Button
                            onClick={() => navigate(`/employer/candidates/${candidate.id}`)}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                          >
                            <Users className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            View Profile
                          </Button>
                        </div>
                      </Card>
                    );
                  }
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
