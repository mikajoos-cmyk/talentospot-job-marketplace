import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Plus, Bell, Loader2, Info } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { CandidateAlert, candidateAlertService } from '@/services/candidateAlertService';
import CandidateAlertCard from '@/components/employer/CandidateAlertCard';
import CandidateAlertModal from '@/components/employer/CandidateAlertModal';
import MatchingCandidatesModal from '@/components/employer/MatchingCandidatesModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CandidateAlerts: React.FC = () => {
    const { showToast } = useToast();
    const [alerts, setAlerts] = useState<CandidateAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMatchesModalOpen, setIsMatchesModalOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<CandidateAlert | null>(null);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const data = await candidateAlertService.getAlerts();
            setAlerts(data || []);
        } catch (error) {
            console.error('Error loading candidate alerts:', error);
            showToast({
                title: 'Error',
                description: 'Failed to load your candidate alerts',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    const handleCreateNew = () => {
        setSelectedAlert(null);
        setIsModalOpen(true);
    };

    const handleEdit = (alert: CandidateAlert) => {
        setSelectedAlert(alert);
        setIsModalOpen(true);
    };

    const handleViewMatches = (alert: CandidateAlert) => {
        setSelectedAlert(alert);
        setIsMatchesModalOpen(true);
    };

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete the candidate alert "${title}"?`)) {
            try {
                await candidateAlertService.deleteAlert(id);
                showToast({ title: 'Alert Deleted', description: 'The candidate alert has been removed.' });
                loadAlerts();
            } catch (error) {
                console.error('Error deleting alert:', error);
                showToast({
                    title: 'Error',
                    description: 'Failed to delete candidate alert',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleTogglePause = async (id: string, currentPaused: boolean) => {
        try {
            await candidateAlertService.updateAlert(id, { is_paused: !currentPaused });
            showToast({
                title: !currentPaused ? 'Alert Paused' : 'Alert Resumed',
                description: !currentPaused ? 'You will no longer receive notifications for this alert.' : 'Your alert is now active again.'
            });
            loadAlerts();
        } catch (error) {
            console.error('Error toggling alert status:', error);
            showToast({
                title: 'Error',
                description: 'Failed to update alert status',
                variant: 'destructive',
            });
        }
    };

    return (
        <AppLayout>
            <div className="space-y-8 max-w-6xl mx-auto py-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-heading text-foreground mb-2 font-bold tracking-tight">Candidate Alerts</h1>
                        <p className="text-body text-muted-foreground">
                            Set up alerts to get notified when new candidates match your criteria.
                        </p>
                    </div>
                    <Button
                        onClick={handleCreateNew}
                        className="bg-primary text-primary-foreground hover:bg-primary-hover px-6 py-6 font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
                        New Candidate Alert
                    </Button>
                </div>

                <Alert className="bg-primary/5 border-primary/20 text-primary-foreground py-6 px-8 rounded-2xl">
                    <Info className="w-6 h-6 text-primary" />
                    <div className="ml-4">
                        <AlertTitle className="text-lg font-bold text-foreground">Pro Tip</AlertTitle>
                        <AlertDescription className="text-muted-foreground">
                            Create specific alerts for hard-to-fill roles to get notified immediately when matching talent joins.
                        </AlertDescription>
                    </div>
                </Alert>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
                        <p className="text-muted-foreground font-medium">Loading your candidate alerts...</p>
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="text-center py-32 bg-card border border-dashed border-border rounded-3xl space-y-6">
                        <div className="w-24 h-24 bg-muted/10 rounded-full flex items-center justify-center mx-auto">
                            <Bell className="w-12 h-12 text-muted-foreground opacity-20" />
                        </div>
                        <div className="space-y-2 max-w-md mx-auto">
                            <h3 className="text-2xl font-bold text-foreground">No alerts yet</h3>
                            <p className="text-muted-foreground">
                                Create your first candidate alert to stay informed about new talent.
                            </p>
                        </div>
                        <Button
                            onClick={handleCreateNew}
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary/5 font-bold h-12 px-8"
                        >
                            Create My First Alert
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {alerts.map((alert) => (
                            <CandidateAlertCard
                                key={alert.id}
                                alert={alert}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onTogglePause={handleTogglePause}
                                onViewMatches={handleViewMatches}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CandidateAlertModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                alert={selectedAlert}
                onSaveSuccess={loadAlerts}
            />

            {selectedAlert && (
                <MatchingCandidatesModal
                    isOpen={isMatchesModalOpen}
                    onClose={() => setIsMatchesModalOpen(false)}
                    filters={selectedAlert.filters}
                    alertTitle={selectedAlert.title}
                />
            )}
        </AppLayout>
    );
};

export default CandidateAlerts;
