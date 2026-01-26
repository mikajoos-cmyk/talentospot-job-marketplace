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
import ReviewCard from '../components/shared/ReviewCard';

const CandidateProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [candidateData, setCandidateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Funktion zur dynamischen Berechnung des Fortschritts
  const calculateCompletion = (data: any, userProfile: any) => {
    let score = 0;

    // Basisdaten (User Context + Profile)
    if (userProfile.name) score += 10;
    if (userProfile.email) score += 5;
    if (data.job_title) score += 10;
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
  const hasLicenses = candidateData.driving_licenses && candidateData.driving_licenses.length > 0;
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
              {candidateData.is_refugee && (
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-caption rounded-md mb-2">
                  Refugee/Immigrant
                  {candidateData.origin_country && ` from ${candidateData.origin_country}`}
                </span>
              )}
              <h2 className="text-h2 font-heading text-foreground mb-2">{user.name}</h2>
              <p className="text-body text-muted-foreground mb-4">
                {candidateData.job_title || 'No job title specified'}
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
                {(candidateData.salary_expectation_min || candidateData.salary_expectation_max)
                  ? `€${candidateData.salary_expectation_min?.toLocaleString() || '0'} - €${candidateData.salary_expectation_max?.toLocaleString() || '0'}`
                  : 'Not specified'}
              </p>
            </div>

            {/* Nur anzeigen, wenn Bonus > 0 */}
            {candidateData.desired_entry_bonus > 0 && (
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-caption text-warning mb-1">Entry Bonus</p>
                <p className="text-h4 font-heading text-warning">
                  €{candidateData.desired_entry_bonus.toLocaleString()}
                </p>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Work Radius</p>
              <p className="text-h4 font-heading text-foreground">
                {candidateData.work_radius_km ? `${candidateData.work_radius_km} km` : 'Not specified'}
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Home Office</p>
              <p className="text-h4 font-heading text-foreground capitalize">
                {candidateData.home_office_preference || 'Not specified'}
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Vacation Days</p>
              <p className="text-h4 font-heading text-foreground">
                {candidateData.vacation_days ? `${candidateData.vacation_days} days` : 'Not specified'}
              </p>
            </div>

            {candidateData.available_from && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-caption text-muted-foreground mb-1">Available From</p>
                <p className="text-h4 font-heading text-foreground">
                  {new Date(candidateData.available_from).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Notice Period</p>
              <p className="text-h4 font-heading text-foreground">
                {candidateData.notice_period || 'Not specified'}
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Travel Willingness</p>
              <div className="flex items-center">
                <Plane className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-body-sm text-foreground">
                  {candidateData.travel_willingness > 0
                    ? `Up to ${candidateData.travel_willingness}%`
                    : 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Video Introduction - Nur anzeigen wenn vorhanden */}
        {candidateData.video_url && (
          <Card className="p-6 md:p-8 border border-border bg-card">
            <div className="flex items-center space-x-3 mb-6">
              <Video className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="text-h3 font-heading text-foreground">Video Introduction</h3>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                width="100%"
                height="100%"
                src={candidateData.video_url}
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
        {candidateData.portfolio_images && candidateData.portfolio_images.length > 0 && (
          <Card className="p-6 md:p-8 border border-border bg-card">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="text-h3 font-heading text-foreground">Portfolio</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {candidateData.portfolio_images.map((image: string, index: number) => (
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
                        {exp.company_name || exp.company} • {new Date(exp.start_date).toLocaleDateString()}
                        {exp.end_date ? ` - ${new Date(exp.end_date).toLocaleDateString()}` : ' - Present'}
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
                        {edu.institution} • {new Date(edu.start_date).toLocaleDateString()}
                        {edu.end_date ? ` - ${new Date(edu.end_date).toLocaleDateString()}` : ' - Present'}
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
                        <span key={idx} className="px-2 py-1 bg-info/10 text-info text-caption rounded-md">
                          {lang.name}
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
                      {candidateData.driving_licenses.map((license: string, idx: number) => (
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