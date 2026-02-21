import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { MapPin, DollarSign, Briefcase, Calendar, ArrowLeft, Building2, Map as MapIcon, Award, Clock, FileText, TrendingUp, Loader2, Upload, X } from 'lucide-react';
import { jobsService } from '@/services/jobs.service';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';
import { applicationsService } from '@/services/applications.service';
import { messagesService } from '@/services/messages.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { candidateService } from '@/services/candidate.service';
import { storageService } from '@/services/storage.service';
import { formatLanguageLevel } from '@/utils/language-levels';
import { useLanguage } from '@/contexts/LanguageContext';
import MapView from '@/components/maps/MapView';
import { getCoordinates } from '@/utils/geocoding';
// import { Input } from '../../components/ui/input';

import UpgradeBanner from '@/components/shared/UpgradeBanner';

const JobDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, isAuthenticated } = useUser();
  const { language } = useLanguage();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [resumeRequired, setResumeRequired] = useState(false);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const required = await candidateService.isResumeRequired();
        setResumeRequired(required);
      } catch (e) {
        console.warn('Fehler beim Laden der Systemeinstellungen:', e);
      }
    };
    fetchSettings();
  }, []);

  React.useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await jobsService.getJobById(id);
        setJob(data);

        // Fetch coordinates for the map
        if (data.city) {
          const coords = await getCoordinates(data.city, data.country);
          if (coords) {
            setMapCenter([coords.latitude, coords.longitude]);
          }
        }
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };
    const checkApplicationStatus = async () => {
      if (id && user?.id && user.role === 'candidate') {
        try {
          const applied = await applicationsService.hasApplied(id, user.id);
          setHasApplied(applied);
        } catch (error) {
          console.error('Error checking application status:', error);
        }
      }
    };

    fetchJob();
    checkApplicationStatus();
  }, [id, user?.id, user?.role]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      showToast({
        title: 'Authentication Required',
        description: 'Please log in as a candidate to apply for this job',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (resumeRequired && !cvFile) {
      showToast({
        title: 'Lebenslauf erforderlich',
        description: 'Bitte lade einen Lebenslauf hoch, um dich zu bewerben.',
        variant: 'destructive',
      });
      return;
    }

    if (user.role !== 'candidate') {
      showToast({
        title: 'Nur Kandidaten können sich bewerben',
        description: 'Ihr Account-Typ erlaubt keine Job-Bewerbungen',
        variant: 'destructive',
      });
      return;
    }

    if (resumeRequired && !cvFile) {
      showToast({
        title: 'Lebenslauf erforderlich',
        description: 'Bitte lade einen Lebenslauf hoch, um dich zu bewerben.',
        variant: 'destructive',
      });
      return;
    }

    if (!user.hasActivePackage) {
      navigate('/candidate/packages');
      return;
    }

    try {
      // Optional: upload CV to storage if selected
      let cvUrl: string | undefined = undefined;
      if (cvFile) {
        try {
          setCvUploading(true);
          cvUrl = await storageService.uploadCV(user.id, cvFile);
        } catch (uploadErr: any) {
          console.error('Error uploading CV:', uploadErr);
          showToast({
            title: 'Upload fehlgeschlagen',
            description: uploadErr.message || 'Dein Lebenslauf konnte nicht hochgeladen werden.',
            variant: 'destructive',
          });
          setCvUploading(false);
          return; // Abort application if CV upload failed
        } finally {
          setCvUploading(false);
        }
      }

      // 1. Submit Application
      await applicationsService.applyToJob({
        job_id: id!,
        candidate_id: user.id,
        employer_id: job.employer_id,
        cover_letter: coverLetter,
        cv_url: cvUrl,
      });

      // 2. Notify Employer via Message
      try {
        // Find or create conversation with the employer
        // job.employer_profiles.id is the employer's profile ID (which is the user ID in this case)
        const conversation = await messagesService.getOrCreateConversation(user.id, job.employer_id);

        // Send notification message
        await messagesService.sendMessage(
          conversation.id,
          user.id,
          `I have applied for the position: **${job.title}**. You can review my application in your dashboard.`
        );
      } catch (msgError) {
        console.error('Error sending notification message:', msgError);
        // We don't fail the whole process if message fails, application is the most important
      }

      showToast({
        title: 'Application Submitted',
        description: `Your application for ${job?.title} has been submitted successfully`,
      });
      setApplyDialogOpen(false);
      setCoverLetter('');
      navigate('/candidate/applications');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      showToast({
        title: 'Application Failed',
        description: error.message || 'There was an error submitting your application. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <AppLayout isPublic={user.role === 'guest'}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!job) {
    return (
      <AppLayout isPublic={user.role === 'guest'}>
        <div className="text-center py-12">
          <h2 className="text-h2 font-heading text-foreground mb-4">Job Not Found</h2>
          <Button onClick={() => navigate(-1)} className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal">
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout isPublic={user.role === 'guest'}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="bg-background border border-border text-foreground hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </Button>
            <div>
              <nav className="flex mb-1" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-caption text-muted-foreground uppercase tracking-wider">
                  <li>Jobs</li>
                  <li className="flex items-center space-x-2">
                    <span>/</span>
                    <span>{job.employment_type?.replace(/_/g, ' ')}</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-h2 md:text-h1 font-heading text-foreground">{job.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                  return;
                }
                if (user.role !== 'candidate') {
                  showToast({
                    title: 'Only Candidates Can Apply',
                    description: 'Your account type does not allow job applications',
                    variant: 'destructive',
                  });
                  return;
                }
                setApplyDialogOpen(true);
              }}
              disabled={hasApplied}
              className={`flex-1 sm:flex-none font-medium h-12 px-8 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] ${hasApplied
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-primary/30'
                }`}
            >
              {hasApplied ? 'Already Applied' : 'Apply Now'}
            </Button>
          </div>
        </div>

        {/* Hinweis-Banner unter dem Zurück-Button, wenn Paket fehlt */}
        {user.role === 'candidate' && !user.hasActivePackage && (
          <UpgradeBanner
            message="Sie benötigen ein Paket, um Kontaktdaten und vollständige Jobdetails sehen zu können."
            upgradeLink="/candidate/packages"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Card */}
            <Card className="overflow-hidden border-none bg-background shadow-sm">
              <div className="relative h-32 md:h-40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                <div className="absolute -bottom-10 left-8 p-1 bg-background rounded-xl border border-border shadow-md">
                  <img
                    src={job.employer_profiles?.logo_url || "https://via.placeholder.com/80"}
                    alt={job.employer_profiles?.company_name}
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover ${(user.role === 'guest' || (user.role === 'candidate' && !user.hasActivePackage)) ? 'blur-sm select-none' : ''}`}
                  />
                </div>
              </div>
              <div className="pt-14 pb-8 px-8">
                <div
                  className="group cursor-pointer inline-flex items-center"
                  onClick={() => job.employer_id && navigate(`/companies/${job.employer_id}`)}
                >
                  <h2 className={`text-h2 font-heading text-foreground group-hover:text-primary transition-colors ${(user.role === 'guest' || (user.role === 'candidate' && !user.hasActivePackage)) ? 'blur-sm select-none' : ''}`}>
                    {job.employer_profiles?.company_name}
                  </h2>
                  <ArrowLeft className="w-5 h-5 ml-2 rotate-180 opacity-0 group-hover:opacity-100 transition-all text-primary" strokeWidth={1.5} />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-body text-foreground/80">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-caption text-muted-foreground font-medium uppercase tracking-wider">Location</p>
                      <p>{job.city}, {job.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-body text-foreground/80">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-caption text-muted-foreground font-medium uppercase tracking-wider">Sector</p>
                      <p>{job.sector || job.employer_profiles?.industry || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-body text-foreground/80">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3">
                      <DollarSign className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-caption text-muted-foreground font-medium uppercase tracking-wider">Salary</p>
                      <p className="font-semibold text-primary">
                        {job.salary_min && job.salary_max
                          ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.salary_currency || 'EUR'}`
                          : 'Competitive'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Entry Bonus */}
            {job.entry_bonus && (
              <div className="bg-gradient-to-r from-[#FFB800]/20 to-[#FFB800]/5 border border-[#FFB800]/20 rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#FFB800]/20 rounded-xl">
                    <Award className="w-6 h-6 text-[#FFB800]" />
                  </div>
                  <div>
                    <h4 className="text-body font-bold text-[#FFB800] mb-0.5">Joining Bonus</h4>
                    <p className="text-caption text-[#FFB800]/80">One-time payment upon successful hire</p>
                  </div>
                </div>
                <span className="text-h2 font-heading text-[#FFB800] font-bold">€{job.entry_bonus.toLocaleString()}</span>
              </div>
            )}

            {/* Description Section */}
            <div className="space-y-4">
              <h3 className="text-h3 font-heading text-foreground flex items-center border-b border-border pb-4">
                <FileText className="w-6 h-6 mr-3 text-primary" strokeWidth={1.5} />
                About the Position
              </h3>
              <div
                className="text-body text-foreground prose prose-sm max-w-none prose-headings:font-heading prose-p:leading-relaxed prose-strong:text-primary"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-h3 font-heading text-foreground flex items-center border-b border-border pb-4">
                <MapIcon className="w-6 h-6 mr-3 text-primary" strokeWidth={1.5} />
                Work Location
              </h3>
              {mapCenter ? (
                <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
                  <MapView
                    center={mapCenter}
                    zoom={13}
                    height="350px"
                    showRadius={false}
                    disabled={applyDialogOpen}
                  />
                  <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-primary mr-2" />
                      <span className="text-body-sm font-medium">{job.city}, {job.country}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-72 bg-muted rounded-2xl flex items-center justify-center border border-border overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 pointer-events-none" />
                  <div className="text-center relative z-10 transition-transform duration-500 group-hover:scale-105">
                    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-border shadow-lg">
                      <MapPin className="w-8 h-8 text-primary" strokeWidth={1.5} />
                    </div>
                    <p className="text-h3 font-heading text-foreground">{job.city}, {job.country}</p>
                    <p className="text-body-sm text-muted-foreground mt-1">
                      {loading ? 'Finding location...' : 'Coordinates not available'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border border-border bg-card/50 backdrop-blur-sm sticky top-6">
              <h3 className="text-body font-bold text-foreground mb-6 uppercase tracking-widest text-sm flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-primary" strokeWidth={2} />
                Job Specifications
              </h3>

              <div className="space-y-6">
                {/* Employment Details */}
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: 'Employment', value: job.employment_type?.replace(/_/g, ' '), icon: Briefcase },
                    { label: 'Career Level', value: job.career_level, icon: TrendingUp },
                    { label: 'Experience', value: job.experience_years !== null && job.experience_years !== undefined ? `${job.experience_years} ${job.experience_years === 1 ? 'year' : 'years'}` : null, icon: Clock },
                    { label: 'Contract', value: job.contract_duration, icon: FileText },
                    { label: 'Vacation', value: job.vacation_days ? `${job.vacation_days} Days / Year` : null, icon: Calendar },
                    { label: 'Work Mode', value: job.home_office_available ? 'Home Office' : 'On-site', icon: Building2 },
                  ].filter(item => item.value).map((item, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="p-2 bg-muted rounded-lg mr-3">
                        <item.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-caption text-muted-foreground uppercase tracking-wider leading-none mb-1">{item.label}</p>
                        <p className="text-body-sm font-medium text-foreground capitalize">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {job.contract_terms?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-caption text-muted-foreground font-medium uppercase tracking-wider mb-2">Terms</p>
                    <div className="flex flex-wrap gap-2">
                      {job.contract_terms.map((term: string) => (
                        <span key={term} className="px-2 py-0.5 bg-muted text-foreground text-[10px] rounded uppercase font-bold border border-border">
                          {term.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-px bg-border my-6" />

                {/* Skills & Tags */}
                <div className="space-y-6">
                  {job.required_skills?.length > 0 && (
                    <div>
                      <h4 className="text-caption font-bold text-foreground uppercase tracking-widest mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.map((skill: string) => (
                          <span key={skill} className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium border border-border">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.benefits?.length > 0 && (
                    <div>
                      <h4 className="text-caption font-bold text-foreground uppercase tracking-widest mb-3">Benefits</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.benefits.map((benefit: string) => (
                          <span key={benefit} className="px-3 py-1 bg-[#FFB800]/10 text-[#FFB800] text-xs rounded-full font-medium border border-[#FFB800]/20">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.required_qualifications?.length > 0 && (
                    <div>
                      <h4 className="text-caption font-bold text-foreground uppercase tracking-widest mb-3">Qualifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.required_qualifications.map((qual: string) => (
                          <span key={qual} className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium border border-border">
                            {qual}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.required_personal_titles?.length > 0 && (
                    <div>
                      <h4 className="text-caption font-bold text-foreground uppercase tracking-widest mb-3">Required Titles</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.required_personal_titles.map((title: string) => (
                          <span key={title} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium border border-primary/20">
                            {title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.required_languages?.length > 0 && (
                    <div>
                      <h4 className="text-caption font-bold text-foreground uppercase tracking-widest mb-3">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.required_languages.map((lang: any, index: number) => {
                          const langName = typeof lang === 'string' ? lang : lang.name;
                          const langLevel = typeof lang === 'object' && lang.level ? lang.level : null;
                          return (
                            <span key={index} className="px-3 py-1 bg-info/10 text-info text-xs rounded-full font-medium border border-info/20">
                              {langName}{langLevel && ` (${formatLanguageLevel(langLevel)})`}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {job.driving_licenses?.length > 0 && (
                    <div>
                      <h4 className="text-caption font-bold text-foreground uppercase tracking-widest mb-3">Licenses</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.driving_licenses.map((license: string) => (
                          <span key={license} className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium border border-border">
                            {license}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>


      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Apply for {job.title}</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Submit your application to {job.employer_profiles?.company_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="coverLetter" className="text-body-sm font-medium text-foreground mb-2 block">
                Cover Letter <span className="text-error">*</span>
              </Label>
              <RichTextEditor
                value={coverLetter}
                onChange={setCoverLetter}
                placeholder="Tell us why you're a great fit for this role..."
                minHeight="200px"
              />
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Lebenslauf anhängen {resumeRequired ? <span className="text-error">(Pflicht)</span> : '(optional)'}
              </Label>
              <label htmlFor="cv-upload" className="block border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-body-sm text-foreground">
                  {cvFile ? 'Datei gewählt: ' + cvFile.name : 'Klicke hier, um deinen Lebenslauf auszuwählen'}
                </p>
                <p className="text-caption text-muted-foreground">PDF, DOC, DOCX bis 10MB</p>
                <input
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && file.size > 10 * 1024 * 1024) {
                      showToast({
                        title: 'Datei zu groß',
                        description: 'Bitte wähle eine Datei bis maximal 10MB.',
                        variant: 'destructive',
                      });
                      e.currentTarget.value = '';
                      return;
                    }
                    setCvFile(file);
                  }}
                />
              </label>
              {cvFile && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-3">{cvFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setCvFile(null)}
                    className="inline-flex items-center text-error hover:text-error/80"
                  >
                    <X className="w-4 h-4 mr-1" /> Entfernen
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setApplyDialogOpen(false)}
              className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!coverLetter.trim() || cvUploading || (resumeRequired && !cvFile)}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              {cvUploading ? 'Hochladen...' : 'Submit Application'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default JobDetailView;
