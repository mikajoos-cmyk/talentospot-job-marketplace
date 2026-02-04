import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, Users } from 'lucide-react';
import { candidateAlertService } from '@/services/candidateAlertService';
import { CandidateFilters } from '@/types/candidate';
import CandidateCard from '@/components/employer/CandidateCard';
import { useToast } from '@/contexts/ToastContext';
import { candidateService } from '@/services/candidate.service';
import { useUser } from '@/contexts/UserContext';

interface MatchingCandidatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: CandidateFilters;
    alertTitle: string;
}

const MatchingCandidatesModal: React.FC<MatchingCandidatesModalProps> = ({ isOpen, onClose, filters, alertTitle }) => {
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [accessRequests, setAccessRequests] = useState<Record<string, string>>({});
    const { user } = useUser();
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            loadMatchingCandidates();
        }
    }, [isOpen, filters]);

    const loadMatchingCandidates = async () => {
        try {
            setLoading(true);
            const data = await candidateAlertService.getMatchingCandidates(filters);
            setCandidates(data || []);

            if (user && user.role === 'employer' && user.profile?.id) {
                // Fetch access requests for this employer
                try {
                    const { data: requests } = await candidateService.getEmployerAccessRequests(user.profile.id);
                    const requestMap: Record<string, string> = {};
                    requests?.forEach((r: any) => {
                        requestMap[r.candidate_id] = r.status;
                    });
                    setAccessRequests(requestMap);
                } catch (e) {
                    console.error("Error fetching access requests", e);
                }
            }

        } catch (error) {
            console.error('Error loading matching candidates:', error);
            showToast({
                title: 'Error',
                description: 'Failed to load matching candidates',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                <DialogHeader>
                    <DialogTitle className="text-h3 font-heading text-foreground">Matching Candidates for "{alertTitle}"</DialogTitle>
                    <DialogDescription className="text-body text-muted-foreground">
                        Candidates matching your alert criteria.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="text-center py-12 bg-muted/5 rounded-xl border border-dashed border-border">
                            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                            <h3 className="text-lg font-semibold text-foreground mb-1">No matching candidates found</h3>
                            <p className="text-sm text-muted-foreground">Try adjusting your alert filters to see more results.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {candidates.map((candidate) => (
                                <CandidateCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    accessStatus={accessRequests[candidate.id]}
                                    matchScore={candidate.matchScore}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MatchingCandidatesModal;
