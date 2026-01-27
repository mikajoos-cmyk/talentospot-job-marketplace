import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import RichTextEditor from '../../components/ui/rich-text-editor';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { jobsService } from '../../services/jobs.service';
import { locationData } from '../../data/locationData';
import { X, Plus, ArrowLeft, Loader2, Home } from 'lucide-react';
import { Switch } from '../../components/ui/switch';
import { Slider } from '../../components/ui/slider';

const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
    salary_min: 1000,
    salary_max: 250000,
    salary_currency: 'EUR',
    type: 'full_time',
    entryBonus: '',
    contractDuration: '',
    location: {
      continent: '',
      country: '',
      city: '',
    },
    homeOfficeAvailable: false,
  });

  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [qualificationInput, setQualificationInput] = useState('');

  const continents = Object.keys(locationData);
  const countries = formData.location.continent ? Object.keys(locationData[formData.location.continent] || {}) : [];
  const cities = formData.location.country && formData.location.continent
    ? locationData[formData.location.continent]?.[formData.location.country] || []
    : [];

  const handleAddLanguage = () => {
    if (languageInput.trim() && !languages.includes(languageInput.trim())) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (language: string) => {
    setLanguages(languages.filter(l => l !== language));
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

  const saveJob = async (status: 'draft' | 'active') => {
    if (!formData.title || !formData.description) {
      showToast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      showToast({
        title: 'Error',
        description: 'You must be logged in to post a job',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {

      await jobsService.createJob({
        employer_id: user.id,
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
        home_office_available: formData.homeOfficeAvailable,
        status: status,
      });

      showToast({
        title: status === 'active' ? 'Job Published' : 'Draft Saved',
        description: status === 'active' ? 'Your job posting is now live' : 'Your job posting has been saved as a draft',
      });
      navigate('/employer/jobs');
    } catch (error: any) {
      console.error('Error saving job:', error);
      showToast({
        title: 'Error',
        description: error.message || 'Failed to save job',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = () => {
    saveJob('draft');
  };

  const handlePublish = () => {
    saveJob('active');
  };

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
            <h1 className="text-h1 font-heading text-foreground mb-2">Post a Job</h1>
            <p className="text-body text-muted-foreground">Create a new job posting to attract top talent.</p>
          </div>
        </div>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-body-sm font-medium text-foreground mb-2 block">
                Job Title <span className="text-error">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Senior Frontend Developer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    onValueChange={(value) => setFormData({ ...formData, salary_min: value[0], salary_max: value[1] })}
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
                <Label htmlFor="type" className="text-body-sm font-medium text-foreground mb-2 block">
                  Employment Type
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
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

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Required Languages
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
                Required Qualifications
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
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Draft
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Publish Job
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default PostJob;
