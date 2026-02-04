import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Sparkles, RotateCcw, X, Plus, Users, Briefcase } from 'lucide-react';

import { getLanguageLevelOptions } from '@/utils/language-levels';
import { AutocompleteInput } from '@/components/shared/AutocompleteInput';
import DrivingLicenseSelector from '@/components/shared/DrivingLicenseSelector';
import { Switch } from '../../components/ui/switch';
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

export interface JobFiltersState {
    title: string;
    sector: string;
    continent: string;
    country: string;
    city: string;
    employmentTypes: string[];
    salaryRange: [number, number];
    minEntryBonus: number;
    contractDuration: string;
    skills: string[];
    qualifications: string[];
    languages: { name: string; level: string }[] | string[];
    careerLevel: string;
    experienceYears: number | null;
    drivingLicenses: string[];
    contractTerms: string[];
    homeOffice: boolean;
    enableFlexibleMatch: boolean;
    enablePartialMatch: boolean;
    minMatchThreshold: number;
    benefits: string[];
    minVacationDays: number;
    workRadius: number;
}

interface JobFiltersProps {
    filters: JobFiltersState;
    onFiltersChange: (filters: JobFiltersState) => void;
    onMatchProfile: () => void;
    onReset: () => void;
    mapCenter?: [number, number];
}

const JobFilters: React.FC<JobFiltersProps> = ({ filters, onFiltersChange, onMatchProfile, onReset, mapCenter }) => {
    const [requirementsOpen, setRequirementsOpen] = useState(false);
    const [conditionsOpen, setConditionsOpen] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [qualificationInput, setQualificationInput] = useState('');
    const [languageInput, setLanguageInput] = useState('');
    const [languageLevel, setLanguageLevel] = useState('B2');
    const [benefitInput, setBenefitInput] = useState('');

    const employmentTypes = [
        { id: 'full-time', label: 'Full Time' },
        { id: 'part-time', label: 'Part Time' },
        { id: 'contract', label: 'Contract' },
        { id: 'freelance', label: 'Freelance' },
        { id: 'internship', label: 'Internship' },
        { id: 'remote', label: 'Remote' },
    ];

    const careerLevels = [
        { id: 'entry', label: 'Entry Level' },
        { id: 'junior', label: 'Junior' },
        { id: 'mid', label: 'Mid-Level' },
        { id: 'senior', label: 'Senior' },
        { id: 'lead', label: 'Lead / Manager' },
    ];

    const sectors = ['IT', 'Healthcare', 'Finance', 'Engineering', 'Marketing', 'Sales', 'Education', 'Manufacturing', 'Retail', 'Other'];

    const handleEmploymentTypeToggle = (typeId: string) => {
        const current = filters.employmentTypes;
        const updated = current.includes(typeId)
            ? current.filter(t => t !== typeId)
            : [...current, typeId];
        onFiltersChange({ ...filters, employmentTypes: updated });
    };

    const handleContractTermToggle = (term: string) => {
        const current = filters.contractTerms;
        const updated = current.includes(term)
            ? current.filter(t => t !== term)
            : [...current, term];
        onFiltersChange({ ...filters, contractTerms: updated });
    };

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

    const handleAddBenefit = () => {
        if (benefitInput.trim() && !(filters.benefits || []).includes(benefitInput.trim())) {
            onFiltersChange({
                ...filters,
                benefits: [...(filters.benefits || []), benefitInput.trim()],
            });
            setBenefitInput('');
        }
    };

    const handleRemoveBenefit = (benefit: string) => {
        onFiltersChange({
            ...filters,
            benefits: (filters.benefits || []).filter(b => b !== benefit),
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



    const handleReset = () => {
        onFiltersChange({
            title: '',
            sector: '',
            continent: '',
            country: '',
            city: '',
            employmentTypes: [],
            salaryRange: [0, 250000],
            minEntryBonus: 0,
            contractDuration: '',
            skills: [],
            qualifications: [],
            languages: [],
            careerLevel: '',
            experienceYears: null,
            drivingLicenses: [],
            contractTerms: [],
            homeOffice: false,
            enableFlexibleMatch: false,
            enablePartialMatch: false,
            minMatchThreshold: 50,
            benefits: [],
            minVacationDays: 0,
            workRadius: 200,
        });
        onReset();
    };

    return (
        <Card className="p-6 border border-primary/30 bg-card sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group/filters">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-h4 font-heading text-foreground">Filters</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground font-normal bg-transparent"
                >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                </Button>
            </div>

            <div className="space-y-6">
                <Button
                    onClick={onMatchProfile}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary-hover flex items-center justify-center gap-2 py-6 shadow-sm shadow-primary/20 transition-all active:scale-[0.98]"
                >
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">Match My Profile</span>
                </Button>

                {/* Matching Preferences (Collapsible) */}
                <Collapsible defaultOpen>
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-between bg-transparent text-primary hover:bg-primary/10 hover:text-primary font-medium border border-primary/20"
                        >
                            <div className="flex items-center">
                                <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
                                Matching Preferences
                            </div>
                            <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-6 mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        {/* Flexible Match (Allow Overqualification) */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="flexibleMatch" className="text-body-sm font-medium text-foreground cursor-pointer">
                                    Allow Overqualification
                                </Label>
                                <p className="text-[10px] text-muted-foreground">
                                    Show jobs where you exceed requirements
                                </p>
                            </div>
                            <Switch
                                id="flexibleMatch"
                                checked={filters.enableFlexibleMatch}
                                onCheckedChange={(checked) => onFiltersChange({ ...filters, enableFlexibleMatch: checked })}
                            />
                        </div>

                        {/* Partial Match */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="partialMatch" className="text-body-sm font-medium text-foreground cursor-pointer">
                                        Enable Partial Matching
                                    </Label>
                                    <p className="text-[10px] text-muted-foreground">
                                        Show jobs that don't match all criteria
                                    </p>
                                </div>
                                <Switch
                                    id="partialMatch"
                                    checked={filters.enablePartialMatch}
                                    onCheckedChange={(checked) => onFiltersChange({ ...filters, enablePartialMatch: checked })}
                                />
                            </div>

                            {filters.enablePartialMatch && (
                                <div className="pt-2 pl-2 border-l-2 border-primary/30 ml-1">
                                    <Label className="text-body-sm font-medium text-foreground mb-4 block">
                                        Minimum Match Percentage: {filters.minMatchThreshold}%
                                    </Label>
                                    <Slider
                                        value={[filters.minMatchThreshold]}
                                        onValueChange={(val) => onFiltersChange({ ...filters, minMatchThreshold: val[0] })}
                                        min={0}
                                        max={100}
                                        step={5}
                                        className="mt-2"
                                    />
                                </div>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Always Visible Section */}
                <div className="space-y-4 pb-4 border-b border-border">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">Always Visible</h4>

                    {/* Job Title */}
                    <div>
                        <Label className="text-body-sm font-medium text-foreground mb-2 block">
                            Job Title
                        </Label>
                        <AutocompleteInput
                            category="job_titles"
                            placeholder="Search title..."
                            value={filters.title}
                            onChange={(val) => onFiltersChange({ ...filters, title: val })}
                            className="bg-background text-foreground border-border"
                        />
                    </div>

                    {/* Sector */}
                    <div>
                        <Label className="text-body-sm font-medium text-foreground mb-2 block">
                            Sector
                        </Label>
                        <Select value={filters.sector || ''} onValueChange={(value) => onFiltersChange({ ...filters, sector: value })}>
                            <SelectTrigger className="bg-background text-foreground border-border">
                                <SelectValue placeholder="Select sector" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sectors</SelectItem>
                                {sectors.map(sector => (
                                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                        <Label className="text-body-sm font-medium text-foreground block">
                            Location
                        </Label>
                        <LocationPicker
                            mode="city"
                            value={{
                                city: filters.city,
                                country: filters.country,
                            }}
                            onChange={(val) => onFiltersChange({
                                ...filters,
                                city: val.city,
                                country: val.country,
                                continent: findContinent(val.country)
                            })}
                        />

                        {filters.city && (
                            <div className="pt-2 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                        Search Radius: {filters.workRadius} km
                                    </Label>
                                </div>
                                <Slider
                                    value={[filters.workRadius || 200]}
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

                {/* Candidate Requirements (Collapsible) */}
                <Collapsible open={requirementsOpen} onOpenChange={setRequirementsOpen}>
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-between bg-transparent text-primary hover:bg-primary/10 hover:text-primary font-medium"
                        >
                            <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2" strokeWidth={1.5} />
                                Candidate Requirements
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform ${requirementsOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                        </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-6 mt-6">
                        {/* Career Level */}
                        <div>
                            <Label className="text-body-sm font-medium text-foreground mb-3 block">
                                Career Level
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {careerLevels.map((level) => (
                                    <button
                                        key={level.id}
                                        type="button"
                                        onClick={() => onFiltersChange({ ...filters, careerLevel: filters.careerLevel === level.id ? '' : level.id })}
                                        className={`px-3 py-1 rounded-full text-body-sm font-medium transition-all ${filters.careerLevel === level.id
                                            ? 'bg-accent text-accent-foreground'
                                            : 'bg-muted text-foreground hover:bg-muted/80'
                                            }`}
                                    >
                                        {level.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Experience Years */}
                        <div>
                            <Label className="text-body-sm font-medium text-foreground mb-4 block">
                                Max Required Experience: {filters.experienceYears === null ? 'Any' : `${filters.experienceYears} years`}
                            </Label>
                            <Slider
                                value={[filters.experienceYears === null ? 30 : filters.experienceYears]}
                                onValueChange={(val) => onFiltersChange({ ...filters, experienceYears: val[0] === 30 ? null : val[0] })}
                                min={0}
                                max={30}
                                step={1}
                                className="mt-2"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1 text-right">Slide to 30 for "Any"</p>
                        </div>

                        {/* Qualifications */}
                        <div>
                            <Label className="text-body-sm font-medium text-foreground mb-2 block">
                                Qualifications
                            </Label>
                            <div className="flex space-x-2 mb-3">
                                <AutocompleteInput
                                    category="qualifications"
                                    placeholder="Add qualification..."
                                    value={qualificationInput}
                                    onChange={setQualificationInput}
                                    onKeyPress={(e: any) => e.key === 'Enter' && handleAddQualification()}
                                    className="bg-background text-foreground border-border"
                                />
                                <Button size="icon" onClick={handleAddQualification} className="bg-accent text-accent-foreground shrink-0">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {filters.qualifications.map(qual => (
                                    <div key={qual} className="flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-body-sm">
                                        <span>{qual}</span>
                                        <button onClick={() => handleRemoveQualification(qual)}><X className="w-4 h-4" /></button>
                                    </div>
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
                                    placeholder="Add language..."
                                    value={languageInput}
                                    onChange={setLanguageInput}
                                    onKeyPress={(e: any) => e.key === 'Enter' && handleAddLanguage()}
                                    className="flex-1 bg-background text-foreground border-border"
                                />
                                <Select value={languageLevel} onValueChange={setLanguageLevel}>
                                    <SelectTrigger className="w-[85px] bg-background text-foreground border-border">
                                        <SelectValue placeholder="Lvl" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getLanguageLevelOptions().map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button size="icon" onClick={handleAddLanguage} className="bg-info text-info-foreground shrink-0 w-full sm:w-10">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(filters.languages || []).map((lang: any) => {
                                    const langName = typeof lang === 'string' ? lang : lang.name;
                                    const langLevel = typeof lang === 'object' ? lang.level : '';
                                    return (
                                        <div key={langName} className="flex items-center gap-1 px-3 py-1 bg-info/10 text-info rounded-full text-body-sm">
                                            <span className="capitalize">{langName}{langLevel ? ` (${langLevel})` : ''}</span>
                                            <button onClick={() => handleRemoveLanguage(langName)}><X className="w-4 h-4" /></button>
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
                                    placeholder="Add skill..."
                                    value={skillInput}
                                    onChange={setSkillInput}
                                    onKeyPress={(e: any) => e.key === 'Enter' && handleAddSkill()}
                                    className="bg-background text-foreground border-border"
                                />
                                <Button size="icon" onClick={handleAddSkill} className="bg-primary text-primary-foreground shrink-0">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {filters.skills.map(skill => (
                                    <div key={skill} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-body-sm">
                                        <span>{skill}</span>
                                        <button onClick={() => handleRemoveSkill(skill)}><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Driving Licenses */}
                        <div>
                            <Label className="text-body-sm font-medium text-foreground mb-3 block">
                                Required Driving Licenses
                            </Label>
                            <DrivingLicenseSelector
                                value={filters.drivingLicenses || []}
                                onChange={(val) => onFiltersChange({ ...filters, drivingLicenses: val })}
                            />
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Job Conditions (Collapsible) */}
                <Collapsible open={conditionsOpen} onOpenChange={setConditionsOpen}>
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-between bg-transparent text-primary hover:bg-primary/10 hover:text-primary font-medium"
                        >
                            <div className="flex items-center">
                                <Briefcase className="w-4 h-4 mr-2" strokeWidth={1.5} />
                                Job Conditions
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform ${conditionsOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                        </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-6 mt-6">
                        {/* Salary Range */}
                        <div>
                            <Label className="text-body-sm font-medium text-foreground mb-4 block">
                                Salary Range (EUR): €{filters.salaryRange[0].toLocaleString()} - €{filters.salaryRange[1].toLocaleString()}+
                            </Label>
                            <Slider
                                value={filters.salaryRange}
                                onValueChange={(val) => onFiltersChange({ ...filters, salaryRange: val as [number, number] })}
                                min={0}
                                max={250000}
                                step={5000}
                                className="mt-2"
                            />
                        </div>

                        {/* Entry Bonus */}
                        <div>
                            <Label className="text-body-sm font-medium text-foreground mb-4 block">
                                Min Entry Bonus (EUR): €{filters.minEntryBonus.toLocaleString()}+
                            </Label>
                            <Slider
                                value={[filters.minEntryBonus]}
                                onValueChange={(val) => onFiltersChange({ ...filters, minEntryBonus: val[0] })}
                                min={0}
                                max={50000}
                                step={1000}
                                className="mt-2"
                            />
                        </div>

                        {/* Vacation Days */}
                        <div>
                            <Label className="text-body-sm font-medium text-foreground mb-4 block">
                                Min Vacation Days: {filters.minVacationDays > 0 ? filters.minVacationDays : 'Any'}
                            </Label>
                            <Slider
                                value={[filters.minVacationDays]}
                                onValueChange={(val) => onFiltersChange({ ...filters, minVacationDays: val[0] })}
                                min={0}
                                max={40}
                                step={1}
                                className="mt-2"
                            />
                        </div>

                        {/* Employment Type */}
                        <div>
                            <Label className="text-body-sm font-medium text-foreground mb-3 block">
                                Employment Type
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {employmentTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => handleEmploymentTypeToggle(type.id)}
                                        className={`px-3 py-1 rounded-full text-body-sm font-medium transition-all ${filters.employmentTypes.includes(type.id)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-foreground hover:bg-muted/80'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Contract Terms */}
                        <div>
                            <Label className="text-body-sm font-medium text-foreground mb-3 block">
                                Contract Terms
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {['permanent', 'temporary', 'contract', 'freelance', 'internship'].map((term) => (
                                    <button
                                        key={term}
                                        type="button"
                                        onClick={() => handleContractTermToggle(term)}
                                        className={`px-3 py-1 rounded-full text-body-sm font-medium transition-all ${(filters.contractTerms || []).includes(term)
                                            ? 'bg-info text-info-foreground shadow-sm shadow-info/20'
                                            : 'bg-muted text-foreground hover:bg-muted/80'
                                            }`}
                                    >
                                        {term.charAt(0).toUpperCase() + term.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Home Office */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="homeOffice" className="text-body-sm font-medium text-foreground cursor-pointer">
                                Home Office Available
                            </Label>
                            <Switch
                                id="homeOffice"
                                checked={filters.homeOffice}
                                onCheckedChange={(checked) => onFiltersChange({ ...filters, homeOffice: checked })}
                            />
                        </div>

                        {/* Benefits / Custom Tags */}
                        <div>
                            <Label className="text-body-sm font-medium text-foreground mb-2 block">
                                Benefits (Tags)
                            </Label>
                            <p className="text-[10px] text-muted-foreground mb-2">
                                e.g. Gym, Free snacks, etc.
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
                                {(filters.benefits || []).map((benefit) => (
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
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </Card>
    );
};

export default JobFilters;
