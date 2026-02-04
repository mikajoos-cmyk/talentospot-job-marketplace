import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Building2, Bookmark, DollarSign, CheckCircle2, Award, Languages, Briefcase, Sparkles } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface JobListCardProps {
    job: any;
    onViewDetail: (id: string) => void;
    onApply?: (job: any) => void;
    onSave?: (id: string) => void;
    isSaved?: boolean;
    isApplied?: boolean;
    showMatchScore?: boolean;
}

const JobListCard: React.FC<JobListCardProps> = ({
    job,
    onViewDetail,
    onApply,
    onSave,
    isSaved = false,
    isApplied = false,
    showMatchScore = false
}) => {
    const { isAuthenticated } = useUser();
    // Helper to format currency
    const formatMoney = (amount: number | undefined) => amount?.toLocaleString() ?? '0';

    const employmentTypes = Array.isArray(job.employment_type) ? job.employment_type : [job.employment_type].filter(Boolean);
    const contractTerms = job.contract_terms || [];

    return (
        <Card className="group p-0 overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300">
            <div className={`flex flex-col ${isAuthenticated ? 'layout-xl:flex-row' : 'layout-md:flex-row'}`}>
                {/* Left Section: Identity & Primary Info */}
                <div className={`p-6 ${isAuthenticated ? 'layout-xl:w-1/4 layout-xl:border-b-0 layout-xl:border-r' : 'layout-md:w-1/4 layout-md:border-b-0 layout-md:border-r'} flex flex-col items-center text-center border-b border-border bg-muted/5`}>
                    <div className={`relative mb-4 w-24 h-24 rounded-xl overflow-hidden bg-white shadow-sm border border-border/40 p-1 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 ${!isAuthenticated ? 'blur-md select-none' : ''}`}>
                        {job.employer_profiles?.logo_url ? (
                            <img
                                src={job.employer_profiles.logo_url}
                                alt={job.employer_profiles.company_name}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <Building2 className="w-10 h-10 text-muted-foreground" />
                        )}
                    </div>

                    <h4 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{job.title}</h4>
                    <p className={`text-sm font-medium text-muted-foreground mb-1 ${!isAuthenticated ? 'blur-md select-none' : ''}`}>{job.employer_profiles?.company_name}</p>

                    <div className="w-full pt-4 mt-auto border-t border-border/50 space-y-2">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {employmentTypes.map((type: string) => (
                                <span key={type} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                    {type.replace('-', ' ')}
                                </span>
                            ))}
                            {showMatchScore && job.matchScore !== undefined && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${job.matchScore >= 80 ? 'bg-success text-success-foreground' :
                                    job.matchScore >= 50 ? 'bg-warning text-warning-foreground' :
                                        'bg-muted text-muted-foreground'
                                    }`}>
                                    {job.matchScore}% Match
                                </span>
                            )}
                            {contractTerms.map((term: string) => (
                                <span key={term} className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
                                    {term}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Middle Section: Details Grid */}
                <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Column 1: Core Details */}
                    <div className="space-y-4">
                        {/* Location */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Location</p>
                                <p className="text-sm font-semibold">{job.city}, {job.country}</p>
                            </div>
                        </div>

                        {/* Industry/Sector */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Industry</p>
                                <p className="text-sm font-semibold">{job.employer_profiles?.industry || 'Not specified'}</p>
                            </div>
                        </div>

                        {/* Salary */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                <DollarSign className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Salary Offer</p>
                                <p className="text-sm font-semibold">
                                    {job.salary_min ? `${formatMoney(job.salary_min)} - ${formatMoney(job.salary_max)} ${job.salary_currency || 'EUR'}` : 'Competitive Salary'}
                                </p>
                                {job.entry_bonus && (
                                    <p className="text-xs font-bold text-[#FFB800] mt-0.5">Entry Bonus: €{formatMoney(job.entry_bonus)}</p>
                                )}
                            </div>
                        </div>

                        {/* Posted Date */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Posted</p>
                                <p className="text-sm font-semibold">{new Date(job.posted_at || Date.now()).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Requirements */}
                    <div className="space-y-4">
                        {/* Skills */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" /> Required Skills
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {(job.required_skills || []).slice(0, 4).map((skill: any, i: number) => {
                                    const skillName = typeof skill === 'string' ? skill : (skill.name || 'Skill');
                                    return (
                                        <span key={i} className="px-2 py-1 bg-muted text-foreground text-[11px] font-semibold rounded-md border border-border/50">
                                            {skillName}
                                        </span>
                                    );
                                })}
                                {(job.required_skills || []).length > 4 && (
                                    <span className="text-[10px] text-muted-foreground font-bold">
                                        +{(job.required_skills || []).length - 4} more
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Qualifications */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                                <Award className="w-3 h-3" /> Qualifications
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {(job.required_qualifications || []).slice(0, 3).map((qual: any, i: number) => {
                                    const qualName = typeof qual === 'string' ? qual : (qual.name || 'Qualification');
                                    return (
                                        <span key={i} className="px-2 py-0.5 bg-accent/10 text-accent text-[11px] font-bold rounded-md border border-accent/20">
                                            {qualName}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Languages */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                                <Languages className="w-3 h-3" /> Languages
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {(job.required_languages || []).slice(0, 3).map((lang: any, i: number) => {
                                    const langName = typeof lang === 'string' ? lang : (lang.name || 'Language');
                                    const level = typeof lang === 'string' ? '' : (lang.level || lang.proficiency_level || '');
                                    return (
                                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100">
                                            {langName}{level ? ` (${level})` : ''}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Benefits */}
                        {job.benefits && job.benefits.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> Benefits
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {job.benefits.slice(0, 4).map((benefit: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 bg-secondary/10 text-secondary text-[11px] font-bold rounded-md border border-secondary/20">
                                            {benefit}
                                        </span>
                                    ))}
                                    {job.benefits.length > 4 && (
                                        <span className="text-[10px] text-muted-foreground font-bold flex items-center">
                                            +{job.benefits.length - 4}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section: Actions */}
                <div className={`p-6 ${isAuthenticated ? 'layout-xl:w-48 layout-xl:border-t-0 layout-xl:border-l' : 'layout-md:w-48 layout-md:border-t-0 layout-md:border-l'} flex flex-col justify-center gap-3 border-t border-border bg-muted/5`}>
                    <Button
                        onClick={() => onViewDetail(job.id)}
                        variant="outline"
                        className="w-full border-primary/20 text-primary hover:bg-primary/5 font-bold h-10 shadow-sm"
                    >
                        View Details
                    </Button>

                    {onApply && (
                        <Button
                            onClick={() => onApply(job)}
                            disabled={isApplied}
                            className={`w-full font-bold h-10 shadow-md ${isApplied
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                                }`}
                        >
                            {isApplied ? 'Applied' : 'Apply Now'}
                        </Button>
                    )}

                    {onSave && (
                        <Button
                            variant="ghost"
                            onClick={() => onSave(job.id)}
                            className={`w-full gap-2 ${isSaved ? 'text-accent' : 'text-muted-foreground'
                                } hover:text-foreground`}
                        >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                            <span className="text-xs font-bold">{isSaved ? 'Saved' : 'Save'}</span>
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default JobListCard;
