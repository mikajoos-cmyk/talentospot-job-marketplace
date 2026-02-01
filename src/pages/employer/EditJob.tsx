import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import RichTextEditor from '../../components/ui/rich-text-editor';
import { useToast } from '../../contexts/ToastContext';
import { locationData } from '../../data/locationData';
import { jobsService } from '../../services/jobs.service';
import { masterDataService } from '../../services/master-data.service';
import { Loader2 } from 'lucide-react';
import { X, Plus, ArrowLeft, Home } from 'lucide-react';
import { Switch } from '../../components/ui/switch';
import { Slider } from '../../components/ui/slider';
import { getLanguageLevelOptions } from '../../utils/language-levels';
import { AutocompleteInput } from '../../components/shared/AutocompleteInput';
import DrivingLicenseSelector from '../../components/shared/DrivingLicenseSelector';

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const [languages, setLanguages] = useState<{ name: string; level: string }[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  const [languageLevel, setLanguageLevel] = useState('B2');
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [qualificationInput, setQualificationInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const job = await jobsService.getJobById(id);
        if (job) {
          setFormData({
            title: job.title || '',
            description: job.description || '',
            salary_min: job.salary_min || 1000,
            salary_max: job.salary_max || 250000,
            salary_currency: job.salary_currency || 'EUR',
            type: job.employment_type || 'full_time',
            entryBonus: job.entry_bonus?.toString() || '',
            contractDuration: job.contract_duration || '',
            location: {
              continent: job.continent || 'Europe',
              country: job.country || '',
              city: job.city || '',
            },
            homeOfficeAvailable: job.home_office_available || false,
            careerLevel: job.career_level || '',
            experienceYears: job.experience_years || 0,
            drivingLicenses: job.driving_licenses || [],
            contractTerms: job.contract_terms || [],
            vacationDays: job.vacation_days?.toString() || '',
          });
          setLanguages(job.required_languages || []);
          setQualifications(job.required_qualifications || []);
          setSkills(job.required_skills || []);
          setBenefits(job.benefits || []);
        }
      } catch (error) {
        console.error('Error fetching job to edit:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleAddLanguage = () => {
    if (languageInput.trim() && !languages.some(l => l.name.toLowerCase() === languageInput.trim().toLowerCase())) {
      setLanguages([...languages, { name: languageInput.trim(), level: languageLevel }]);
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (languageName: string) => {
    setLanguages(languages.filter(l => l.name !== languageName));
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

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddBenefit = () => {
    if (benefitInput.trim() && !benefits.includes(benefitInput.trim())) {
      setBenefits([...benefits, benefitInput.trim()]);
      setBenefitInput('');
    }
  };

  const handleRemoveBenefit = (benefit: string) => {
    setBenefits(benefits.filter(b => b !== benefit));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      showToast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!id) return;

    setIsSaving(true);
    try {
      // Sync benefits to master data for suggestions
      // Don't block saving if this fails due to permissions
      try {
        await masterDataService.syncMasterData('tags', benefits);
      } catch (err) {
        console.warn('Failed to sync benefits to master data:', err);
      }

      await jobsService.updateJob(id, {
        title: formData.title,
        description: formData.description,
        continent: formData.location.continent,
        country: formData.location.country,
        city: formData.location.city,
        employment_type: formData.type,
        salary_min: formData.salary_min,
        salary_max: formData.salary_max,
        salary_currency: formData.salary_currency,
        entry_bonus: formData.entryBonus ? parseInt(formData.entryBonus) : undefined,
        contract_duration: formData.contractDuration,
        required_languages: languages,
        required_qualifications: qualifications,
        required_skills: skills,
        home_office_available: formData.homeOfficeAvailable,
        career_level: formData.careerLevel,
        experience_years: formData.experienceYears,
        driving_licenses: formData.drivingLicenses,
        contract_terms: formData.contractTerms,
        vacation_days: formData.vacationDays ? parseInt(formData.vacationDays) : undefined,
        benefits: benefits,
      });

      showToast({
        title: 'Job Updated',
        description: 'Your job posting has been updated successfully',
      });
      navigate('/employer/jobs');
    } catch (error: any) {
      console.error('Error updating job:', error);
      showToast({
        title: 'Error',
        description: error.message || 'Failed to update job',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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

  if (!formData) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-h2 font-heading text-foreground mb-4">Job Not Found</h2>
          <Button onClick={() => navigate('/employer/jobs')} className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal">
            Back to Jobs
          </Button>
        </div>
      </AppLayout>
    );
  }

  const continents = Object.keys(locationData);
  const countries = formData.location.continent ? Object.keys(locationData[formData.location.continent] || {}) : [];
  const cities = formData.location.country && formData.location.continent
    ? locationData[formData.location.continent]?.[formData.location.country] || []
    : [];

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/employer/jobs')}
            className="bg-transparent text-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Button>
          <div>
            <h1 className="text-h1 font-heading text-foreground mb-2">Edit Job</h1>
            <p className="text-body text-muted-foreground">Update your job posting details.</p>
          </div>
        </div>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-body-sm font-medium text-foreground mb-2 block">
                Job Title <span className="text-error">*</span>
              </Label>
              <AutocompleteInput
                category="job_titles"
                id="title"
                value={formData.title}
                onChange={(val) => setFormData({ ...formData, title: val })}
                placeholder="e.g., Senior Frontend Developer"
                className="bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Location <span className="text-error">*</span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  value={formData.location.continent}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    location: { continent: value, country: '', city: '' }
                  })}
                >
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Continent" />
                  </SelectTrigger>
                  <SelectContent>
                    {continents.map(continent => (
                      <SelectItem key={continent} value={continent}>{continent}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {formData.location.continent && (
                  <Select
                    value={formData.location.country}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      location: { ...formData.location, country: value, city: '' }
                    })}
                  >
                    <SelectTrigger className="bg-background text-foreground border-border">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {formData.location.country && (
                  <Select
                    value={formData.location.city}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      location: { ...formData.location, city: value }
                    })}
                  >
                    <SelectTrigger className="bg-background text-foreground border-border">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-body-sm font-medium text-foreground mb-2 block">
                Job Description <span className="text-error">*</span>
              </Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Describe the role, responsibilities, and requirements..."
                minHeight="250px"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="salary" className="text-body-sm font-medium text-foreground">
                    Salary Range ({formData.salary_currency})
                  </Label>
                  <div className="w-32">
                    <Select
                      value={formData.salary_currency}
                      onValueChange={(value) => setFormData({ ...formData, salary_currency: value })}
                    >
                      <SelectTrigger className="bg-background text-foreground border-border h-8">
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
                <div className="space-y-4">
                  <Slider
                    value={[formData.salary_min, formData.salary_max]}
                    onValueChange={(value: number[]) => setFormData({ ...formData, salary_min: value[0], salary_max: value[1] })}
                    min={1000}
                    max={250000}
                    step={1000}
                  />
                  <div className="flex justify-between text-caption text-muted-foreground">
                    <span>{formData.salary_currency} {formData.salary_min.toLocaleString()}</span>
                    <span>{formData.salary_currency} {formData.salary_max.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-body-sm font-medium text-foreground mb-3 block">
                  Employment Type
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'full_time', label: 'Full Time' },
                    { id: 'part_time', label: 'Part Time' },
                    { id: 'contract', label: 'Contract' },
                    { id: 'freelance', label: 'Freelance' },
                    { id: 'internship', label: 'Internship' },
                    { id: 'remote', label: 'Remote' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      className={`px-4 py-2 rounded-full text-body-sm font-medium transition-all ${formData.type === type.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-body-sm font-medium text-foreground mb-3 block">
                  Contract Terms
                </Label>
                <div className="flex flex-wrap gap-2">
                  {['permanent', 'temporary', 'contract', 'freelance', 'internship'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        const current = formData.contractTerms || [];
                        const updated = current.includes(term)
                          ? current.filter((t: string) => t !== term)
                          : [...current, term];
                        setFormData({ ...formData, contractTerms: updated });
                      }}
                      className={`px-4 py-2 rounded-full text-body-sm font-medium transition-all ${(formData.contractTerms || []).includes(term)
                        ? 'bg-info text-info-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                    >
                      {term.charAt(0).toUpperCase() + term.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="entryBonus" className="text-body-sm font-medium text-foreground mb-2 block">
                  Entry Bonus (€)
                </Label>
                <Input
                  id="entryBonus"
                  type="number"
                  placeholder="e.g., 5000"
                  value={formData.entryBonus}
                  onChange={(e) => setFormData({ ...formData, entryBonus: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="contractDuration" className="text-body-sm font-medium text-foreground mb-2 block">
                  Contract Duration
                </Label>
                <Input
                  id="contractDuration"
                  type="text"
                  placeholder="e.g., Permanent, 12 months"
                  value={formData.contractDuration}
                  onChange={(e) => setFormData({ ...formData, contractDuration: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="careerLevel" className="text-body-sm font-medium text-foreground mb-2 block">
                  Career Level
                </Label>
                <Select value={formData.careerLevel} onValueChange={(value) => setFormData({ ...formData, careerLevel: value })}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid-Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead / Manager</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experienceYears" className="text-body-sm font-medium text-foreground mb-2 block">
                  Experience Years Required
                </Label>
                <Input
                  id="experienceYears"
                  type="number"
                  placeholder="e.g., 3"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                  className="bg-background text-foreground border-border"
                />
              </div>

              <div>
                <Label htmlFor="vacationDays" className="text-body-sm font-medium text-foreground mb-2 block">
                  Vacation Days (per year)
                </Label>
                <Input
                  id="vacationDays"
                  type="number"
                  placeholder="e.g., 25"
                  value={formData.vacationDays}
                  onChange={(e) => setFormData({ ...formData, vacationDays: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Required Languages
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
                    {getLanguageLevelOptions().map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
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
                    <span className="capitalize">{language.name} ({language.level})</span>
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
                Required Qualifications
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
              <Label className="text-body-sm font-medium text-foreground mb-4 block">
                Required Driving Licenses
              </Label>
              <DrivingLicenseSelector
                value={formData.drivingLicenses}
                onChange={(val) => setFormData({ ...formData, drivingLicenses: val })}
              />
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Required Skills
              </Label>
              <div className="flex space-x-2 mb-3">
                <AutocompleteInput
                  category="skills"
                  value={skillInput}
                  onChange={setSkillInput}
                  onKeyPress={(e: any) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add skill..."
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
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center space-x-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-body-sm"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-primary-hover"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Section */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Benefits / Additional Conditions (Tags)
              </Label>
              <p className="text-caption text-muted-foreground mb-2">
                e.g., Gym membership, Free snacks, Pet friendly, Barrier-free
              </p>
              <div className="flex space-x-2 mb-3">
                <AutocompleteInput
                  category="tags"
                  value={benefitInput}
                  onChange={setBenefitInput}
                  onKeyPress={(e: any) => e.key === 'Enter' && handleAddBenefit()}
                  placeholder="Add benefit..."
                  className="flex-1 bg-background text-foreground border-border"
                />
                <Button
                  size="icon"
                  onClick={handleAddBenefit}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center space-x-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-body-sm"
                  >
                    <span>{benefit}</span>
                    <button
                      onClick={() => handleRemoveBenefit(benefit)}
                      className="hover:text-secondary-hover"
                      aria-label={`Remove ${benefit}`}
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Home className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <Label htmlFor="home-office" className="text-body font-medium text-foreground">
                    Home Office Available
                  </Label>
                  <p className="text-caption text-muted-foreground">
                    Enable if this position allows for remote work/home office
                  </p>
                </div>
              </div>
              <Switch
                id="home-office"
                checked={formData.homeOfficeAvailable}
                onCheckedChange={(checked) => setFormData({ ...formData, homeOfficeAvailable: checked })}
              />
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/employer/jobs')}
            disabled={isSaving}
            className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </div >
    </AppLayout >
  );
};

export default EditJob;
