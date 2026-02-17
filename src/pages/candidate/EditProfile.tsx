import React, { useState, useRef, useEffect } from 'react';
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
import { ArrowLeft, Upload, X, Plus, Trash2, Image as ImageIcon, Briefcase, GraduationCap, MapPin, Video, Car, Plane, Loader2, Globe, Edit2, Award } from 'lucide-react';
import { ProjectImageCarousel } from '../../components/shared/ProjectImageCarousel';
import { Switch } from '../../components/ui/switch';
import { masterDataService } from '../../services/master-data.service';
import { AutocompleteInput } from '../../components/shared/AutocompleteInput';
import { LocationPicker } from '../../components/shared/LocationPicker';
import ImageCropModal from '../../components/shared/ImageCropModal';
import { findContinent } from '../../utils/locationUtils';
import DrivingLicenseSelector from '../../components/shared/DrivingLicenseSelector';
import { formatLanguageLevel } from '../../utils/language-levels';
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
  images: string[];
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
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Refs for Datei-Uploads
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const awardImageInputRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState('');
  const [allCountries, setAllCountries] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countries = await masterDataService.getCountries();
        setAllCountries(countries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);

  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>(null);


  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const profile = await candidateService.getCandidateProfile(user.id);
        if (profile) {
          const nameParts = (user.name || '').trim().split(/\s+/);
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          setFormData({
            firstName,
            lastName,
            email: user.email,
            phone: profile.phone || '',
            dateOfBirth: profile.dateOfBirth || '',
            nationality: profile.nationality || '',
            gender: profile.gender || '',
            address: profile.address || '',
            street: profile.street || '',
            houseNumber: profile.houseNumber || '',
            postalCode: profile.postalCode || '',
            state: profile.state || '',
            latitude: profile.latitude || 0,
            longitude: profile.longitude || 0,
            country: profile.country || '',
            city: profile.city || '',
            tags: profile.tags || [],
            cvUrl: profile.cvUrl || '',
            location: profile.location || '',
            videoUrl: profile.videoUrl || '',
            avatar: profile.avatar || '',
            title: profile.title || '',
            sector: profile.sector === 'Technology' ? 'IT' : (profile.sector || ''),
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
            homeOfficePreference: (!profile.conditions.homeOfficePreference || profile.conditions.homeOfficePreference === 'none') ? 'no' : (profile.conditions.homeOfficePreference === 'full' ? 'yes' : profile.conditions.homeOfficePreference),
            description: profile.description || '',
            availableFrom: profile.availableFrom || '',
            currency: profile.currency || 'EUR',
            isRefugee: profile.isRefugee || false,
            originCountry: profile.originCountry || '',
            contractTermPreference: (profile.contractTermPreference || []).map((t: string) => t === 'permanent' ? 'permanent' : t),
            yearsOfExperience: profile.yearsOfExperience || 0,
            nationalityCode: profile.nationalityCode || '',
          });
          setExperience(profile.experience || []);
          setEducation(profile.education || []);
          setSkills(profile.skills || []);
          setQualifications(profile.qualifications || []);
          setRequirements(profile.requirements || []);
          setLanguages(profile.languages || []);
          setDrivingLicenses(profile.drivingLicenses || []);
          setAwards(profile.awards || []);

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
              images: p.images || (p.image ? [p.image] : [])
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
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
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
    description: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [qualificationInput, setQualificationInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [languages, setLanguages] = useState<{ name: string; level: string }[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  const [languageLevel, setLanguageLevel] = useState('B2');
  const [drivingLicenses, setDrivingLicenses] = useState<string[]>([]);

  // Awards state
  const [awards, setAwards] = useState<any[]>([]);
  const [awardsModalOpen, setAwardsModalOpen] = useState(false);
  const [editingAwardId, setEditingAwardId] = useState<string | null>(null);
  const [newAward, setNewAward] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    description: '',
    certificateImage: '',
  });

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
    images: [] as string[],
  });



  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input value so the same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user?.id) {
      showToast({ title: 'Error', description: 'User session not found. Please log in again.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const file = new File([croppedBlob], 'avatar.png', { type: 'image/png' });
      
      // Update preview immediately
      const previewUrl = URL.createObjectURL(croppedBlob);
      setAvatarPreview(previewUrl);

      const publicUrl = await storageService.uploadAvatar(user.id, file);
      
      setFormData((prev: any) => ({ ...prev, avatar: publicUrl }));
      showToast({ title: 'Upload Success', description: 'Profile picture uploaded' });
    } catch (error) {
      console.error('Avatar upload failed:', error);
      showToast({ title: 'Upload Failed', description: 'Could not upload image', variant: 'destructive' });
    } finally {
      setUploading(false);
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
      setNewProject({ ...newProject, images: [...newProject.images, publicUrl] });
      showToast({ title: 'Upload Success', description: 'Project image added' });
    } catch (error) {
      showToast({ title: 'Error', description: 'Image upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user?.id) return;
    const file = files[0];

    setUploading(true);
    try {
      const publicUrl = await storageService.uploadCV(user.id, file);
      setFormData((prev: any) => ({ ...prev, cvUrl: publicUrl }));
      showToast({ title: 'Success', description: 'CV uploaded successfully' });
    } catch (error) {
      console.error('CV upload failed:', error);
      showToast({ title: 'Error', description: 'CV upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t: string) => t !== tag)
    });
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
      id: editingExperienceId || Date.now().toString(),
      title: newExperience.title,
      company: newExperience.company,
      startDate: newExperience.startDate,
      endDate: newExperience.isCurrent ? null : newExperience.endDate,
      isCurrent: newExperience.isCurrent,
      period: `${newExperience.startDate} - ${newExperience.isCurrent ? 'Present' : (newExperience.endDate || 'Present')}`,
      description: newExperience.description,
    };

    if (editingExperienceId) {
      setExperience(experience.map(e => e.id === editingExperienceId ? exp : e));
    } else {
      setExperience([...experience, exp]);
    }

    setNewExperience({ title: '', company: '', startDate: '', endDate: '', isCurrent: false, description: '' });
    setEditingExperienceId(null);
    setExperienceModalOpen(false);
    showToast({
      title: editingExperienceId ? 'Experience Updated' : 'Experience Added',
      description: `Work experience has been ${editingExperienceId ? 'updated' : 'added'} successfully`,
    });
  };

  const handleEditExperience = (exp: any) => {
    setNewExperience({
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate || '',
      isCurrent: exp.isCurrent || false,
      description: exp.description || '',
    });
    setEditingExperienceId(exp.id);
    setExperienceModalOpen(true);
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
      id: editingEducationId || Date.now().toString(),
      degree: newEducation.degree,
      institution: newEducation.institution,
      startDate: newEducation.startDate,
      endDate: newEducation.isCurrent ? null : newEducation.endDate,
      description: newEducation.description || '',
      period: `${newEducation.startDate} - ${newEducation.isCurrent ? 'Present' : (newEducation.endDate || 'Present')}`,
    };

    if (editingEducationId) {
      setEducation(education.map(e => e.id === editingEducationId ? edu : e));
    } else {
      setEducation([...education, edu]);
    }

    setNewEducation({ degree: '', institution: '', startDate: '', endDate: '', isCurrent: false, description: '' });
    setEditingEducationId(null);
    setEducationModalOpen(false);
    showToast({
      title: editingEducationId ? 'Education Updated' : 'Education Added',
      description: `Education has been ${editingEducationId ? 'updated' : 'added'} successfully`,
    });
  };

  const handleEditEducation = (edu: any) => {
    setNewEducation({
      degree: edu.degree,
      institution: edu.institution,
      startDate: edu.startDate,
      endDate: edu.endDate || '',
      isCurrent: !edu.endDate,
      description: edu.description || '',
    });
    setEditingEducationId(edu.id);
    setEducationModalOpen(true);
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

  const handleAddRequirement = () => {
    if (requirementInput.trim() && !requirements.includes(requirementInput.trim())) {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (requirement: string) => {
    setRequirements(requirements.filter(r => r !== requirement));
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



  const handleAddLocation = () => {


    const location: PreferredLocation = {
      id: Date.now().toString(),
      continent: findContinent(newLocation.country),
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
      id: editingProjectId || Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      images: newProject.images,
    };

    if (editingProjectId) {
      setPortfolioProjects(portfolioProjects.map(p => p.id === editingProjectId ? project : p));
    } else {
      setPortfolioProjects([...portfolioProjects, project]);
    }

    setNewProject({ title: '', description: '', images: [] });
    setEditingProjectId(null);
    setPortfolioModalOpen(false);
    showToast({
      title: editingProjectId ? 'Project Updated' : 'Project Added',
      description: `Your portfolio project has been ${editingProjectId ? 'updated' : 'added'} successfully`,
    });
  };

  const handleEditProject = (project: PortfolioProject) => {
    setNewProject({
      title: project.title,
      description: project.description,
      images: project.images || [],
    });
    setEditingProjectId(project.id);
    setPortfolioModalOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    setPortfolioProjects(portfolioProjects.filter(p => p.id !== projectId));
    showToast({
      title: 'Project Deleted',
      description: 'Portfolio project has been removed',
    });
  };

  const handleAwardImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user?.id) return;
    const file = event.target.files[0];
    setUploading(true);
    try {
      const publicUrl = await storageService.uploadPortfolioImage(user.id, file);
      setNewAward({ ...newAward, certificateImage: publicUrl });
      showToast({ title: 'Upload Success', description: 'Certificate image uploaded' });
    } catch (error) {
      showToast({ title: 'Error', description: 'Image upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleAddAward = () => {
    if (!newAward.title.trim() || !newAward.year.trim()) {
      showToast({
        title: 'Error',
        description: 'Please fill in all required fields (Title and Year)',
        variant: 'destructive',
      });
      return;
    }

    const award = {
      id: editingAwardId || Date.now().toString(),
      title: newAward.title,
      year: newAward.year,
      description: newAward.description,
      certificateImage: newAward.certificateImage,
    };

    if (editingAwardId) {
      setAwards(awards.map(a => a.id === editingAwardId ? award : a));
    } else {
      setAwards([...awards, award]);
    }

    setNewAward({ title: '', year: new Date().getFullYear().toString(), description: '', certificateImage: '' });
    setEditingAwardId(null);
    setAwardsModalOpen(false);
    showToast({
      title: editingAwardId ? 'Award Updated' : 'Award Added',
      description: `Award has been ${editingAwardId ? 'updated' : 'added'} successfully`,
    });
  };

  const handleEditAward = (award: any) => {
    setNewAward({
      title: award.title,
      year: award.year,
      description: award.description || '',
      certificateImage: award.certificateImage || '',
    });
    setEditingAwardId(award.id);
    setAwardsModalOpen(true);
  };

  const handleDeleteAward = (awardId: string) => {
    setAwards(awards.filter(a => a.id !== awardId));
    showToast({
      title: 'Award Deleted',
      description: 'Award has been removed',
    });
  };

  const handleSave = async () => {
    try {
      if (!user?.id) return;
      setLoading(true);

      const updates = {
        // --- Basisdaten ---
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,

        // --- DB Felder (mapped) ---
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        address: formData.address,
        street: formData.street,
        house_number: formData.houseNumber,
        postal_code: formData.postalCode,
        state: formData.state,
        city: formData.city,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
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
        cv_url: formData.cvUrl,
        description: formData.description,
        currency: formData.currency,
        tags: formData.tags,

        // --- Arrays & Listen ---
        jobTypes: formData.jobTypes,
        drivingLicenses: drivingLicenses,
        skills: skills,
        experience: experience,
        education: education,
        qualifications: qualifications,
        requirements: requirements,
        languages: languages.map(l => ({ name: l.name, proficiency_level: l.level })),
        preferredLocations: preferredLocations,

        // Portfolio Bilder (Speichert nun das ganze Objekt)
        portfolioImages: portfolioProjects.map(p => ({
          images: p.images,
          title: p.title,
          description: p.description
        })),
        awards: awards,
        isRefugee: formData.isRefugee,
        originCountry: formData.isRefugee ? formData.originCountry : null,
        contractTermPreference: formData.contractTermPreference,
        yearsOfExperience: formData.yearsOfExperience,
        nationalityCode: formData.nationalityCode
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
                <Label htmlFor="firstName" className="text-body-sm font-medium text-foreground mb-2 block">
                  First Name <span className="text-error">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="bg-background text-foreground border-border"
                  placeholder="e.g., John"
                />
              </div>

              <div>
                <Label htmlFor="lastName" className="text-body-sm font-medium text-foreground mb-2 block">
                  Last Name <span className="text-error">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="bg-background text-foreground border-border"
                  placeholder="e.g., Doe"
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
                <AutocompleteInput
                  category="nationalities"
                  id="nationality"
                  placeholder="e.g., German"
                  value={formData.nationality}
                  onChange={(val) => setFormData({ ...formData, nationality: val })}
                  onSelect={(suggestion: any) => {
                    // Map nationality to country code for flag display
                    const nationalityToCode: Record<string, string> = {
                      'German': 'DE', 'French': 'FR', 'Spanish': 'ES', 'Italian': 'IT',
                      'British': 'GB', 'English': 'GB', 'Dutch': 'NL', 'Austrian': 'AT',
                      'Swiss': 'CH', 'Belgian': 'BE', 'Polish': 'PL', 'Portuguese': 'PT',
                      'Greek': 'GR', 'Swedish': 'SE', 'Norwegian': 'NO', 'Danish': 'DK',
                      'Finnish': 'FI', 'Irish': 'IE', 'Czech': 'CZ', 'Hungarian': 'HU',
                      'Romanian': 'RO', 'Bulgarian': 'BG', 'Croatian': 'HR', 'Slovak': 'SK',
                      'Slovenian': 'SI', 'American': 'US', 'Canadian': 'CA', 'Mexican': 'MX',
                      'Brazilian': 'BR', 'Argentine': 'AR', 'Argentinian': 'AR',
                      'Chinese': 'CN', 'Japanese': 'JP', 'Korean': 'KR', 'Indian': 'IN',
                      'Turkish': 'TR', 'Russian': 'RU', 'Ukrainian': 'UA', 'Syrian': 'SY',
                      'Afghan': 'AF', 'Iraqi': 'IQ', 'Iranian': 'IR', 'Lebanese': 'LB',
                      'Egyptian': 'EG', 'Moroccan': 'MA', 'Algerian': 'DZ', 'Tunisian': 'TN',
                      'Nigerian': 'NG', 'South African': 'ZA', 'Australian': 'AU', 'New Zealander': 'NZ'
                    };
                    const code = nationalityToCode[suggestion.name] || '';
                    setFormData({ ...formData, nationality: suggestion.name, nationalityCode: code });
                  }}
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



              <div className="md:col-span-2 space-y-2">
                <LocationPicker
                  value={{
                    city: formData.city,
                    street: formData.street,
                    houseNumber: formData.houseNumber,
                    country: formData.country,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    lat: formData.latitude,
                    lon: formData.longitude
                  }}
                  onChange={(val) => setFormData({
                    ...formData,
                    city: val.city,
                    street: val.street || '',
                    houseNumber: val.houseNumber || '',
                    country: val.country,
                    state: val.state,
                    postalCode: val.postalCode,
                    latitude: val.lat,
                    longitude: val.lon
                  })}
                />
              </div>

              <div className="md:col-span-2 space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-body font-medium text-foreground">
                      Refugee / Immigrant Status
                    </Label>
                    <p className="text-caption text-muted-foreground">
                      Indicate if you have a refugee or immigrant background
                    </p>
                  </div>
                  <Switch
                    checked={formData.isRefugee}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRefugee: checked })}
                  />
                </div>

                {formData.isRefugee && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="originCountry" className="text-body-sm font-medium text-foreground mb-2 block">
                      <Globe className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                      Origin Country
                    </Label>
                    <Select
                      value={formData.originCountry}
                      onValueChange={(value) => setFormData({ ...formData, originCountry: value })}
                    >
                      <SelectTrigger className="bg-background text-foreground border-border">
                        <SelectValue placeholder="Select country of origin" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCountries.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 pt-4 border-t border-border mt-4">
                <Label className="text-body-sm font-medium text-foreground mb-4 block">
                  <Car className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                  Driving Licenses
                </Label>
                <DrivingLicenseSelector
                  value={drivingLicenses}
                  onChange={setDrivingLicenses}
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

            <div className="pt-4 border-t border-border">
              <Label className="text-body-sm font-medium text-foreground mb-4 block">
                Attachments
              </Label>
              <div className="flex items-center space-x-6">
                <div className="flex-1 p-4 border-2 border-dashed border-border rounded-lg bg-muted/50">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    {formData.cvUrl ? (
                      <div className="flex items-center space-x-2 text-primary">
                        <Plus className="w-5 h-5" />
                        <span className="text-body-sm font-medium">CV already uploaded</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-body-sm text-muted-foreground font-medium">No CV uploaded yet</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={cvInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCVUpload}
                    />
                    <Button
                      variant="outline"
                      onClick={() => cvInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-background text-foreground border-border hover:bg-muted font-normal mt-2"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" strokeWidth={1.5} />}
                      {formData.cvUrl ? 'Update CV' : 'Upload CV'}
                    </Button>
                  </div>
                </div>
                <div className="w-1/3">
                  <p className="text-caption text-muted-foreground">
                    Upload your latest Curriculum Vitae (CV).
                    Accepted formats: PDF, DOC, DOCX. Max size: 10MB.
                  </p>
                </div>
              </div>
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
                <AutocompleteInput
                  category="job_titles"
                  id="title"
                  value={formData.title}
                  onChange={(val) => setFormData({ ...formData, title: val })}
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
                <AutocompleteInput
                  category="sectors"
                  value={formData.sector}
                  onChange={(value) => setFormData({ ...formData, sector: value })}
                  placeholder="Search sector..."
                  className="bg-background text-foreground border-border"
                />
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
                <Label htmlFor="yearsOfExperience" className="text-body-sm font-medium text-foreground mb-2 block">
                  Professional Experience (Years)
                </Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[formData.yearsOfExperience]}
                    onValueChange={(value) => setFormData({ ...formData, yearsOfExperience: value[0] })}
                    min={0}
                    max={50}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-body-sm font-medium w-12 text-center">{formData.yearsOfExperience}y</span>
                </div>
              </div>

              <div>
                <Label htmlFor="noticePeriod" className="text-body-sm font-medium text-foreground mb-2 block">
                  Notice Period
                </Label>
                <Select value={formData.noticePeriod} onValueChange={(value) => setFormData({ ...formData, noticePeriod: value })}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select notice period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="1-week">1 Week</SelectItem>
                    <SelectItem value="2-weeks">2 Weeks</SelectItem>
                    <SelectItem value="1-month">1 Month</SelectItem>
                    <SelectItem value="2-months">2 Months</SelectItem>
                    <SelectItem value="3-months">3 Months</SelectItem>
                    <SelectItem value="6-months">6 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label className="text-body-sm font-medium text-foreground mb-2 block">
                  Qualifications
                </Label>
                <div className="flex space-x-2 mb-3">
                  <AutocompleteInput
                    category="qualifications"
                    value={qualificationInput}
                    onChange={setQualificationInput}
                    onKeyPress={(e: any) => e.key === 'Enter' && handleAddQualification()}
                    placeholder="Add qualification..."
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
                      className="flex items-center space-x-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-body-sm"
                    >
                      <span>{qualification}</span>
                      <button
                        onClick={() => handleRemoveQualification(qualification)}
                        className="hover:text-primary-foreground/80 transition-colors"
                        aria-label={`Remove ${qualification}`}
                      >
                        <X className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
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
                    <SelectItem value="Unemployed">Unemployed</SelectItem>
                    <SelectItem value="Employed">Employed</SelectItem>
                    <SelectItem value="Trainee">Trainee</SelectItem>
                    <SelectItem value="Apprentice">Apprentice</SelectItem>
                    <SelectItem value="Pupil">Pupil</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Civil Servant">Civil Servant</SelectItem>
                    <SelectItem value="Freelancer">Freelancer</SelectItem>
                    <SelectItem value="Entrepreneur">Entrepreneur</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Skills
              </Label>
              <div className="flex space-x-2 mb-4">
                <AutocompleteInput
                  category="skills"
                  value={skillInput}
                  onChange={setSkillInput}
                  onKeyPress={(e: any) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add skill name..."
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

          </div>
          {/* End of Professionals Grid */}

          <div>
            <Label className="text-body-sm font-medium text-foreground mb-2 block">
              Additional Abilities
            </Label>
            <div className="flex space-x-2 mb-3">
              <AutocompleteInput
                category="requirements"
                value={requirementInput}
                onChange={setRequirementInput}
                onKeyPress={(e: any) => e.key === 'Enter' && handleAddRequirement()}
                placeholder="Add additional ability..."
                className="flex-1 bg-background text-foreground border-border"
              />
              <Button
                size="icon"
                onClick={handleAddRequirement}
                className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
              >
                <Plus className="w-5 h-5" strokeWidth={2} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {requirements.map((requirement) => (
                <div
                  key={requirement}
                  className="flex items-center space-x-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-body-sm"
                >
                  <span>{requirement}</span>
                  <button
                    onClick={() => handleRemoveRequirement(requirement)}
                    className="hover:text-secondary-foreground/80 transition-colors"
                    aria-label={`Remove ${requirement}`}
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
              <AutocompleteInput
                category="languages"
                value={languageInput}
                onChange={setLanguageInput}
                onKeyPress={(e: any) => e.key === 'Enter' && handleAddLanguage()}
                placeholder="Add language..."
                className="flex-1 bg-background text-foreground border-border"
              />
              <Select value={languageLevel} onValueChange={setLanguageLevel}>
                <SelectTrigger className="w-full sm:w-[150px] bg-background text-foreground border-border">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1 (Beginner)</SelectItem>
                  <SelectItem value="A2">A2 (Elementary)</SelectItem>
                  <SelectItem value="B1">B1 (Intermediate)</SelectItem>
                  <SelectItem value="B2">B2 (Upper Intermediate)</SelectItem>
                  <SelectItem value="C1">C1 (Advanced)</SelectItem>
                  <SelectItem value="C2">C2 (Proficient)</SelectItem>
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
                  className="flex items-center space-x-1 px-3 py-1 bg-info text-info-foreground rounded-full text-body-sm"
                >
                  <span className="capitalize">{language.name} ({formatLanguageLevel(language.level)})</span>
                  <button
                    onClick={() => handleRemoveLanguage(language.name)}
                    className="hover:text-info-foreground/80 transition-colors"
                    aria-label={`Remove ${language.name}`}
                  >
                    <X className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              ))}
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
                {['full-time', 'part-time', 'apprenticeship', 'internship', 'traineeship', 'freelance', 'contract'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleJobTypeToggle(type)}
                    className={`px-4 py-2 rounded-full text-body-sm font-medium transition-all ${formData.jobTypes.includes(type)
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
                    <SelectItem value="no">No Home Office</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="yes">Full Remote (Yes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Additional Tags (e.g., "Handicap accessible", "Pets allowed")
                <span className="ml-2 text-[10px] text-muted-foreground font-normal italic">
                  (These help employers find specific accommodations or traits)
                </span>
              </Label>
              <div className="flex space-x-2 mb-3">
                <AutocompleteInput
                  category="tags"
                  value={tagInput}
                  onChange={setTagInput}
                  onKeyPress={(e: any) => e.key === 'Enter' && handleAddTag()}
                  placeholder="e.g. Barrier-free, Fitness studio..."
                  className="flex-1 bg-background text-foreground border-border"
                />
                <Button
                  size="icon"
                  onClick={handleAddTag}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag: string) => (
                  <div
                    key={tag}
                    className="flex items-center space-x-1 px-3 py-1 bg-muted text-foreground rounded-full text-body-sm border border-border"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-foreground/80"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Preferred Contract Terms
              </Label>
              <div className="flex flex-wrap gap-3">
                {['permanent', 'temporary'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      const current = formData.contractTermPreference || [];
                      const updated = current.includes(term)
                        ? current.filter((t: string) => t !== term)
                        : [...current, term];
                      setFormData({ ...formData, contractTermPreference: updated });
                    }}
                    className={`px-4 py-2 rounded-full text-body-sm font-medium transition-all ${(formData.contractTermPreference || []).includes(term)
                      ? 'bg-info text-info-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                  >
                    {term.charAt(0).toUpperCase() + term.slice(1)}
                  </button>
                ))}
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

        {/* Education */}
        <Card className="p-6 md:p-8 border border-border bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h3 font-heading text-foreground">Education</h3>
            <Button
              onClick={() => {
                setEditingEducationId(null);
                setNewEducation({ degree: '', institution: '', startDate: '', endDate: '', isCurrent: false, description: '' });
                setEducationModalOpen(true);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              <Plus className="w-5 h-5 mr-2" strokeWidth={2} />
              Add Education
            </Button>
          </div>

          {
            education.length === 0 ? (
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
                        <p className="text-body-sm text-muted-foreground mb-2">{edu.institution} • {edu.period}</p>
                        {edu.description && (
                          <p className="text-body-sm text-foreground">{edu.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditEducation(edu)}
                          variant="ghost"
                          size="icon"
                          className="bg-transparent text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <GraduationCap className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteEducation(edu.id)}
                          variant="ghost"
                          size="icon"
                          className="bg-transparent text-error hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          }
        </Card >

        {/* Work Experience */}
        < Card className="p-6 md:p-8 border border-border bg-card" >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h3 font-heading text-foreground">Work Experience</h3>
            <Button
              onClick={() => {
                setEditingExperienceId(null);
                setNewExperience({ title: '', company: '', startDate: '', endDate: '', isCurrent: false, description: '' });
                setExperienceModalOpen(true);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              <Plus className="w-5 h-5 mr-2" strokeWidth={2} />
              Add Experience
            </Button>
          </div>

          {
            experience.length === 0 ? (
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
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditExperience(exp)}
                          variant="ghost"
                          size="icon"
                          className="bg-transparent text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <Briefcase className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteExperience(exp.id)}
                          variant="ghost"
                          size="icon"
                          className="bg-transparent text-error hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          }
        </Card >

        {/* Awards & Achievements */}
        < Card className="p-6 md:p-8 border border-border bg-card" >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h3 font-heading text-foreground">Awards & Achievements</h3>
            <Button
              onClick={() => {
                setEditingAwardId(null);
                setNewAward({ title: '', year: new Date().getFullYear().toString(), description: '', certificateImage: '' });
                setAwardsModalOpen(true);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              <Plus className="w-5 h-5 mr-2" strokeWidth={2} />
              Add Award
            </Button>
          </div>

          {
            awards.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-body text-muted-foreground mb-4">No awards added yet</p>
                <Button
                  onClick={() => setAwardsModalOpen(true)}
                  variant="outline"
                  className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                >
                  Add Your First Award
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {awards.map((award) => (
                  <Card key={award.id} className="p-4 border border-border bg-background">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 flex gap-4">
                        {award.certificateImage && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden border border-border shrink-0">
                            <img src={award.certificateImage} alt={award.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-h4 font-heading text-foreground mb-1">{award.title}</h4>
                          <p className="text-body-sm text-muted-foreground mb-2">{award.year}</p>
                          {award.description && (
                            <p className="text-body-sm text-foreground">{award.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditAward(award)}
                          variant="ghost"
                          size="icon"
                          className="bg-transparent text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <Award className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteAward(award.id)}
                          variant="ghost"
                          size="icon"
                          className="bg-transparent text-error hover:bg-error/10 hover:text-error"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          }
        </Card >

        {/* Portfolio */}
        < Card className="p-6 md:p-8 border border-border bg-card" >
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

          {
            portfolioProjects.length === 0 ? (
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
                  <Card key={project.id} className="overflow-hidden border border-border bg-background hover:shadow-lg transition-all duration-normal group">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {project.images && project.images.length > 0 ? (
                        <ProjectImageCarousel images={project.images} title={project.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="text-h4 font-heading text-foreground mb-2">{project.title}</h4>
                      <p className="text-body-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditProject(project)}
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent text-primary border-primary hover:bg-primary hover:text-primary-foreground font-normal"
                        >
                          <Edit2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteProject(project.id)}
                          variant="outline"
                          size="sm"
                          className="bg-transparent text-error border-error hover:bg-error hover:text-error-foreground font-normal px-3"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          }
        </Card >

        {/* Action Buttons */}
        < div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4" >
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
        </div >
      </div >

      {/* Experience Modal */}
      < Dialog open={experienceModalOpen} onOpenChange={setExperienceModalOpen} >
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">{editingExperienceId ? 'Update Work Experience' : 'Add Work Experience'}</DialogTitle>
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
                setEditingExperienceId(null);
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
              {editingExperienceId ? 'Update Experience' : 'Add Experience'}
            </Button>
          </div>
        </DialogContent>
      </Dialog >

      {/* Education Modal */}
      < Dialog open={educationModalOpen} onOpenChange={setEducationModalOpen} >
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">{editingEducationId ? 'Update Education' : 'Add Education'}</DialogTitle>
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

            <div>
              <Label htmlFor="eduDescription" className="text-body-sm font-medium text-foreground mb-2 block">
                Description
              </Label>
              <textarea
                id="eduDescription"
                placeholder="Describe your studies, main subjects, or achievements..."
                value={newEducation.description}
                onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                className="w-full min-h-[120px] px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setEducationModalOpen(false);
                setEditingEducationId(null);
                setNewEducation({ degree: '', institution: '', startDate: '', endDate: '', isCurrent: false, description: '' });
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
              {editingEducationId ? 'Update Education' : 'Add Education'}
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
            <LocationPicker
              mode="city"
              value={{
                city: newLocation.city,
                country: newLocation.country,
              }}
              onChange={(val) => setNewLocation({
                ...newLocation,
                city: val.city,
                country: val.country
              })}
            />
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
              disabled={!newLocation.country || !newLocation.city}
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
            <DialogTitle className="text-h3 font-heading text-foreground">
              {editingProjectId ? 'Update Portfolio Project' : 'Add Portfolio Project'}
            </DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              {editingProjectId ? 'Modify your project details and images' : 'Showcase your work and achievements'}
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
                Project Images
              </Label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {newProject.images.map((img, idx) => (
                  <div key={idx} className="aspect-video rounded-lg overflow-hidden relative group border border-border">
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setNewProject({ ...newProject, images: newProject.images.filter((_, i) => i !== idx) })}
                      className="absolute top-1 right-1 p-1 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => portfolioInputRef.current?.click()}
                  className="aspect-video border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-caption text-muted-foreground">Add Image</span>
                    </>
                  )}
                </button>
              </div>

              <input
                type="file"
                ref={portfolioInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePortfolioImageUpload}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setPortfolioModalOpen(false);
                setEditingProjectId(null);
                setNewProject({ title: '', description: '', images: [] });
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
              {editingProjectId ? 'Update Project' : 'Save Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog >

      {/* Awards Modal */}
      < Dialog open={awardsModalOpen} onOpenChange={setAwardsModalOpen} >
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">
              {editingAwardId ? 'Update Award' : 'Add Award'}
            </DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              {editingAwardId ? 'Modify your award details' : 'Add an award or achievement to your profile'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="awardTitle" className="text-body-sm font-medium text-foreground mb-2 block">
                Award Title <span className="text-error">*</span>
              </Label>
              <Input
                id="awardTitle"
                type="text"
                placeholder="e.g., Employee of the Year"
                value={newAward.title}
                onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="awardYear" className="text-body-sm font-medium text-foreground mb-2 block">
                Year <span className="text-error">*</span>
              </Label>
              <Input
                id="awardYear"
                type="text"
                placeholder="e.g., 2023"
                value={newAward.year}
                onChange={(e) => setNewAward({ ...newAward, year: e.target.value })}
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="awardDescription" className="text-body-sm font-medium text-foreground mb-2 block">
                Description
              </Label>
              <textarea
                id="awardDescription"
                placeholder="Describe the award and why you received it..."
                value={newAward.description}
                onChange={(e) => setNewAward({ ...newAward, description: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Certificate Image
              </Label>

              {newAward.certificateImage ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border mb-4">
                  <img src={newAward.certificateImage} alt="Certificate preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setNewAward({ ...newAward, certificateImage: '' })}
                    className="absolute top-2 right-2 p-2 bg-error text-white rounded-full hover:bg-error/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => awardImageInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-body-sm text-muted-foreground">Click to upload certificate image</span>
                      <span className="text-caption text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                    </>
                  )}
                </button>
              )}

              <input
                type="file"
                ref={awardImageInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAwardImageUpload}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setAwardsModalOpen(false);
                setEditingAwardId(null);
                setNewAward({ title: '', year: new Date().getFullYear().toString(), description: '', certificateImage: '' });
              }}
              className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAward}
              disabled={!newAward.title.trim() || !newAward.year.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              {editingAwardId ? 'Update Award' : 'Save Award'}
            </Button>
          </div>
        </DialogContent>
      </Dialog >

      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        imageSrc={selectedImage || ''}
        onCropComplete={handleCropComplete}
        aspect={1}
      />
    </AppLayout >
  );
};

export default EditProfile;
