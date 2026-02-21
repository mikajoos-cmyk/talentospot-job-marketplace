import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Search, MapPin, Briefcase, ChevronDown,
    SlidersHorizontal, Plus, X, Globe,
    Languages, GraduationCap, Clock, Coins, Umbrella,
    Sparkles, Car, ArrowRight, User
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AutocompleteInput } from '@/components/shared/AutocompleteInput';
import { Separator } from '@/components/ui/separator';
import { masterDataService } from '@/services/master-data.service';
import { getLanguageLevelOptions } from '@/utils/language-levels';
import { LocationPicker, LocationValue } from '@/components/shared/LocationPicker';
import DrivingLicenseSelector from '@/components/shared/DrivingLicenseSelector';
import { findContinent } from '@/utils/locationUtils';

const MainHeroFilter = ({ className }: { className?: string }) => {
    const navigate = useNavigate();
    const [searchMode, setSearchMode] = useState<'candidates' | 'jobs'>('candidates');
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [filters, setFilters] = useState({
        // Common
        jobTitle: '',
        personalTitles: [] as string[],
        location: '',
        radius: 50,
        sector: 'any',
        continent: 'any',
        country: 'any',
        city: 'any',

        lat: null as number | null,
        lon: null as number | null,

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
        gender: [] as string[],

        // Job Search specific
        benefits: [] as string[],
        contractDuration: '',
        minVacationDays: 0,
        experienceYears: null as number | null,
        employmentTypes: [] as string[],
        minEntryBonus: 0,

        // Driving Licenses
        drivingLicenses: [] as string[],

        // Matching preferences
        enablePartialMatch: false,
        minMatchThreshold: 50,
        enableFlexibleMatch: false,

    });

    const [skillInput, setSkillInput] = useState('');
    const [qualificationInput, setQualificationInput] = useState('');
    const [personalTitleInput, setPersonalTitleInput] = useState('');
    const [languageInput, setLanguageInput] = useState('');
    const [languageLevel, setLanguageLevel] = useState('B2');
    const [tagInput, setTagInput] = useState('');
    const [benefitInput, setBenefitInput] = useState('');
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


    const handleSearch = () => {
        const searchParams = new URLSearchParams();
        if (filters.jobTitle) {
            searchParams.set('title', filters.jobTitle);
        }
        if (filters.personalTitles.length > 0) {
            searchParams.set('p_titles', filters.personalTitles.join(','));
        }
        if (filters.location) searchParams.set('location', filters.location);
        if (filters.radius) searchParams.set('radius', filters.radius.toString());
        if (filters.sector !== 'any') searchParams.set('sector', filters.sector);

        // Location hierarchy
        if (filters.continent !== 'any') searchParams.set('continent', filters.continent);
        if (filters.country !== 'any') searchParams.set('country', filters.country);
        if (filters.city !== 'any') searchParams.set('city', filters.city);

        if (filters.lat && filters.lon) {
            searchParams.set('lat', filters.lat.toString());
            searchParams.set('lon', filters.lon.toString());
        }

        // Common for both but often distinct in state
        if (filters.skills.length > 0) searchParams.set('skills', filters.skills.join(','));
        if (filters.qualifications.length > 0) searchParams.set('qualifications', filters.qualifications.join(','));
        if (filters.languages.length > 0) searchParams.set('languages', JSON.stringify(filters.languages));
        if (filters.drivingLicenses.length > 0) {
            const pkw = filters.drivingLicenses.filter(l => ['B', 'BE', 'B96', 'AM', 'L', 'T'].includes(l));
            const lkw = filters.drivingLicenses.filter(l => ['C', 'CE', 'C1', 'C1E', 'D', 'DE'].includes(l));
            if (pkw.length > 0) searchParams.set('pkwClasses', pkw.join(','));
            if (lkw.length > 0) searchParams.set('lkwClasses', lkw.join(','));
            const other = filters.drivingLicenses.filter(l => !['B', 'BE', 'B96', 'AM', 'L', 'T', 'C', 'CE', 'C1', 'C1E', 'D', 'DE'].includes(l));
            if (other.length > 0) searchParams.set('otherLicenses', other.join(','));
        }

        if (filters.enablePartialMatch) {
            searchParams.set('partialMatch', 'true');
            searchParams.set('threshold', filters.minMatchThreshold.toString());
        }

        if (searchMode === 'candidates') {
            // Mapping landing page filters to candidate search params
            if (filters.talentStatus.length > 0) searchParams.set('status', filters.talentStatus.join(','));
            if (filters.isRefugee) searchParams.set('isRefugee', 'true');
            if (filters.originCountry) searchParams.set('originCountry', filters.originCountry);
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

            if (filters.gender.length > 0) searchParams.set('gender', filters.gender.join(',').toLowerCase());
            
            // Allow Overqualification mapping for candidates
            if (filters.enableFlexibleMatch) searchParams.set('allowOverqualification', 'true');

            navigate(`/candidates?${searchParams.toString()}`);
        } else {
            // Mapping landing page filters to job search params
            if (filters.employmentTypes.length > 0) searchParams.set('jobTypes', filters.employmentTypes.join(','));
            if (filters.contractTerms.length > 0) searchParams.set('contractTerms', filters.contractTerms.join(','));
            if (filters.homeOffice.length > 0) {
                if (filters.homeOffice.includes('yes') || filters.homeOffice.includes('hybrid')) {
                    searchParams.set('homeOffice', 'true');
                }
            }

            searchParams.set('salaryMin', filters.salaryRange[0].toString());
            searchParams.set('salaryMax', filters.salaryRange[1].toString());
            
            // For jobs, we use the specific min bonus/vacation fields
            searchParams.set('bonusMin', filters.minEntryBonus.toString());
            searchParams.set('vacationMin', filters.minVacationDays.toString());

            if (filters.experienceYears !== null) searchParams.set('expMin', filters.experienceYears.toString());
            if (filters.benefits.length > 0) searchParams.set('benefits', filters.benefits.join(','));

            if (filters.careerLevel.length > 0) searchParams.set('careerLevel', filters.careerLevel.join(','));

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

    const handleAddPersonalTitle = () => {
        if (personalTitleInput.trim() && !filters.personalTitles.includes(personalTitleInput.trim())) {
            setFilters({
                ...filters,
                personalTitles: [...filters.personalTitles, personalTitleInput.trim()],
            });
            setPersonalTitleInput('');
        }
    };

    const handleRemovePersonalTitle = (title: string) => {
        setFilters({
            ...filters,
            personalTitles: filters.personalTitles.filter(t => t !== title),
        });
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

    // Location helpers - keeping for backward compatibility if needed, but using LocationPicker now
    // const continents = Object.keys(locationData);
    // const countries = filters.continent !== 'any' ? Object.keys(locationData[filters.continent] || {}) : [];
    // const cities = (filters.continent !== 'any' && filters.country !== 'any')
    //     ? locationData[filters.continent]?.[filters.country] || []
    //     : [];

    const handleLocationChange = (val: LocationValue) => {
        setFilters({
            ...filters,
            location: val.city,
            city: val.city,
            country: val.country,
            continent: findContinent(val.country),
            lat: val.lat,
            lon: val.lon
        });
    };

    return (
        <div className={`w-full mx-auto px-4 relative z-10 ${className}`}>
            {/* Search Mode Toggle */}
            <div className="flex justify-center mb-6">
                <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border-4 border-primary/40 flex gap-1">
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

            <Card className="p-3 md:p-6 shadow-2xl border-4 border-primary/40 bg-white/95 backdrop-blur-md rounded-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500">
                {/* Main Search Bar */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    {/* Job Title */}
                    <div className={`${searchMode === 'candidates' ? 'md:col-span-4' : 'md:col-span-4'} space-y-1.5 p-2`}>
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Job Title</Label>
                        <AutocompleteInput
                            category="job_titles"
                            placeholder="e.g. Software Engineer"
                            value={filters.jobTitle}
                            onChange={(val) => setFilters({ ...filters, jobTitle: val })}
                            inputClassName="h-12 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary text-base rounded-xl"
                            icon={<Search className="w-4 h-4 text-primary" />}
                        />
                    </div>

                    {/* Location (Simplified for main bar) */}
                    <div className={`${searchMode === 'candidates' ? 'md:col-span-4' : 'md:col-span-4'} space-y-1.5 p-2`}>
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Location / Work Preference</Label>
                        <AutocompleteInput
                            category="cities"
                            placeholder="City..."
                            value={filters.location}
                            onChange={(val) => setFilters({ ...filters, location: val })}
                            inputClassName="h-12 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary text-base rounded-xl"
                            icon={<MapPin className="w-4 h-4 text-primary" />}
                        />
                    </div>

                    {/* Sector */}
                    <div className="md:col-span-2 space-y-1.5 p-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Sector</Label>
                        <AutocompleteInput
                            category="sectors"
                            placeholder="Any Sector"
                            value={filters.sector === 'any' ? '' : filters.sector}
                            onChange={(val) => setFilters({ ...filters, sector: val || 'any' })}
                            inputClassName="h-12 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary text-base rounded-xl"
                            icon={<Briefcase className="w-4 h-4 text-primary" />}
                        />
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
                                    <div className="flex items-center min-w-0">
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
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 hover:text-primary font-medium flex items-center gap-1.5">
                                <SlidersHorizontal className="w-4 h-4" />
                                {isAdvancedOpen ? 'Hide' : 'Show'} All Filters
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                            </Button>
                        </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="px-4 py-8 mt-4 space-y-12 animate-in slide-in-from-top duration-300 overflow-visible">

                        {/* 1. Precise Location & Radius */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Precise Location</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                                <div className="md:col-span-8">
                                    <LocationPicker
                                        mode="city"
                                        value={{
                                            city: filters.city !== 'any' ? filters.city : '',
                                            country: filters.country !== 'any' ? filters.country : ''
                                        }}
                                        onChange={handleLocationChange}
                                        className="space-y-4"
                                    />
                                </div>

                                <div className="md:col-span-4 space-y-4 pt-1">
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
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Select a city above to enable radius matching based on your location.
                                    </p>
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
                                                    {['Unemployed', 'Employed', 'Trainee', 'Apprentice', 'Pupil', 'Student', 'Civil Servant', 'Freelancer', 'Entrepreneur', 'Retired', 'Other'].map(status => (
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
                                                                ? 'bg-accent border-accent text-accent-foreground shadow-sm'
                                                                : 'bg-muted text-foreground hover:bg-muted/80'
                                                                }`}
                                                        >
                                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Driving Licenses */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                    <Car className="w-3 h-3" />
                                                    Driving Licenses
                                                </Label>
                                                <DrivingLicenseSelector
                                                    value={filters.drivingLicenses}
                                                    onChange={(val) => setFilters({ ...filters, drivingLicenses: val })}
                                                />
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

                                            {/* Notice Period */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Notice Period</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['immediate', '1-week', '2-weeks', '1-month', '2-months', '3-months'].map(period => (
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
                                                            {allCountries.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            {/* Gender */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Gender</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Male', 'Female', 'Non-binary', 'Other'].map(g => (
                                                        <button
                                                            key={g}
                                                            onClick={() => {
                                                                const genderKey = (g === 'Non-binary' || g === 'Other') ? 'diverse' : g.toLowerCase();
                                                                const current = filters.gender;
                                                                const updated = current.includes(genderKey)
                                                                    ? current.filter(i => i !== genderKey)
                                                                    : [...current, genderKey];
                                                                setFilters({ ...filters, gender: updated });
                                                            }}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filters.gender.includes((g === 'Non-binary' || g === 'Other') ? 'diverse' : g.toLowerCase())
                                                                ? 'bg-primary border-primary text-white shadow-sm'
                                                                : 'bg-white border-border text-foreground hover:border-primary/50'
                                                                }`}
                                                        >
                                                            {g}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Skills, Qualifications, Languages, Conditions */}
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

                                            {/* Personal Titles */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Personal Titles</Label>
                                                <div className="flex gap-2">
                                                    <AutocompleteInput
                                                        category="personal_titles"
                                                        placeholder="Dr., Prof..."
                                                        value={personalTitleInput}
                                                        onChange={(val) => setPersonalTitleInput(val)}
                                                        onSelect={(val) => {
                                                            if (typeof val === 'string') handleAddPersonalTitle();
                                                            else if (val && val.name) handleAddPersonalTitle();
                                                        }}
                                                        className="h-10 flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={handleAddPersonalTitle}
                                                        className="h-10 w-10 border-primary text-primary hover:bg-primary/5 shrink-0"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {filters.personalTitles.map((title) => (
                                                        <div
                                                            key={title}
                                                            className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md flex items-center gap-1 border border-primary/20"
                                                        >
                                                            <span>{title}</span>
                                                            <button onClick={() => handleRemovePersonalTitle(title)}>
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
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
                                                            {getLanguageLevelOptions().map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
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
                                    </div>
                                </section>

                                <Separator className="opacity-50" />

                                {/* 2.5 Candidate Conditions & Expectations */}
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
                                                    {['full-time', 'part-time', 'apprenticeship', 'internship', 'traineeship', 'freelance', 'contract'].map(t => (
                                                        <button
                                                            key={t}
                                                            onClick={() => toggleFilterItem('jobTypes', t)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filters.jobTypes.includes(t)
                                                                ? 'bg-success border-success text-white shadow-sm'
                                                                : 'bg-white border-border text-foreground hover:border-success/50'
                                                                }`}
                                                        >
                                                            {t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Contract Term */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Contract Term</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['unlimited', 'temporary'].map(term => (
                                                        <button
                                                            key={term}
                                                            onClick={() => toggleFilterItem('contractTerms', term)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filters.contractTerms.includes(term)
                                                                ? 'bg-info border-info text-info-foreground shadow-sm'
                                                                : 'bg-muted text-foreground hover:bg-muted/80'
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
                                                        Desired Salary (€ / Year)
                                                    </Label>
                                                    <span className="text-xs font-bold text-success">{filters.salaryRange[0].toLocaleString()} - {filters.salaryRange[1].toLocaleString()}</span>
                                                </div>
                                                <Slider
                                                    value={filters.salaryRange}
                                                    onValueChange={(val) => setFilters({ ...filters, salaryRange: val as [number, number] })}
                                                    min={20000}
                                                    max={200000}
                                                    step={5000}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3" />
                                                        Desired Entry Bonus (€)
                                                    </Label>
                                                    <span className="text-xs font-bold text-success">{filters.bonusRange[0].toLocaleString()} - {filters.bonusRange[1].toLocaleString()}</span>
                                                </div>
                                                <Slider
                                                    value={filters.bonusRange}
                                                    onValueChange={(val) => setFilters({ ...filters, bonusRange: val as [number, number] })}
                                                    min={0}
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
                                                    min={0}
                                                    max={50}
                                                    step={1}
                                                />
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
                                {/* Candidate Requirements for Jobs */}
                                <section className="space-y-8 animate-in fade-in duration-500">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                                            <GraduationCap className="w-4 h-4 text-info" />
                                        </div>
                                        <h3 className="font-bold text-lg">Candidate Requirements</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            {/* Experience Requirement */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase">Max Required Experience (Years)</Label>
                                                    <span className="text-xs font-bold text-info">{filters.experienceYears === null ? 'Any' : `${filters.experienceYears} Years`}</span>
                                                </div>
                                                <Slider
                                                    value={[filters.experienceYears === null ? 30 : filters.experienceYears]}
                                                    onValueChange={(val) => setFilters({ ...filters, experienceYears: val[0] === 30 ? null : val[0] })}
                                                    max={30}
                                                    step={1}
                                                />
                                                <p className="text-[10px] text-muted-foreground italic text-right">Slide to 30 for "Any"</p>
                                            </div>

                                            {/* Career Level */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Career Level</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['entry', 'junior', 'mid', 'senior', 'lead', 'executive'].map(level => (
                                                        <button
                                                            key={level}
                                                            onClick={() => {
                                                                setFilters({ ...filters, careerLevel: filters.careerLevel.includes(level) ? filters.careerLevel.filter(l => l !== level) : [...filters.careerLevel, level] });
                                                            }}
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

                                            {/* Driving Licenses */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                    <Car className="w-3 h-3" />
                                                    Required Driving Licenses
                                                </Label>
                                                <DrivingLicenseSelector
                                                    value={filters.drivingLicenses}
                                                    onChange={(val) => setFilters({ ...filters, drivingLicenses: val })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Skills Tags */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Required Skills</Label>
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
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Required Qualifications</Label>
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
                                                    Required Languages
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
                                                            {getLanguageLevelOptions().map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
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

                                {/* Job Conditions */}
                                <section className="space-y-8 animate-in fade-in duration-500">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-success" />
                                        </div>
                                        <h3 className="font-bold text-lg">Job Conditions</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* Left: Job Types & Terms */}
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Job Types</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote'].map(t => (
                                                        <button
                                                            key={t}
                                                            onClick={() => {
                                                                const current = filters.employmentTypes;
                                                                const updated = current.includes(t)
                                                                    ? current.filter(i => i !== t)
                                                                    : [...current, t];
                                                                setFilters({ ...filters, employmentTypes: updated });
                                                            }}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filters.employmentTypes.includes(t)
                                                                ? 'bg-success border-success text-white shadow-sm'
                                                                : 'bg-white border-border text-foreground hover:border-success/50'
                                                                }`}
                                                        >
                                                            {t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Contract Term */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Contract Term</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['permanent', 'temporary', 'contract', 'freelance', 'internship'].map(term => (
                                                        <button
                                                            key={term}
                                                            onClick={() => toggleFilterItem('contractTerms', term)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filters.contractTerms.includes(term)
                                                                ? 'bg-info border-info text-info-foreground shadow-sm'
                                                                : 'bg-muted text-foreground hover:bg-muted/80'
                                                                }`}
                                                        >
                                                            {term.charAt(0).toUpperCase() + term.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Home Office Option</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['yes', 'no', 'hybrid'].map(pref => (
                                                        <button
                                                            key={pref}
                                                            onClick={() => {
                                                                const current = filters.homeOffice;
                                                                const updated = current.includes(pref)
                                                                    ? current.filter(i => i !== pref)
                                                                    : [...current, pref];
                                                                setFilters({ ...filters, homeOffice: updated });
                                                            }}
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
                                                    min={0}
                                                    max={250000}
                                                    step={5000}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3" />
                                                        Min Entry Bonus (€)
                                                    </Label>
                                                    <span className="text-xs font-bold text-success">{filters.minEntryBonus.toLocaleString()}</span>
                                                </div>
                                                <Slider
                                                    value={[filters.minEntryBonus]}
                                                    onValueChange={(val) => setFilters({ ...filters, minEntryBonus: val[0] })}
                                                    max={50000}
                                                    step={1000}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                        <Umbrella className="w-3 h-3" />
                                                        Min Vacation Days
                                                    </Label>
                                                    <span className="text-xs font-bold text-success">{filters.minVacationDays}</span>
                                                </div>
                                                <Slider
                                                    value={[filters.minVacationDays]}
                                                    onValueChange={(val) => setFilters({ ...filters, minVacationDays: val[0] })}
                                                    max={40}
                                                    step={1}
                                                />
                                            </div>

                                            {/* Benefits */}
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Job Benefits (Tags)</Label>
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
                                    {searchMode === 'jobs' && (
                                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-bold block">Allow Overqualification</Label>
                                                <p className="text-[10px] text-muted-foreground">Show jobs where you exceed requirements</p>
                                            </div>
                                            <Switch
                                                checked={filters.enableFlexibleMatch}
                                                onCheckedChange={(checked) => setFilters({ ...filters, enableFlexibleMatch: checked })}
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold block">Partial Match</Label>
                                            <p className="text-[10px] text-muted-foreground">
                                                {searchMode === 'candidates' 
                                                    ? 'Show candidates that partially match your criteria' 
                                                    : 'Show jobs that partially match your profile'}
                                            </p>
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
                                    <p className="text-xs text-muted-foreground italic px-2">
                                        * These preferences help you find more diverse matches by slightly loosening strict requirements.
                                    </p>
                                </div>
                            </div>
                        </section>

            {/* Large Action Search Button at bottom of advanced */}
                        <div className="pt-8 text-center pb-4">
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
