import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, Calendar, Clock, UserPlus } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { CandidateProfile } from '@/types/candidate';
import { mockJobs } from '@/data/mockJobs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CandidateCardProps {
  candidate: CandidateProfile;
  packageTier: 'free' | 'basic' | 'premium';
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, packageTier }) => {
  const { showToast } = useToast();
  const isBlurred = packageTier === 'free';
  const canContact = packageTier === 'premium';

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const [requestPending, setRequestPending] = useState(false);

  const handleAction = async () => {
    if (canContact) {
      showToast({
        title: 'Contact Initiated',
        description: `You can now contact ${candidate.name}`,
      });
    } else {
      // Simulate API call
      setRequestPending(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      showToast({
        title: 'Request Sent',
        description: `Personal data request sent to ${isBlurred ? 'candidate' : candidate.name}`,
      });
    }
  };

  const handleInvite = (jobTitle: string) => {
    showToast({
      title: 'Invitation Sent',
      description: `${candidate.name} has been invited to apply for ${jobTitle}`,
    });
    setInviteDialogOpen(false);
  };

  const displayName = isBlurred ? `Candidate #${candidate.id.padStart(3, '0')}` : candidate.name;

  return (
    <>
      <Card className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Avatar className={`w-16 h-16 ${isBlurred ? 'blur-md' : ''}`}>
                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isBlurred && (
                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {candidate.isRefugee && (
                <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-caption rounded-md mb-2">
                  Refugee/Immigrant
                </span>
              )}
              <h4 className="text-h4 font-heading text-foreground truncate">
                {displayName}
              </h4>
              <p className="text-body-sm text-muted-foreground">{candidate.title}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-body-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
              <span>{candidate.location}</span>
            </div>
            <div className="flex items-center text-body-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
              <span>
                ${candidate.salary.min.toLocaleString()} - ${candidate.salary.max.toLocaleString()}
              </span>
            </div>
          </div>

          {candidate.conditions.entryBonus && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-medium text-warning">Entry Bonus</span>
                <span className="text-h4 font-heading text-warning">€{candidate.conditions.entryBonus.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {candidate.conditions.startDate && (
              <div className="flex items-center px-2 py-1 bg-info/10 text-info text-caption rounded-md">
                <Calendar className="w-3 h-3 mr-1" strokeWidth={1.5} />
                <span>{new Date(candidate.conditions.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {candidate.conditions.noticePeriod && (
              <div className="flex items-center px-2 py-1 bg-muted text-foreground text-caption rounded-md">
                <Clock className="w-3 h-3 mr-1" strokeWidth={1.5} />
                <span>{candidate.conditions.noticePeriod}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {candidate.skills.slice(0, 3).map((skill) => (
              <span
                key={skill.name}
                className="px-2 py-1 bg-muted text-foreground text-caption rounded-md"
              >
                {skill.name}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="px-2 py-1 bg-muted text-foreground text-caption rounded-md">
                +{candidate.skills.length - 3}
              </span>
            )}
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleAction}
              disabled={requestPending}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover font-normal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canContact ? 'Contact' : requestPending ? 'Request Pending' : 'Request Data'}
            </Button>
            <Button 
              onClick={() => setInviteDialogOpen(true)}
              variant="outline"
              className="flex-1 bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              <UserPlus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Invite
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Invite to Apply</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Select a job to invite {isBlurred ? 'this candidate' : candidate.name} to apply
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
            {mockJobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => handleInvite(job.title)}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={job.image}
                    alt={job.company}
                    className="w-12 h-12 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h4 className="text-body font-medium text-foreground mb-1">{job.title}</h4>
                    <p className="text-body-sm text-muted-foreground mb-2">{job.location}</p>
                    <div className="flex items-center space-x-4 text-caption text-muted-foreground">
                      <span>{job.type}</span>
                      <span>•</span>
                      <span>{job.salary}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CandidateCard;
