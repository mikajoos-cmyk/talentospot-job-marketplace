import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { useUser } from '../contexts/UserContext';
import { candidateService } from '../services/candidate.service';
import {
  Loader2, MapPin, Mail, Phone, Briefcase, GraduationCap, Award, Video,
  Image as ImageIcon, DollarSign, Plane, Globe, Car, Star, Tag, Download,
  User, Calendar, Layers, Activity, UserCircle, CheckCircle2, Home, Clock,
  FileText
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
import { ProjectImageCarousel } from '../components/shared/ProjectImageCarousel';

const CandidateProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [candidateData, setCandidateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAward, setSelectedAward] = useState<any>(null);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);

  // Funktion zur dynamischen Berechnung des Fortschritts
  const calculateCompletion = (data: any, userProfile: any) => {
    let score = 0;

    // Basisdaten (User Context + Profile)
    if (userProfile?.name) score += 10;
    if (userProfile?.email) score += 5;
    if (data.title) score += 10;
    if (data.street || data.city || data.country) score += 5;
    if (data.phone) score += 5;

    // Konditionen
    if (data.salary?.min || data.salary?.max) score += 10;

    // Qualifikationen & Skills
    if (data.skills && data.skills.length > 0) score += 15;
    if (data.languages && data.languages.length > 0) score += 10;
    if (data.tags && data.tags.length > 0) score += 5;

    // Erfahrung & Bildung
    if (data.experience && data.experience.length > 0) score += 15;
    if (data.education && data.education.length > 0) score += 15;
    if (data.cvUrl) score += 5;

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
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        </AppLayout>
    );
  }

  if (!candidateData) return null;

  // Hilfsvariablen
  const hasSkills = candidateData.skills && candidateData.skills.length > 0;
  const hasLanguages = candidateData.languages && candidateData.languages.length > 0;
  const hasLicenses = candidateData.drivingLicenses && candidateData.drivingLicenses.length > 0;
  const hasQualifications = candidateData.qualifications && candidateData.qualifications.length > 0;
  const hasExperience = candidateData.experience && candidateData.experience.length > 0;
  const hasEducation = candidateData.education && candidateData.education.length > 0;
  const hasRequirements = candidateData.requirements && candidateData.requirements.length > 0;
  const hasJobTypes = candidateData.jobTypes && candidateData.jobTypes.length > 0;

  // Formatierung der Location
  const streetDisplay = candidateData.street ? `${candidateData.street}${candidateData.houseNumber ? ` ${candidateData.houseNumber}` : ''}` : null;
  const cityDisplay = candidateData.postalCode && candidateData.city ? `${candidateData.postalCode} ${candidateData.city}` : (candidateData.postalCode || candidateData.city || null);
  const regionDisplay = [candidateData.state, candidateData.country].filter(Boolean).join(', ') || null;
  const hasLocation = streetDisplay || cityDisplay || regionDisplay;

  // Reviews Placeholder
  const candidateReviews: any[] = [];
  const averageRating = 0;

  return (
      <AppLayout>
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your professional identity and preferences.</p>
            </div>
            <div className="flex gap-3">
              <Button
                  variant="outline"
                  onClick={() => navigate('/candidate/profile/preview')}
                  className="hidden sm:flex"
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Public View
              </Button>
              <Button
                  onClick={() => navigate('/candidate/profile/edit')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT COLUMN: Sidebar (Sticky) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">

              {/* 1. Identity & Core Info Card */}
              <Card className="overflow-hidden border-border bg-card shadow-sm">
                <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border/50 relative">
                  {candidateData.isRefugee && (
                      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border border-accent/20 text-accent text-xs font-medium px-2.5 py-1 rounded-full flex items-center shadow-sm">
                        <Globe className="w-3 h-3 mr-1.5" />
                        Refugee / Immigrant {candidateData.originCountry && `from ${candidateData.originCountry}`}
                      </div>
                  )}
                </div>
                <div className="px-6 pb-6">
                  <div className="relative flex justify-between items-end -mt-12 mb-4">
                    <Avatar className="w-24 h-24 border-4 border-card bg-card shadow-md">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {candidateData.cvUrl && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-10 w-10 bg-card hover:bg-muted shadow-sm"
                            onClick={() => window.open(candidateData.cvUrl, '_blank')}
                            title="Download CV"
                        >
                          <Download className="w-4 h-4 text-foreground" />
                        </Button>
                    )}
                  </div>

                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground leading-tight">{user.name}</h2>
                    <p className="text-primary font-medium mt-1">{candidateData.title || 'No job title specified'}</p>
                  </div>

                  {/* Contact & Personal Details */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-3 text-muted-foreground shrink-0" />
                        <span className="truncate" title={user.email}>{user.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-3 text-muted-foreground shrink-0" />
                        <span>{candidateData.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-3 text-muted-foreground shrink-0" />
                        <span className="capitalize">{candidateData.gender || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-3 text-muted-foreground shrink-0" />
                        <span>{candidateData.dateOfBirth ? new Date(candidateData.dateOfBirth).toLocaleDateString() : 'No birthdate'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Globe className="w-4 h-4 mr-3 text-muted-foreground shrink-0" />
                        <span>{candidateData.nationality || 'Nationality not set'}</span>
                      </div>
                      {/* Address Block */}
                      {hasLocation && (
                          <div className="flex items-start text-sm mt-1">
                            <MapPin className="w-4 h-4 mr-3 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="flex flex-col text-foreground/90">
                              {streetDisplay && <span>{streetDisplay}</span>}
                              {cityDisplay && <span>{cityDisplay}</span>}
                              {regionDisplay && <span>{regionDisplay}</span>}
                            </div>
                          </div>
                      )}
                    </div>
                  </div>

                  {/* Professional Overview (The Grid from Screenshot) */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground flex items-center mb-1">
                                <Layers className="w-3 h-3 mr-1" /> Sector
                            </span>
                        <span className="text-sm font-semibold">{candidateData.sector || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground flex items-center mb-1">
                                <Activity className="w-3 h-3 mr-1" /> Level
                            </span>
                        <span className="text-sm font-semibold capitalize">{candidateData.careerLevel || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground flex items-center mb-1">
                                <UserCircle className="w-3 h-3 mr-1" /> Status
                            </span>
                        <span className="text-sm font-semibold capitalize">{candidateData.employmentStatus || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground flex items-center mb-1">
                                <Briefcase className="w-3 h-3 mr-1" /> Exp.
                            </span>
                        <span className="text-sm font-semibold">{candidateData.yearsOfExperience || 0} years</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">Profile Strength</span>
                      <span className="text-xs font-bold text-primary">{profileCompletion}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-2" />
                  </div>
                </div>
              </Card>

              {/* 2. Skills & Languages Card */}
              <Card className="border-border bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-primary" />
                    Skills & Languages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Skills */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Top Skills</p>
                    {!hasSkills ? (
                        <p className="text-sm text-muted-foreground italic">No skills added</p>
                    ) : (
                        <div className="space-y-3">
                          {candidateData.skills.slice(0, 5).map((cs: any) => (
                              <div key={cs.id || cs.name}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium">{cs.name}</span>
                                  <span className="text-muted-foreground text-xs">{cs.percentage}%</span>
                                </div>
                                <Progress value={cs.percentage} className="h-1.5" />
                              </div>
                          ))}
                          {candidateData.skills.length > 5 && (
                              <p className="text-xs text-muted-foreground pt-1">
                                + {candidateData.skills.length - 5} more skills
                              </p>
                          )}
                        </div>
                    )}
                  </div>

                  {/* Languages */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Languages</p>
                    {!hasLanguages ? (
                        <p className="text-sm text-muted-foreground italic">No languages added</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                          {candidateData.languages.map((lang: any, idx: number) => (
                              <div key={idx} className="flex flex-col bg-muted/50 px-2.5 py-1.5 rounded-md border border-border">
                                <span className="text-sm font-medium leading-none">{lang.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase mt-1">{lang.level || 'N/A'}</span>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>

                  {/* Tags */}
                  {candidateData.tags && candidateData.tags.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {candidateData.tags.map((tag: string) => (
                              <span key={tag} className="px-2 py-1 bg-muted text-xs rounded-md border border-border capitalize">
                                    # {tag}
                                </span>
                          ))}
                        </div>
                      </div>
                  )}
                </CardContent>
              </Card>

              {/* Preferred Locations */}
              {candidateData.preferredLocations && candidateData.preferredLocations.length > 0 && (
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-primary" />
                        Preferred Locations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        {candidateData.preferredLocations.map((loc: any, idx: number) => (
                            <div key={idx} className="flex items-center text-sm text-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent mr-2.5" />
                              {[loc.city, loc.country].filter(Boolean).join(', ')}
                            </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
              )}
            </div>

            {/* RIGHT COLUMN: Main Content */}
            <div className="lg:col-span-8 space-y-6">

              {/* 1. About / Summary */}
              {candidateData.description && (
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl">About Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {candidateData.description}
                      </p>
                    </CardContent>
                  </Card>
              )}

              {/* 2. Conditions Dashboard */}
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-primary" />
                    Work Preferences & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Salary (Big Box) */}
                    <div className="col-span-2 md:col-span-2 p-4 bg-muted/40 rounded-xl border border-border/50">
                      <div className="flex items-center text-muted-foreground mb-1 text-sm">
                        <DollarSign className="w-4 h-4 mr-1.5" />
                        Salary Expectation
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {(candidateData.salary?.min || candidateData.salary?.max)
                            ? `${candidateData.currency || '€'}${candidateData.salary.min?.toLocaleString() || '0'} - ${candidateData.salary.max?.toLocaleString() || '0'}`
                            : 'Not specified'}
                      </p>
                      {candidateData.conditions?.entryBonus > 0 && (
                          <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-yellow-500/10 text-yellow-600 text-xs font-medium rounded border border-yellow-500/20">
                            + {candidateData.currency || '€'}{candidateData.conditions.entryBonus.toLocaleString()} Bonus
                          </div>
                      )}
                    </div>

                    {/* Availability */}
                    <div className="col-span-1 p-4 bg-muted/40 rounded-xl border border-border/50">
                      <div className="flex items-center text-muted-foreground mb-1 text-xs uppercase tracking-wide">
                        Available From
                      </div>
                      <p className="text-lg font-semibold text-foreground truncate">
                        {candidateData.availableFrom
                            ? new Date(candidateData.availableFrom).toLocaleDateString()
                            : 'Negotiable'}
                      </p>
                    </div>

                    {/* Notice Period */}
                    <div className="col-span-1 p-4 bg-muted/40 rounded-xl border border-border/50">
                      <div className="flex items-center text-muted-foreground mb-1 text-xs uppercase tracking-wide">
                        Notice Period
                      </div>
                      <p className="text-lg font-semibold text-foreground truncate">
                        {candidateData.conditions?.noticePeriod || candidateData.noticePeriod || 'None'}
                      </p>
                    </div>

                    {/* Contract Terms (ADDED) */}
                    <div className="col-span-2 md:col-span-2 p-4 bg-muted/40 rounded-xl border border-border/50">
                      <div className="flex items-center text-muted-foreground mb-1 text-xs uppercase tracking-wide">
                        <FileText className="w-3.5 h-3.5 mr-1" /> Contract Terms
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {candidateData.contractTermPreference && candidateData.contractTermPreference.length > 0 ? (
                            candidateData.contractTermPreference.map((term: string) => (
                                <span key={term} className="px-2 py-0.5 bg-info/10 text-info text-xs rounded-md border border-info/20 capitalize font-medium">
                                            {term === 'unlimited' ? 'Permanent' : term}
                                        </span>
                            ))
                        ) : (
                            <span className="font-medium text-foreground">Open</span>
                        )}
                      </div>
                    </div>

                    {/* Work Radius */}
                    <div className="col-span-1 p-4 bg-muted/40 rounded-xl border border-border/50">
                      <div className="flex items-center text-muted-foreground mb-1 text-xs uppercase tracking-wide">
                        <MapPin className="w-3.5 h-3.5 mr-1" /> Radius
                      </div>
                      <p className="font-medium">{candidateData.conditions?.workRadius ? `${candidateData.conditions.workRadius} km` : 'N/A'}</p>
                    </div>

                    {/* Home Office */}
                    <div className="col-span-1 p-4 bg-muted/40 rounded-xl border border-border/50">
                      <div className="flex items-center text-muted-foreground mb-1 text-xs uppercase tracking-wide">
                        <Home className="w-3.5 h-3.5 mr-1" /> Remote
                      </div>
                      <p className="font-medium capitalize">{candidateData.conditions?.homeOfficePreference || 'N/A'}</p>
                    </div>

                    {/* Travel */}
                    <div className="col-span-1 p-4 bg-muted/40 rounded-xl border border-border/50">
                      <div className="flex items-center text-muted-foreground mb-1 text-xs uppercase tracking-wide">
                        <Plane className="w-3.5 h-3.5 mr-1" /> Travel
                      </div>
                      <p className="font-medium">
                        {candidateData.travelWillingness > 0 ? `${candidateData.travelWillingness}%` : 'None'}
                      </p>
                    </div>

                    {/* Vacation */}
                    <div className="col-span-1 p-4 bg-muted/40 rounded-xl border border-border/50">
                      <div className="flex items-center text-muted-foreground mb-1 text-xs uppercase tracking-wide">
                        <Activity className="w-3.5 h-3.5 mr-1" /> Vacation
                      </div>
                      <p className="font-medium">
                        {candidateData.conditions?.vacationDays ? `${candidateData.conditions.vacationDays} days` : 'N/A'}
                      </p>
                    </div>

                    {/* Job Types (Full Width) */}
                    {hasJobTypes && (
                        <div className="col-span-2 md:col-span-4 p-4 bg-muted/40 rounded-xl border border-border/50 flex flex-col sm:flex-row sm:items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground shrink-0">Looking for:</span>
                          <div className="flex flex-wrap gap-2">
                            {candidateData.jobTypes.map((type: string) => (
                                <span key={type} className="px-2.5 py-1 bg-background text-foreground text-xs font-medium rounded shadow-sm border border-border capitalize">
                                            {type}
                                        </span>
                            ))}
                          </div>
                        </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 3. Experience (Timeline Design) */}
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-primary" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {!hasExperience ? (
                      <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                        <Briefcase className="w-10 h-10 mx-auto text-muted-foreground mb-2 opacity-50" />
                        <p className="text-muted-foreground">No experience listed.</p>
                        <Button variant="link" onClick={() => navigate('/candidate/profile/edit')} className="text-primary">Add Experience</Button>
                      </div>
                  ) : (
                      <div className="relative border-l-2 border-border/60 ml-3 space-y-8 pb-2">
                        {candidateData.experience.map((exp: any, idx: number) => (
                            <div key={exp.id || idx} className="relative pl-8">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-4 border-card bg-primary ring-1 ring-border" />

                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                                <h3 className="text-lg font-bold text-foreground">{exp.job_title || exp.title}</h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground mt-1 sm:mt-0 w-fit">
                                            {exp.period}
                                        </span>
                              </div>
                              <p className="text-primary font-medium text-sm mb-3">{exp.company}</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {exp.description}
                              </p>
                            </div>
                        ))}
                      </div>
                  )}
                </CardContent>
              </Card>

              {/* 4. Education (Timeline Design) */}
              <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-primary" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {!hasEducation ? (
                      <div className="text-center py-6 text-muted-foreground text-sm">No education listed.</div>
                  ) : (
                      <div className="relative border-l-2 border-border/60 ml-3 space-y-8 pb-2">
                        {candidateData.education.map((edu: any, idx: number) => (
                            <div key={edu.id || idx} className="relative pl-8">
                              <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-4 border-card bg-accent ring-1 ring-border" />

                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                                <h3 className="text-lg font-bold text-foreground">{edu.degree}</h3>
                                <span className="text-xs text-muted-foreground mt-1 sm:mt-0">{edu.period}</span>
                              </div>
                              <p className="text-foreground/80 font-medium text-sm mb-2">{edu.institution}</p>
                              {edu.description && (
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{edu.description}</p>
                              )}
                            </div>
                        ))}
                      </div>
                  )}
                </CardContent>
              </Card>

              {/* 5. Additional Abilities (Grid) */}
              {(hasRequirements || hasLicenses || hasQualifications) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Requirements / Abilities */}
                    {hasRequirements && (
                        <Card className="border-border bg-card shadow-sm h-full">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                              Abilities
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {candidateData.requirements.map((req: string, idx: number) => (
                                  <li key={idx} className="flex items-start text-sm text-muted-foreground">
                                    <div className="mt-1.5 mr-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                    {req}
                                  </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                    )}

                    {/* Qualifications & Licenses */}
                    <div className="space-y-6">
                      {hasQualifications && (
                          <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center">
                                <Award className="w-4 h-4 mr-2 text-accent" />
                                Qualifications
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {candidateData.qualifications.map((q: string, idx: number) => (
                                    <span key={idx} className="px-2 py-1 bg-accent/5 text-accent text-xs rounded border border-accent/20">
                                                {q}
                                            </span>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                      )}

                      {hasLicenses && (
                          <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center">
                                <Car className="w-4 h-4 mr-2 text-primary" />
                                Licenses
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {candidateData.drivingLicenses.map((license: string, idx: number) => (
                                    <span key={idx} className="px-2 py-1 bg-muted text-foreground text-xs rounded border border-border">
                                                {license}
                                            </span>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                      )}
                    </div>
                  </div>
              )}


              {/* 6. Awards (Rich List) */}
              {candidateData.awards && candidateData.awards.length > 0 && (
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <Award className="w-5 h-5 mr-2 text-accent" />
                        Awards & Honors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {candidateData.awards.map((award: any, index: number) => (
                            <div
                                key={award.id || index}
                                className="flex items-start p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer group"
                                onClick={() => {
                                  setSelectedAward(award);
                                  setIsAwardModalOpen(true);
                                }}
                            >
                              <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 mr-4 shadow-sm overflow-hidden">
                                {award.certificateImage ? (
                                    <img src={award.certificateImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Award className="w-6 h-6 text-accent" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{award.title}</h4>
                                <p className="text-xs text-muted-foreground mb-1">{award.year}</p>
                                {award.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{award.description}</p>
                                )}
                              </div>
                            </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
              )}

              {/* 7. Portfolio (Grid) */}
              {candidateData.portfolioImages && candidateData.portfolioImages.length > 0 && (
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <ImageIcon className="w-5 h-5 mr-2 text-primary" />
                        Portfolio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {candidateData.portfolioImages.map((project: any, index: number) => (
                            <div
                                key={index}
                                onClick={() => {
                                  setSelectedProject(project);
                                  setIsModalOpen(true);
                                }}
                                className="group relative aspect-video rounded-xl overflow-hidden bg-muted cursor-pointer shadow-sm hover:shadow-md transition-all border border-border"
                            >
                              <ProjectImageCarousel
                                  images={project.images || (project.image ? [project.image] : [])}
                                  title={project.title || `Portfolio ${index + 1}`}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                                <p className="text-white font-medium truncate translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{project.title || 'Untitled Project'}</p>
                                {project.description && (
                                    <p className="text-white/80 text-xs truncate translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">{project.description}</p>
                                )}
                              </div>
                            </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
              )}

              {/* 8. Video */}
              {candidateData.videoUrl && (
                  <Card className="border-border bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <Video className="w-5 h-5 mr-2 text-primary" />
                        Video Introduction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video rounded-xl overflow-hidden bg-black border border-border shadow-sm">
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
                    </CardContent>
                  </Card>
              )}

              {/* 9. Reviews */}
              <Card className="border-border bg-card shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Reviews
                  </CardTitle>
                  {candidateReviews.length > 0 && (
                      <div className="flex items-center bg-muted/50 px-3 py-1 rounded-full">
                        <span className="font-bold mr-1">{averageRating.toFixed(1)}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.round(averageRating) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                      </div>
                  )}
                </CardHeader>
                <CardContent>
                  {candidateReviews.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No reviews received yet.
                      </div>
                  ) : (
                      <div className="space-y-4">
                        {candidateReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>

          {/* MODALS */}

          {/* Project Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-card border-border">
              {selectedProject && (
                  <div className="flex flex-col">
                    <div className="relative aspect-video w-full overflow-hidden bg-black/5">
                      <ProjectImageCarousel
                          images={selectedProject.images || (selectedProject.image ? [selectedProject.image] : [])}
                          title={selectedProject.title}
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
                        <DialogTitle className="text-2xl font-bold text-foreground">
                          {selectedProject.title || 'Untitled Project'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="prose prose-sm max-w-none text-muted-foreground">
                        {selectedProject.description || 'No description provided for this project.'}
                      </div>
                    </div>
                  </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Award Detail Dialog */}
          <Dialog open={isAwardModalOpen} onOpenChange={setIsAwardModalOpen}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-card border-border">
              {selectedAward && (
                  <div className="flex flex-col">
                    {selectedAward.certificateImage && (
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted flex items-center justify-center bg-white border-b border-border">
                          <img
                              src={selectedAward.certificateImage}
                              alt={selectedAward.title}
                              className="w-full h-full object-contain p-4"
                          />
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setIsAwardModalOpen(false)}
                              className="absolute top-2 right-2 rounded-full bg-black/10 hover:bg-black/20 text-foreground border-none"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                    )}
                    <div className="p-6 relative">
                      {!selectedAward.certificateImage && (
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setIsAwardModalOpen(false)}
                              className="absolute top-2 right-2 rounded-full hover:bg-muted text-muted-foreground"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                      )}
                      <DialogHeader className="mb-2">
                        <DialogTitle className="text-2xl font-bold text-foreground">
                          {selectedAward.title}
                        </DialogTitle>
                        <p className="text-primary font-medium">{selectedAward.year}</p>
                      </DialogHeader>
                      <div className="mt-4 prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                        {selectedAward.description || 'No description provided.'}
                      </div>
                    </div>
                  </div>
              )}
            </DialogContent>
          </Dialog>

        </div>
      </AppLayout>
  );
};

export default CandidateProfile;