import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { X, Plus, ChevronDown, User, Briefcase, Sparkles, MapPin } from 'lucide-react';
import { CandidateFilters as CandidateFiltersType } from '@/types/candidate';
import { refugeeOriginCountries } from '@/data/locationData';
import { getLanguageLevelOptions } from '@/utils/language-levels';
import { AutocompleteInput } from '@/components/shared/AutocompleteInput';
import DrivingLicenseSelector from '@/components/shared/DrivingLicenseSelector';
import { LocationPicker } from '../../components/shared/LocationPicker';
import { findContinent } from '../../utils/locationUtils';
import MapView from '../maps/MapView';

// Client-side only wrapper
const MapLoader: React.FC<{ center: [number, number]; radius: number }> = ({ center, radius }) => {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => { setIsClient(true); }, []);
  if (!isClient) return null;
  return (
    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="rounded-lg overflow-hidden border border-primary/20 shadow-sm">
        <MapView
          center={center}
          radius={radius}
          showRadius={true}
          zoom={radius > 100 ? 7 : 9}
          height="180px"
        />
      </div>
    </div>
  );
};

interface CandidateFiltersProps {
  filters: CandidateFiltersType;
  onFiltersChange: (filters: CandidateFiltersType) => void;
  mapCenter?: [number, number];
}

const CandidateFilters: React.FC<CandidateFiltersProps> = ({ filters, onFiltersChange, mapCenter }) => {
  const [skillInput, setSkillInput] = useState('');
  const [qualificationInput, setQualificationInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [languageLevel, setLanguageLevel] = useState('B2');
  const [tagInput, setTagInput] = useState('');
  const [personalInfoOpen, setPersonalInfoOpen] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);

  const handleAddSkill = () => {
    if (skillInput.trim() && !filters.skills.includes(skillInput.trim())) {
      onFiltersChange({
        ...filters,
        skills: [...filters.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    onFiltersChange({
      ...filters,
      skills: filters.skills.filter(s => s !== skill),
    });
  };

  const handleAddQualification = () => {
    if (qualificationInput.trim() && !filters.qualifications.includes(qualificationInput.trim())) {
      onFiltersChange({
        ...filters,
        qualifications: [...filters.qualifications, qualificationInput.trim()],
      });
      setQualificationInput('');
    }
  };

  const handleRemoveQualification = (qualification: string) => {
    onFiltersChange({
      ...filters,
      qualifications: filters.qualifications.filter(q => q !== qualification),
    });
  };

  const handleAddLanguage = () => {
    const langs = Array.isArray(filters.languages) ? filters.languages : [];
    const langExists = langs.some(l =>
      (typeof l === 'string' ? l : l.name).toLowerCase() === languageInput.trim().toLowerCase()
    );

    if (languageInput.trim() && !langExists) {
      onFiltersChange({
        ...filters,
        languages: [...langs, { name: languageInput.trim(), level: languageLevel }] as any,
      });
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (languageName: string) => {
    const langs = Array.isArray(filters.languages) ? filters.languages : [];
    onFiltersChange({
      ...filters,
      languages: langs.filter(l => (typeof l === 'string' ? l : l.name) !== languageName) as any,
    });
  };


  const handleAddTag = () => {
    if (tagInput.trim() && !(filters.customTags || []).includes(tagInput.trim())) {
      onFiltersChange({
        ...filters,
        customTags: [...(filters.customTags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onFiltersChange({
      ...filters,
      customTags: (filters.customTags || []).filter(t => t !== tag),
    });
  };

  const handleCareerLevelToggle = (level: string) => {
    const current = filters.careerLevel || [];
    const updated = current.includes(level)
      ? current.filter(l => l !== level)
      : [...current, level];
    onFiltersChange({ ...filters, careerLevel: updated });
  };

  const handleJobTypeToggle = (type: string) => {
    const current = filters.jobTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, jobTypes: updated });
  };

  const handleContractTermToggle = (term: string) => {
    const current = filters.contractTerm || [];
    const updated = current.includes(term)
      ? current.filter(t => t !== term)
      : [...current, term];
    onFiltersChange({ ...filters, contractTerm: updated });
  };

  const handleHomeOfficeToggle = (pref: 'yes' | 'no' | 'hybrid') => {
    const current = filters.homeOfficePreference || [];
    const updated = current.includes(pref)
      ? current.filter(p => p !== pref)
      : [...current, pref];
    onFiltersChange({ ...filters, homeOfficePreference: updated });
  };

  const handleNoticePeriodToggle = (period: string) => {
    const current = filters.noticePeriod || [];
    const updated = current.includes(period)
      ? current.filter(p => p !== period)
      : [...current, period];
    onFiltersChange({ ...filters, noticePeriod: updated });
  };

  const handleCandidateStatusToggle = (status: string) => {
    const current = filters.candidateStatus || [];
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    onFiltersChange({ ...filters, candidateStatus: updated });
  };

  const handleGenderToggle = (gender: 'male' | 'female' | 'diverse') => {
    const current = filters.gender || [];
    const updated = current.includes(gender)
      ? current.filter(g => g !== gender)
      : [...current, gender];
    onFiltersChange({ ...filters, gender: updated });
  };

  const handleReset = () => {
    onFiltersChange({
      salary: [20000, 200000],
      bonus: [0, 100000],
      workRadius: 200,
      isRefugee: false,
      originCountry: '',
      skills: [],
      qualifications: [],
      location: {
        continent: '',
        country: '',
        cities: [],
      },
      jobTitle: '',
      jobTypes: [],
      careerLevel: [],
      yearsOfExperience: [0, 30],
      languages: [],
      contractTerm: [],
      travelWillingness: [0, 100],
      drivingLicenses: [],
      enablePartialMatch: false,
      minMatchThreshold: 50,
      sector: '',
      candidateStatus: [],
      homeOfficePreference: [],
      vacationDays: [0, 50],
      noticePeriod: [],
      preferredWorkLocations: [],
      customTags: [],
      gender: [],
      allowOverqualification: false,
    });
  };





  const careerLevels = ['junior', 'mid', 'senior', 'lead', 'executive'];
  const jobTypes = ['full-time', 'part-time', 'apprenticeship', 'internship', 'traineeship', 'freelance', 'contract'];
  const contractTerms = ['unlimited', 'temporary'];
  const candidateStatuses = ['Unemployed', 'Employed', 'Trainee', 'Apprentice', 'Pupil', 'Student', 'Civil Servant', 'Freelancer', 'Entrepreneur', 'Retired', 'Other'];
  const noticePeriods = ['immediate', '1-week', '2-weeks', '1-month', '2-months', '3-months'];

  return (
    <Card className="p-6 border border-primary/30 bg-card sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group/filters">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-h4 font-heading text-foreground">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground font-normal"
        >
          Reset
        </Button>
      </div>

      <div className="space-y-6">
        <div className="pt-4 border-t border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enablePartialMatch" className="text-body-sm font-medium text-foreground cursor-pointer">
                Enable Partial Matching
              </Label>
              <p className="text-[10px] text-muted-foreground">Show results with less than 100% match</p>
            </div>
            <Switch
              id="enablePartialMatch"
              checked={filters.enablePartialMatch}
              onCheckedChange={(checked) => onFiltersChange({ ...filters, enablePartialMatch: checked })}
            />
          </div>

          {filters.enablePartialMatch && (
            <div className="space-y-4">
              <Label className="text-body-sm font-medium text-foreground mb-4 block">
                Min Match Threshold: {filters.minMatchThreshold}%
              </Label>
              <Slider
                value={[filters.minMatchThreshold || 50]}
                onValueChange={(val) => onFiltersChange({ ...filters, minMatchThreshold: val[0] })}
                min={10}
                max={90}
                step={5}
                className="mt-2"
              />
            </div>
          )}
        </div>

        {/* ALWAYS VISIBLE SECTION */}
        <div className="space-y-4 pb-4 border-b border-border">
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">Always Visible</h4>

          {/* Job Title */}
          <div>
            <Label className="text-body-sm font-medium text-foreground mb-2 block">
              Job Title
            </Label>
            <AutocompleteInput
              category="job_titles"
              placeholder="Search by job title..."
              value={filters.jobTitle || ''}
              onChange={(val) => onFiltersChange({ ...filters, jobTitle: val })}
              className="bg-background text-foreground border-border"
            />
          </div>

          {/* Talent Status */}
          <div>
            <Label className="text-body-sm font-medium text-foreground mb-3 block">
              Talent Status
            </Label>
            <div className="flex flex-wrap gap-2">
              {candidateStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleCandidateStatusToggle(status)}
                  className={`px-3 py-1 rounded-full text-body-sm font-medium transition-all ${(filters.candidateStatus || []).includes(status)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                >
                  {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Sector */}
          <div>
            <Label className="text-body-sm font-medium text-foreground mb-2 block">
              Sector
            </Label>
            <AutocompleteInput
              category="sectors"
              placeholder="Type sector..."
              value={filters.sector === 'any' ? '' : filters.sector || ''}
              onChange={(val) => onFiltersChange({ ...filters, sector: val || 'any' })}
              className="bg-background text-foreground border-border"
            />
          </div>

          {/* Location */}
          <div>
            <Label className="text-body-sm font-medium text-foreground mb-3 block">
              Location (Candidate)
            </Label>

            <div className="space-y-3">
              <LocationPicker
                mode="city"
                value={{
                  city: filters.location.cities[0] || '',
                  country: filters.location.country,
                }}
                onChange={(val) => onFiltersChange({
                  ...filters,
                  location: {
                    continent: findContinent(val.country),
                    country: val.country,
                    cities: val.city ? [val.city] : [],
                  }
                })}
              />

              {filters.location.cities[0] && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Search Radius: {filters.workRadius} km
                    </Label>
                  </div>
                  <Slider
                    value={[filters.workRadius]}
                    onValueChange={(value) => onFiltersChange({ ...filters, workRadius: value[0] })}
                    min={10}
                    max={200}
                    step={5}
                    className="py-2"
                  />
                  {mapCenter && (
                    <MapLoader center={mapCenter} radius={filters.workRadius} />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desired Work Location */}
          <div>
            <Label className="text-body-sm font-medium text-foreground mb-3 block">
              Desired Work Location
            </Label>
            <div className="space-y-3">
              <AutocompleteInput
                category="cities"
                placeholder="Search for cities..."
                value={filters.preferredWorkLocations && filters.preferredWorkLocations.length > 0 ? filters.preferredWorkLocations[0].city : ''}
                onChange={(val) => {
                  // For simplicity in the sidebar, we just handle the first preferred location
                  onFiltersChange({
                    ...filters,
                    preferredWorkLocations: val ? [{
                      city: val,
                      country: '', // We could enhance this to also select country
                      continent: '',
                      radius: 50
                    }] : []
                  });
                }}
                className="bg-background text-foreground border-border"
                icon={<MapPin className="w-4 h-4 text-primary" />}
              />
            </div>
          </div>
        </div>

        {/* PERSONAL INFORMATION COLLAPSIBLE */}
        <Collapsible open={personalInfoOpen} onOpenChange={setPersonalInfoOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between bg-transparent text-primary hover:bg-primary/10 hover:text-primary font-medium"
            >
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Personal Information
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${personalInfoOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-6 mt-6">
            {/* Refugee/Immigrant */}
            <div className="flex items-center justify-between">
              <Label htmlFor="refugee-filter" className="text-body-sm font-medium text-foreground">
                Refugee/Immigrant
              </Label>
              <Switch
                id="refugee-filter"
                checked={filters.isRefugee}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, isRefugee: checked, originCountry: checked ? filters.originCountry : '' })}
              />
            </div>

            {filters.isRefugee && (
              <div>
                <Label className="text-body-sm font-medium text-foreground mb-2 block">
                  Country of Origin
                </Label>
                <Select value={filters.originCountry} onValueChange={(value) => onFiltersChange({ ...filters, originCountry: value })}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {refugeeOriginCountries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Gender */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Gender
              </Label>
              <div className="flex flex-wrap gap-2">
                {['Male', 'Female', 'Non-binary', 'Other'].map(g => (
                  <button
                    key={g}
                    onClick={() => {
                      const genderMap: Record<string, any> = {
                        'Male': 'male',
                        'Female': 'female',
                        'Non-binary': 'diverse',
                        'Other': 'diverse'
                      };
                      handleGenderToggle(genderMap[g]);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${(filters.gender || []).includes(g.toLowerCase() === 'non-binary' || g.toLowerCase() === 'other' ? 'diverse' : g.toLowerCase())
                      ? 'bg-primary border-primary text-white shadow-sm'
                      : 'bg-white border-border text-foreground hover:border-primary/50'
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Driving Licenses */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Driving Licenses
              </Label>
              <DrivingLicenseSelector
                value={filters.drivingLicenses || []}
                onChange={(val) => onFiltersChange({ ...filters, drivingLicenses: val })}
              />
            </div>

            {/* Qualifications */}
            <div>
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
                {filters.qualifications.map((qualification) => (
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

            {/* Career Level */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Career Level
              </Label>
              <div className="flex flex-wrap gap-2">
                {careerLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleCareerLevelToggle(level)}
                    className={`px-3 py-1 rounded-full text-body-sm font-medium transition-all ${(filters.careerLevel || []).includes(level)
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages */}
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
                  <SelectTrigger className="w-[85px] bg-background text-foreground border-border">
                    <SelectValue placeholder="Lvl" />
                  </SelectTrigger>
                  <SelectContent>
                    {getLanguageLevelOptions(true).map(opt => (
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
                {(filters.languages || []).map((lang: any) => {
                  const langName = typeof lang === 'string' ? lang : lang.name;
                  const langLevel = typeof lang === 'object' ? lang.level : '';
                  return (
                    <div
                      key={langName}
                      className="flex items-center space-x-1 px-3 py-1 bg-info/10 text-info rounded-full text-body-sm"
                    >
                      <span className="capitalize">{langName}{langLevel ? ` (${langLevel})` : ''}</span>
                      <button
                        onClick={() => handleRemoveLanguage(langName)}
                        className="hover:text-info-hover"
                        aria-label={`Remove ${langName}`}
                      >
                        <X className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skills */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Skills
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
                {filters.skills.map((skill) => (
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

            {/* Experience Years */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Experience (Years): {(filters.yearsOfExperience || [0, 30])[0]} - {(filters.yearsOfExperience || [0, 30])[1]} years
              </Label>
              <Slider
                value={filters.yearsOfExperience || [0, 30]}
                onValueChange={(value) => onFiltersChange({ ...filters, yearsOfExperience: value })}
                min={0}
                max={30}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Notice Period */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Notice Period
              </Label>
              <div className="flex flex-wrap gap-2">
                {noticePeriods.map((period) => (
                  <button
                    key={period}
                    onClick={() => handleNoticePeriodToggle(period)}
                    className={`px-3 py-1 rounded-full text-body-sm font-medium transition-all ${(filters.noticePeriod || []).includes(period)
                      ? 'bg-warning text-warning-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                  >
                    {period.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* CONDITIONS & EXPECTATIONS COLLAPSIBLE */}
        <Collapsible open={conditionsOpen} onOpenChange={setConditionsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between bg-transparent text-primary hover:bg-primary/10 hover:text-primary font-medium"
            >
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Conditions & Expectations
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${conditionsOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-6 mt-6">
            {/* Matching Preferences */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <Label className="text-sm font-bold">Matching Preferences</Label>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border/40">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold block">Allow Overqualification</Label>
                  <p className="text-[10px] text-muted-foreground">Show candidates exceeding requirements</p>
                </div>
                <Switch
                  checked={filters.allowOverqualification || false}
                  onCheckedChange={(checked) => onFiltersChange({ ...filters, allowOverqualification: checked })}
                />
              </div>
            </div>

            {/* Job Type */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Job Type
              </Label>
              <div className="flex flex-wrap gap-2">
                {jobTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleJobTypeToggle(type)}
                    className={`px-3 py-1 rounded-full text-body-sm font-medium transition-all ${(filters.jobTypes || []).includes(type)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                  >
                    {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Contract Term */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Contract Term
              </Label>
              <div className="flex flex-wrap gap-2">
                {contractTerms.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleContractTermToggle(term)}
                    className={`px-3 py-1 rounded-full text-body-sm font-medium transition-all ${(filters.contractTerm || []).includes(term)
                      ? 'bg-info text-info-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                  >
                    {term.charAt(0).toUpperCase() + term.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Home Office */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Home Office
              </Label>
              <div className="flex flex-wrap gap-2">
                {(['yes', 'no', 'hybrid'] as const).map((pref) => (
                  <button
                    key={pref}
                    onClick={() => handleHomeOfficeToggle(pref)}
                    className={`px-3 py-1 rounded-full text-body-sm font-medium transition-all ${(filters.homeOfficePreference || []).includes(pref)
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                  >
                    {pref.charAt(0).toUpperCase() + pref.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Desired Salary (Year): ${filters.salary[0].toLocaleString()} - ${filters.salary[1].toLocaleString()}
              </Label>
              <Slider
                value={filters.salary}
                onValueChange={(value) => onFiltersChange({ ...filters, salary: value })}
                min={20000}
                max={200000}
                step={5000}
                className="mt-2"
              />
            </div>

            {/* Entry Bonus */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Entry Bonus: ${filters.bonus[0].toLocaleString()} - ${filters.bonus[1].toLocaleString()}
              </Label>
              <Slider
                value={filters.bonus}
                onValueChange={(value) => onFiltersChange({ ...filters, bonus: value })}
                min={0}
                max={100000}
                step={1000}
                className="mt-2"
              />
            </div>

            {/* Vacation Days */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Vacation Days: {(filters.vacationDays || [0, 50])[0]} - {(filters.vacationDays || [0, 50])[1]} days
              </Label>
              <Slider
                value={filters.vacationDays || [0, 50]}
                onValueChange={(value) => onFiltersChange({ ...filters, vacationDays: value })}
                min={0}
                max={50}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Willingness to Travel */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Willingness to Travel: {(filters.travelWillingness || [0, 100])[0]}% - {(filters.travelWillingness || [0, 100])[1]}%
              </Label>
              <Slider
                value={filters.travelWillingness || [0, 100]}
                onValueChange={(value) => onFiltersChange({ ...filters, travelWillingness: value })}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>



            {/* Custom Tags */}
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Additional Conditions (Tags)
              </Label>
              <p className="text-[10px] text-muted-foreground mb-2">
                e.g., Barrier-free, Fitness studio, Pets allowed, etc.
              </p>
              <div className="flex space-x-2 mb-3">
                <AutocompleteInput
                  category="tags"
                  placeholder="Add custom tag..."
                  value={tagInput}
                  onChange={setTagInput}
                  onKeyPress={(e: any) => e.key === 'Enter' && handleAddTag()}
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
                {(filters.customTags || []).map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center space-x-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-body-sm"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-secondary-hover"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
};

export default CandidateFilters;
