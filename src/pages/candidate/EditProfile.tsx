import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Slider } from '../../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { candidateService } from '../../services/candidate.service';
import { ArrowLeft, Upload, X, Plus, Trash2, Image as ImageIcon, Briefcase, GraduationCap, MapPin, Video, Car, Plane, Loader2 } from 'lucide-react';
import { locationData } from '../../data/locationData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface PreferredLocation {
  id: string;
  continent: string;
  country: string;
  city: string;
}

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const profile = await candidateService.getCandidateProfile(user.id);
        if (profile) {
          setFormData({
            name: user.name,
            email: user.email,
            phone: profile.profiles?.phone || '',
            dateOfBirth: profile.date_of_birth || '',
            nationality: profile.nationality || '',
            gender: profile.gender || '',
            address: profile.address || '',
            location: `${profile.city || ''}, ${profile.country || ''}`,
            videoUrl: profile.video_url || '',
            title: profile.job_title || '',
            sector: profile.sector || '',
            careerLevel: profile.career_level || '',
            status: profile.employment_status || '',
            jobTypes: profile.jobTypes || [],
            noticePeriod: profile.notice_period || '',
            travelWillingness: profile.travel_willingness?.toString() || '0',
            salaryMin: profile.salary_expectation_min || 0,
            salaryMax: profile.salary_expectation_max || 0,
            entryBonus: profile.desired_entry_bonus || 0,
            vacationDays: profile.vacation_days || 0,
            workRadius: profile.work_radius_km || 0,
          });
          setExperience(profile.candidate_experience || []);
          setEducation(profile.candidate_education || []);
          setSkills(profile.candidate_skills?.map((s: any) => ({ name: s.skills?.name, percentage: s.proficiency_percentage })) || []);
          setQualifications(profile.candidate_qualifications?.map((q: any) => q.qualifications?.name) || []);
        }
      } catch (error) {
        console.error('Error fetching profile for editing:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id, user.name, user.email]);
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [educationModalOpen, setEducationModalOpen] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    period: '',
    description: '',
  });
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    period: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [qualificationInput, setQualificationInput] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  const [drivingLicenses, setDrivingLicenses] = useState<string[]>([]);
  const [licenseInput, setLicenseInput] = useState('');

  const [preferredLocations, setPreferredLocations] = useState<PreferredLocation[]>([]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    continent: '',
    country: '',
    city: '',
  });

  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([]);

  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    image: '',
  });

  const continents = Object.keys(locationData);
  const countries = newLocation.continent ? Object.keys(locationData[newLocation.continent] || {}) : [];
  const cities = newLocation.country && newLocation.continent
    ? locationData[newLocation.continent]?.[newLocation.country] || []
    : [];

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.some(s => s.name === skillInput.trim())) {
      setSkills([...skills, { name: skillInput.trim(), percentage: 50 }]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(skills.filter(s => s.name !== skillName));
  };

  const handleSkillPercentageChange = (skillName: string, percentage: number) => {
    setSkills(skills.map(s => s.name === skillName ? { ...s, percentage } : s));
  };

  const handleAddExperience = () => {
    if (!newExperience.title.trim() || !newExperience.company.trim()) {
      showToast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const exp = {
      id: Date.now().toString(),
      title: newExperience.title,
      company: newExperience.company,
      period: newExperience.period,
      description: newExperience.description,
    };

    setExperience([...experience, exp]);
    setNewExperience({ title: '', company: '', period: '', description: '' });
    setExperienceModalOpen(false);
    showToast({
      title: 'Experience Added',
      description: 'Work experience has been added successfully',
    });
  };

  const handleDeleteExperience = (expId: string) => {
    setExperience(experience.filter(e => e.id !== expId));
    showToast({
      title: 'Experience Deleted',
      description: 'Work experience has been removed',
    });
  };

  const handleAddEducation = () => {
    if (!newEducation.degree.trim() || !newEducation.institution.trim()) {
      showToast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const edu = {
      id: Date.now().toString(),
      degree: newEducation.degree,
      institution: newEducation.institution,
      period: newEducation.period,
    };

    setEducation([...education, edu]);
    setNewEducation({ degree: '', institution: '', period: '' });
    setEducationModalOpen(false);
    showToast({
      title: 'Education Added',
      description: 'Education has been added successfully',
    });
  };

  const handleDeleteEducation = (eduId: string) => {
    setEducation(education.filter(e => e.id !== eduId));
    showToast({
      title: 'Education Deleted',
      description: 'Education has been removed',
    });
  };

  const handleAddQualification = () => {
    if (qualificationInput.trim() && !qualifications.includes(qualificationInput.trim())) {
      setQualifications([...qualifications, qualificationInput.trim()]);
      setQualificationInput('');
    }
  };

  const handleRemoveQualification = (qualification: string) => {
    setQualifications(qualifications.filter(q => q !== qualification));
  };

  const handleAddLanguage = () => {
    if (languageInput.trim() && !languages.includes(languageInput.trim())) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (language: string) => {
    setLanguages(languages.filter(l => l !== language));
  };

  const handleAddLicense = () => {
    if (licenseInput.trim() && !drivingLicenses.includes(licenseInput.trim().toUpperCase())) {
      setDrivingLicenses([...drivingLicenses, licenseInput.trim().toUpperCase()]);
      setLicenseInput('');
    }
  };

  const handleRemoveLicense = (license: string) => {
    setDrivingLicenses(drivingLicenses.filter(l => l !== license));
  };

  const handleAddLocation = () => {
    if (!newLocation.continent || !newLocation.country || !newLocation.city) {
      showToast({
        title: 'Error',
        description: 'Please select continent, country, and city',
        variant: 'destructive',
      });
      return;
    }

    const location: PreferredLocation = {
      id: Date.now().toString(),
      continent: newLocation.continent,
      country: newLocation.country,
      city: newLocation.city,
    };

    setPreferredLocations([...preferredLocations, location]);
    setNewLocation({ continent: '', country: '', city: '' });
    setLocationModalOpen(false);
    showToast({
      title: 'Location Added',
      description: 'Preferred work location has been added successfully',
    });
  };

  const handleDeleteLocation = (locationId: string) => {
    setPreferredLocations(preferredLocations.filter(l => l.id !== locationId));
    showToast({
      title: 'Location Removed',
      description: 'Preferred work location has been removed',
    });
  };

  const handleJobTypeToggle = (type: string) => {
    if (formData.jobTypes.includes(type)) {
      setFormData({
        ...formData,
        jobTypes: formData.jobTypes.filter((t: string) => t !== type),
      });
    } else {
      setFormData({
        ...formData,
        jobTypes: [...formData.jobTypes, type],
      });
    }
  };

  const handleAddProject = () => {
    if (!newProject.title.trim() || !newProject.description.trim()) {
      showToast({
        title: 'Error',
        description: 'Please fill in all project fields',
        variant: 'destructive',
      });
      return;
    }

    const project: PortfolioProject = {
      id: Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      image: newProject.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    };

    setPortfolioProjects([...portfolioProjects, project]);
    setNewProject({ title: '', description: '', image: '' });
    setPortfolioModalOpen(false);
    showToast({
      title: 'Project Added',
      description: 'Your portfolio project has been added successfully',
    });
  };

  const handleDeleteProject = (projectId: string) => {
    setPortfolioProjects(portfolioProjects.filter(p => p.id !== projectId));
    showToast({
      title: 'Project Deleted',
      description: 'Portfolio project has been removed',
    });
  };

  const handleSave = async () => {
    try {
      if (!user?.id) return;

      const updates = {
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        address: formData.address,
        city: formData.location.split(', ')[0] || '',
        country: formData.location.split(', ')[1]?.trim() || '',
        job_title: formData.title,
        sector: formData.sector,
        career_level: formData.careerLevel,
        employment_status: formData.status,
        notice_period: formData.noticePeriod,
        salary_expectation_min: formData.salaryMin,
        salary_expectation_max: formData.salaryMax,
        desired_entry_bonus: formData.entryBonus,
        vacation_days: formData.vacationDays,
        work_radius_km: formData.workRadius,
        travel_willingness: parseInt(formData.travelWillingness),
        video_url: formData.videoUrl,
        jobTypes: formData.jobTypes,
      };

      await candidateService.updateCandidateProfile(user.id, updates);

      showToast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
      navigate('/candidate/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast({
        title: 'Update Failed',
        description: 'An error occurred while saving your profile',
        variant: 'destructive',
      });
    }
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

  if (!formData) return null;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/candidate/profile')}
            className="bg-transparent text-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Button>
          <div>
            <h1 className="text-h1 font-heading text-foreground mb-2">Edit Profile</h1>
            <p className="text-body text-muted-foreground">Update your professional information.</p>
          </div>
        </div>

        {/* Personal Information */}
        <Card className="p-6 md:p-8 border border-border bg-card">
          <h3 className="text-h3 font-heading text-foreground mb-6">Personal Information</h3>

          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-h2 font-heading text-primary">
                {user.name.charAt(0)}
              </div>
              <div>
                <Label className="text-body-sm font-medium text-foreground mb-2 block">
                  Profile Picture
                </Label>
                <Button
                  variant="outline"
                  className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                >
                  <Upload className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Upload Photo
                </Button>
                <p className="text-caption text-muted-foreground mt-2">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-body-sm font-medium text-foreground mb-2 block">
                  Full Name <span className="text-error">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-body-sm font-medium text-foreground mb-2 block">
                  Email Address <span className="text-error">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-body-sm font-medium text-foreground mb-2 block">
                  WhatsApp / Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth" className="text-body-sm font-medium text-foreground mb-2 block">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="nationality" className="text-body-sm font-medium text-foreground mb-2 block">
                  Nationality
                </Label>
                <Input
                  id="nationality"
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="gender" className="text-body-sm font-medium text-foreground mb-2 block">
                  Gender
                </Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-body-sm font-medium text-foreground mb-2 block">
                  Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-body-sm font-medium text-foreground mb-2 block">
                  Current Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Media */}
        <Card className="p-6 md:p-8 border border-border bg-card">
          <h3 className="text-h3 font-heading text-foreground mb-6">Media & Presentation</h3>

          <div className="space-y-6">
            <div>
              <Label htmlFor="videoUrl" className="text-body-sm font-medium text-foreground mb-2 block">
                <Video className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                Video Introduction (YouTube URL)
              </Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="bg-background text-foreground border-border"
              />
              <p className="text-caption text-muted-foreground mt-2">
                Add a YouTube video to introduce yourself to potential employers
              </p>
            </div>
          </div>
        </Card>

        {/* Professional Information */}
        <Card className="p-6 md:p-8 border border-border bg-card">
          <h3 className="text-h3 font-heading text-foreground mb-6">Professional Information</h3>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title" className="text-body-sm font-medium text-foreground mb-2 block">
                  Job Title <span className="text-error">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="sector" className="text-body-sm font-medium text-foreground mb-2 block">
                  Sector
                </Label>
                <Select value={formData.sector} onValueChange={(value) => setFormData({ ...formData, sector: value })}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="careerLevel" className="text-body-sm font-medium text-foreground mb-2 block">
                  Career Level
                </Label>
                <Select value={formData.careerLevel} onValueChange={(value) => setFormData({ ...formData, careerLevel: value })}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid-Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status" className="text-body-sm font-medium text-foreground mb-2 block">
                  Employment Status
                </Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Werte müssen exakt mit DB Constraints übereinstimmen */}
                    <SelectItem value="employed_full_time">Employed (Full-time)</SelectItem>
                    <SelectItem value="employed_part_time">Employed (Part-time)</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="self_employed">Freelance / Self-Employed</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Skills
              </Label>
              <div className="flex space-x-2 mb-4">
                <Input
                  type="text"
                  placeholder="Add skill name..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="flex-1 bg-background text-foreground border-border"
                />
                <Button
                  size="icon"
                  onClick={handleAddSkill}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                </Button>
              </div>
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.name} className="p-4 border border-border rounded-lg bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-body-sm font-medium text-foreground">{skill.name}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-body-sm text-muted-foreground">{skill.percentage}%</span>
                        <button
                          onClick={() => handleRemoveSkill(skill.name)}
                          className="text-error hover:text-error/80"
                          aria-label={`Remove ${skill.name}`}
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                    <Slider
                      value={[skill.percentage]}
                      onValueChange={(value) => handleSkillPercentageChange(skill.name, value[0])}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Qualifications
              </Label>
              <div className="flex space-x-2 mb-3">
                <Input
                  type="text"
                  placeholder="Add qualification..."
                  value={qualificationInput}
                  onChange={(e) => setQualificationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddQualification()}
                  className="flex-1 bg-background text-foreground border-border"
                />
                <Button
                  size="icon"
                  onClick={handleAddQualification}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {qualifications.map((qualification) => (
                  <div
                    key={qualification}
                    className="flex items-center space-x-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-body-sm"
                  >
                    <span>{qualification}</span>
                    <button
                      onClick={() => handleRemoveQualification(qualification)}
                      className="hover:text-accent-hover"
                      aria-label={`Remove ${qualification}`}
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Languages
              </Label>
              <div className="flex space-x-2 mb-3">
                <Input
                  type="text"
                  placeholder="Add language..."
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
                  className="flex-1 bg-background text-foreground border-border"
                />
                <Button
                  size="icon"
                  onClick={handleAddLanguage}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <div
                    key={language}
                    className="flex items-center space-x-1 px-3 py-1 bg-info/10 text-info rounded-full text-body-sm"
                  >
                    <span>{language}</span>
                    <button
                      onClick={() => handleRemoveLanguage(language)}
                      className="hover:text-info-hover"
                      aria-label={`Remove ${language}`}
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                <Car className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                Driving Licenses
              </Label>
              <div className="flex space-x-2 mb-3">
                <Input
                  type="text"
                  placeholder="Add license class (e.g., B, A, C1)..."
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLicense()}
                  className="flex-1 bg-background text-foreground border-border"
                />
                <Button
                  size="icon"
                  onClick={handleAddLicense}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {drivingLicenses.map((license) => (
                  <div
                    key={license}
                    className="flex items-center space-x-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-body-sm font-medium"
                  >
                    <span>Class {license}</span>
                    <button
                      onClick={() => handleRemoveLicense(license)}
                      className="hover:text-primary-hover"
                      aria-label={`Remove ${license}`}
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Job Preferences */}
        <Card className="p-6 md:p-8 border border-border bg-card">
          <h3 className="text-h3 font-heading text-foreground mb-6">Job Preferences</h3>

          <div className="space-y-6">
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Preferred Job Types
              </Label>
              <div className="flex flex-wrap gap-3">
                {['full-time', 'part-time', 'contract', 'freelance', 'remote'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleJobTypeToggle(type)}
                    className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-all ${formData.jobTypes.includes(type)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                  >
                    {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="noticePeriod" className="text-body-sm font-medium text-foreground mb-2 block">
                  Notice Period
                </Label>
                <Input
                  id="noticePeriod"
                  type="text"
                  placeholder="e.g., 3 months, Immediate"
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="travelWillingness" className="text-body-sm font-medium text-foreground mb-2 block">
                  <Plane className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                  Willingness to Travel
                </Label>
                <Select value={formData.travelWillingness} onValueChange={(value) => setFormData({ ...formData, travelWillingness: value })}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Travel</SelectItem>
                    <SelectItem value="25">Up to 25%</SelectItem>
                    <SelectItem value="50">Up to 50%</SelectItem>
                    <SelectItem value="75">Up to 75%</SelectItem>
                    <SelectItem value="100">100% (Fully Mobile)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-body-sm font-medium text-foreground">
                  <MapPin className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                  Preferred Work Locations
                </Label>
                <Button
                  onClick={() => setLocationModalOpen(true)}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                >
                  <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
                  Add Location
                </Button>
              </div>

              {preferredLocations.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-body-sm text-muted-foreground mb-3">No preferred locations added yet</p>
                  <Button
                    onClick={() => setLocationModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                  >
                    Add Your First Location
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {preferredLocations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg bg-background hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-primary" strokeWidth={1.5} />
                        <span className="text-body-sm text-foreground">
                          {location.city}, {location.country}, {location.continent}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleDeleteLocation(location.id)}
                        variant="ghost"
                        size="icon"
                        className="bg-transparent text-error hover:bg-error/10 hover:text-error h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Salary & Conditions */}
        <Card className="p-6 md:p-8 border border-border bg-card">
          <h3 className="text-h3 font-heading text-foreground mb-6">Salary & Conditions</h3>

          <div className="space-y-6">
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Salary Expectation: ${formData.salaryMin.toLocaleString()} - ${formData.salaryMax.toLocaleString()}
              </Label>
              <div className="space-y-4">
                <div>
                  <Label className="text-caption text-muted-foreground mb-2 block">Minimum</Label>
                  <Slider
                    value={[formData.salaryMin]}
                    onValueChange={(value) => setFormData({ ...formData, salaryMin: value[0] })}
                    min={30000}
                    max={200000}
                    step={5000}
                  />
                </div>
                <div>
                  <Label className="text-caption text-muted-foreground mb-2 block">Maximum</Label>
                  <Slider
                    value={[formData.salaryMax]}
                    onValueChange={(value) => setFormData({ ...formData, salaryMax: value[0] })}
                    min={30000}
                    max={200000}
                    step={5000}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Entry Bonus: €{formData.entryBonus.toLocaleString()}
              </Label>
              <Slider
                value={[formData.entryBonus]}
                onValueChange={(value) => setFormData({ ...formData, entryBonus: value[0] })}
                min={0}
                max={50000}
                step={1000}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-body-sm font-medium text-foreground mb-3 block">
                  Vacation Days: {formData.vacationDays}
                </Label>
                <Slider
                  value={[formData.vacationDays]}
                  onValueChange={(value) => setFormData({ ...formData, vacationDays: value[0] })}
                  min={20}
                  max={40}
                  step={1}
                />
              </div>

              <div>
                <Label className="text-body-sm font-medium text-foreground mb-3 block">
                  Work Radius: {formData.workRadius} km
                </Label>
                <Slider
                  value={[formData.workRadius]}
                  onValueChange={(value) => setFormData({ ...formData, workRadius: value[0] })}
                  min={10}
                  max={200}
                  step={5}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Work Experience */}
        <Card className="p-6 md:p-8 border border-border bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h3 font-heading text-foreground">Work Experience</h3>
            <Button
              onClick={() => setExperienceModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              <Plus className="w-5 h-5 mr-2" strokeWidth={2} />
              Add Experience
            </Button>
          </div>

          {experience.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-body text-muted-foreground mb-4">No work experience added yet</p>
              <Button
                onClick={() => setExperienceModalOpen(true)}
                variant="outline"
                className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
              >
                Add Your First Experience
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {experience.map((exp) => (
                <Card key={exp.id} className="p-4 border border-border bg-background">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-h4 font-heading text-foreground mb-1">{exp.title}</h4>
                      <p className="text-body-sm text-muted-foreground mb-2">{exp.company} • {exp.period}</p>
                      <p className="text-body-sm text-foreground">{exp.description}</p>
                    </div>
                    <Button
                      onClick={() => handleDeleteExperience(exp.id)}
                      variant="ghost"
                      size="icon"
                      className="bg-transparent text-error hover:bg-error/10 hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Education */}
        <Card className="p-6 md:p-8 border border-border bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h3 font-heading text-foreground">Education</h3>
            <Button
              onClick={() => setEducationModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              <Plus className="w-5 h-5 mr-2" strokeWidth={2} />
              Add Education
            </Button>
          </div>

          {education.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-body text-muted-foreground mb-4">No education added yet</p>
              <Button
                onClick={() => setEducationModalOpen(true)}
                variant="outline"
                className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
              >
                Add Your First Education
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {education.map((edu) => (
                <Card key={edu.id} className="p-4 border border-border bg-background">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-h4 font-heading text-foreground mb-1">{edu.degree}</h4>
                      <p className="text-body-sm text-muted-foreground">{edu.institution} • {edu.period}</p>
                    </div>
                    <Button
                      onClick={() => handleDeleteEducation(edu.id)}
                      variant="ghost"
                      size="icon"
                      className="bg-transparent text-error hover:bg-error/10 hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Portfolio */}
        <Card className="p-6 md:p-8 border border-border bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h3 font-heading text-foreground">My Portfolio</h3>
            <Button
              onClick={() => setPortfolioModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              <Plus className="w-5 h-5 mr-2" strokeWidth={2} />
              Add Project
            </Button>
          </div>

          {portfolioProjects.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-body text-muted-foreground mb-4">No portfolio projects yet</p>
              <Button
                onClick={() => setPortfolioModalOpen(true)}
                variant="outline"
                className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
              >
                Add Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden border border-border bg-background hover:shadow-lg transition-all duration-normal">
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-h4 font-heading text-foreground mb-2">{project.title}</h4>
                    <p className="text-body-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
                    <Button
                      onClick={() => handleDeleteProject(project.id)}
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent text-error border-error hover:bg-error hover:text-error-foreground font-normal"
                    >
                      <Trash2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/candidate/profile')}
            className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Experience Modal */}
      <Dialog open={experienceModalOpen} onOpenChange={setExperienceModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Add Work Experience</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Add your professional work experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="expTitle" className="text-body-sm font-medium text-foreground mb-2 block">
                Job Title <span className="text-error">*</span>
              </Label>
              <Input
                id="expTitle"
                type="text"
                placeholder="e.g., Senior Frontend Developer"
                value={newExperience.title}
                onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="expCompany" className="text-body-sm font-medium text-foreground mb-2 block">
                Company <span className="text-error">*</span>
              </Label>
              <Input
                id="expCompany"
                type="text"
                placeholder="e.g., TechCorp Inc."
                value={newExperience.company}
                onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="expPeriod" className="text-body-sm font-medium text-foreground mb-2 block">
                Period
              </Label>
              <Input
                id="expPeriod"
                type="text"
                placeholder="e.g., 2020 - Present"
                value={newExperience.period}
                onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="expDescription" className="text-body-sm font-medium text-foreground mb-2 block">
                Description
              </Label>
              <textarea
                id="expDescription"
                placeholder="Describe your responsibilities and achievements..."
                value={newExperience.description}
                onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                className="w-full min-h-[120px] px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setExperienceModalOpen(false);
                setNewExperience({ title: '', company: '', period: '', description: '' });
              }}
              className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddExperience}
              disabled={!newExperience.title.trim() || !newExperience.company.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              Add Experience
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Education Modal */}
      <Dialog open={educationModalOpen} onOpenChange={setEducationModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Add Education</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Add your educational background
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="eduDegree" className="text-body-sm font-medium text-foreground mb-2 block">
                Degree <span className="text-error">*</span>
              </Label>
              <Input
                id="eduDegree"
                type="text"
                placeholder="e.g., Bachelor of Computer Science"
                value={newEducation.degree}
                onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="eduInstitution" className="text-body-sm font-medium text-foreground mb-2 block">
                Institution <span className="text-error">*</span>
              </Label>
              <Input
                id="eduInstitution"
                type="text"
                placeholder="e.g., University of Technology"
                value={newEducation.institution}
                onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="eduPeriod" className="text-body-sm font-medium text-foreground mb-2 block">
                Period
              </Label>
              <Input
                id="eduPeriod"
                type="text"
                placeholder="e.g., 2014 - 2018"
                value={newEducation.period}
                onChange={(e) => setNewEducation({ ...newEducation, period: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setEducationModalOpen(false);
                setNewEducation({ degree: '', institution: '', period: '' });
              }}
              className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEducation}
              disabled={!newEducation.degree.trim() || !newEducation.institution.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              Add Education
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preferred Location Modal */}
      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Add Preferred Work Location</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Select a location where you would like to work
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="locContinent" className="text-body-sm font-medium text-foreground mb-2 block">
                Continent <span className="text-error">*</span>
              </Label>
              <Select
                value={newLocation.continent}
                onValueChange={(value) => setNewLocation({ continent: value, country: '', city: '' })}
              >
                <SelectTrigger className="bg-background text-foreground border-border">
                  <SelectValue placeholder="Select continent" />
                </SelectTrigger>
                <SelectContent>
                  {continents.map(continent => (
                    <SelectItem key={continent} value={continent}>{continent}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newLocation.continent && (
              <div>
                <Label htmlFor="locCountry" className="text-body-sm font-medium text-foreground mb-2 block">
                  Country <span className="text-error">*</span>
                </Label>
                <Select
                  value={newLocation.country}
                  onValueChange={(value) => setNewLocation({ ...newLocation, country: value, city: '' })}
                >
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newLocation.country && (
              <div>
                <Label htmlFor="locCity" className="text-body-sm font-medium text-foreground mb-2 block">
                  City <span className="text-error">*</span>
                </Label>
                <Select
                  value={newLocation.city}
                  onValueChange={(value) => setNewLocation({ ...newLocation, city: value })}
                >
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setLocationModalOpen(false);
                setNewLocation({ continent: '', country: '', city: '' });
              }}
              className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLocation}
              disabled={!newLocation.continent || !newLocation.country || !newLocation.city}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              Add Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Portfolio Modal */}
      <Dialog open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Add Portfolio Project</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Showcase your work and achievements
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="projectTitle" className="text-body-sm font-medium text-foreground mb-2 block">
                Project Title <span className="text-error">*</span>
              </Label>
              <Input
                id="projectTitle"
                type="text"
                placeholder="e.g., E-Commerce Platform"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="projectDescription" className="text-body-sm font-medium text-foreground mb-2 block">
                Description <span className="text-error">*</span>
              </Label>
              <textarea
                id="projectDescription"
                placeholder="Describe your project, technologies used, and your role..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full min-h-[120px] px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Project Image
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-body-sm text-foreground">Click to upload image</p>
                <p className="text-caption text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setPortfolioModalOpen(false);
                setNewProject({ title: '', description: '', image: '' });
              }}
              className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProject}
              disabled={!newProject.title.trim() || !newProject.description.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              Save Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default EditProfile;
