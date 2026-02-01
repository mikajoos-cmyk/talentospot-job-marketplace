import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Edit2, Trash2, Eye, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { JobAlert, jobAlertService } from '@/services/jobAlertService';
import { Badge } from '@/components/ui/badge';
import MatchingJobsModal from './MatchingJobsModal';

interface JobAlertCardProps {
    alert: JobAlert;
    onEdit: (alert: JobAlert) => void;
    onDelete: (id: string, title: string) => void;
    onTogglePause: (id: string, isPaused: boolean) => void;
}

const JobAlertCard: React.FC<JobAlertCardProps> = ({ alert, onEdit, onDelete, onTogglePause }) => {
    const [matchingCount, setMatchingCount] = useState<number | null>(null);
    const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const jobs = await jobAlertService.getMatchingJobs(alert.filters);
                setMatchingCount(jobs.length || 0);
            } catch (error) {
                console.error('Error fetching matching count:', error);
            }
        };
        fetchCount();
    }, [alert.filters]);

    const filters = alert.filters;

    return (
        <>
            <Card className={`p-6 border border-border bg-card hover:shadow-lg transition-all duration-300 ${alert.is_paused ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-start justify-between md:justify-start gap-3">
                            <div className={`p-2 rounded-xl ${alert.is_paused ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                                {alert.is_paused ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground mb-1">{alert.title}</h3>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <Badge variant={alert.is_paused ? "outline" : "default"} className={alert.is_paused ? "text-muted-foreground" : "bg-success text-success-foreground"}>
                                        {alert.is_paused ? 'Paused' : 'Active'}
                                    </Badge>
                                    {matchingCount !== null && (
                                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                                            {matchingCount} Matching {matchingCount === 1 ? 'Job' : 'Jobs'}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
                            {filters.title && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Briefcase className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{filters.title}</span>
                                </div>
                            )}
                            {(filters.city || filters.country) && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{[filters.city, filters.country].filter(Boolean).join(', ')}</span>
                                </div>
                            )}
                            {filters.sector && filters.sector !== 'all' && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Briefcase className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{filters.sector}</span>
                                </div>
                            )}
                            {filters.salaryRange && (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 250000) && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <DollarSign className="w-4 h-4 shrink-0" />
                                    <span>€{(filters.salaryRange[0] / 1000).toFixed(0)}k - €{(filters.salaryRange[1] / 1000).toFixed(0)}k+</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {filters.employmentTypes?.map(type => (
                                <span key={type} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {type}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 justify-end">
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary-hover font-bold"
                            onClick={() => setIsMatchingModalOpen(true)}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View Jobs
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-border hover:bg-muted text-foreground"
                                onClick={() => onEdit(alert)}
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`flex-1 ${alert.is_paused ? 'text-success hover:bg-success/5 border-success/20' : 'text-warning hover:bg-warning/5 border-warning/20'}`}
                                onClick={() => onTogglePause(alert.id, alert.is_paused)}
                            >
                                {alert.is_paused ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-error hover:bg-error/5 border-error/20"
                                onClick={() => onDelete(alert.id, alert.title)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <MatchingJobsModal
                isOpen={isMatchingModalOpen}
                onClose={() => setIsMatchingModalOpen(false)}
                filters={alert.filters}
                alertTitle={alert.title}
            />
        </>
    );
};

export default JobAlertCard;
