import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/contexts/ToastContext';
import CandidateFilters from '@/components/employer/CandidateFilters';
import { candidateAlertService, CandidateAlert } from '@/services/candidateAlertService';
import { Loader2, Save } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { CandidateFilters as CandidateFiltersType } from '@/types/candidate';

interface CandidateAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    alert?: CandidateAlert | null;
    onSaveSuccess: () => void;
}

const CandidateAlertModal: React.FC<CandidateAlertModalProps> = ({ isOpen, onClose, alert, onSaveSuccess }) => {
    const { user } = useUser();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [employerJobs, setEmployerJobs] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>('');

    const initialFilters: CandidateFiltersType = {
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
    };

    const [filters, setFilters] = useState<CandidateFiltersType>(initialFilters);

    useEffect(() => {
        // Load employer jobs when modal opens to allow importing criteria
        if (isOpen && user.id && user.role === 'employer') {
            const loadJobs = async () => {
                try {
                    // Dynamically import to avoid circular dependency
                    const { jobsService } = await import('@/services/jobs.service');
                    const profile = user.profile; // Should be loaded by context
                    // If profile is not in context yet, we might need to fetch it, but usually it is.
                    // Fallback to fetch if needed
                    if (profile?.id) {
                        const jobs = await jobsService.getJobsByEmployer(profile.id);
                        setEmployerJobs(jobs?.filter((j: any) => j.status === 'active') || []);
                    }
                } catch (e) {
                    console.error("Failed to load jobs for alert template", e);
                }
            }
            loadJobs();
        }
    }, [isOpen, user.id, user.role, user.profile]);

    const handleJobSelect = (jobId: string) => {
        setSelectedJobId(jobId);
        const job = employerJobs.find(j => j.id === jobId);
        if (job) {
            // Map job to filters
            const newFilters: CandidateFiltersType = {
                ...initialFilters,
                jobTitle: job.title || '',
                location: {
                    continent: job.continent || '',
                    country: job.country || '',
                    cities: job.city ? [job.city] : [],
                },
                sector: job.sector || '',
                salary: [job.salary_min || 20000, job.salary_max || 200000],
                bonus: [0, job.entry_bonus || 100000],
                skills: job.required_skills || [],
                qualifications: job.required_qualifications || [],
                jobTypes: job.employment_type ? [job.employment_type] : [],
                careerLevel: job.career_level ? [job.career_level] : [],
                yearsOfExperience: [0, job.experience_years || 30],
                languages: (job.required_languages || []).map((l: any) => typeof l === 'string' ? l : l.name),
                drivingLicenses: job.driving_licenses || [],
                contractTerm: job.contract_terms || [],
            }
            setFilters(newFilters);
            // Also auto-suggest title
            setTitle(`Alert: ${job.title} Candidates`);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setLoading(false);
            if (alert) {
                setTitle(alert.title);
                setFilters(alert.filters);
            } else {
                setTitle('');
                setFilters(initialFilters);
            }
        }
    }, [alert, isOpen]);

    const handleSave = async () => {
        let alertName = title.trim();

        // Auto-generate name if empty
        if (!alertName) {
            if (filters.jobTitle) {
                alertName = `Candidate Alarm: ${filters.jobTitle}`;
            } else if (filters.sector && filters.sector !== 'any') {
                alertName = `Candidate Alarm: ${filters.sector}`;
            } else if (filters.location.cities[0]) {
                alertName = `Candidate Alarm: ${filters.location.cities[0]}`;
            } else {
                showToast({
                    title: 'Name required',
                    description: 'Please enter a name for your candidate alert.',
                    variant: 'destructive',
                });
                return;
            }
            setTitle(alertName);
        }

        if (!user || !user.id || user.role !== 'employer') {
            showToast({
                title: 'Authentication required',
                description: 'Please log in as an employer to save a candidate alert.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setLoading(true);
            const employerId = user.profile?.id;

            if (!employerId) {
                throw new Error("Employer profile not found");
            }

            if (alert) {
                await candidateAlertService.updateAlert(alert.id, { title: alertName, filters });
                showToast({ title: 'Alert Updated', description: 'Your changes have been saved successfully.' });
            } else {
                await candidateAlertService.createAlert(employerId, alertName, filters);
                showToast({ title: 'Alert Created', description: 'Your new candidate alert is now active.' });
            }

            // Success cleanup
            setTimeout(() => {
                onSaveSuccess();
                onClose();
            }, 100);
        } catch (error: any) {
            console.error('CandidateAlertModal: Error saving alert:', error);
            setLoading(false);
            showToast({
                title: 'Error Saving',
                description: error.message || 'The candidate alert could not be saved.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-card border-border max-w-5xl max-h-[95vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-heading text-foreground">{alert ? 'Edit Candidate Alert' : 'Create Candidate Alert'}</DialogTitle>
                    <DialogDescription className="text-body text-muted-foreground">
                        Define your candidate search criteria and save it as an alert.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-2 space-y-8">
                    <div className="space-y-4">
                        {!alert && employerJobs.length > 0 && (
                            <div className="bg-muted/10 p-4 rounded-xl border border-border">
                                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Load from Job (Optional)</Label>
                                <Select value={selectedJobId} onValueChange={handleJobSelect}>
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Select a job to pre-fill criteria..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employerJobs.map(job => (
                                            <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-2">Selecting a job will overwrite current filters with the job's requirements.</p>
                            </div>
                        )}

                        <Label htmlFor="alertTitle" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Alert Name</Label>
                        <Input
                            id="alertTitle"
                            placeholder="e.g., Senior React Developer Berlin"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-lg py-6 border-2 focus-visible:ring-primary/20"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-card px-3 text-sm font-bold uppercase tracking-widest text-muted-foreground/50">Filter Options</span>
                        </div>
                    </div>

                    <div className="bg-muted/5 rounded-2xl border border-border/50 p-1">
                        {/* We reuse the CandidateFilters component but wrap it to fit better in modal */}
                        <div className="pointer-events-auto">
                            <CandidateFilters
                                filters={filters}
                                onFiltersChange={setFilters}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border flex justify-end gap-4 bg-muted/5">
                    <Button variant="ghost" onClick={onClose} disabled={loading} className="font-bold">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary-hover px-8 py-6 font-bold text-lg shadow-lg shadow-primary/20">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        {alert ? 'Update Alert' : 'Save Alert'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CandidateAlertModal;
