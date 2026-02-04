import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, CheckCircle2, Award, Languages, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CandidateListCardProps {
    candidate: any;
    onViewProfile: (id: string) => void;
}

const CandidateListCard: React.FC<CandidateListCardProps> = ({ candidate, onViewProfile }) => {
    // Extract info safely
    const name = candidate.profiles?.full_name || `Candidate #${candidate.id.substring(0, 4)}`;
    const title = candidate.job_title || 'Professional';
    const location = `${candidate.city || ''}, ${candidate.country || ''}`;
    const status = candidate.employment_status || candidate.employmentStatus || 'Available';
    const isRefugee = candidate.is_refugee === true || candidate.isRefugee === true;
    const careerLevel = candidate.career_level || candidate.careerLevel || 'Not specified';
    const sector = candidate.sector || 'General';
    const salary = (candidate.salary_expectation_min || candidate.salary?.min)
        ? `${(candidate.salary_expectation_min || candidate.salary?.min).toLocaleString()} - ${(candidate.salary_expectation_max || candidate.salary?.max)?.toLocaleString()} ${candidate.currency || 'EUR'}`
        : 'Negotiable';
    const bonus = candidate.desired_entry_bonus || candidate.conditions?.entryBonus ? `€${(candidate.desired_entry_bonus || candidate.conditions?.entryBonus).toLocaleString()}` : null;
    const skills = candidate.candidate_skills || candidate.skills || [];
    const languages = candidate.candidate_languages || candidate.languages || [];
    const isBlurred = true; // Always blur on landing page as requested
    const nationalityCode = candidate.nationality_code || candidate.nationalityCode;

    return (
        <Card className="group p-0 overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col md:flex-row">
                {/* Left Section: Profile Info */}
                <div className="p-6 md:w-1/4 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-border bg-muted/5">
                    <div className="relative mb-4">
                        <Avatar className={`w-24 h-24 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500 ${isBlurred ? 'blur-md' : ''}`}>
                            <AvatarImage src={candidate.profiles?.avatar_url || ""} alt={name} className="object-cover" />
                            <AvatarFallback className="text-2xl bg-primary text-white">
                                {name.split(' ').map((n: any) => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        {nationalityCode && (
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-md">
                                <img
                                    src={`https://flagcdn.com/w40/${nationalityCode.toLowerCase()}.png`}
                                    alt={candidate.nationality || 'Nationality'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                    <h4 className={`text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors ${isBlurred ? 'blur-sm select-none' : ''}`}>{name}</h4>
                    <p className="text-sm font-medium text-muted-foreground mb-4">{title}</p>

                    <div className="w-full pt-4 border-t border-border/50 space-y-2">
                        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {status}
                            </span>
                            {isRefugee && (
                                <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                                    Refugee/Immigrant
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Middle Section: Details */}
                <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Column 1: Core Details */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Location</p>
                                <p className="text-sm font-semibold">{location}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Sector</p>
                                <p className="text-sm font-semibold">{sector}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                <Award className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Career Level</p>
                                <p className="text-sm font-semibold capitalize">{careerLevel}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                <DollarSign className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Salary Expectation</p>
                                <p className="text-sm font-semibold">{salary}</p>
                                {bonus && <p className="text-xs font-bold text-[#FFB800]">Entry Bonus: {bonus}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Skills & Langs */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" /> Top Skills
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {skills.slice(0, 4).map((s: any, i: number) => {
                                    const skillName = typeof s === 'string' ? s : (s.skills?.name || s.name || 'Skill');
                                    return (
                                        <span key={i} className="px-2 py-1 bg-muted text-foreground text-[11px] font-semibold rounded-md border border-border/50">
                                            {skillName}
                                        </span>
                                    );
                                })}
                                {skills.length > 4 && <span className="text-[10px] text-muted-foreground font-bold">+{skills.length - 4} more</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                                <Award className="w-3 h-3" /> Qualifications
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {(candidate.candidate_qualifications || candidate.qualifications || []).slice(0, 3).map((q: any, i: number) => {
                                    const qualName = typeof q === 'string' ? q : (q.qualifications?.name || q.name || 'Qualification');
                                    return (
                                        <span key={i} className="px-2 py-0.5 bg-accent/10 text-accent text-[11px] font-bold rounded-md border border-accent/20">
                                            {qualName}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                                <Languages className="w-3 h-3" /> Languages
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {languages.slice(0, 3).map((l: any, i: number) => {
                                    const langName = typeof l === 'string' ? l : (l.languages?.name || l.name || 'Language');
                                    const level = typeof l === 'string' ? '' : (l.proficiency_level || l.level || '');
                                    return (
                                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100">
                                            {langName}{level ? ` (${level})` : ''}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section: Action */}
                <div className="p-6 md:w-48 flex flex-col justify-center items-center gap-3 bg-muted/5 border-t md:border-t-0 md:border-l border-border">
                    <Button
                        onClick={() => onViewProfile(candidate.id)}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 shadow-lg shadow-primary/20"
                    >
                        View Profile
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground px-2">
                        Verified candidate profile with complete work history.
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default CandidateListCard;
