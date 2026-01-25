import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { CandidateFilters as CandidateFiltersType } from '@/types/candidate';
import { locationData, refugeeOriginCountries } from '@/data/locationData';

interface CandidateFiltersProps {
  filters: CandidateFiltersType;
  onFiltersChange: (filters: CandidateFiltersType) => void;
}

const CandidateFilters: React.FC<CandidateFiltersProps> = ({ filters, onFiltersChange }) => {
  const [skillInput, setSkillInput] = useState('');
  const [qualificationInput, setQualificationInput] = useState('');

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

  const handleReset = () => {
    onFiltersChange({
      salary: [30000, 120000],
      bonus: [0, 50000],
      workRadius: 50,
      isRefugee: false,
      originCountry: '',
      skills: [],
      qualifications: [],
      location: {
        continent: '',
        country: '',
        cities: [],
      },
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
          <Label className="text-body-sm font-medium text-foreground mb-3 block">
            Work Radius: {filters.workRadius} km
          </Label>
          <Slider
            value={[filters.workRadius]}
            onValueChange={(value) => onFiltersChange({ ...filters, workRadius: value[0] })}
            min={10}
            max={200}
            step={5}
            className="mt-2"
          />
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
      </div>
    </Card>
  );
};

export default CandidateFilters;
