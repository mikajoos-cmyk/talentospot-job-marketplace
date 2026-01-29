import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Filter, Sparkles, RotateCcw, X, Plus } from 'lucide-react';
import { locationData } from '@/data/locationData';
import { getLanguageLevelOptions } from '@/utils/language-levels';

export interface JobFiltersState {
    title: string;
    continent: string;
    country: string;
    city: string;
    employmentTypes: string[];
    salaryRange: [number, number];
    minEntryBonus: number;
    contractDuration: string;
    skills: string[];
    qualifications: string[];
    languages: { name: string; level: string }[] | string[]; // Support both formats for backward compatibility
    careerLevel: string;
    experienceYears: number | null;
    drivingLicenses: string[];
    contractTerms: string[];
    homeOffice: boolean;
    enableFlexibleMatch: boolean; // Show jobs even if overqualified
    enablePartialMatch: boolean; // Show jobs with partial match (with score)
    minMatchThreshold: number;
}

interface JobFiltersProps {
    filters: JobFiltersState;
    onFiltersChange: (filters: JobFiltersState) => void;
    onMatchProfile: () => void;
    onReset: () => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({ filters, onFiltersChange, onMatchProfile, onReset }) => {
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [qualificationInput, setQualificationInput] = useState('');
    const [languageInput, setLanguageInput] = useState('');
    const [languageLevel, setLanguageLevel] = useState('B2');

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

    const handleEmploymentTypeToggle = (typeId: string) => {
        const current = filters.employmentTypes;
        const updated = current.includes(typeId)
            ? current.filter(t => t !== typeId)
            : [...current, typeId];
        onFiltersChange({ ...filters, employmentTypes: updated });
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

    const continents = Object.keys(locationData);
    const countries = filters.continent ? Object.keys(locationData[filters.continent] || {}) : [];
    const cities = filters.continent && filters.country ? locationData[filters.continent][filters.country] || [] : [];

    const handleReset = () => {
        onFiltersChange({
            title: '',
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
        });
        onReset();
    };

    return (
        <Card className="p-6 border border-border bg-card sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
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

                {/* Matching Options Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                    {/* Flexible Matching Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <Label htmlFor="enableFlexibleMatch" className="text-body-sm font-medium text-foreground cursor-pointer">
                                Flexible Matching
                            </Label>
                            <p className="text-[10px] text-muted-foreground">Show jobs even if you're overqualified</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            id="enableFlexibleMatch"
                            aria-checked={filters.enableFlexibleMatch}
                            onClick={() => onFiltersChange({ ...filters, enableFlexibleMatch: !filters.enableFlexibleMatch })}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${filters.enableFlexibleMatch ? 'bg-primary' : 'bg-muted'
                                }`}
                        >
                            <span
                                className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${filters.enableFlexibleMatch ? 'translate-x-4' : 'translate-x-0.5'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Partial Matching Toggle */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex-1">
                            <Label htmlFor="enablePartialMatch" className="text-body-sm font-medium text-foreground cursor-pointer">
                                Partial Matching
                            </Label>
                            <p className="text-[10px] text-muted-foreground">Show jobs with incomplete match</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            id="enablePartialMatch"
                            aria-checked={filters.enablePartialMatch}
                            onClick={() => onFiltersChange({ ...filters, enablePartialMatch: !filters.enablePartialMatch })}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${filters.enablePartialMatch ? 'bg-accent' : 'bg-muted'
                                }`}
                        >
                            <span
                                className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${filters.enablePartialMatch ? 'translate-x-4' : 'translate-x-0.5'
                                    }`}
                            />
                        </button>
                    </div>

                    {filters.enablePartialMatch && (
                        <div className="space-y-2 pt-2">
                            <Label className="text-body-sm font-medium text-foreground block">
                                Min Match Score: {filters.minMatchThreshold}%
                            </Label>
                            <Slider
                                value={[filters.minMatchThreshold]}
                                onValueChange={(val) => onFiltersChange({ ...filters, minMatchThreshold: val[0] })}
                                min={10}
                                max={90}
                                step={5}
                                className="mt-2"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Lower threshold shows more jobs with partial requirements
                            </p>
                        </div>
                    )}
                </div>

                {/* Job Title - Second position */}
                <div className="pt-4 border-t border-border">
                    <Label className="text-body-sm font-medium text-foreground mb-2 block">
                        Job Title
                    </Label>
                    <Input
                        placeholder="Search title..."
                        value={filters.title}
                        onChange={(e) => onFiltersChange({ ...filters, title: e.target.value })}
                        className="bg-background text-foreground border-border"
                    />
                </div>

                {/* Advanced Filters - Everything else */}
                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-between p-0 h-auto font-medium text-primary hover:bg-transparent hover:text-primary-hover"
                        >
                            <span className="flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Advanced Filters
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 pt-6">
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

                        {/* Location */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label className="text-body-sm font-medium text-foreground mb-2 block">
                                    Continent
                                </Label>
                                <Select
                                    value={filters.continent}
                                    onValueChange={(val) => onFiltersChange({ ...filters, continent: val, country: '', city: '' })}
                                >
                                    <SelectTrigger className="bg-background text-foreground border-border">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Continents</SelectItem>
                                        {continents.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {filters.continent && filters.continent !== 'all' && (
                                <div>
                                    <Label className="text-body-sm font-medium text-foreground mb-2 block">
                                        Country
                                    </Label>
                                    <Select
                                        value={filters.country}
                                        onValueChange={(val) => onFiltersChange({ ...filters, country: val, city: '' })}
                                    >
                                        <SelectTrigger className="bg-background text-foreground border-border">
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Countries</SelectItem>
                                            {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {filters.country && filters.country !== 'all' && cities.length > 0 && (
                                <div>
                                    <Label className="text-body-sm font-medium text-foreground mb-2 block">
                                        City
                                    </Label>
                                    <Select
                                        value={filters.city}
                                        onValueChange={(val) => onFiltersChange({ ...filters, city: val })}
                                    >
                                        <SelectTrigger className="bg-background text-foreground border-border">
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Cities</SelectItem>
                                            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

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

                        {/* Skills */}
                        <div>
                            <Label className="text-body-sm font-medium text-foreground mb-2 block">
                                Skills
                            </Label>
                            <div className="flex space-x-2 mb-3">
                                <Input
                                    placeholder="Add skill..."
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
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

                        {/* Qualifications */}
                        <div>
                            <Label className="text-body-sm font-medium text-foreground mb-2 block">
                                Qualifications
                            </Label>
                            <div className="flex space-x-2 mb-3">
                                <Input
                                    placeholder="Add qualification..."
                                    value={qualificationInput}
                                    onChange={(e) => setQualificationInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddQualification()}
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
                                <Input
                                    placeholder="Add language..."
                                    value={languageInput}
                                    onChange={(e) => setLanguageInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
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

                        {/* Driving Licenses */}
                        <div>
                            <Label className="text-body-sm font-medium text-foreground mb-3 block">
                                Required Driving Licenses
                            </Label>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-caption text-muted-foreground mb-2 block">General Licenses</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {['B', 'A', 'BE', 'AM'].map((lic) => (
                                            <button
                                                key={lic}
                                                type="button"
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
                                </div>

                                <div>
                                    <Label className="text-caption text-muted-foreground mb-2 block">Truck Licenses</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {['C', 'CE', 'C1', 'C1E'].map((lic) => (
                                            <button
                                                key={lic}
                                                type="button"
                                                onClick={() => {
                                                    const current = filters.drivingLicenses || [];
                                                    const updated = current.includes(lic)
                                                        ? current.filter(l => l !== lic)
                                                        : [...current, lic];
                                                    onFiltersChange({ ...filters, drivingLicenses: updated });
                                                }}
                                                className={`px-3 py-1 rounded-full text-body-sm font-medium transition-all ${(filters.drivingLicenses || []).includes(lic)
                                                    ? 'bg-warning text-warning-foreground border border-warning/30'
                                                    : 'bg-muted text-foreground hover:bg-muted/80'
                                                    }`}
                                            >
                                                {lic}
                                            </button>
                                        ))}
                                    </div>
                                </div>
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
                                        onClick={() => {
                                            const current = filters.contractTerms || [];
                                            const updated = current.includes(term)
                                                ? current.filter(t => t !== term)
                                                : [...current, term];
                                            onFiltersChange({ ...filters, contractTerms: updated });
                                        }}
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
                            <button
                                type="button"
                                role="switch"
                                id="homeOffice"
                                aria-checked={filters.homeOffice}
                                onClick={() => onFiltersChange({ ...filters, homeOffice: !filters.homeOffice })}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${filters.homeOffice ? 'bg-primary' : 'bg-muted'
                                    }`}
                            >
                                <span
                                    className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${filters.homeOffice ? 'translate-x-4' : 'translate-x-0.5'
                                        }`}
                                />
                            </button>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </Card>
    );
};

export default JobFilters;
