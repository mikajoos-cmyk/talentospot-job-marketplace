import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Search, MapPin, Briefcase, ChevronDown,
    SlidersHorizontal, Plus, X, Globe,
    Languages, GraduationCap, Clock, Coins, Umbrella,
    Sparkles, Truck, Car, ArrowRight, User
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AutocompleteInput } from '@/components/shared/AutocompleteInput';
import { Separator } from '@/components/ui/separator';
import { locationData, refugeeOriginCountries } from '@/data/locationData';
import { getLanguageLevelOptions } from '@/utils/language-levels';

const MainHeroFilter = () => {
    const navigate = useNavigate();
    const [searchMode, setSearchMode] = useState<'candidates' | 'jobs'>('candidates');
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [filters, setFilters] = useState({
        // Common
        jobTitle: '',
        location: '',
        radius: 50,
        sector: 'any',
        continent: 'any',
        country: 'any',
        city: 'any',

        // Candidate specific
        talentStatus: [] as string[],
        isRefugee: false,
        originCountry: '',
        skills: [] as string[],
        qualifications: [] as string[],
        languages: [] as { name: string, level: string }[],
        careerLevel: [] as string[],
        yearsOfExperience: [0, 30] as [number, number],
        noticePeriod: [] as string[],
        jobTypes: [] as string[],
        contractTerms: [] as string[],
        homeOffice: [] as string[],
        salaryRange: [20000, 200000] as [number, number],
        bonusRange: [0, 100000] as [number, number],
        vacationDays: [0, 50] as [number, number],
        travelWillingness: [0, 100] as [number, number],
        customTags: [] as string[],
        preferredWorkLocations: [] as { continent: string, country: string, city: string, radius: number }[],

        // Job Search specific
        benefits: [] as string[],
        contractDuration: '',
        minVacationDays: 0,
        experienceYears: null as number | null,

        // Driving Licenses
        hasPkw: null as boolean | null,
        hasLkw: null as boolean | null,
        pkwClasses: [] as string[],
        lkwClasses: [] as string[],
        customPkw: '',
        customLkw: '',

        // Matching preferences
        enablePartialMatch: false,
        minMatchThreshold: 50,
        enableFlexibleMatch: false,
    });

    const [skillInput, setSkillInput] = useState('');
    const [qualificationInput, setQualificationInput] = useState('');
    const [languageInput, setLanguageInput] = useState('');
    const [languageLevel, setLanguageLevel] = useState('B2');
    const [customPkwInput, setCustomPkwInput] = useState('');
    const [customLkwInput, setCustomLkwInput] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [benefitInput, setBenefitInput] = useState('');

    const [suggestions, setSuggestions] = useState({
        jobTitles: [] as string[],
        sectors: [] as string[],
    });

    // Mocked suggestions for now, in a real app these would come from the service
    useEffect(() => {
        setSuggestions({
            jobTitles: ['Software Engineer', 'Project Manager', 'Sales Specialist', 'Truck Driver', 'Nurse'],
            sectors: ['IT', 'Healthcare', 'Finance', 'Engineering', 'Marketing', 'Sales', 'Education', 'Manufacturing', 'Retail', 'Logistics', 'Construction', 'Other'],
        });
    }, []);

    const handleSearch = () => {
        const searchParams = new URLSearchParams();
        if (filters.jobTitle) searchParams.set('title', filters.jobTitle);
        if (filters.location) searchParams.set('location', filters.location);
        if (filters.radius) searchParams.set('radius', filters.radius.toString());
        if (filters.sector !== 'any') searchParams.set('sector', filters.sector);

        // Location hierarchy
        if (filters.continent !== 'any') searchParams.set('continent', filters.continent);
        if (filters.country !== 'any') searchParams.set('country', filters.country);
        if (filters.city !== 'any') searchParams.set('city', filters.city);

        if (searchMode === 'candidates') {
            // Mapping landing page filters to candidate search params
            if (filters.talentStatus.length > 0) searchParams.set('status', filters.talentStatus.join(','));
            if (filters.isRefugee) searchParams.set('isRefugee', 'true');
            if (filters.originCountry) searchParams.set('originCountry', filters.originCountry);
            if (filters.skills.length > 0) searchParams.set('skills', filters.skills.join(','));
            if (filters.qualifications.length > 0) searchParams.set('qualifications', filters.qualifications.join(','));
            if (filters.languages.length > 0) searchParams.set('languages', JSON.stringify(filters.languages));
            if (filters.careerLevel.length > 0) searchParams.set('careerLevel', filters.careerLevel.join(','));

            searchParams.set('salaryMin', filters.salaryRange[0].toString());
            searchParams.set('salaryMax', filters.salaryRange[1].toString());
            searchParams.set('bonusMin', filters.bonusRange[0].toString());
            searchParams.set('bonusMax', filters.bonusRange[1].toString());

            if (filters.yearsOfExperience[0] > 0) searchParams.set('expMin', filters.yearsOfExperience[0].toString());
            if (filters.yearsOfExperience[1] < 30) searchParams.set('expMax', filters.yearsOfExperience[1].toString());

            if (filters.jobTypes.length > 0) searchParams.set('jobTypes', filters.jobTypes.join(','));
            if (filters.contractTerms.length > 0) searchParams.set('contractTerms', filters.contractTerms.join(','));
            if (filters.homeOffice.length > 0) searchParams.set('homeOffice', filters.homeOffice.join(','));

            if (filters.noticePeriod.length > 0) searchParams.set('noticePeriod', filters.noticePeriod.join(','));
            searchParams.set('travelMin', filters.travelWillingness[0].toString());
            searchParams.set('travelMax', filters.travelWillingness[1].toString());
            if (filters.vacationDays[0] > 0) searchParams.set('vacationMin', filters.vacationDays[0].toString());
            if (filters.vacationDays[1] < 50) searchParams.set('vacationMax', filters.vacationDays[1].toString());
            if (filters.customTags.length > 0) searchParams.set('tags', filters.customTags.join(','));

            // Driving Licenses
            if (filters.hasPkw !== null) searchParams.set('hasPkw', filters.hasPkw.toString());
            const allPkw = [...filters.pkwClasses, ...(filters.customPkw ? [filters.customPkw] : [])];
            if (allPkw.length > 0) searchParams.set('pkwClasses', allPkw.join(','));

            if (filters.hasLkw !== null) searchParams.set('hasLkw', filters.hasLkw.toString());
            const allLkw = [...filters.lkwClasses, ...(filters.customLkw ? [filters.customLkw] : [])];
            if (allLkw.length > 0) searchParams.set('lkwClasses', allLkw.join(','));

            if (filters.enablePartialMatch) {
                searchParams.set('partialMatch', 'true');
                searchParams.set('threshold', filters.minMatchThreshold.toString());
            }

            navigate(`/candidates?${searchParams.toString()}`);
        } else {
            // Mapping landing page filters to job search params
            if (filters.jobTypes.length > 0) searchParams.set('jobTypes', filters.jobTypes.join(','));
            if (filters.contractTerms.length > 0) searchParams.set('contractTerms', filters.contractTerms.join(','));
            if (filters.homeOffice.length > 0) searchParams.set('homeOffice', filters.homeOffice.join(','));

            searchParams.set('salaryMin', filters.salaryRange[0].toString());
            searchParams.set('salaryMax', filters.salaryRange[1].toString());
            searchParams.set('bonusMin', filters.bonusRange[0].toString());
            searchParams.set('vacationMin', filters.vacationDays[0].toString());

            if (filters.experienceYears !== null) searchParams.set('expMin', filters.experienceYears.toString());
            if (filters.benefits.length > 0) searchParams.set('benefits', filters.benefits.join(','));

            // Shared Driving Licenses for Jobs too
            if (filters.hasPkw !== null) searchParams.set('hasPkw', filters.hasPkw.toString());
            const allPkw = [...filters.pkwClasses, ...(filters.customPkw ? [filters.customPkw] : [])];
            if (allPkw.length > 0) searchParams.set('pkwClasses', allPkw.join(','));

            if (filters.hasLkw !== null) searchParams.set('hasLkw', filters.hasLkw.toString());
            const allLkw = [...filters.lkwClasses, ...(filters.customLkw ? [filters.customLkw] : [])];
            if (allLkw.length > 0) searchParams.set('lkwClasses', allLkw.join(','));

            if (filters.enableFlexibleMatch) searchParams.set('flexibleMatch', 'true');

            navigate(`/jobs?${searchParams.toString()}`);
        }
    };

    const toggleFilterItem = (category: keyof typeof filters, item: string) => {
        const current = filters[category] as string[];
        const updated = current.includes(item)
            ? current.filter(i => i !== item)
            : [...current, item];
        setFilters({ ...filters, [category]: updated });
    };

    const handleAddSkill = () => {
        if (skillInput.trim() && !filters.skills.includes(skillInput.trim())) {
            setFilters({
                ...filters,
                skills: [...filters.skills, skillInput.trim()],
            });
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setFilters({
            ...filters,
            skills: filters.skills.filter(s => s !== skill),
        });
    };

    const handleAddQualification = () => {
        if (qualificationInput.trim() && !filters.qualifications.includes(qualificationInput.trim())) {
            setFilters({
                ...filters,
                qualifications: [...filters.qualifications, qualificationInput.trim()],
            });
            setQualificationInput('');
        }
    };

    const handleRemoveQualification = (qualification: string) => {
        setFilters({
            ...filters,
            qualifications: filters.qualifications.filter(q => q !== qualification),
        });
    };

    const handleAddLanguage = () => {
        const langExists = filters.languages.some(l => l.name.toLowerCase() === languageInput.trim().toLowerCase());
        if (languageInput.trim() && !langExists) {
            setFilters({
                ...filters,
                languages: [...filters.languages, { name: languageInput.trim(), level: languageLevel }],
            });
            setLanguageInput('');
        }
    };

    const handleRemoveLanguage = (name: string) => {
        setFilters({
            ...filters,
            languages: filters.languages.filter(l => l.name !== name),
        });
    };

    const togglePkwClass = (cls: string) => {
        setFilters(prev => ({
            ...prev,
            pkwClasses: prev.pkwClasses.includes(cls)
                ? prev.pkwClasses.filter(c => c !== cls)
                : [...prev.pkwClasses, cls]
        }));
    };

    const toggleLkwClass = (cls: string) => {
        setFilters(prev => ({
            ...prev,
            lkwClasses: prev.lkwClasses.includes(cls)
                ? prev.lkwClasses.filter(c => c !== cls)
                : [...prev.lkwClasses, cls]
        }));
    };

    const handleAddCustomPkw = () => {
        if (customPkwInput.trim()) {
            setFilters({ ...filters, customPkw: customPkwInput.trim() });
            setCustomPkwInput('');
        }
    };

    const handleAddCustomLkw = () => {
        if (customLkwInput.trim()) {
            setFilters({ ...filters, customLkw: customLkwInput.trim() });
            setCustomLkwInput('');
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !filters.customTags.includes(tagInput.trim())) {
            setFilters({
                ...filters,
                customTags: [...filters.customTags, tagInput.trim()],
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFilters({
            ...filters,
            customTags: filters.customTags.filter(t => t !== tag),
        });
    };

    const handleAddBenefit = () => {
        if (benefitInput.trim() && !filters.benefits.includes(benefitInput.trim())) {
            setFilters({
                ...filters,
                benefits: [...filters.benefits, benefitInput.trim()],
            });
            setBenefitInput('');
        }
    };

    const handleRemoveBenefit = (benefit: string) => {
        setFilters({
            ...filters,
            benefits: filters.benefits.filter(b => b !== benefit),
        });
    };

    // Location helpers
    const continents = Object.keys(locationData);
    const countries = filters.continent !== 'any' ? Object.keys(locationData[filters.continent] || {}) : [];
    const cities = (filters.continent !== 'any' && filters.country !== 'any')
        ? locationData[filters.continent]?.[filters.country] || []
        : [];

    return (
        <div className="w-full max-w-5xl mx-auto px-4 relative z-10">
            {/* Search Mode Toggle */}
            <div className="flex justify-center mb-6">
                <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-primary/10 flex gap-1">
                    <button
                        onClick={() => setSearchMode('candidates')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${searchMode === 'candidates'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-muted-foreground hover:text-primary'
                            }`}
                    >
                        Search Candidates
                    </button>
                    <button
                        onClick={() => setSearchMode('jobs')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${searchMode === 'jobs'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-muted-foreground hover:text-primary'
                            }`}
                    >
                        Search Jobs
                    </button>
                </div>
            </div>

            <Card className="p-3 md:p-6 shadow-2xl border-none bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden">
                {/* Main Search Bar */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    {/* Job Title */}
                    <div className={`${searchMode === 'candidates' ? 'md:col-span-3' : 'md:col-span-4'} space-y-1.5 p-2`}>
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Job Title</Label>
                        <AutocompleteInput
                            category="job_titles"
                            placeholder="Work title, skills..."
                            value={filters.jobTitle}
                            onChange={(val) => setFilters({ ...filters, jobTitle: val })}
                            inputClassName="h-12 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary text-base rounded-xl"
                            icon={<Search className="w-4 h-4 text-primary" />}
                        />
                    </div>

                    {/* Location (Simplified for main bar) */}
                    <div className={`${searchMode === 'candidates' ? 'md:col-span-3' : 'md:col-span-4'} space-y-1.5 p-2`}>
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Location / Work Preference</Label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                            <Input
                                placeholder="City or ZIP"
                                className="pl-11 h-12 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary text-base rounded-xl"
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Sector */}
                    <div className="md:col-span-2 space-y-1.5 p-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Sector</Label>
                        <Select value={filters.sector} onValueChange={(val) => setFilters({ ...filters, sector: val })}>
                            <SelectTrigger className="h-12 bg-muted/40 border-none focus:ring-1 focus:ring-primary text-base shadow-none rounded-xl">
                                <div className="flex items-center truncate">
                                    <Briefcase className="w-4 h-4 mr-3 text-primary shrink-0" />
                                    <SelectValue placeholder="Sector" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any Sector</SelectItem>
                                {suggestions.sectors.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Hero Quick Filter Slot - Only for Candidates */}
                    {searchMode === 'candidates' && (
                        <div className="md:col-span-2 space-y-1.5 p-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Talent Status</Label>
                            <Select
                                value={filters.talentStatus.length === 1 ? filters.talentStatus[0] : 'any'}
                                onValueChange={(val) => setFilters({ ...filters, talentStatus: val === 'any' ? [] : [val] })}
                            >
                                <SelectTrigger className="h-12 bg-muted/40 border-none focus:ring-1 focus:ring-primary text-base shadow-none rounded-xl">
                                    <div className="flex items-center truncate">
                                        <User className="w-4 h-4 mr-3 text-primary shrink-0" />
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">Any Status</SelectItem>
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
                    )}

                    {/* Search Button */}
                    <div className="md:col-span-2 p-2">
                        <Button
                            onClick={handleSearch}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Search
                            <Search className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Collapsible Advanced Filters */}
                <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="mt-2">
                    <div className="flex items-center justify-between px-2 py-1">
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5 font-medium flex items-center gap-1.5">
                                <SlidersHorizontal className="w-4 h-4" />
                                {isAdvancedOpen ? 'Hide' : 'Show'} All Filters
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                            </Button>
                        </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="px-4 py-8 border-t border-border mt-2 space-y-12 animate-in slide-in-from-top duration-300 overflow-visible">

                        {/* 1. Precise Location Hierarchy */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Precise Location</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Continent</Label>
                                    <Select value={filters.continent} onValueChange={(val) => setFilters({ ...filters, continent: val, country: 'any', city: 'any' })}>
                                        <SelectTrigger className="h-10 bg-muted/40 border-none rounded-lg"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">All Continents</SelectItem>
                                            {continents.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Country</Label>
                                    <Select
                                        value={filters.country}
                                        onValueChange={(val) => setFilters({ ...filters, country: val, city: 'any' })}
                                        disabled={filters.continent === 'any'}
                                    >
                                        <SelectTrigger className="h-10 bg-muted/40 border-none rounded-lg"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">All Countries</SelectItem>
                                            {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase">City</Label>
                                    <Select
                                        value={filters.city}
                                        onValueChange={(val) => setFilters({ ...filters, city: val })}
                                        disabled={filters.country === 'any'}
                                    >
                                        <SelectTrigger className="h-10 bg-muted/40 border-none rounded-lg"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">All Cities</SelectItem>
                                            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">Radius Search</Label>
                                        <span className="text-xs font-bold text-primary">{filters.radius} km</span>
                                    </div>
                                    <Slider
                                        value={[filters.radius]}
                                        onValueChange={(val) => setFilters({ ...filters, radius: val[0] })}
                                        max={200}
                                        step={5}
                                    />
                                </div>
                            </div>
                        </section>

                        <Separator className="opacity-50" />

                        {/* 2. Candidate Search Specific Filter Areas */}
                        {searchMode === 'candidates' && (
                            <>
                                <section className="space-y-8 animate-in fade-in duration-500">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                                            <GraduationCap className="w-4 h-4 text-info" />
                                        </div>
                                        <h3 className="font-bold text-lg">Candidate Profile & Requirements</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* Left Column: Status & Experience */}
                                        <div className="space-y-6">
                                            {/* Talent Status */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Talent Status</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Unemployed', 'Employed', 'Trainee', 'Apprentice', 'Pupil', 'Student', 'Freelancer', 'Retired'].map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => toggleFilterItem('talentStatus', status)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filters.talentStatus.includes(status)
                                                                ? 'bg-primary border-primary text-white shadow-sm'
                                                                : 'bg-white border-border text-foreground hover:border-primary/50'
                                                                }`}
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Career Level */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Career Level</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['entry', 'junior', 'mid', 'senior', 'lead', 'executive'].map(level => (
                                                        <button
                                                            key={level}
                                                            onClick={() => toggleFilterItem('careerLevel', level)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filters.careerLevel.includes(level)
                                                                ? 'bg-info border-info text-white shadow-sm'
                                                                : 'bg-white border-border text-foreground hover:border-info/50'
                                                                }`}
                                                        >
                                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Experience Slider */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Experience (Years)</Label>
                                                    <span className="text-xs font-bold text-info">{filters.yearsOfExperience[0]} - {filters.yearsOfExperience[1]}</span>
                                                </div>
                                                <Slider
                                                    value={filters.yearsOfExperience}
                                                    onValueChange={(val) => setFilters({ ...filters, yearsOfExperience: val as [number, number] })}
                                                    max={30}
                                                    step={1}
                                                />
                                            </div>

                                            {/* Refugee Status */}
                                            <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <Label className="text-sm font-bold flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-accent" />
                                                        Refugee / Immigrant Filter
                                                    </Label>
                                                    <p className="text-[10px] text-muted-foreground">Search specifically for refugee profiles</p>
                                                </div>
                                                <Switch
                                                    checked={filters.isRefugee}
                                                    onCheckedChange={(checked) => setFilters({ ...filters, isRefugee: checked })}
                                                />
                                            </div>

                                            {filters.isRefugee && (
                                                <div className="space-y-1.5 animate-in fade-in slide-in-from-left duration-300">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Country of Origin</Label>
                                                    <Select value={filters.originCountry} onValueChange={(val) => setFilters({ ...filters, originCountry: val })}>
                                                        <SelectTrigger className="h-10 bg-muted/40 border-none rounded-lg"><SelectValue placeholder="Select Country" /></SelectTrigger>
                                                        <SelectContent>
                                                            {refugeeOriginCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            {/* Travel Willingness */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Travel Willingness</Label>
                                                    <span className="text-xs font-bold text-info">{filters.travelWillingness[0]}% - {filters.travelWillingness[1]}%</span>
                                                </div>
                                                <Slider
                                                    value={filters.travelWillingness}
                                                    onValueChange={(val) => setFilters({ ...filters, travelWillingness: val as [number, number] })}
                                                    max={100}
                                                    step={5}
                                                />
                                            </div>

                                            {/* Notice Period */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Notice Period</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['immediately', '1-month', '2-months', '3-months', '6-months'].map(period => (
                                                        <button
                                                            key={period}
                                                            onClick={() => toggleFilterItem('noticePeriod', period)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filters.noticePeriod.includes(period)
                                                                ? 'bg-warning border-warning text-white shadow-sm'
                                                                : 'bg-white border-border text-foreground hover:border-warning/50'
                                                                }`}
                                                        >
                                                            {period.replace('-', ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Custom Tags */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Additional Conditions (Tags)</Label>
                                                <div className="flex gap-2">
                                                    <AutocompleteInput
                                                        category="tags"
                                                        placeholder="e.g. Barrier-free, Pets..."
                                                        value={tagInput}
                                                        onChange={setTagInput}
                                                        onKeyPress={(e: any) => e.key === 'Enter' && handleAddTag()}
                                                        className="h-10 flex-1"
                                                    />
                                                    <Button size="icon" variant="outline" onClick={handleAddTag} className="h-10 w-10 shrink-0"><Plus className="w-4 h-4" /></Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {filters.customTags.map(t => (
                                                        <span key={t} className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-md flex items-center gap-1.5 border border-secondary/20">
                                                            {t} <X className="w-3 h-3 cursor-pointer hover:text-secondary/70" onClick={() => handleRemoveTag(t)} />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Skills, Qualifications, Languages */}
                                        <div className="space-y-6">
                                            {/* Skills Tags */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Skills</Label>
                                                <div className="flex gap-2">
                                                    <AutocompleteInput
                                                        category="skills"
                                                        placeholder="Add skill..."
                                                        value={skillInput}
                                                        onChange={setSkillInput}
                                                        onKeyPress={(e: any) => e.key === 'Enter' && handleAddSkill()}
                                                        className="h-10 flex-1"
                                                    />
                                                    <Button size="icon" variant="secondary" onClick={handleAddSkill} className="h-10 w-10 shrink-0"><Plus className="w-4 h-4" /></Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {filters.skills.map(s => (
                                                        <span key={s} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md flex items-center gap-1.5 border border-primary/20">
                                                            {s} <X className="w-3 h-3 cursor-pointer hover:text-primary/70" onClick={() => handleRemoveSkill(s)} />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Qualifications */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Qualifications</Label>
                                                <div className="flex gap-2">
                                                    <AutocompleteInput
                                                        category="qualifications"
                                                        placeholder="Add qualification..."
                                                        value={qualificationInput}
                                                        onChange={setQualificationInput}
                                                        onKeyPress={(e: any) => e.key === 'Enter' && handleAddQualification()}
                                                        className="h-10 flex-1"
                                                    />
                                                    <Button size="icon" variant="secondary" onClick={handleAddQualification} className="h-10 w-10 shrink-0"><Plus className="w-4 h-4" /></Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {filters.qualifications.map(q => (
                                                        <span key={q} className="px-2.5 py-1 bg-accent/10 text-accent text-xs font-bold rounded-md flex items-center gap-1.5 border border-accent/20">
                                                            {q} <X className="w-3 h-3 cursor-pointer hover:text-accent/70" onClick={() => handleRemoveQualification(q)} />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Languages */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                    <Languages className="w-3 h-3" />
                                                    Languages
                                                </Label>
                                                <div className="flex gap-2 flex-wrap">
                                                    <AutocompleteInput
                                                        category="languages"
                                                        placeholder="Language..."
                                                        value={languageInput}
                                                        onChange={setLanguageInput}
                                                        className="h-10 w-full sm:flex-1"
                                                    />
                                                    <Select value={languageLevel} onValueChange={setLanguageLevel}>
                                                        <SelectTrigger className="h-10 w-24"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {getLanguageLevelOptions(true).map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button size="icon" variant="secondary" onClick={handleAddLanguage} className="h-10 w-10 shrink-0"><Plus className="w-4 h-4" /></Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {filters.languages.map(l => (
                                                        <span key={l.name} className="px-2.5 py-1 bg-info/10 text-info text-xs font-bold rounded-md flex items-center gap-1.5 border border-info/20">
                                                            {l.name} ({l.level}) <X className="w-3 h-3 cursor-pointer hover:text-info/70" onClick={() => handleRemoveLanguage(l.name)} />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <Separator className="opacity-50" />
                            </>
                        )}

                        {/* 3. Job Search Specific Filter Areas */}
                        {searchMode === 'jobs' && (
                            <>
                                <section className="space-y-8 animate-in fade-in duration-500">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-success" />
                                        </div>
                                        <h3 className="font-bold text-lg">Conditions & Expectations</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* Left: Job Types & Terms */}
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Job Types</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['full-time', 'part-time', 'contract', 'freelance', 'internship', 'traineeship'].map(t => (
                                                        <button
                                                            key={t}
                                                            onClick={() => toggleFilterItem('jobTypes', t)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filters.jobTypes.includes(t)
                                                                ? 'bg-success border-success text-white shadow-sm'
                                                                : 'bg-white border-border text-foreground hover:border-success/50'
                                                                }`}
                                                        >
                                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Contract Term</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['unlimited', 'temporary', 'permanent'].map(term => (
                                                        <button
                                                            key={term}
                                                            onClick={() => toggleFilterItem('contractTerms', term)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filters.contractTerms.includes(term)
                                                                ? 'bg-warning border-warning text-white shadow-sm'
                                                                : 'bg-white border-border text-foreground hover:border-warning/50'
                                                                }`}
                                                        >
                                                            {term.charAt(0).toUpperCase() + term.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Home Office Preference</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['yes', 'no', 'hybrid'].map(pref => (
                                                        <button
                                                            key={pref}
                                                            onClick={() => toggleFilterItem('homeOffice', pref)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filters.homeOffice.includes(pref)
                                                                ? 'bg-primary border-primary text-white shadow-sm'
                                                                : 'bg-white border-border text-foreground hover:border-primary/50'
                                                                }`}
                                                        >
                                                            {pref.charAt(0).toUpperCase() + pref.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Salary & Vacation */}
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                        <Coins className="w-3 h-3" />
                                                        Salary Range (€ / Year)
                                                    </Label>
                                                    <span className="text-xs font-bold text-success">{filters.salaryRange[0].toLocaleString()} - {filters.salaryRange[1].toLocaleString()}</span>
                                                </div>
                                                <Slider
                                                    value={filters.salaryRange}
                                                    onValueChange={(val) => setFilters({ ...filters, salaryRange: val as [number, number] })}
                                                    min={20000}
                                                    max={250000}
                                                    step={5000}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3" />
                                                        Entry Bonus (€)
                                                    </Label>
                                                    <span className="text-xs font-bold text-success">{filters.bonusRange[0].toLocaleString()} - {filters.bonusRange[1].toLocaleString()}</span>
                                                </div>
                                                <Slider
                                                    value={filters.bonusRange}
                                                    onValueChange={(val) => setFilters({ ...filters, bonusRange: val as [number, number] })}
                                                    max={100000}
                                                    step={1000}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                        <Umbrella className="w-3 h-3" />
                                                        Vacation Days
                                                    </Label>
                                                    <span className="text-xs font-bold text-success">{filters.vacationDays[0]} - {filters.vacationDays[1]}</span>
                                                </div>
                                                <Slider
                                                    value={filters.vacationDays}
                                                    onValueChange={(val) => setFilters({ ...filters, vacationDays: val as [number, number] })}
                                                    max={50}
                                                    step={1}
                                                />
                                            </div>

                                            {/* Experience Requirement */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Minimum Experience (Years)</Label>
                                                <Select value={filters.experienceYears?.toString() || 'any'} onValueChange={(val) => setFilters({ ...filters, experienceYears: val === 'any' ? null : parseInt(val) })}>
                                                    <SelectTrigger className="h-10 bg-white border-border rounded-lg"><SelectValue placeholder="Any" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="any">Any Experience</SelectItem>
                                                        {[0, 1, 2, 3, 5, 10].map(y => <SelectItem key={y} value={y.toString()}>{y}+ Years</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Benefits */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Job Benefits</Label>
                                                <div className="flex gap-2">
                                                    <AutocompleteInput
                                                        category="tags"
                                                        placeholder="Add benefit..."
                                                        value={benefitInput}
                                                        onChange={setBenefitInput}
                                                        onKeyPress={(e: any) => e.key === 'Enter' && handleAddBenefit()}
                                                        className="h-10 flex-1"
                                                    />
                                                    <Button size="icon" variant="outline" onClick={handleAddBenefit} className="h-10 w-10 shrink-0"><Plus className="w-4 h-4" /></Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {filters.benefits.map(b => (
                                                        <span key={b} className="px-2.5 py-1 bg-success/10 text-success text-xs font-bold rounded-md flex items-center gap-1.5 border border-success/20">
                                                            {b} <X className="w-3 h-3 cursor-pointer hover:text-success/70" onClick={() => handleRemoveBenefit(b)} />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <Separator className="opacity-50" />
                            </>
                        )}

                        <Separator className="opacity-50" />

                        {/* 4. Refined Driving Licenses Logic */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                                    <Car className="w-4 h-4 text-warning" />
                                </div>
                                <h3 className="font-bold text-lg">Driving Licenses</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* PKW (Car) Section */}
                                <div className="space-y-6 p-6 bg-muted/20 rounded-2xl border border-border/40 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Car className="w-20 h-20" />
                                    </div>

                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-xl flex items-center gap-2">
                                                PKW <span className="text-muted-foreground text-sm font-normal">(Car)</span>
                                            </h4>
                                            <p className="text-xs text-muted-foreground">Standard passenger vehicle licenses</p>
                                        </div>
                                        <div className="flex gap-2 bg-white p-1 rounded-full shadow-inner border border-border/20">
                                            <Button
                                                size="sm"
                                                variant={filters.hasPkw === true ? 'default' : 'ghost'}
                                                onClick={() => setFilters({ ...filters, hasPkw: true })}
                                                className={`rounded-full px-4 h-9 font-bold ${filters.hasPkw === true ? 'shadow-md' : 'text-muted-foreground'}`}
                                            >
                                                YES
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={filters.hasPkw === false ? 'default' : 'ghost'}
                                                onClick={() => setFilters({ ...filters, hasPkw: false, pkwClasses: [], customPkw: '' })}
                                                className={`rounded-full px-4 h-9 font-bold ${filters.hasPkw === false ? 'shadow-md' : 'text-muted-foreground'}`}
                                            >
                                                NO
                                            </Button>
                                        </div>
                                    </div>

                                    {filters.hasPkw === true && (
                                        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300 relative z-10">
                                            <Separator className="bg-border/60" />
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Common Classes</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['B', 'BE', 'B96', 'AM', 'L', 'T'].map(cls => (
                                                        <button
                                                            key={cls}
                                                            onClick={() => togglePkwClass(cls)}
                                                            className={`w-12 h-12 rounded-xl text-sm font-black transition-all border-2 flex items-center justify-center ${filters.pkwClasses.includes(cls)
                                                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                                                                : 'bg-white border-border/60 text-foreground hover:border-primary/40'
                                                                }`}
                                                        >
                                                            {cls}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Custom Option</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Add specific class..."
                                                        value={customPkwInput}
                                                        onChange={(e) => setCustomPkwInput(e.target.value)}
                                                        className="h-10 bg-white"
                                                    />
                                                    <Button size="icon" variant="ghost" className="border-dashed border-2 border-border h-10 w-10 shrink-0" onClick={handleAddCustomPkw}>
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                {filters.customPkw && (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary text-xs font-bold rounded-lg border border-primary/20">
                                                        {filters.customPkw} <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, customPkw: '' })} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* LKW (Truck) Section */}
                                <div className="space-y-6 p-6 bg-muted/20 rounded-2xl border border-border/40 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Truck className="w-20 h-20" />
                                    </div>

                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-xl flex items-center gap-2">
                                                LKW <span className="text-muted-foreground text-sm font-normal">(Truck)</span>
                                            </h4>
                                            <p className="text-xs text-muted-foreground">Commercial heavy vehicle licenses</p>
                                        </div>
                                        <div className="flex gap-2 bg-white p-1 rounded-full shadow-inner border border-border/20">
                                            <Button
                                                size="sm"
                                                variant={filters.hasLkw === true ? 'secondary' : 'ghost'}
                                                onClick={() => setFilters({ ...filters, hasLkw: true })}
                                                className={`rounded-full px-4 h-9 font-bold ${filters.hasLkw === true ? 'shadow-md' : 'text-muted-foreground'}`}
                                            >
                                                YES
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={filters.hasLkw === false ? 'secondary' : 'ghost'}
                                                onClick={() => setFilters({ ...filters, hasLkw: false, lkwClasses: [], customLkw: '' })}
                                                className={`rounded-full px-4 h-9 font-bold ${filters.hasLkw === false ? 'shadow-md' : 'text-muted-foreground'}`}
                                            >
                                                NO
                                            </Button>
                                        </div>
                                    </div>

                                    {filters.hasLkw === true && (
                                        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300 relative z-10">
                                            <Separator className="bg-border/60" />
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Common Classes</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['C', 'CE', 'C1', 'C1E', 'D', 'DE'].map(cls => (
                                                        <button
                                                            key={cls}
                                                            onClick={() => toggleLkwClass(cls)}
                                                            className={`w-12 h-12 rounded-xl text-sm font-black transition-all border-2 flex items-center justify-center ${filters.lkwClasses.includes(cls)
                                                                ? 'bg-secondary border-secondary text-secondary-foreground shadow-lg shadow-secondary/20 scale-105'
                                                                : 'bg-white border-border/60 text-foreground hover:border-secondary/40'
                                                                }`}
                                                        >
                                                            {cls}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Custom Option</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Add specific class..."
                                                        value={customLkwInput}
                                                        onChange={(e) => setCustomLkwInput(e.target.value)}
                                                        className="h-10 bg-white"
                                                    />
                                                    <Button size="icon" variant="ghost" className="border-dashed border-2 border-border h-10 w-10 shrink-0" onClick={handleAddCustomLkw}>
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                {filters.customLkw && (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/5 text-secondary text-xs font-bold rounded-lg border border-secondary/20">
                                                        {filters.customLkw} <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, customLkw: '' })} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <Separator className="opacity-50" />

                        {/* 5. Matching Preferences */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Matching Preferences</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold block">Partial Match</Label>
                                            <p className="text-[10px] text-muted-foreground">Show results with less than 100% score</p>
                                        </div>
                                        <Switch
                                            checked={filters.enablePartialMatch}
                                            onCheckedChange={(checked) => setFilters({ ...filters, enablePartialMatch: checked })}
                                        />
                                    </div>

                                    {filters.enablePartialMatch && (
                                        <div className="space-y-4 px-2 animate-in slide-in-from-left duration-300">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Min Threshold</Label>
                                                <span className="text-sm font-bold text-primary">{filters.minMatchThreshold}%</span>
                                            </div>
                                            <Slider
                                                value={[filters.minMatchThreshold]}
                                                onValueChange={(val) => setFilters({ ...filters, minMatchThreshold: val[0] })}
                                                min={10}
                                                max={100}
                                                step={5}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold block">Allow Overqualification</Label>
                                            <p className="text-[10px] text-muted-foreground">Show jobs where candidate exceeds requirements</p>
                                        </div>
                                        <Switch
                                            checked={filters.enableFlexibleMatch}
                                            onCheckedChange={(checked) => setFilters({ ...filters, enableFlexibleMatch: checked })}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground italic px-2">
                                        * These preferences help you find more diverse matches by slightly loosening strict requirements.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Large Action Search Button at bottom of advanced */}
                        <div className="pt-8 text-center">
                            <Button
                                onClick={handleSearch}
                                className="px-12 h-14 bg-primary text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 group"
                            >
                                START SEARCH
                                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Visual Separation hint */}
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 flex items-center gap-1 opacity-20 pointer-events-none">
                <div className="h-0.5 w-12 bg-primary rounded-full"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <div className="h-0.5 w-12 bg-primary rounded-full"></div>
            </div>
        </div>
    );
};

export default MainHeroFilter;
