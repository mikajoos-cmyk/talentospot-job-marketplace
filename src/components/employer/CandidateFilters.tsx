import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { X, Plus, Map, ChevronDown, Filter } from 'lucide-react';
import { CandidateFilters as CandidateFiltersType } from '@/types/candidate';
import { locationData, refugeeOriginCountries } from '@/data/locationData';

interface CandidateFiltersProps {
  filters: CandidateFiltersType;
  onFiltersChange: (filters: CandidateFiltersType) => void;
}

const CandidateFilters: React.FC<CandidateFiltersProps> = ({ filters, onFiltersChange }) => {
  const [skillInput, setSkillInput] = useState('');
  const [qualificationInput, setQualificationInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [licenseInput, setLicenseInput] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

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
    if (languageInput.trim() && !(filters.languages || []).includes(languageInput.trim())) {
      onFiltersChange({
        ...filters,
        languages: [...(filters.languages || []), languageInput.trim()],
      });
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (language: string) => {
    onFiltersChange({
      ...filters,
      languages: (filters.languages || []).filter(l => l !== language),
    });
  };

  const handleAddLicense = () => {
    if (licenseInput.trim() && !(filters.drivingLicenses || []).includes(licenseInput.trim().toUpperCase())) {
      onFiltersChange({
        ...filters,
        drivingLicenses: [...(filters.drivingLicenses || []), licenseInput.trim().toUpperCase()],
      });
      setLicenseInput('');
    }
  };

  const handleRemoveLicense = (license: string) => {
    onFiltersChange({
      ...filters,
      drivingLicenses: (filters.drivingLicenses || []).filter(l => l !== license),
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
    });
  };

  const continents = Object.keys(locationData);
  const countries = filters.location.continent ? Object.keys(locationData[filters.location.continent] || {}) : [];
  const cities = filters.location.country && filters.location.continent
    ? locationData[filters.location.continent]?.[filters.location.country] || []
    : [];

  const handleContinentChange = (continent: string) => {
    onFiltersChange({
      ...filters,
      location: {
        continent,
        country: '',
        cities: [],
      },
    });
  };

  const handleCountryChange = (country: string) => {
    onFiltersChange({
      ...filters,
      location: {
        ...filters.location,
        country,
        cities: [],
      },
    });
  };

  const handleCityToggle = (city: string) => {
    const cities = filters.location.cities.includes(city)
      ? filters.location.cities.filter(c => c !== city)
      : [...filters.location.cities, city];

    onFiltersChange({
      ...filters,
      location: {
        ...filters.location,
        cities,
      },
    });
  };

  const careerLevels = ['junior', 'mid', 'senior', 'lead', 'executive'];
  const jobTypes = ['full-time', 'part-time', 'contract', 'freelance', 'remote'];
  const contractTerms = ['permanent', 'temporary', 'contract', 'freelance', 'internship'];

  return (
    <Card className="p-6 border border-border bg-card sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
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

        {/* Basic Filters */}
        <div>
          <Label className="text-body-sm font-medium text-foreground mb-2 block">
            Job Title
          </Label>
          <Input
            type="text"
            placeholder="Search by job title..."
            value={filters.jobTitle || ''}
            onChange={(e) => onFiltersChange({ ...filters, jobTitle: e.target.value })}
            className="bg-background text-foreground border-border"
          />
        </div>

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

        <div>
          <Label className="text-body-sm font-medium text-foreground mb-3 block">
            Location Preference
          </Label>

          <div className="space-y-3">
            <Select value={filters.location.continent} onValueChange={handleContinentChange}>
              <SelectTrigger className="bg-background text-foreground border-border">
                <SelectValue placeholder="Select continent" />
              </SelectTrigger>
              <SelectContent>
                {continents.map(continent => (
                  <SelectItem key={continent} value={continent}>{continent}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filters.location.continent && (
              <Select value={filters.location.country} onValueChange={handleCountryChange}>
                <SelectTrigger className="bg-background text-foreground border-border">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filters.location.country && cities.length > 0 && (
              <div className="space-y-2">
                <Label className="text-caption text-muted-foreground">Select Cities (Multiple)</Label>
                <div className="max-h-32 overflow-y-auto border border-border rounded-md p-2 bg-background">
                  {cities.map(city => (
                    <label key={city} className="flex items-center space-x-2 py-1 hover:bg-muted rounded px-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.location.cities.includes(city)}
                        onChange={() => handleCityToggle(city)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <span className="text-body-sm text-foreground">{city}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between bg-transparent text-primary hover:bg-primary/10 hover:text-primary font-medium"
            >
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Advanced Filters
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-6 mt-6">
            <div>
              <Label className="text-body-sm font-medium text-foreground mb-3 block">
                Salary Range: ${filters.salary[0].toLocaleString()} - ${filters.salary[1].toLocaleString()}
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

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-body-sm font-medium text-foreground">
                  Work Radius: {filters.workRadius} km
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="bg-transparent text-primary hover:bg-primary/10 hover:text-primary font-normal h-8 px-2"
                >
                  <Map className="w-4 h-4 mr-1" strokeWidth={1.5} />
                  {showMap ? 'Hide' : 'Show'} Map
                </Button>
              </div>
              <Slider
                value={[filters.workRadius]}
                onValueChange={(value) => onFiltersChange({ ...filters, workRadius: value[0] })}
                min={10}
                max={200}
                step={5}
                className="mt-2"
              />
              {showMap && (
                <div className="mt-4">
                  <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border border-border">
                    <div className="text-center">
                      <Map className="w-12 h-12 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                      <p className="text-body-sm text-muted-foreground">Map View</p>
                      <p className="text-caption text-muted-foreground">Radius: {filters.workRadius} km</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

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

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Skills
              </Label>
              <div className="flex space-x-2 mb-3">
                <Input
                  type="text"
                  placeholder="Add skill..."
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
                {(filters.languages || []).map((language) => (
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
                Driving Licenses
              </Label>
              <div className="flex space-x-2 mb-3">
                <Input
                  type="text"
                  placeholder="Add license (e.g., B, C, CE)..."
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
              <div className="flex flex-wrap gap-2 mb-4">
                {['B', 'A', 'BE', 'AM'].map((lic) => (
                  <button
                    key={lic}
                    onClick={() => {
                      const current = filters.drivingLicenses || [];
                      const updated = current.includes(lic)
                        ? current.filter(l => l !== lic)
                        : [...current, lic];
                      onFiltersChange({ ...filters, drivingLicenses: updated });
                    }}
                    className={`px-3 py-1 rounded-full text-body-sm font-medium transition-all ${(filters.drivingLicenses || []).includes(lic)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                  >
                    {lic}
                  </button>
                ))}
              </div>

              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Truck Licenses
              </Label>
              <div className="flex flex-wrap gap-2 mb-4">
                {['C', 'CE', 'C1', 'C1E'].map((lic) => (
                  <button
                    key={lic}
                    onClick={() => {
                      const current = filters.drivingLicenses || [];
                      const updated = current.includes(lic)
                        ? current.filter(l => l !== lic)
                        : [...current, lic];
                      onFiltersChange({ ...filters, drivingLicenses: updated });
                    }}
                    className={`px-3 py-1 rounded-full text-body-sm font-medium transition-all ${(filters.drivingLicenses || []).includes(lic)
                      ? 'bg-warning/20 text-warning-foreground border border-warning/30'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                  >
                    {lic}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {(filters.drivingLicenses || []).filter(l => !['B', 'A', 'BE', 'AM', 'C', 'CE', 'C1', 'C1E'].includes(l)).map((license) => (
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
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card >
  );
};

export default CandidateFilters;
