import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, Briefcase } from 'lucide-react';
import { jobAlertService } from '@/services/jobAlertService';
import { JobFiltersState } from '@/components/candidate/JobFilters';
import JobListCard from '@/components/landing/JobListCard';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';

import { packagesService } from '@/services/packages.service';
import { useUser } from '@/contexts/UserContext';

interface MatchingJobsModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: JobFiltersState;
    alertTitle: string;
}

const MatchingJobsModal: React.FC<MatchingJobsModalProps> = ({ isOpen, onClose, filters, alertTitle }) => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
    const { user } = useUser();
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            checkAccess();
            loadMatchingJobs();
        }
    }, [isOpen, filters]);

    const checkAccess = async () => {
        if (user?.id && user.role === 'candidate') {
            const access = await packagesService.hasActivePackage(user.id);
            setHasPremiumAccess(access);
        }
    };

    const loadMatchingJobs = async () => {
        try {
            setLoading(true);
            const data = await jobAlertService.getMatchingJobs(filters);
            setJobs(data || []);
        } catch (error) {
            console.error('Error loading matching jobs:', error);
            showToast({
                title: 'Error',
                description: 'Failed to load matching jobs',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-h3 font-heading text-foreground">Matching Jobs for "{alertTitle}"</DialogTitle>
                    <DialogDescription className="text-body text-muted-foreground">
                        Beiträge, die Ihren gespeicherten Filterkriterien entsprechen.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-12 bg-muted/5 rounded-xl border border-dashed border-border">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                            <h3 className="text-lg font-semibold text-foreground mb-1">No matching jobs found</h3>
                            <p className="text-sm text-muted-foreground">Try adjusting your alert filters to see more results.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {jobs.map((job) => (
                                <JobListCard
                                    key={job.id}
                                    job={job}
                                    onViewDetail={(id) => hasPremiumAccess || user?.role !== 'candidate' ? navigate(`/jobs/${id}`) : navigate('/packages')}
                                    showMatchScore={true}
                                    obfuscate={!hasPremiumAccess && user?.role === 'candidate'}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MatchingJobsModal;
