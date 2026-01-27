import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import {
  MapPin, Mail, Phone, Briefcase, GraduationCap, Award, Video,
  Image as ImageIcon, DollarSign, Plane, ArrowLeft,
  MessageSquare, UserPlus, Globe, Car, Star, Heart
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
import { candidateService } from '../../services/candidate.service';
import { jobsService } from '../../services/jobs.service';
import { shortlistsService } from '../../services/shortlists.service';
import ReviewCard from '../../components/shared/ReviewCard';
import ReviewModal from '../../components/shared/ReviewModal';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { getYouTubeEmbedUrl } from '../../lib/utils';

const CandidateDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { showToast } = useToast();
  const [candidate, setCandidate] = useState<any>(null);
  const [employerJobs, setEmployerJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [accessStatus, setAccessStatus] = useState<string>('none');
  const [isShortlisted, setIsShortlisted] = useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [candidateData, jobsData] = await Promise.all([
          candidateService.getCandidateProfile(id),
          user.role === 'employer' ? jobsService.getJobsByEmployer(user.id) : Promise.resolve([])
        ]);
        setCandidate(candidateData);
        setEmployerJobs(jobsData);

        if (user.role === 'employer' && user.profile?.id) {
          const status = await candidateService.checkDataAccess(id, user.profile.id);
          setAccessStatus(status);

          // Check shortlist status
          const shortlisted = await shortlistsService.isInShortlist(user.profile.id, id);
          setIsShortlisted(shortlisted);
        }
      } catch (error) {
        console.error('Error fetching candidate detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user.id, user.role, user.profile?.id]);

  // is_refugee etc. from DB
  // Strict privacy: Blurred unless request accepted.
  const isBlurred = accessStatus !== 'accepted';
  const canContact = !isBlurred && (user as any).packageTier === 'premium'; // Assuming premium unlocks contact AFTER reveal.

  // Reviews placeholder
  const candidateReviews: any[] = [];
  const averageRating = 0;

  const handleShortlist = async () => {
    if (!user?.profile?.id) return;

    try {
      if (isShortlisted) {
        await shortlistsService.removeFromShortlist(user.profile.id, id!);
        setIsShortlisted(false);
        showToast({
          title: 'Removed from Shortlist',
          description: `${candidate?.name || 'Candidate'} removed from shortlist`,
        });
      } else {
        await shortlistsService.addToShortlist(user.profile.id, id!);
        setIsShortlisted(true);
        showToast({
          title: 'Shortlisted',
          description: `${candidate?.name || 'Candidate'} added to your shortlist`,
        });
      }
    } catch (error) {
      console.error('Error updating shortlist:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update shortlist',
        variant: 'destructive',
      });
    }
  };

  const handleInvite = (jobTitle: string) => {
    showToast({
      title: 'Invitation Sent',
      description: `${candidate?.name} has been invited to apply for ${jobTitle}`,
    });
    setInviteDialogOpen(false);
  };

  const handleMessage = () => {
    navigate(`/employer/messages?conversationId=${candidate?.id}`);
  };

  const handleRequestData = async () => {
    if (!user.profile?.id) return;
    try {
      const result = await candidateService.requestDataAccess(candidate.id, user.profile.id);
      if (result.status === 'exists') {
        showToast({ title: 'Info', description: 'Request already pending or processed.' });
      } else {
        showToast({
          title: 'Request Sent',
          description: `Personal data request sent to candidate.`,
        });
        setAccessStatus('pending');
      }
    } catch (e) {
      showToast({ title: 'Error', description: 'Failed to request data.', variant: 'destructive' });
    }
  };

  const handleSubmitReview = (_rating: number, _comment: string) => {
    showToast({
      title: 'Review Submitted',
      description: `Your review for ${candidate?.name} has been submitted`,
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!candidate) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-h2 font-heading text-foreground mb-4">Candidate Not Found</h2>
          <Button onClick={() => navigate('/employer/candidates')} className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal">
            Back to Search
          </Button>
        </div>
      </AppLayout>
    );
  }

  const displayName = isBlurred ? `Candidate #${candidate.id.padStart(3, '0')}` : candidate.name;
  const locationString = [candidate.city, candidate.country].filter(Boolean).join(', ');

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/employer/candidates')}
            className="bg-transparent text-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Button>
          <div>
            <h1 className="text-h1 font-heading text-foreground mb-2">Candidate Profile</h1>
            <p className="text-body text-muted-foreground">Review candidate details and qualifications</p>
          </div>
        </div>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <div className="flex flex-col md:flex-row gap-6">
            <div
              className="relative cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/employer/candidates/${candidate.id}`)}
            >
              <Avatar className={`w-24 h-24 ${isBlurred ? 'blur-md' : ''}`}>
                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-h3">
                  {candidate.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              {isBlurred && (
                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-full"></div>
              )}
            </div>

            <div className="flex-1">
              {candidate.isRefugee && (
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-caption rounded-md mb-2">
                  Refugee/Immigrant
                  {candidate.originCountry && ` from ${candidate.originCountry}`}
                </span>
              )}
              <h2
                className="text-h2 font-heading text-foreground mb-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/employer/candidates/${candidate.id}`)}
              >
                {displayName}
              </h2>
              <p className="text-body text-muted-foreground mb-4">{candidate.title}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center text-body-sm text-foreground">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{isBlurred ? '••••••@••••.com' : 'sarah.j@example.com'}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{isBlurred ? '+•• ••• •••••••' : (candidate.phone || 'N/A')}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{locationString || 'Location not specified'}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <Globe className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{candidate.nationality || 'Not specified'}</span>
                </div>
              </div>

              {candidate.description && !isBlurred && (
                <div className="mb-6">
                  <p className="text-body text-foreground whitespace-pre-wrap">{candidate.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleShortlist}
                  variant={isShortlisted ? 'default' : 'outline'}
                  className={`font-normal ${isShortlisted
                    ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                    : 'bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground'
                    }`}
                >
                  <Heart className="w-4 h-4 mr-2" strokeWidth={1.5} fill={isShortlisted ? 'currentColor' : 'none'} />
                  {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                </Button>
                {canContact ? (
                  <>
                    <Button
                      onClick={handleMessage}
                      className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Send Message
                    </Button>
                    <Button
                      onClick={() => setInviteDialogOpen(true)}
                      variant="outline"
                      className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                    >
                      <UserPlus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Invite to Job
                    </Button>
                    <Button
                      onClick={() => setReviewModalOpen(true)}
                      variant="outline"
                      className="bg-transparent text-accent border-accent hover:bg-accent hover:text-accent-foreground font-normal"
                    >
                      <Star className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Write Review
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleRequestData}
                    disabled={accessStatus === 'pending' || accessStatus === 'rejected'}
                    className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                  >
                    {accessStatus === 'pending' ? 'Request Pending' : accessStatus === 'rejected' ? 'Request Rejected' : 'Request Personal Data'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <div className="flex items-center space-x-3 mb-6">
            <DollarSign className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <h3 className="text-h3 font-heading text-foreground">Conditions & Expectations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Salary Expectation</p>
              <p className="text-h4 font-heading text-foreground">
                {candidate.currency || 'EUR'} {candidate.salary?.min?.toLocaleString()} - {candidate.salary?.max?.toLocaleString()}
              </p>
            </div>

            {candidate.conditions?.entryBonus && (
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-caption text-warning mb-1">Entry Bonus</p>
                <p className="text-h4 font-heading text-warning">
                  {candidate.currency || 'EUR'} {candidate.conditions.entryBonus.toLocaleString()}
                </p>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Work Radius</p>
              <p className="text-h4 font-heading text-foreground">{candidate.conditions?.workRadius} km</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Home Office</p>
              <p className="text-h4 font-heading text-foreground capitalize">{candidate.conditions?.homeOfficePreference}</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Vacation Days</p>
              <p className="text-h4 font-heading text-foreground">{candidate.conditions?.vacationDays} days</p>
            </div>

            {candidate.availableFrom && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-caption text-muted-foreground mb-1">Available From</p>
                <p className="text-h4 font-heading text-foreground">
                  {new Date(candidate.availableFrom).toLocaleDateString()}
                </p>
              </div>
            )}

            {candidate.conditions?.noticePeriod && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-caption text-muted-foreground mb-1">Notice Period</p>
                <p className="text-h4 font-heading text-foreground">{candidate.conditions.noticePeriod}</p>
              </div>
            )}
          </div>
        </Card>

        {candidate.videoUrl && !isBlurred && (
          <Card className="p-6 md:p-8 border border-border bg-card">
            <div className="flex items-center space-x-3 mb-6">
              <Video className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="text-h3 font-heading text-foreground">Video Introduction</h3>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                width="100%"
                height="100%"
                src={getYouTubeEmbedUrl(candidate.videoUrl)}
                title="Video Introduction"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </Card>
        )}

        {candidate.portfolioImages && candidate.portfolioImages.length > 0 && !isBlurred && (
          <Card className="p-6 md:p-8 border border-border bg-card">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="text-h3 font-heading text-foreground">Portfolio</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {candidate.portfolioImages.map((item: any, index: number) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-muted hover:shadow-lg transition-all duration-normal hover:-translate-y-1 cursor-pointer"
                >
                  <img
                    src={item.image || item}
                    alt={item.title || `Portfolio ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {item.title && (
                    <div className="p-2 bg-white/90 absolute bottom-0 left-0 right-0">
                      <p className="font-medium text-xs truncate">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <Briefcase className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Work Experience</h3>
              </div>

              {!candidate.experience || candidate.experience.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-body text-muted-foreground">No work experience added</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {candidate.experience.map((exp: any, index: number) => (
                    <div key={exp.id || index} className="relative pl-6 border-l-2 border-border">                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary"></div>
                      <h4 className="text-h4 font-heading text-foreground mb-1">{exp.title}</h4>
                      <p className="text-body-sm text-muted-foreground mb-2">
                        {exp.company} • {exp.period || `${new Date(exp.startDate).toLocaleDateString()} - ${exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}`}
                      </p>
                      <p className="text-body-sm text-foreground">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <GraduationCap className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Education</h3>
              </div>

              {!candidate.education || candidate.education.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-body text-muted-foreground">No education added</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidate.education.map((edu: any, index: number) => (
                    <div key={edu.id || index} className="relative pl-6 border-l-2 border-border">                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-accent"></div>
                      <h4 className="text-h4 font-heading text-foreground mb-1">{edu.degree}</h4>
                      <p className="text-body-sm text-muted-foreground">
                        {edu.institution} • {edu.period || `${new Date(edu.startDate).toLocaleDateString()} - ${edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Primary Location section */}
            {(candidate.city || candidate.country) && (
              <Card className="p-6 border border-border bg-card">
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  <h3 className="text-h3 font-heading text-foreground">Primary Location</h3>
                </div>
                <div className="flex items-center p-3 bg-muted rounded-lg">
                  <MapPin className="w-4 h-4 mr-2 text-primary" strokeWidth={1.5} />
                  <span className="text-body-sm text-foreground">
                    {locationString}
                  </span>
                </div>
              </Card>
            )}

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <MapPin className="w-6 h-6 text-accent" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Preferred Work Locations</h3>
              </div>

              <div className="space-y-2">
                {candidate.preferredLocations && candidate.preferredLocations.length > 0 ? (
                  candidate.preferredLocations.map((loc: any, index: number) => (
                    <div key={index} className="flex items-center p-3 bg-muted rounded-lg">
                      <MapPin className="w-4 h-4 mr-2 text-accent" strokeWidth={1.5} />
                      <span className="text-body-sm text-foreground">
                        {[loc.city, loc.country].filter(Boolean).join(', ')}
                        {loc.continent && <span className="text-muted-foreground ml-1">({loc.continent})</span>}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center p-3 bg-muted rounded-lg">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-body-sm text-muted-foreground">
                      No preferred locations specified
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <Award className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Skills</h3>
              </div>

              <div className="space-y-4">
                {candidate.skills?.map((cs: any) => (
                  <div key={cs.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-body-sm font-medium text-foreground">{cs.name}</span>
                      <span className="text-body-sm text-muted-foreground">{cs.percentage}%</span>
                    </div>
                    <Progress value={cs.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <GraduationCap className="w-6 h-6 text-accent" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Qualifications</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {candidate.qualifications?.map((q: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-2 bg-accent/10 text-accent text-body-sm rounded-lg"
                  >
                    {q}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <Car className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Additional Info</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-caption text-muted-foreground mb-1">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.languages?.length > 0 ? (
                      candidate.languages.map((lang: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-info/10 text-info text-caption rounded-md border border-info/20 flex flex-col min-w-[80px]">
                          <span className="font-medium text-foreground">{lang.name}</span>
                          <span className="text-[10px] opacity-70 uppercase">{lang.level || 'Not specified'}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-body-sm text-foreground">Not specified</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-caption text-muted-foreground mb-1">Driving Licenses</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.drivingLicenses?.length > 0 ? (
                      candidate.drivingLicenses.map((license: string) => (
                        <span key={license} className="px-2 py-1 bg-primary/10 text-primary text-caption rounded-md">{license}</span>
                      ))
                    ) : (
                      <span className="text-body-sm text-foreground">Not specified</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-caption text-muted-foreground mb-1">Travel Willingness</p>
                  <div className="flex items-center text-foreground">
                    <Plane className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-body-sm">Up to {candidate.travelWillingness}%</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Star className="w-6 h-6 text-accent" strokeWidth={1.5} />
                  <h3 className="text-h3 font-heading text-foreground">Reviews</h3>
                </div>
                {candidateReviews.length > 0 && (
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
                      ({candidateReviews.length})
                    </span>
                  </div>
                )}
              </div>

              {candidateReviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-body text-muted-foreground mb-4">No reviews yet</p>
                  {canContact && (
                    <Button
                      onClick={() => setReviewModalOpen(true)}
                      variant="outline"
                      size="sm"
                      className="bg-transparent text-accent border-accent hover:bg-accent hover:text-accent-foreground font-normal"
                    >
                      Write First Review
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {candidateReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Invite to Apply</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Select a job to invite {displayName} to apply
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
            {employerJobs.map((job: any) => (
              <div
                key={job.id}
                className="p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => handleInvite(job.title)}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={job.employer_profiles?.logo_url || "https://via.placeholder.com/48"}
                    alt={job.employer_profiles?.company_name}
                    className="w-12 h-12 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h4 className="text-body font-medium text-foreground mb-1">{job.title}</h4>
                    <p className="text-body-sm text-muted-foreground mb-2">{job.city}, {job.country}</p>
                    <div className="flex items-center space-x-4 text-caption text-muted-foreground">
                      <span>{job.employment_type}</span>
                      <span>•</span>
                      <span>{job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max} ${job.salary_currency || 'EUR'}` : 'Competitive'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        targetName={displayName}
        targetRole="candidate"
        onSubmit={handleSubmitReview}
      />
    </AppLayout>
  );
};

export default CandidateDetailView;
