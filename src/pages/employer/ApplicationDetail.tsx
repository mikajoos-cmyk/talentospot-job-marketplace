import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { MapPin, DollarSign, ArrowLeft, Mail, Phone, MessageSquare, Star, Loader2, Globe, Briefcase, GraduationCap, Award, Plane, Car } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { applicationsService } from '../../services/applications.service';
import ReviewModal from '../../components/shared/ReviewModal';
import { Progress } from '../../components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { supabase } from '../../lib/supabase';

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

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

  const candidate = application.candidate_profiles?.profiles;
  const candidateDetails = application.candidate_profiles;
  const job = application.jobs;
  const applicationStatus = application.status;
  const coverLetter = application.cover_letter || "No cover letter provided.";

  const canMessage = applicationStatus === 'accepted' || applicationStatus === 'interview';

  const handleAccept = async () => {
    if (!id) return;

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await applicationsService.acceptApplication(id, user.id);

      showToast({
        title: 'Bewerbung akzeptiert',
        description: `Die Bewerbung von ${candidate?.full_name} wurde akzeptiert und eine Nachricht wurde gesendet.`,
      });

      setAcceptDialogOpen(false);

      // Update local state
      setApplication((prev: any) => ({ ...prev, status: 'accepted' }));
    } catch (error) {
      console.error('Error accepting application:', error);
      showToast({
        title: 'Fehler',
        description: 'Die Bewerbung konnte nicht akzeptiert werden. Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await applicationsService.rejectApplication(id, user.id);

      showToast({
        title: 'Bewerbung abgelehnt',
        description: `Die Bewerbung von ${candidate?.full_name} wurde abgelehnt und eine Nachricht wurde gesendet.`,
      });

      setRejectDialogOpen(false);

      // Update local state
      setApplication((prev: any) => ({ ...prev, status: 'rejected' }));
    } catch (error) {
      console.error('Error rejecting application:', error);
      showToast({
        title: 'Fehler',
        description: 'Die Bewerbung konnte nicht abgelehnt werden. Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
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
              <div className="flex items-center space-x-3 mb-4">
                <Award className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Skills</h3>
              </div>
              <div className="space-y-4">
                {candidateDetails?.candidate_skills?.map((cs: any) => (
                  <div key={cs.id || cs.skills?.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-body-sm font-medium text-foreground">{cs.skills?.name}</span>
                      <span className="text-body-sm text-muted-foreground">{cs.proficiency_percentage}%</span>
                    </div>
                    <Progress value={cs.proficiency_percentage} className="h-2" />
                  </div>
                ))}
                {(!candidateDetails?.candidate_skills || candidateDetails.candidate_skills.length === 0) && (
                  <p className="text-body-sm text-muted-foreground">No skills specified</p>
                )}
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Languages</h3>
              </div>
              <div className="space-y-4">
                {candidateDetails?.candidate_languages?.map((cl: any) => (
                  <div key={cl.id || cl.languages?.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-body-sm font-medium text-foreground">{cl.languages?.name}</span>
                      <span className="text-body-sm text-muted-foreground capitalize">{cl.proficiency_level}</span>
                    </div>
                  </div>
                ))}
                {(!candidateDetails?.candidate_languages || candidateDetails.candidate_languages.length === 0) && (
                  <p className="text-body-sm text-muted-foreground">No languages specified</p>
                )}
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <Briefcase className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Work Experience</h3>
              </div>
              {!candidateDetails?.candidate_experience || candidateDetails.candidate_experience.length === 0 ? (
                <p className="text-body-sm text-muted-foreground">No work experience added</p>
              ) : (
                <div className="space-y-6">
                  {candidateDetails.candidate_experience.map((exp: any) => (
                    <div key={exp.id || Math.random()} className="relative pl-6 border-l-2 border-border">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary"></div>
                      <h4 className="text-h4 font-heading text-foreground mb-1">{exp.job_title}</h4>
                      <p className="text-body-sm text-muted-foreground mb-2">
                        {exp.company_name} • {exp.start_date} - {exp.end_date || 'Present'}
                      </p>
                      <p className="text-body-sm text-foreground">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <GraduationCap className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Education</h3>
              </div>
              {!candidateDetails?.candidate_education || candidateDetails.candidate_education.length === 0 ? (
                <p className="text-body-sm text-muted-foreground">No education added</p>
              ) : (
                <div className="space-y-4">
                  {candidateDetails.candidate_education.map((edu: any) => (
                    <div key={edu.id || Math.random()} className="relative pl-6 border-l-2 border-border">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-accent"></div>
                      <h4 className="text-h4 font-heading text-foreground mb-1">{edu.degree}</h4>
                      <p className="text-body-sm text-muted-foreground">
                        {edu.institution} • {edu.start_date} - {edu.end_date || 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
                  onClick={() => setAcceptDialogOpen(true)}
                  disabled={applicationStatus === 'accepted' || applicationStatus === 'rejected' || processing}
                  className="w-full bg-success text-success-foreground hover:bg-success/90 font-normal disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verarbeitung...
                    </>
                  ) : applicationStatus === 'accepted' ? (
                    'Bereits akzeptiert'
                  ) : (
                    'Bewerbung akzeptieren'
                  )}
                </Button>
                <Button
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={applicationStatus === 'accepted' || applicationStatus === 'rejected' || processing}
                  variant="outline"
                  className="w-full bg-transparent text-error border-error hover:bg-error hover:text-error-foreground font-normal disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applicationStatus === 'rejected' ? 'Bereits abgelehnt' : 'Bewerbung ablehnen'}
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
                  {candidateDetails.currency || 'EUR'} {candidateDetails.desired_entry_bonus.toLocaleString()}
                </p>
              </Card>
            )}

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-4">
                <Award className="w-5 h-5 text-accent" strokeWidth={1.5} />
                <h3 className="text-h4 font-heading text-foreground">Qualifications</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {candidateDetails?.candidate_qualifications?.map((q: any) => (
                  <span
                    key={q.qualifications?.id}
                    className="px-3 py-1 bg-accent/10 text-accent text-body-sm rounded-lg"
                  >
                    {q.qualifications?.name}
                  </span>
                ))}
                {(!candidateDetails?.candidate_qualifications || candidateDetails.candidate_qualifications.length === 0) && (
                  <p className="text-body-sm text-muted-foreground">No qualifications specified</p>
                )}
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-5 h-5 text-accent" strokeWidth={1.5} />
                <h3 className="text-h4 font-heading text-foreground">Preferred Locations</h3>
              </div>
              <div className="space-y-2">
                {candidateDetails?.candidate_preferred_locations?.map((loc: any) => (
                  <div key={loc.id} className="flex items-center p-2 bg-muted rounded-lg">
                    <MapPin className="w-4 h-4 mr-2 text-accent" strokeWidth={1.5} />
                    <span className="text-body-sm text-foreground">
                      {[loc.cities?.name, loc.countries?.name].filter(Boolean).join(', ')}
                      {loc.continents?.name && <span className="text-muted-foreground ml-1">({loc.continents.name})</span>}
                    </span>
                  </div>
                ))}
                {(!candidateDetails?.candidate_preferred_locations || candidateDetails.candidate_preferred_locations.length === 0) && (
                  <p className="text-body-sm text-muted-foreground">No preferred locations specified</p>
                )}
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-4">
                <Car className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <h3 className="text-h4 font-heading text-foreground">Additional Info</h3>
              </div>
              <div className="space-y-3">
                {candidateDetails?.driving_licenses && candidateDetails.driving_licenses.length > 0 && (
                  <div>
                    <p className="text-caption text-muted-foreground mb-1">Driving Licenses</p>
                    <div className="flex flex-wrap gap-2">
                      {candidateDetails.driving_licenses.map((license: string) => (
                        <span key={license} className="px-2 py-1 bg-primary/10 text-primary text-caption rounded-md">{license}</span>
                      ))}
                    </div>
                  </div>
                )}
                {candidateDetails?.travel_willingness !== undefined && (
                  <div>
                    <p className="text-caption text-muted-foreground mb-1">Travel Willingness</p>
                    <div className="flex items-center">
                      <Plane className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-body-sm text-foreground">Up to {candidateDetails.travel_willingness}%</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
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

      <AlertDialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bewerbung akzeptieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Bewerbung von <strong>{candidate?.full_name}</strong> wirklich akzeptieren?
              Der Kandidat wird automatisch über die Nachrichtenfunktion benachrichtigt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAccept}
              disabled={processing}
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verarbeitung...
                </>
              ) : (
                'Akzeptieren'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bewerbung ablehnen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Bewerbung von <strong>{candidate?.full_name}</strong> wirklich ablehnen?
              Der Kandidat wird automatisch über die Nachrichtenfunktion benachrichtigt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={processing}
              className="bg-error text-error-foreground hover:bg-error/90"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verarbeitung...
                </>
              ) : (
                'Ablehnen'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default ApplicationDetail;
