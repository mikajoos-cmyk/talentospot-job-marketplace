import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { MapPin, DollarSign, ArrowLeft, Mail, Phone, MessageSquare, Star, Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { applicationsService } from '../../services/applications.service';
import ReviewModal from '../../components/shared/ReviewModal';

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  React.useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await applicationsService.getApplicationById(id);
        setApplication(data);
      } catch (error) {
        console.error('Error fetching application detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!application) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-h2 font-heading text-foreground mb-4">Application Not Found</h2>
          <Button onClick={() => navigate('/employer/dashboard')} className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal">
            Back to Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  const candidate = application.profiles;
  const candidateDetails = application.candidate_profiles;
  const job = application.jobs;
  const applicationStatus = application.status;
  const coverLetter = application.cover_letter || "No cover letter provided.";

  const canMessage = applicationStatus === 'accepted' || applicationStatus === 'interview';

  const handleAccept = () => {
    showToast({
      title: 'Application Accepted',
      description: `${candidate?.full_name}'s application has been accepted`,
    });
    navigate('/employer/dashboard');
  };

  const handleReject = () => {
    showToast({
      title: 'Application Rejected',
      description: `${candidate?.full_name}'s application has been rejected`,
    });
    navigate('/employer/dashboard');
  };

  const handleSubmitReview = (_rating: number, _comment: string) => {
    showToast({
      title: 'Review Submitted',
      description: `Your review for ${candidate?.full_name} has been submitted`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/employer/dashboard')}
            className="bg-transparent text-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Button>
          <div>
            <h1 className="text-h1 font-heading text-foreground mb-2">Application Review</h1>
            <p className="text-body text-muted-foreground">Review candidate details and application</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border border-border bg-card">
              <h3 className="text-h3 font-heading text-foreground mb-4">Applied For</h3>
              <div className="flex items-start space-x-4">
                <img
                  src={job.employer_profiles?.logo_url || "https://via.placeholder.com/64"}
                  alt={job.employer_profiles?.company_name}
                  className="w-16 h-16 rounded-lg object-cover"
                  loading="lazy"
                />
                <div className="flex-1">
                  <h4 className="text-h4 font-heading text-foreground mb-1">{job.title}</h4>
                  <p className="text-body-sm text-muted-foreground mb-3">{job.employer_profiles?.company_name}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      <span>{job.city}, {job.country}</span>
                    </div>
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      <span>{job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max} ${job.salary_currency || 'EUR'}` : 'Competitive'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card">
              <h3 className="text-h3 font-heading text-foreground mb-4">Cover Letter</h3>
              <div className="bg-muted rounded-lg p-4">
                <div
                  className="text-body text-foreground prose prose-sm max-w-none [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:my-2 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:my-2 [&>p]:my-2 [&>strong]:font-semibold [&>em]:italic"
                  dangerouslySetInnerHTML={{ __html: coverLetter }}
                />
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card">
              <h3 className="text-h3 font-heading text-foreground mb-4">Skills</h3>
              <div className="space-y-3">
                {candidateDetails?.candidate_skills?.map((cs: any) => (
                  <div key={cs.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-body-sm font-medium text-foreground">{cs.skills?.name}</span>
                      <span className="text-body-sm text-muted-foreground">{cs.proficiency_percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${cs.proficiency_percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border border-border bg-card">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar
                  className="w-24 h-24 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/employer/candidates/${application.candidate_id}`)}
                >
                  <AvatarImage src={candidate?.avatar_url} alt={candidate?.full_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-h3">
                    {candidate?.full_name?.split(' ').map((n: any) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                {candidateDetails?.is_refugee && (
                  <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-caption rounded-md mb-2">
                    Refugee/Immigrant
                  </span>
                )}
                <h3
                  className="text-h3 font-heading text-foreground mb-1 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate(`/employer/candidates/${application.candidate_id}`)}
                >
                  {candidate?.full_name}
                </h3>
                <p className="text-body text-muted-foreground">{candidateDetails?.job_title}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-body-sm text-foreground">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{candidateDetails?.city}, {candidateDetails?.country}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{application.email || candidate?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{application.phone || candidate?.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-3">
                {canMessage && (
                  <Button
                    onClick={() => navigate(`/employer/messages?conversationId=${id}`)}
                    className="w-full bg-info text-info-foreground hover:bg-info/90 font-normal"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Send Message
                  </Button>
                )}
                <Button
                  onClick={handleAccept}
                  className="w-full bg-success text-success-foreground hover:bg-success/90 font-normal"
                >
                  Accept Application
                </Button>
                <Button
                  onClick={handleReject}
                  variant="outline"
                  className="w-full bg-transparent text-error border-error hover:bg-error hover:text-error-foreground font-normal"
                >
                  Reject Application
                </Button>
                <Button
                  onClick={() => setReviewModalOpen(true)}
                  variant="outline"
                  className="w-full bg-transparent text-accent border-accent hover:bg-accent hover:text-accent-foreground font-normal"
                >
                  <Star className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Write Review
                </Button>
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card">
              <h3 className="text-h4 font-heading text-foreground mb-4">Salary Expectation</h3>
              <p className="text-h3 font-heading text-primary">
                {candidateDetails?.salary_expectation_min?.toLocaleString()} - {candidateDetails?.salary_expectation_max?.toLocaleString()} {candidateDetails?.currency || 'EUR'}
              </p>
            </Card>

            {candidateDetails?.desired_entry_bonus && (
              <Card className="p-6 border border-warning/30 bg-warning/5">
                <h3 className="text-h4 font-heading text-foreground mb-4">Entry Bonus Expected</h3>
                <p className="text-h3 font-heading text-warning">
                  €{candidateDetails.desired_entry_bonus.toLocaleString()}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        targetName={candidate?.full_name}
        targetRole="candidate"
        onSubmit={handleSubmitReview}
      />
    </AppLayout>
  );
};

export default ApplicationDetail;
