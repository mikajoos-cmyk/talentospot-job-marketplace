import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, Mail, Phone, Briefcase, GraduationCap, Award, Video, 
  Image as ImageIcon, DollarSign, Home, Calendar, Plane, ArrowLeft,
  MessageSquare, UserPlus, Globe, Car
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import { mockCandidates } from '@/data/mockCandidates';
import { mockJobs } from '@/data/mockJobs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const CandidateDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { showToast } = useToast();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const candidate = mockCandidates.find(c => c.id === id);
  const isBlurred = user.packageTier === 'free';
  const canContact = user.packageTier === 'premium';

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
                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-h3">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
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
                  <span>{isBlurred ? '+•• ••• •••••••' : '+49 123 456 7890'}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{candidate.location}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <Globe className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{candidate.locationPreference.country}</span>
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
                ${candidate.conditions.salaryExpectation.min.toLocaleString()} - ${candidate.conditions.salaryExpectation.max.toLocaleString()}
              </p>
            </div>

            {candidate.conditions.entryBonus && (
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-caption text-warning mb-1">Entry Bonus</p>
                <p className="text-h4 font-heading text-warning">
                  €{candidate.conditions.entryBonus.toLocaleString()}
                </p>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Work Radius</p>
              <p className="text-h4 font-heading text-foreground">{candidate.conditions.workRadius} km</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Home Office</p>
              <p className="text-h4 font-heading text-foreground capitalize">{candidate.conditions.homeOfficePreference}</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-caption text-muted-foreground mb-1">Vacation Days</p>
              <p className="text-h4 font-heading text-foreground">{candidate.conditions.vacationDays} days</p>
            </div>

            {candidate.conditions.startDate && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-caption text-muted-foreground mb-1">Available From</p>
                <p className="text-h4 font-heading text-foreground">
                  {new Date(candidate.conditions.startDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {candidate.conditions.noticePeriod && (
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
                src={candidate.videoUrl}
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
              {candidate.portfolioImages.map((image, index) => (
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

              {candidate.experience.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-body text-muted-foreground">No work experience added</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {candidate.experience.map((exp) => (
                    <div key={exp.id} className="relative pl-6 border-l-2 border-border">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary"></div>
                      <h4 className="text-h4 font-heading text-foreground mb-1">{exp.title}</h4>
                      <p className="text-body-sm text-muted-foreground mb-2">
                        {exp.company} • {exp.period}
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

              {candidate.education.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-body text-muted-foreground">No education added</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidate.education.map((edu) => (
                    <div key={edu.id} className="relative pl-6 border-l-2 border-border">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-accent"></div>
                      <h4 className="text-h4 font-heading text-foreground mb-1">{edu.degree}</h4>
                      <p className="text-body-sm text-muted-foreground">
                        {edu.institution} • {edu.period}
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
                {candidate.locationPreference.cities.map((city, index) => (
                  <div key={index} className="flex items-center p-3 bg-muted rounded-lg">
                    <MapPin className="w-4 h-4 mr-2 text-primary" strokeWidth={1.5} />
                    <span className="text-body-sm text-foreground">
                      {city}, {candidate.locationPreference.country}
                    </span>
                  </div>
                ))}
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
                {candidate.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-body-sm font-medium text-foreground">{skill.name}</span>
                      <span className="text-body-sm text-muted-foreground">{skill.percentage}%</span>
                    </div>
                    <Progress value={skill.percentage} className="h-2" />
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
                {candidate.qualifications.map((qualification) => (
                  <span
                    key={qualification}
                    className="px-3 py-2 bg-accent/10 text-accent text-body-sm rounded-lg"
                  >
                    {qualification}
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
                    <span className="px-2 py-1 bg-primary/10 text-primary text-caption rounded-md">Class B</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-caption rounded-md">Class A</span>
                  </div>
                </div>

                <div>
                  <p className="text-caption text-muted-foreground mb-1">Travel Willingness</p>
                  <div className="flex items-center">
                    <Plane className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-body-sm text-foreground">Up to 25%</span>
                  </div>
                </div>
              </div>
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
            {mockJobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => handleInvite(job.title)}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={job.image}
                    alt={job.company}
                    className="w-12 h-12 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h4 className="text-body font-medium text-foreground mb-1">{job.title}</h4>
                    <p className="text-body-sm text-muted-foreground mb-2">{job.location}</p>
                    <div className="flex items-center space-x-4 text-caption text-muted-foreground">
                      <span>{job.type}</span>
                      <span>•</span>
                      <span>{job.salary}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default CandidateDetailView;
