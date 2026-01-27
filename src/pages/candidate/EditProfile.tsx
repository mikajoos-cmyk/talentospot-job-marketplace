import React, { useState, useRef } from 'react';
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
import { storageService } from '../../services/storage.service';
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
  const { user, refreshUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Refs for Datei-Uploads
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

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
            phone: profile.phone || '',
            dateOfBirth: profile.dateOfBirth || '',
            nationality: profile.nationality || '',
            gender: profile.gender || '',
            address: profile.address || '',
            location: profile.location || '',
            videoUrl: profile.videoUrl || '',
            avatar: profile.avatar || '',
            title: profile.title || '',
            sector: profile.sector || '',
            careerLevel: profile.careerLevel || '',
            status: profile.employmentStatus || '',
            jobTypes: profile.jobTypes || [],
            noticePeriod: profile.conditions.noticePeriod || '',
            travelWillingness: profile.travelWillingness?.toString() || '0',
            salaryMin: profile.salary.min || 0,
            salaryMax: profile.salary.max || 0,
            entryBonus: profile.conditions.entryBonus || 0,
            vacationDays: profile.conditions.vacationDays || 0,
            workRadius: profile.conditions.workRadius || 0,
            homeOfficePreference: profile.conditions.homeOfficePreference || 'none',
            description: profile.description || '',
            availableFrom: profile.availableFrom || '',
            currency: profile.currency || 'EUR',
          });
          setExperience(profile.experience || []);
          setEducation(profile.education || []);
          setSkills(profile.skills || []);
          setQualifications(profile.qualifications || []);
          setLanguages(profile.languages || []);
          setDrivingLicenses(profile.drivingLicenses || []);

          if (profile.preferredLocations) {
            const locations: PreferredLocation[] = profile.preferredLocations.map((loc: any, i: number) => ({
              id: `init-${i}`,
              continent: loc.continent,
              country: loc.country,
              city: loc.city
            }));
            setPreferredLocations(locations);
          }

          if (profile.portfolioImages) {
            setPortfolioProjects(profile.portfolioImages.map((p: any, i: number) => ({
              id: i.toString(),
              title: p.title || `Project ${i + 1}`,
              description: p.description || '',
              image: p.image || ''
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching profile for editing:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [educationModalOpen, setEducationModalOpen] = useState(false);
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  });
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });

  const [skillInput, setSkillInput] = useState('');
  const [qualificationInput, setQualificationInput] = useState('');
  const [languages, setLanguages] = useState<{ name: string; level: string }[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  const [languageLevel, setLanguageLevel] = useState('b2');
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log('handleAvatarUpload triggered', { fileCount: files?.length, userId: user?.id });

    if (!files || files.length === 0) return;
    const file = files[0];

    // Show preview immediately - do this before any other checks
    try {
      const previewUrl = URL.createObjectURL(file);
      console.log('Created preview URL:', previewUrl);
      setAvatarPreview(previewUrl);
    } catch (err) {
      console.error('Failed to create preview URL:', err);
    }

    if (!user?.id) {
      console.error('No user ID available for upload');
      showToast({ title: 'Error', description: 'User session not found. Please log in again.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      console.log('Starting upload for file:', file.name);
      const publicUrl = await storageService.uploadAvatar(user.id, file);
      console.log('Upload successful, public URL:', publicUrl);

      setFormData((prev: any) => {
        const next = { ...prev, avatar: publicUrl };
        console.log('Updating formData avatar:', next.avatar);
        return next;
      });

      showToast({ title: 'Upload Success', description: 'Profile picture uploaded' });
    } catch (error) {
      console.error('Avatar upload failed during service call:', error);
      showToast({ title: 'Upload Failed', description: 'Could not upload image', variant: 'destructive' });
      // We keep the preview for now so the user can see what they tried to upload
    } finally {
      setUploading(false);
      // Reset input value so the same file can be selected again if needed
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Cleanup preview URL to avoid memory leaks
  React.useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handlePortfolioImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user?.id) return;
    const file = event.target.files[0];
    setUploading(true);
    try {
      const publicUrl = await storageService.uploadPortfolioImage(user.id, file);
      setNewProject({ ...newProject, image: publicUrl });
      showToast({ title: 'Upload Success', description: 'Project image uploaded' });
    } catch (error) {
      showToast({ title: 'Error', description: 'Image upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

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
    if (!newExperience.title.trim() || !newExperience.company.trim() || !newExperience.startDate) {
      showToast({
        title: 'Error',
        description: 'Please fill in all required fields (Job Title, Company, and Start Date)',
        variant: 'destructive',
      });
      return;
    }

    const exp = {
      id: Date.now().toString(),
      title: newExperience.title,
      company: newExperience.company,
      startDate: newExperience.startDate,
      endDate: newExperience.isCurrent ? null : newExperience.endDate,
      isCurrent: newExperience.isCurrent,
      period: `${newExperience.startDate} - ${newExperience.isCurrent ? 'Present' : (newExperience.endDate || 'Present')}`,
      description: newExperience.description,
    };

    setExperience([...experience, exp]);
    setNewExperience({ title: '', company: '', startDate: '', endDate: '', isCurrent: false, description: '' });
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
    if (!newEducation.degree.trim() || !newEducation.institution.trim() || !newEducation.startDate) {
      showToast({
        title: 'Error',
        description: 'Please fill in all required fields (Degree, Institution, and Start Date)',
        variant: 'destructive',
      });
      return;
    }

    const edu = {
      id: Date.now().toString(),
      degree: newEducation.degree,
      institution: newEducation.institution,
      startDate: newEducation.startDate,
      endDate: newEducation.isCurrent ? null : newEducation.endDate,
      period: `${newEducation.startDate} - ${newEducation.isCurrent ? 'Present' : (newEducation.endDate || 'Present')}`,
    };

    setEducation([...education, edu]);
    setNewEducation({ degree: '', institution: '', startDate: '', endDate: '', isCurrent: false });
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
    if (languageInput.trim() && !languages.some(l => l.name.toLowerCase() === languageInput.trim().toLowerCase())) {
      setLanguages([...languages, { name: languageInput.trim(), level: languageLevel }]);
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (languageName: string) => {
    setLanguages(languages.filter(l => l.name !== languageName));
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
      setLoading(true);

      const updates = {
        // --- Basisdaten ---
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,

        // --- DB Felder (mapped) ---
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
        home_office_preference: formData.homeOfficePreference,
        available_from: formData.availableFrom,
        video_url: formData.videoUrl,
        description: formData.description,
        currency: formData.currency,

        // --- Arrays & Listen ---
        jobTypes: formData.jobTypes,
        drivingLicenses: drivingLicenses,
        skills: skills,
        experience: experience,
        education: education,
        qualifications: qualifications,
        languages: languages,
        preferredLocations: preferredLocations,

        // Portfolio Bilder (Speichert nun das ganze Objekt)
        portfolioImages: portfolioProjects.map(p => ({
          image: p.image,
          title: p.title,
          description: p.description
        }))
      };

      await candidateService.updateCandidateProfile(user.id, updates);
      await refreshUser();

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
    } finally {
      setLoading(false);
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
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border shadow-sm">
                {avatarPreview || formData.avatar ? (
                  <img src={avatarPreview || formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-h2 font-heading text-primary">{(user.name || 'U').charAt(0)}</span>
                )}
              </div>
              <div>
                <Label className="text-body-sm font-medium text-foreground mb-2 block">
                  Profile Picture
                </Label>
                <input
                  type="file"
                  ref={avatarInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                >
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" strokeWidth={1.5} />}
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

              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-body-sm font-medium text-foreground mb-2 block">
                  About Me / Profile Description
                </Label>
                <textarea
                  id="description"
                  placeholder="Describe your professional background and what you are looking for..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[120px] px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-sans text-body-sm"
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
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
                <Input
                  type="text"
                  placeholder="Add language..."
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
                  className="flex-1 bg-background text-foreground border-border"
                />
                <Select value={languageLevel} onValueChange={setLanguageLevel}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-background text-foreground border-border">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a1">A1 (Beginner)</SelectItem>
                    <SelectItem value="a2">A2 (Elementary)</SelectItem>
                    <SelectItem value="b1">B1 (Intermediate)</SelectItem>
                    <SelectItem value="b2">B2 (Upper Intermediate)</SelectItem>
                    <SelectItem value="c1">C1 (Advanced)</SelectItem>
                    <SelectItem value="c2">C2 (Proficient)</SelectItem>
                    <SelectItem value="native">Native</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  onClick={handleAddLanguage}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal w-full sm:w-10"
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <div
                    key={language.name}
                    className="flex items-center space-x-1 px-3 py-1 bg-info/10 text-info rounded-full text-body-sm"
                  >
                    <span className="capitalize">{language.name} ({language.level.toUpperCase()})</span>
                    <button
                      onClick={() => handleRemoveLanguage(language.name)}
                      className="hover:text-info-hover"
                      aria-label={`Remove ${language.name}`}
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

              <div>
                <Label htmlFor="homeOfficePreference" className="text-body-sm font-medium text-foreground mb-2 block">
                  Home Office Preference
                </Label>
                <Select value={formData.homeOfficePreference} onValueChange={(value: any) => setFormData({ ...formData, homeOfficePreference: value })}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Home Office</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="full">Full Remote</SelectItem>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="currency" className="text-body-sm font-medium text-foreground mb-2 block">
                  Currency
                </Label>
                <Select value={formData.currency || 'EUR'} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CHF">CHF (₣)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Salary Expectation: {formData.currency || 'EUR'} {formData.salaryMin.toLocaleString()} - {formData.salaryMax.toLocaleString()}
              </Label>
              <div className="space-y-4">
                <Slider
                  value={[formData.salaryMin, formData.salaryMax]}
                  onValueChange={(value) => setFormData({ ...formData, salaryMin: value[0], salaryMax: value[1] })}
                  min={1000}
                  max={250000}
                  step={1000}
                />
                <div className="flex justify-between text-caption text-muted-foreground">
                  <span>min. {formData.currency || 'EUR'} {formData.salaryMin.toLocaleString()}</span>
                  <span>max. {formData.currency || 'EUR'} {formData.salaryMax.toLocaleString()}</span>
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

            <div>
              <Label htmlFor="availableFrom" className="text-body-sm font-medium text-foreground mb-2 block">
                Available From
              </Label>
              <Input
                id="availableFrom"
                type="date"
                value={formData.availableFrom || ''}
                onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                className="bg-background text-foreground border-border"
              />
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
      </div >

      {/* Experience Modal */}
      < Dialog open={experienceModalOpen} onOpenChange={setExperienceModalOpen} >
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expStart" className="text-body-sm font-medium text-foreground mb-2 block">
                  Start Date <span className="text-error">*</span>
                </Label>
                <Input
                  id="expStart"
                  type="date"
                  value={newExperience.startDate}
                  onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              {!newExperience.isCurrent && (
                <div>
                  <Label htmlFor="expEnd" className="text-body-sm font-medium text-foreground mb-2 block">
                    End Date
                  </Label>
                  <Input
                    id="expEnd"
                    type="date"
                    value={newExperience.endDate}
                    onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                    className="bg-background text-foreground border-border"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="expCurrent"
                checked={newExperience.isCurrent}
                onChange={(e) => setNewExperience({ ...newExperience, isCurrent: e.target.checked })}
                className="rounded border-border bg-background text-primary focus:ring-primary"
              />
              <Label htmlFor="expCurrent" className="text-body-sm font-medium text-foreground cursor-pointer">
                I am currently working in this role
              </Label>
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
                setNewExperience({ title: '', company: '', startDate: '', endDate: '', isCurrent: false, description: '' });
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
      </Dialog >

      {/* Education Modal */}
      < Dialog open={educationModalOpen} onOpenChange={setEducationModalOpen} >
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eduStart" className="text-body-sm font-medium text-foreground mb-2 block">
                  Start Date <span className="text-error">*</span>
                </Label>
                <Input
                  id="eduStart"
                  type="date"
                  value={newEducation.startDate}
                  onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              {!newEducation.isCurrent && (
                <div>
                  <Label htmlFor="eduEnd" className="text-body-sm font-medium text-foreground mb-2 block">
                    End Date
                  </Label>
                  <Input
                    id="eduEnd"
                    type="date"
                    value={newEducation.endDate}
                    onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })}
                    className="bg-background text-foreground border-border"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="eduCurrent"
                checked={newEducation.isCurrent}
                onChange={(e) => setNewEducation({ ...newEducation, isCurrent: e.target.checked })}
                className="rounded border-border bg-background text-primary focus:ring-primary"
              />
              <Label htmlFor="eduCurrent" className="text-body-sm font-medium text-foreground cursor-pointer">
                I am currently studying here
              </Label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setEducationModalOpen(false);
                setNewEducation({ degree: '', institution: '', startDate: '', endDate: '', isCurrent: false });
              }}
              className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEducation}
              disabled={!newEducation.degree?.trim() || !newEducation.institution?.trim() || !newEducation.startDate}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              Add Education
            </Button>
          </div>
        </DialogContent>
      </Dialog >

      {/* Preferred Location Modal */}
      < Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen} >
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
      </Dialog >

      {/* Portfolio Modal */}
      < Dialog open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen} >
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
              <input
                type="file"
                ref={portfolioInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePortfolioImageUpload}
              />
              <div
                onClick={() => portfolioInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer overflow-hidden relative group min-h-[160px] flex flex-col items-center justify-center"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 mx-auto animate-spin" />
                ) : newProject.image ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={newProject.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-body-sm font-medium">Click to change image</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                    <p className="text-body-sm text-foreground">Click to upload image</p>
                    <p className="text-caption text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
              {newProject.image && !uploading && <p className="text-xs text-green-600 mt-1">Image ready</p>}
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
      </Dialog >
    </AppLayout >
  );
};

export default EditProfile;
