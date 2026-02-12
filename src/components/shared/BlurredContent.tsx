import React from 'react';
import { Button } from '../ui/button';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BlurredContentProps {
  children: React.ReactNode;
  isBlurred: boolean;
  message?: string;
  upgradeLink?: string;
  className?: string;
  overlay?: boolean; // show centered overlay prompt
  blockPointer?: boolean; // block interactions when blurred
}

/**
 * Component to blur/pixelate content for users without active packages
 * Used for: shortlists, saved jobs, contact details
 */
const BlurredContent: React.FC<BlurredContentProps> = ({
  children,
  isBlurred,
  message = 'Upgrade to view this content',
  upgradeLink,
  className = '',
  overlay = true,
  blockPointer = true,
}) => {
  const navigate = useNavigate();

  if (!isBlurred) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className={`blur-md select-none opacity-50 ${blockPointer ? 'pointer-events-none' : ''}`}>
        {children}
      </div>

      {/* Optional overlay with upgrade prompt */}
      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-4 p-6">
            <div className="w-12 h-12 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-body text-foreground font-medium">{message}</p>
            {upgradeLink && (
              <Button
                onClick={() => navigate(upgradeLink)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlurredContent;
