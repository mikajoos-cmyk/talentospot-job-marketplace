import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import AppLayout from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/button';
import { MapPin, Users, Building2, Globe, ArrowLeft, Briefcase, DollarSign, Calendar, Heart, Send, Star, Loader2, MapIcon } from 'lucide-react';
import { getCoordinates } from '../../utils/geocoding';
import MapView from '../../components/maps/MapView';
import { employerService } from '../../services/employer.service';
import { jobsService } from '../../services/jobs.service';
import { useToast } from '../../contexts/ToastContext';
import ReviewCard from '../../components/shared/ReviewCard';
// import ReviewModal from '../../components/shared/ReviewModal';
import { useUser } from '../../contexts/UserContext';
import { followsService } from '../../services/follows.service';
import { analyticsService } from '../../services/analytics.service';

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useUser(); // Need user context
  const [company, setCompany] = useState<any>(null);
  const [companyJobs, setCompanyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [companyData, jobsData] = await Promise.all([
          employerService.getEmployerById(id),
          jobsService.getJobsByEmployer(id)
        ]);
        setCompany(companyData);
        setCompanyJobs(jobsData);

        // Check follow status if user is logged in
        if (user?.profile?.id && user.role === 'candidate') {
          const following = await followsService.isFollowing(user.profile.id, id);
          setIsFollowing(following);

          // Record profile view
          try {
            await analyticsService.recordView(user.id, id, 'employer');
          } catch (analyticsError) {
            console.error('Failed to record profile view:', analyticsError);
          }
        }

      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user?.profile?.id, user?.role]);

  React.useEffect(() => {
    const fetchCoords = async () => {
      if (company?.headquarters_city) {
        const coords = await getCoordinates(company.headquarters_city, company.headquarters_country);
        if (coords) {
          setMapCenter([coords.latitude, coords.longitude]);
        }
      }
    };
    if (company) {
      fetchCoords();
    }
  }, [company]);

  // Use empty reviews/rating for now as they are not in the current DB schema per survey
  const companyReviews: any[] = [];
  const averageRating = 0;

  const handleFollow = async () => {
    if (!user?.profile?.id) {
      showToast({
        title: 'Authentication required',
        description: 'Please log in to follow companies',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isFollowing) {
        await followsService.unfollowEmployer(user.profile.id, id!);
        setIsFollowing(false);
        showToast({
          title: 'Unfollowed',
          description: `You unfollowed ${company?.company_name}`,
        });
      } else {
        await followsService.followEmployer(user.profile.id, id!);
        setIsFollowing(true);
        showToast({
          title: 'Following',
          description: `You are now following ${company?.company_name}`,
        });
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive',
      });
    }
  }; const handleMessage = () => {
    navigate(`/candidate/messages?conversationId=${company?.id}`);
  };

  const handleSubmitReview = (_rating: number, _comment: string) => {
    showToast({
      title: 'Review Submitted',
      description: `Your review for ${company?.company_name} has been submitted`,
    });
    setReviewModalOpen(false);
  };



  if (loading) {
    return (
      <AppLayout isPublic={user.role === 'guest'}>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!company) {
    return (
      <AppLayout isPublic={user.role === 'guest'}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-h2 font-heading text-foreground mb-4">Company Not Found</h2>
            <Button onClick={() => navigate(-1)} className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal">
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout isPublic={user.role === 'guest'}>
      <div className="container mx-auto py-12 max-w-6xl">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="bg-transparent text-foreground hover:bg-muted hover:text-foreground font-normal"
          >
            <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Back to Jobs
          </Button>
        </div>
        <div className="space-y-8">
          <Card className="p-8 md:p-12 border border-border bg-card">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <img
                src={company.logo_url || "https://via.placeholder.com/128"}
                alt={company.company_name}
                className={`w-32 h-32 rounded-lg object-cover shadow-md ${user.role === 'guest' ? 'blur-md select-none' : ''}`}
                loading="lazy"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h1 className={`text-h1 font-heading text-foreground ${user.role === 'guest' ? 'blur-md select-none' : ''}`}>
                    {company.company_name}
                  </h1>
                  {company.open_for_refugees && (
                    <span className="px-3 py-1 bg-accent/10 text-accent text-body-sm rounded-full border border-accent/30">
                      Open for Refugees
                    </span>
                  )}
                </div>

                {user.role !== 'guest' ? (
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? 'default' : 'outline'}
                      className={`font-normal ${isFollowing
                        ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                        : 'bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground'
                        }`}
                    >
                      <Heart
                        className="w-4 h-4 mr-2"
                        strokeWidth={1.5}
                        fill={isFollowing ? 'currentColor' : 'none'}
                      />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button
                      onClick={handleMessage}
                      variant="outline"
                      className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                    >
                      <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Send Message
                    </Button>
                    <Button
                      onClick={() => setReviewModalOpen(true)}
                      variant="outline"
                      className="bg-transparent text-accent border-accent hover:bg-accent hover:text-accent-foreground font-normal"
                    >
                      <Star className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Write Review
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 mb-4 bg-muted/30 p-3 rounded-lg border border-dashed border-border">
                    <p className="text-body-sm text-muted-foreground mr-2 font-medium self-center">Login to follow or message this company.</p>
                    <Button size="sm" variant="outline" onClick={() => navigate('/login')} className="bg-primary text-primary-foreground text-xs font-bold border-none">Log In</Button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center text-body text-foreground">
                    <Building2 className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                    <span>{company.industry}</span>
                  </div>
                  <div className="flex items-center text-body text-foreground">
                    <Users className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                    <span>{company.company_size} employees</span>
                  </div>
                  <div className="flex items-center text-body text-foreground">
                    <MapPin className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                    <span>{company.headquarters_city}, {company.headquarters_country}</span>
                  </div>
                  {company.website && (
                    <div className="flex items-center text-body text-foreground">
                      <Globe className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                      <a
                        href={company.website?.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-primary hover:text-primary-hover hover:underline ${user.role === 'guest' ? 'blur-md select-none pointer-events-none' : ''}`}
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
            <div
              className="text-body text-foreground leading-relaxed prose prose-sm max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: company.description }}
            />

            <div className="mt-8">
              <h3 className="text-h3 font-heading text-foreground mb-4 flex items-center">
                <MapIcon className="w-6 h-6 mr-2 text-primary" strokeWidth={1.5} />
                Headquarters Location
              </h3>
              {mapCenter ? (
                <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
                  <MapView
                    center={mapCenter}
                    zoom={13}
                    height="350px"
                    showRadius={false}
                  />
                  <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-primary mr-2" />
                      <span className="text-body-sm font-medium">{company.headquarters_city}, {company.headquarters_country}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-primary" strokeWidth={1.5} />
                    <p className="text-body font-medium text-foreground">{company.headquarters_city}, {company.headquarters_country}</p>
                  </div>
                </div>
              )}
            </div>
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
                        <div
                          className="text-body-sm text-foreground mb-3 line-clamp-2 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: job.description }}
                        />
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center text-body-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            <span>{job.city}, {job.country}</span>
                          </div>
                          <div className="flex items-center text-body-sm text-muted-foreground">
                            <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            <span>{job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max} ${job.salary_currency || 'EUR'}` : 'Competitive'}</span>
                          </div>
                          <div className="flex items-center text-body-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {job.entry_bonus && (
                          <div className="mt-3 inline-block px-3 py-1 bg-warning/10 text-warning text-caption rounded-md border border-warning/30">
                            Entry Bonus: €{job.entry_bonus.toLocaleString()}
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

          <Card className="p-8 border border-border bg-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Star className="w-6 h-6 text-accent" strokeWidth={1.5} />
                <h2 className="text-h2 font-heading text-foreground">Reviews</h2>
              </div>
              {companyReviews.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.round(averageRating)
                          ? 'text-accent fill-accent'
                          : 'text-muted-foreground'
                          }`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="text-h4 font-heading text-foreground">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    ({companyReviews.length} {companyReviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>

            {companyReviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-body text-muted-foreground mb-6">No reviews yet</p>
                <Button
                  onClick={() => setReviewModalOpen(true)}
                  variant="outline"
                  className="bg-transparent text-accent border-accent hover:bg-accent hover:text-accent-foreground font-normal"
                >
                  Write First Review
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {companyReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Reviews are temporarily disabled as they are not in the current DB schema */}
      {/* <ReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        targetName={company.company_name}
        targetRole="employer"
        onSubmit={handleSubmitReview}
      /> */}
    </AppLayout>
  );
};

export default CompanyDetail;
