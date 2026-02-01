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
import { useToast } from '@/contexts/ToastContext';
import JobFilters, { JobFiltersState } from './JobFilters';
import { jobAlertService, JobAlert } from '@/services/jobAlertService';
import { Loader2, Save } from 'lucide-react';
import { candidateService } from '@/services/candidate.service';
import { useUser } from '@/contexts/UserContext';

interface JobAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    alert?: JobAlert | null;
    onSaveSuccess: () => void;
}

const JobAlertModal: React.FC<JobAlertModalProps> = ({ isOpen, onClose, alert, onSaveSuccess }) => {
    const { user } = useUser();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [filters, setFilters] = useState<JobFiltersState>({
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
    });

    useEffect(() => {
        if (isOpen) {
            setLoading(false);
            if (alert) {
                setTitle(alert.title);
                setFilters(alert.filters);
            } else {
                setTitle('');
                setFilters({
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
                });
            }
        }
    }, [alert, isOpen]);

    const handleMatchProfile = async () => {
        try {
            let profile = user.profile;
            if (!profile) {
                profile = await candidateService.getCandidateProfile(user.id);
            }

            if (!profile) {
                showToast({
                    title: 'Profile Missing',
                    description: 'Please complete your profile to use this feature.',
                    variant: 'destructive',
                });
                return;
            }

            const matchedFilters: JobFiltersState = {
                title: profile.title || '',
                sector: '',
                continent: profile.preferredLocations?.[0]?.continent || '',
                country: profile.preferredLocations?.[0]?.country || '',
                city: profile.preferredLocations?.[0]?.city || '',
                employmentTypes: profile.jobTypes || [],
                salaryRange: [profile.salary?.min || 0, 250000],
                minEntryBonus: profile.conditions?.entryBonus || 0,
                contractDuration: '',
                skills: (profile.skills || []).map((s: any) => s.name),
                qualifications: profile.qualifications || [],
                languages: (profile.languages || []).map((l: any) =>
                    typeof l === 'string' ? l : { name: l.name, level: l.level || l.proficiency_level || 'B2' }
                ),
                careerLevel: profile.careerLevel || '',
                experienceYears: typeof profile.yearsOfExperience === 'number' ? profile.yearsOfExperience : null,
                drivingLicenses: profile.drivingLicenses || [],
                contractTerms: profile.contractTermPreference || [],
                homeOffice: profile.homeOfficePreference && profile.homeOfficePreference !== 'none' ? true : false,
                enableFlexibleMatch: filters.enableFlexibleMatch,
                enablePartialMatch: filters.enablePartialMatch,
                minMatchThreshold: filters.minMatchThreshold,
                benefits: profile.tags || [],
                minVacationDays: 0,
            };

            setFilters(matchedFilters);
            showToast({
                title: 'Profile Matched',
                description: 'Filters have been updated based on your profile settings.',
            });
        } catch (error) {
            console.error('Error matching profile:', error);
            showToast({
                title: 'Error',
                description: 'Failed to match profile settings.',
                variant: 'destructive',
            });
        }
    };

    const handleSave = async () => {
        let alertName = title.trim();

        // Auto-generate name if empty
        if (!alertName) {
            if (filters.title) {
                alertName = `Job Alarm: ${filters.title}`;
            } else if (filters.sector && filters.sector !== 'all') {
                alertName = `Job Alarm: ${filters.sector}`;
            } else if (filters.city) {
                alertName = `Job Alarm: ${filters.city}`;
            } else {
                showToast({
                    title: 'Name erforderlich',
                    description: 'Bitte geben Sie einen Namen für Ihren Job Alarm ein.',
                    variant: 'destructive',
                });
                return;
            }
            setTitle(alertName);
        }

        console.log('JobAlertModal: Saving alert...', { title: alertName, filters });

        if (!user || !user.id || user.role === 'guest') {
            showToast({
                title: 'Authentifizierung erforderlich',
                description: 'Bitte loggen Sie sich ein, um einen Job Alarm zu speichern.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setLoading(true);
            if (alert) {
                console.log('JobAlertModal: Updating existing alert:', alert.id);
                await jobAlertService.updateAlert(alert.id, { title: alertName, filters });
                showToast({ title: 'Job Alarm aktualisiert', description: 'Ihre Änderungen wurden erfolgreich gespeichert.' });
            } else {
                console.log('JobAlertModal: Creating new alert for user:', user.id);
                await jobAlertService.createAlert(user.id, alertName, filters);
                showToast({ title: 'Job Alarm erstellt', description: 'Ihr neuer Job Alarm ist jetzt aktiv.' });
            }

            // Success cleanup
            setTimeout(() => {
                onSaveSuccess();
                onClose();
            }, 100);
        } catch (error: any) {
            console.error('JobAlertModal: Error saving job alert:', error);
            setLoading(false);
            showToast({
                title: 'Fehler beim Speichern',
                description: error.message || 'Der Job Alarm konnte nicht gespeichert werden.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-card border-border max-w-5xl max-h-[95vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-heading text-foreground">{alert ? 'Edit Job Alert' : 'Create Job Alert'}</DialogTitle>
                    <DialogDescription className="text-body text-muted-foreground">
                        Define your search criteria and save it as an alert to find matching jobs.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-2 space-y-8">
                    <div className="space-y-4">
                        <Label htmlFor="alertTitle" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Alert Name</Label>
                        <Input
                            id="alertTitle"
                            placeholder="e.g., Senior Developer Berlin"
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
                        <JobFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            onMatchProfile={handleMatchProfile}
                            onReset={() => setFilters({
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
                            })}
                        />
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

export default JobAlertModal;
