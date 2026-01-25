import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  salary: { min: number; max: number };
  skills: string[];
  isRefugee: boolean;
  country?: string;
  avatar?: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  packageTier: 'free' | 'basic' | 'premium';
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, packageTier }) => {
  const { showToast } = useToast();
  const isBlurred = packageTier === 'free';
  const canContact = packageTier === 'premium';

  const handleAction = () => {
    if (canContact) {
      showToast({
        title: 'Contact Initiated',
        description: `You can now contact ${candidate.name}`,
      });
    } else {
      showToast({
        title: 'Request Sent',
        description: 'Personal data request has been submitted',
      });
    }
  };

  return (
    <Card className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
      <div className="flex flex-col space-y-4">
        <div className="flex items-start space-x-4">
          <Avatar className={`w-16 h-16 ${isBlurred ? 'blur-sm' : ''}`}>
            <AvatarImage src={candidate.avatar} alt={candidate.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {candidate.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {candidate.isRefugee && (
              <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-caption rounded-md mb-2">
                Refugee/Immigrant
              </span>
            )}
            <h4 className="text-h4 font-heading text-foreground truncate">
              {isBlurred ? candidate.name.split(' ')[0] + ' ***' : candidate.name}
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

        <div className="flex flex-wrap gap-2">
          {candidate.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-muted text-foreground text-caption rounded-md"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 3 && (
            <span className="px-2 py-1 bg-muted text-foreground text-caption rounded-md">
              +{candidate.skills.length - 3}
            </span>
          )}
        </div>

        <Button 
          onClick={handleAction}
          className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
        >
          {canContact ? 'Contact' : 'Request Personal Data'}
        </Button>
      </div>
    </Card>
  );
};

export default CandidateCard;
