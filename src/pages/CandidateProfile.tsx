import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { useUser } from '../contexts/UserContext';
import { candidateService } from '../services/candidate.service';
import { Loader2, UserCircle, Pencil } from 'lucide-react';
import { SharedCandidateProfile } from '../components/shared/SharedCandidateProfile';

const CandidateProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [candidateData, setCandidateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Funktion zur dynamischen Berechnung des Fortschritts
  const calculateCompletion = (data: any, userProfile: any) => {
    let score = 0;

    // Basisdaten (User Context + Profile)
    if (userProfile?.name) score += 10;
    if (userProfile?.email) score += 5;
    if (data.title) score += 10;
    if (data.street || data.city || data.country) score += 5;
    if (data.phone) score += 5;

    // Konditionen
    if (data.salary?.min || data.salary?.max) score += 10;

    // Qualifikationen & Skills
    if (data.skills && data.skills.length > 0) score += 15;
    if (data.languages && data.languages.length > 0) score += 10;
    if (data.tags && data.tags.length > 0) score += 5;

    // Erfahrung & Bildung
    if (data.experience && data.experience.length > 0) score += 15;
    if (data.education && data.education.length > 0) score += 15;
    if (data.cvUrl) score += 5;

    return Math.min(score, 100);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data = await candidateService.getCandidateProfile(user.id);
        setCandidateData(data);

        if (data) {
          setProfileCompletion(calculateCompletion(data, user));
        }
      } catch (error) {
        console.error('Error fetching candidate profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id, user]);

  if (loading) {
    return (
        <AppLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        </AppLayout>
    );
  }

  if (!candidateData) return null;

  // Buttons für den Header
  const ProfileActions = (
      <>
        <Button
            variant="outline"
            onClick={() => {
              const url = `/employer/candidates/${user?.id}?preview=true`;
              console.log('[CandidateProfile] Opening Public View URL:', url);
              window.open(url, '_blank');
            }}
            className="hidden sm:flex"
        >
          <UserCircle className="w-4 h-4 mr-2" />
          Public View
        </Button>
        <Button
            onClick={() => navigate('/candidate/profile/edit')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </>
  );

  return (
      <AppLayout>
        <SharedCandidateProfile
            data={candidateData}
            user={user}
            isOwnProfile={true}
            isBlurred={false}
            profileCompletion={profileCompletion}
            actions={ProfileActions}
        />
      </AppLayout>
  );
};

export default CandidateProfile;