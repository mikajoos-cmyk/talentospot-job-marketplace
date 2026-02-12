import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

interface UpgradeBannerProps {
  message?: string;
  upgradeLink: string;
  className?: string;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({
  message = 'Sie benötigen ein Paket, um alle Kontaktdaten sehen zu können.',
  upgradeLink,
  className = '',
}) => {
  const navigate = useNavigate();

  return (
    <div className={`bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent border border-yellow-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
          <Crown className="w-5 h-5 text-yellow-600" />
        </div>
        <p className="text-body-sm md:text-body font-medium text-foreground">
          {message}
        </p>
      </div>
      <Button
        onClick={() => navigate(upgradeLink)}
        className="bg-yellow-500 hover:bg-yellow-600 text-white border-none shadow-sm whitespace-nowrap group"
      >
        <Crown className="w-4 h-4 mr-2" />
        Upgrade jetzt
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
};

export default UpgradeBanner;
