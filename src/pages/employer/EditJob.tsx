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
import { Loader2 } from 'lucide-react';
import { X, Plus, ArrowLeft } from 'lucide-react';

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);

  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [qualificationInput, setQualificationInput] = useState('');

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
            salary: job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max}` : '',
            type: job.employment_type || 'Full-time',
            entryBonus: job.entry_bonus?.toString() || '',
            contractDuration: job.contract_duration || '',
            location: {
              continent: 'Europe', // Default for now
              country: job.country || '',
              city: job.city || '',
            },
          });
          setLanguages(job.required_languages || []);
          setQualifications(job.required_qualifications || []);
        }
      } catch (error) {
        console.error('Error fetching job to edit:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

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

  const handleSave = () => {
    if (!formData.title || !formData.description) {
      showToast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    showToast({
      title: 'Job Updated',
      description: 'Your job posting has been updated successfully',
    });
    navigate('/employer/jobs');
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
              <div>
                <Label htmlFor="salary" className="text-body-sm font-medium text-foreground mb-2 block">
                  Salary Range
                </Label>
                <Input
                  id="salary"
                  type="text"
                  placeholder="e.g., $80k - $120k"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="bg-background text-foreground border-border"
                />
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
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
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
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/employer/jobs')}
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
    </AppLayout>
  );
};

export default EditJob;
