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
  MessageSquare, UserPlus, Globe, Car, Star
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
import { candidateService } from '../../services/candidate.service';
import { jobsService } from '../../services/jobs.service';
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
      } catch (error) {
        console.error('Error fetching candidate detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user.id, user.role]);

  // is_refugee etc. from DB
  const isBlurred = user.role !== 'employer' || (user as any).packageTier === 'free';
  const canContact = user.role === 'employer' && (user as any).packageTier === 'premium';

  // Reviews placeholder
  const candidateReviews: any[] = [];
  const averageRating = 0;

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

  const handleRequestData = () => {
    showToast({
      title: 'Request Sent',
      description: `Personal data request sent to ${candidate?.name}`,
    });
  };

  const handleSubmitReview = (_rating: number, _comment: string) => {
    showToast({
      title: 'Review Submitted',
      description: `Your review for ${candidate?.profiles?.full_name} has been submitted`,
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
                <AvatarImage src={candidate.profiles?.avatar_url} alt={candidate.profiles?.full_name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-h3">
                  {candidate.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              {isBlurred && (
                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-full"></div>
              )}
            </div>

            <div className="flex-1">
              {candidate.is_refugee && (
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-caption rounded-md mb-2">
                  Refugee/Immigrant
                  {candidate.origin_country && ` from ${candidate.origin_country}`}
                </span>
              )}
              <h2
                className="text-h2 font-heading text-foreground mb-2 cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/employer/candidates/${candidate.id}`)}
              >
                {displayName}
              </h2>
              <p className="text-body text-muted-foreground mb-4">{candidate.job_title}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center text-body-sm text-foreground">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{isBlurred ? '••••••@••••.com' : 'sarah.j@example.com'}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{isBlurred ? '+•• ••• •••••••' : (candidate.profiles?.phone || 'N/A')}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{candidate.city}, {candidate.country}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <Globe className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{candidate.nationality}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
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
                    className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                  >
                    Request Personal Data
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
                {candidate.salary_expectation_min?.toLocaleString()} - {candidate.salary_expectation_max?.toLocaleString()} {candidate.currency || 'EUR'}
              </p>
            </div>

            {candidate.desired_entry_bonus && (
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-caption text-warning mb-1">Entry Bonus</p>
                <p className="text-h4 font-heading text-warning">
                  €{candidate.desired_entry_bonus.toLocaleString()}
                </p>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Work Radius</p>
              <p className="text-h4 font-heading text-foreground">{candidate.work_radius_km} km</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Home Office</p>
              <p className="text-h4 font-heading text-foreground capitalize">{candidate.home_office_preference}</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Vacation Days</p>
              <p className="text-h4 font-heading text-foreground">{candidate.vacation_days} days</p>
            </div>

            {candidate.available_from && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-caption text-muted-foreground mb-1">Available From</p>
                <p className="text-h4 font-heading text-foreground">
                  {new Date(candidate.available_from).toLocaleDateString()}
                </p>
              </div>
            )}

            {candidate.notice_period && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-caption text-muted-foreground mb-1">Notice Period</p>
                <p className="text-h4 font-heading text-foreground">{candidate.notice_period}</p>
              </div>
            )}
          </div>
        </Card>

        {candidate.video_url && !isBlurred && (
          <Card className="p-6 md:p-8 border border-border bg-card">
            <div className="flex items-center space-x-3 mb-6">
              <Video className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="text-h3 font-heading text-foreground">Video Introduction</h3>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                width="100%"
                height="100%"
                src={candidate.video_url}
                title="Video Introduction"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </Card>
        )}

        {candidate.portfolio_images && candidate.portfolio_images.length > 0 && !isBlurred && (
          <Card className="p-6 md:p-8 border border-border bg-card">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="text-h3 font-heading text-foreground">Portfolio</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {candidate.portfolio_images.map((image: string, index: number) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-muted hover:shadow-lg transition-all duration-normal hover:-translate-y-1 cursor-pointer"
                >
                  <img
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
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

              {!candidate.candidate_experience || candidate.candidate_experience.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-body text-muted-foreground">No work experience added</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {candidate.candidate_experience.map((exp: any) => (
                    <div key={exp.id} className="relative pl-6 border-l-2 border-border">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary"></div>
                      <h4 className="text-h4 font-heading text-foreground mb-1">{exp.title}</h4>
                      <p className="text-body-sm text-muted-foreground mb-2">
                        {exp.company} • {new Date(exp.start_date).toLocaleDateString()} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}
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

              {!candidate.candidate_education || candidate.candidate_education.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-body text-muted-foreground">No education added</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidate.candidate_education.map((edu: any) => (
                    <div key={edu.id} className="relative pl-6 border-l-2 border-border">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-accent"></div>
                      <h4 className="text-h4 font-heading text-foreground mb-1">{edu.degree}</h4>
                      <p className="text-body-sm text-muted-foreground">
                        {edu.institution} • {new Date(edu.start_date).toLocaleDateString()} - {edu.end_date ? new Date(edu.end_date).toLocaleDateString() : 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <MapPin className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Preferred Work Locations</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center p-3 bg-muted rounded-lg">
                  <MapPin className="w-4 h-4 mr-2 text-primary" strokeWidth={1.5} />
                  <span className="text-body-sm text-foreground">
                    {candidate.city}, {candidate.country}
                  </span>
                </div>
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
                {candidate.candidate_skills?.map((cs: any) => (
                  <div key={cs.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-body-sm font-medium text-foreground">{cs.skills?.name}</span>
                      <span className="text-body-sm text-muted-foreground">{cs.proficiency_percentage}%</span>
                    </div>
                    <Progress value={cs.proficiency_percentage} className="h-2" />
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
                {candidate.candidate_qualifications?.map((cq: any) => (
                  <span
                    key={cq.id}
                    className="px-3 py-2 bg-accent/10 text-accent text-body-sm rounded-lg"
                  >
                    {cq.qualifications?.name}
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
                  <p className="text-caption text-muted-foreground mb-1">Driving Licenses</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.driving_licenses?.map((license: string) => (
                      <span key={license} className="px-2 py-1 bg-primary/10 text-primary text-caption rounded-md">{license}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-caption text-muted-foreground mb-1">Travel Willingness</p>
                  <div className="flex items-center">
                    <Plane className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-body-sm text-foreground">Up to {candidate.travel_willingness}%</span>
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
