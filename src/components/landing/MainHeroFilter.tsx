import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Briefcase, Users, ChevronDown, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { AutocompleteInput } from '@/components/shared/AutocompleteInput';

const MainHeroFilter = () => {
    const navigate = useNavigate();
    const [searchMode, setSearchMode] = useState<'candidates' | 'jobs'>('candidates');
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [filters, setFilters] = useState({
        jobTitle: '',
        location: '',
        radius: 50,
        talentStatus: 'any',
        sector: 'any',
        salaryMin: 0,
        bonusMin: 0,
        hasPkw: null as boolean | null, // null = not selected, true = yes, false = no
        hasLkw: null as boolean | null,
        pkwClasses: [] as string[],
        lkwClasses: [] as string[],
    });

    const [suggestions, setSuggestions] = useState({
        jobTitles: [] as string[],
        sectors: [] as string[],
    });

    // Mocked suggestions for now, in a real app these would come from the service
    useEffect(() => {
        setSuggestions({
            jobTitles: ['Software Engineer', 'Project Manager', 'Sales Specialist', 'Truck Driver', 'Nurse'],
            sectors: ['IT & Tech', 'Logistics', 'Healthcare', 'Construction', 'Finance'],
        });
    }, []);

    const handleSearch = () => {
        const searchParams = new URLSearchParams();
        if (filters.jobTitle) searchParams.set('title', filters.jobTitle);
        if (filters.location) searchParams.set('location', filters.location); // Using 'location' as generic param
        if (filters.radius) searchParams.set('radius', filters.radius.toString());
        if (filters.sector !== 'any') searchParams.set('sector', filters.sector);
        if (filters.salaryMin > 0) searchParams.set('salaryMin', filters.salaryMin.toString());
        if (filters.bonusMin > 0) searchParams.set('bonusMin', filters.bonusMin.toString());

        if (searchMode === 'candidates') {
            if (filters.talentStatus !== 'any') searchParams.set('status', filters.talentStatus);
            if (filters.hasPkw !== null) searchParams.set('hasPkw', filters.hasPkw.toString());
            if (filters.pkwClasses.length > 0) searchParams.set('pkwClasses', filters.pkwClasses.join(','));
            if (filters.hasLkw !== null) searchParams.set('hasLkw', filters.hasLkw.toString());
            if (filters.lkwClasses.length > 0) searchParams.set('lkwClasses', filters.lkwClasses.join(','));
            navigate(`/candidates?${searchParams.toString()}`);
        } else {
            navigate(`/jobs?${searchParams.toString()}`);
        }
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

    return (
        <div className="w-full max-w-5xl mx-auto px-4 relative z-10">
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
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    {/* Job Title */}
                    <div className="md:col-span-4 space-y-1.5 p-2">
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

                    {/* Location */}
                    <div className="md:col-span-3 space-y-1.5 p-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Location</Label>
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

                    {/* Talent Status - Only for candidates */}
                    {searchMode === 'candidates' && (
                        <div className="md:col-span-3 space-y-1.5 p-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Talent Status</Label>
                            <Select value={filters.talentStatus} onValueChange={(val) => setFilters({ ...filters, talentStatus: val })}>
                                <SelectTrigger className="h-12 bg-muted/40 border-none focus:ring-1 focus:ring-primary text-base shadow-none rounded-xl">
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-3 text-primary shrink-0" />
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">Any Status</SelectItem>
                                    <SelectItem value="unemployed">Unemployed</SelectItem>
                                    <SelectItem value="employed">Employed</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="apprentice">Apprentice</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Search Button */}
                    <div className={searchMode === 'candidates' ? "md:col-span-2 p-2" : "md:col-span-5 p-2"}>
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
                                {isAdvancedOpen ? 'Hide' : 'Show'} Advanced Filters
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                            </Button>
                        </CollapsibleTrigger>

                        {/* Quick Summary of active advanced filters could go here */}
                    </div>

                    <CollapsibleContent className="px-4 py-6 border-t border-border mt-2 space-y-8 animate-in slide-in-from-top duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                            {/* Radius Search */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        Radius Search
                                    </Label>
                                    <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded flex items-center">
                                        {filters.radius} km
                                    </span>
                                </div>
                                <Slider
                                    value={[filters.radius]}
                                    onValueChange={(val) => setFilters({ ...filters, radius: val[0] })}
                                    max={200}
                                    step={5}
                                />
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Maximum distance from city center</p>
                            </div>

                            {/* Sector */}
                            <div className="space-y-4">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-primary" />
                                    Industry Sector
                                </Label>
                                <Select value={filters.sector} onValueChange={(val) => setFilters({ ...filters, sector: val })}>
                                    <SelectTrigger className="h-10 bg-muted/20 border-border text-sm">
                                        <SelectValue placeholder="Select sector" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">All Sectors</SelectItem>
                                        {suggestions.sectors.map(s => (
                                            <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Salary & Bonus */}
                            <div className="space-y-4">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    Financial Expectations
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">{searchMode === 'candidates' ? 'Max' : 'Min'} Salary (€)</Label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 40000"
                                            className="h-9 text-sm"
                                            value={filters.salaryMin || ''}
                                            onChange={(e) => setFilters({ ...filters, salaryMin: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] text-muted-foreground uppercase font-bold">{searchMode === 'candidates' ? 'Max' : 'Min'} Bonus (€)</Label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 2000"
                                            className="h-9 text-sm"
                                            value={filters.bonusMin || ''}
                                            onChange={(e) => setFilters({ ...filters, bonusMin: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Driving Licenses - Logic based as requested */}
                        <div className="pt-6 border-t border-dashed border-border">
                            <Label className="text-sm font-bold mb-6 block uppercase tracking-wider">Driving Licenses Logic</Label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* PKW Section */}
                                <div className="space-y-6 p-4 bg-muted/10 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-lg">PKW (Car) License</h4>
                                            <p className="text-xs text-muted-foreground">Standard passenger vehicles</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={(filters.hasPkw as any) === true ? 'default' : 'outline'}
                                                onClick={() => setFilters({ ...filters, hasPkw: true as any })}
                                                className="rounded-full w-12 h-12 p-0 flex-col gap-0.5"
                                            >
                                                <span className="text-xs font-bold leading-none">YES</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={(filters.hasPkw as any) === false ? 'default' : 'outline'}
                                                onClick={() => setFilters({ ...filters, hasPkw: false as any, pkwClasses: [] })}
                                                className="rounded-full w-12 h-12 p-0 flex-col gap-0.5"
                                            >
                                                <span className="text-xs font-bold leading-none">NO</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {filters.hasPkw === true && (
                                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase">Class Specifications</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['B', 'BE', 'B96', 'AM', 'L', 'T'].map(cls => (
                                                    <button
                                                        key={cls}
                                                        onClick={() => togglePkwClass(cls)}
                                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${filters.pkwClasses.includes(cls)
                                                            ? 'bg-primary border-primary text-white shadow-md'
                                                            : 'bg-white border-border text-foreground hover:border-primary/50'
                                                            }`}
                                                    >
                                                        {cls}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* LKW Section */}
                                <div className="space-y-6 p-4 bg-muted/10 rounded-xl text-opacity-50">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-lg">LKW (Truck) License</h4>
                                            <p className="text-xs text-muted-foreground">Heavy goods vehicles</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={(filters.hasLkw as any) === true ? 'secondary' : 'outline'}
                                                onClick={() => setFilters({ ...filters, hasLkw: true as any })}
                                                className="rounded-full w-12 h-12 p-0 flex-col gap-0.5"
                                            >
                                                <span className="text-xs font-bold leading-none">YES</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={(filters.hasLkw as any) === false ? 'secondary' : 'outline'}
                                                onClick={() => setFilters({ ...filters, hasLkw: false as any, lkwClasses: [] })}
                                                className="rounded-full w-12 h-12 p-0 flex-col gap-0.5"
                                            >
                                                <span className="text-xs font-bold leading-none">NO</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {filters.hasLkw === true && (
                                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase">Class Specifications</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {['C', 'CE', 'C1', 'C1E', 'D', 'DE'].map(cls => (
                                                    <button
                                                        key={cls}
                                                        onClick={() => toggleLkwClass(cls)}
                                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${filters.lkwClasses.includes(cls)
                                                            ? 'bg-secondary border-secondary text-secondary-foreground shadow-md'
                                                            : 'bg-white border-border text-foreground hover:border-secondary/50'
                                                            }`}
                                                    >
                                                        {cls}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
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
