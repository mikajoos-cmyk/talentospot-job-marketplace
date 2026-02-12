import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Star, Building2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { mockFollowers } from '../../data/mockInvitations';
import { mockCompanies } from '../../data/mockCompanies';
import { CandidateFollower } from '../../types/invitation';
import { packagesService } from '../../services/packages.service';
import BlurredContent from '../../components/shared/BlurredContent';
import UpgradeBanner from '../../components/shared/UpgradeBanner';

const Followers: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [hasActivePackage, setHasActivePackage] = useState(false);

  React.useEffect(() => {
    const fetchFollowers = async () => {
      if (!user?.id) return;
      try {
        const hasPackage = await packagesService.hasActivePackage(user.id);
        setHasActivePackage(hasPackage);
      } catch (error) {
        console.error('Error checking package status:', error);
      }
    };
    fetchFollowers();
  }, [user?.id]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">Companies Interested in You</h1>
          <p className="text-body text-muted-foreground">
            See which companies have shortlisted your profile.
          </p>
        </div>

        {/* Hinweis-Banner oben, wenn Paket fehlt */}
        {!hasActivePackage && (
          <UpgradeBanner
            message="Sie benötigen ein Paket, um die Kontaktdaten der Unternehmen sehen zu können."
            upgradeLink="/candidate/packages"
          />
        )}

        <div>
          <p className="text-body text-foreground mb-6">
            <span className="font-medium">{mockFollowers.length}</span> companies are following you
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockFollowers.map((follower: CandidateFollower) => {
              const company = mockCompanies.find((c: any) => c.id === follower.companyId);
              const content = (
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className={!hasActivePackage ? 'blur-sm select-none' : ''}>
                      <img
                        src={company?.logo || 'https://ui-avatars.com/api/?name=' + company?.name + '&background=6366f1&color=fff'}
                        alt={follower.companyName}
                        className="w-16 h-16 rounded-lg object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-h4 font-heading text-foreground mb-1 ${!hasActivePackage ? 'blur-sm select-none' : ''}`}>
                        {follower.companyName}
                      </h3>
                      {company && (
                        <p className="text-body-sm text-muted-foreground">{company.industry}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center text-caption text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    <span>Shortlisted {new Date(follower.followedDate).toLocaleDateString()}</span>
                  </div>

                  <Button
                    onClick={() => navigate(`/companies/${follower.companyId}`)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                  >
                    <Building2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    View Company
                  </Button>
                </div>
              );

              return (
                <Card key={follower.id} className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
                  {content}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Followers;
