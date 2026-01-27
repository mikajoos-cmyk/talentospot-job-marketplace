import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { useUser } from '../contexts/UserContext';
import { candidateService } from '../services/candidate.service';
import { Loader2 } from 'lucide-react';
import {
  MapPin, Mail, Phone, Briefcase, GraduationCap, Award, Video,
  Image as ImageIcon, DollarSign, Plane, Globe, Car, Star
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { X } from 'lucide-react';
import ReviewCard from '../components/shared/ReviewCard';
import { getYouTubeEmbedUrl } from '../lib/utils';

const CandidateProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [candidateData, setCandidateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Funktion zur dynamischen Berechnung des Fortschritts
  const calculateCompletion = (data: any, userProfile: any) => {
    let score = 0;

    // Basisdaten (User Context + Profile)
    if (userProfile.name) score += 10;
    if (userProfile.email) score += 5;
    if (data.title) score += 10;
    if (data.city || data.country) score += 5;
    if (data.phone) score += 5;

    // Konditionen
    if (data.salary_expectation_min || data.salary_expectation_max) score += 10;

    // Qualifikationen & Skills
    if (data.skills && data.skills.length > 0) score += 15;
    if (data.languages && data.languages.length > 0) score += 10;

    // Erfahrung & Bildung
    if (data.experience && data.experience.length > 0) score += 15;
    if (data.education && data.education.length > 0) score += 15;

    return Math.min(score, 100);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data = await candidateService.getCandidateProfile(user.id);
        setCandidateData(data);

        if (data) {
          setProfileCompletion(calculateCompletion(data, user));
        }
      } catch (error) {
        console.error('Error fetching candidate profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id, user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!candidateData) return null;

  // Hilfsvariablen für leere Zustände
  const hasSkills = candidateData.skills && candidateData.skills.length > 0;
  const hasLanguages = candidateData.languages && candidateData.languages.length > 0;
  const hasLicenses = candidateData.drivingLicenses && candidateData.drivingLicenses.length > 0;
  const hasQualifications = candidateData.qualifications && candidateData.qualifications.length > 0;
  const hasExperience = candidateData.experience && candidateData.experience.length > 0;
  const hasEducation = candidateData.education && candidateData.education.length > 0;

  // Formatierung der Location (filtert leere/null Werte heraus)
  const locationString = [candidateData.city, candidateData.country].filter(Boolean).join(', ');

  // Placeholder für Reviews (da Tabelle noch leer/nicht implementiert)
  const candidateReviews: any[] = [];
  const averageRating = 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-h1 font-heading text-foreground mb-2">My Profile</h1>
            <p className="text-body text-muted-foreground">Manage your professional information.</p>
          </div>
          <Button
            onClick={() => navigate('/candidate/profile/edit')}
            className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
          >
            Edit Profile
          </Button>
        </div>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-h3">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              {candidateData.isRefugee && (
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-caption rounded-md mb-2">
                  Refugee/Immigrant
                  {candidateData.originCountry && ` from ${candidateData.originCountry}`}
                </span>
              )}
              <h2 className="text-h2 font-heading text-foreground mb-2">{user.name}</h2>
              <p className="text-body text-muted-foreground mb-4">
                {candidateData.title || 'No job title specified'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center text-body-sm text-foreground">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{candidateData.phone || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{locationString || 'Location not specified'}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <Globe className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{candidateData.nationality || 'Not specified'}</span>
                </div>
              </div>

              {candidateData.description && (
                <div className="mb-6">
                  <p className="text-body text-foreground whitespace-pre-wrap">{candidateData.description}</p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body-sm font-medium text-foreground">Profile Completion</span>
                  <span className="text-body-sm text-muted-foreground">{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <div className="flex items-center space-x-3 mb-6">
            <DollarSign className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <h3 className="text-h3 font-heading text-foreground">My Conditions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Salary Expectation</p>
              <p className="text-h4 font-heading text-foreground">
                {(candidateData.conditions.salaryExpectation.min || candidateData.conditions.salaryExpectation.max)
                  ? `€${candidateData.conditions.salaryExpectation.min?.toLocaleString() || '0'} - €${candidateData.conditions.salaryExpectation.max?.toLocaleString() || '0'}`
                  : 'Not specified'}
              </p>
            </div>

            {/* Nur anzeigen, wenn Bonus > 0 */}
            {candidateData.conditions.entryBonus > 0 && (
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-caption text-warning mb-1">Entry Bonus</p>
                <p className="text-h4 font-heading text-warning">
                  €{candidateData.conditions.entryBonus.toLocaleString()}
                </p>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Work Radius</p>
              <p className="text-h4 font-heading text-foreground">
                {candidateData.conditions.workRadius ? `${candidateData.conditions.workRadius} km` : 'Not specified'}
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Home Office</p>
              <p className="text-h4 font-heading text-foreground capitalize">
                {candidateData.conditions.homeOfficePreference || 'Not specified'}
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Vacation Days</p>
              <p className="text-h4 font-heading text-foreground">
                {candidateData.conditions.vacationDays ? `${candidateData.conditions.vacationDays} days` : 'Not specified'}
              </p>
            </div>

            {candidateData.conditions.startDate && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-caption text-muted-foreground mb-1">Available From</p>
                <p className="text-h4 font-heading text-foreground">
                  {new Date(candidateData.conditions.startDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Notice Period</p>
              <p className="text-h4 font-heading text-foreground">
                {candidateData.conditions.noticePeriod || 'Not specified'}
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Travel Willingness</p>
              <div className="flex items-center">
                <Plane className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-h4 font-heading text-foreground">
                  {candidateData.travelWillingness > 0
                    ? `Up to ${candidateData.travelWillingness}%`
                    : 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Video Introduction - Nur anzeigen wenn vorhanden */}
        {candidateData.videoUrl && (
          <Card className="p-6 md:p-8 border border-border bg-card">
            <div className="flex items-center space-x-3 mb-6">
              <Video className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="text-h3 font-heading text-foreground">Video Introduction</h3>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                width="100%"
                height="100%"
                src={getYouTubeEmbedUrl(candidateData.videoUrl)}
                title="Video Introduction"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </Card>
        )}

        {/* Portfolio - Nur anzeigen wenn vorhanden */}
        {candidateData.portfolioImages && candidateData.portfolioImages.length > 0 && (
          <Card className="p-6 md:p-8 border border-border bg-card">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="text-h3 font-heading text-foreground">Portfolio</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {candidateData.portfolioImages.map((project: any, index: number) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedProject(project);
                    setIsModalOpen(true);
                  }}
                  className="group relative aspect-square rounded-lg overflow-hidden bg-muted hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <img
                    src={typeof project === 'string' ? project : project.image}
                    alt={project.title || `Portfolio ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {(project.title || project.description) && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="text-white font-medium truncate">{project.title}</p>
                      <p className="text-white/70 text-caption truncate">{project.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-card border-border">
                {selectedProject && (
                  <div className="flex flex-col">
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={selectedProject.image}
                        alt={selectedProject.title}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-2 right-2 rounded-full bg-black/20 hover:bg-black/40 text-white border-none"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <DialogHeader className="mb-4">
                        <DialogTitle className="text-h3 font-heading text-foreground">
                          {selectedProject.title || 'Untitled Project'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="prose prose-sm max-w-none text-muted-foreground">
                          {selectedProject.description || 'No description provided for this project.'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <Briefcase className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Work Experience</h3>
              </div>

              {!hasExperience ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-body text-muted-foreground mb-4">No work experience added yet</p>
                  <Button
                    onClick={() => navigate('/candidate/profile/edit')}
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                  >
                    Add Experience
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {candidateData.experience.map((exp: any) => (
                    <div key={exp.id} className="relative pl-6 border-l-2 border-border">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary"></div>
                      <h4 className="text-h4 font-heading text-foreground mb-1">{exp.job_title || exp.title}</h4>
                      <p className="text-body-sm text-muted-foreground mb-2">
                        {exp.company} • {new Date(exp.startDate).toLocaleDateString()}
                        {exp.endDate ? ` - ${new Date(exp.endDate).toLocaleDateString()}` : ' - Present'}
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

              {!hasEducation ? (
                <div className="text-center py-8">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-body text-muted-foreground mb-4">No education added yet</p>
                  <Button
                    onClick={() => navigate('/candidate/profile/edit')}
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                  >
                    Add Education
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidateData.education.map((edu: any) => (
                    <div key={edu.id} className="relative pl-6 border-l-2 border-border">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-accent"></div>
                      <h4 className="text-h4 font-heading text-foreground mb-1">{edu.degree}</h4>
                      <p className="text-body-sm text-muted-foreground">
                        {edu.institution} • {new Date(edu.startDate).toLocaleDateString()}
                        {edu.endDate ? ` - ${new Date(edu.endDate).toLocaleDateString()}` : ' - Present'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Optional: Preferred Locations anzeigen wenn nicht leer */}
            {(candidateData.city || candidateData.country) && (
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

            {candidateData.preferredLocations && candidateData.preferredLocations.length > 0 && (
              <Card className="p-6 border border-border bg-card">
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="w-6 h-6 text-accent" strokeWidth={1.5} />
                  <h3 className="text-h3 font-heading text-foreground">Preferred Work Locations</h3>
                </div>
                <div className="space-y-2">
                  {candidateData.preferredLocations.map((loc: any, idx: number) => (
                    <div key={idx} className="flex items-center p-3 bg-muted rounded-lg">
                      <MapPin className="w-4 h-4 mr-2 text-accent" strokeWidth={1.5} />
                      <span className="text-body-sm text-foreground">
                        {[loc.city, loc.country].filter(Boolean).join(', ')}
                        {loc.continent && <span className="text-muted-foreground ml-1">({loc.continent})</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <Award className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Skills</h3>
              </div>

              {!hasSkills ? (
                <div className="text-center py-4">
                  <p className="text-body text-muted-foreground mb-3">No skills added yet</p>
                  <Button
                    onClick={() => navigate('/candidate/profile/edit')}
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-primary border-primary/30 hover:bg-primary/10"
                  >
                    Add Skills
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidateData.skills.map((cs: any) => (
                    <div key={cs.id || cs.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-body-sm font-medium text-foreground">{cs.name}</span>
                        <span className="text-body-sm text-muted-foreground">{cs.percentage}%</span>
                      </div>
                      <Progress value={cs.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <GraduationCap className="w-6 h-6 text-accent" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Qualifications</h3>
              </div>

              {!hasQualifications ? (
                <p className="text-body text-muted-foreground text-center py-4">No qualifications added</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {candidateData.qualifications.map((q: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-accent/10 text-accent text-body-sm rounded-lg"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <Car className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Languages & Licenses</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-caption text-muted-foreground mb-2">Languages</p>
                  {!hasLanguages ? (
                    <p className="text-body-sm text-muted-foreground">Not specified</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {candidateData.languages.map((lang: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-info/10 text-info text-caption rounded-md border border-info/20 flex flex-col">
                          <span className="font-medium">{lang.name}</span>
                          <span className="text-[10px] opacity-70 uppercase">{lang.level || 'Not specified'}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-caption text-muted-foreground mb-2">Driving Licenses</p>
                  {!hasLicenses ? (
                    <p className="text-body-sm text-muted-foreground">Not specified</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {candidateData.drivingLicenses.map((license: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-caption rounded-md">
                          {license}
                        </span>
                      ))}
                    </div>
                  )}
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
                  </div>
                )}
              </div>

              {candidateReviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-body text-muted-foreground">No reviews yet</p>
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
    </AppLayout>
  );
};

export default CandidateProfile;