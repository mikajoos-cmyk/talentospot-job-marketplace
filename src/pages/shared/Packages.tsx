import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';

type UserType = 'employer' | 'candidate';

interface Package {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
}

const Packages: React.FC = () => {
  const [userType, setUserType] = useState<UserType>('employer');

  const employerPackages: Package[] = [
    {
      name: 'Free',
      price: '€0',
      period: 'Forever',
      features: [
        '1 Active Job Posting',
        'Limited Candidate Access',
        'Blurred Candidate Profiles',
        'Basic Search Filters',
        'Email Support',
      ],
    },
    {
      name: 'Standard',
      price: '€499',
      period: 'per year',
      features: [
        '10 Active Job Postings',
        'Full Candidate Access',
        'Advanced Search Filters',
        'Application Tracking',
        'Priority Support',
        'Company Profile Page',
      ],
    },
    {
      name: 'Premium',
      price: '€899',
      period: 'per year',
      features: [
        'Unlimited Job Postings',
        'Full Candidate Access',
        'Advanced Analytics',
        'Featured Job Listings',
        'Dedicated Account Manager',
        'API Access',
        'Custom Branding',
      ],
      highlighted: true,
    },
  ];

  const candidatePackages: Package[] = [
    {
      name: 'Free',
      price: '€0',
      period: 'Forever',
      features: [
        'Basic Profile',
        'Job Search',
        'Apply to Jobs',
        'Email Notifications',
        'Standard Support',
      ],
    },
    {
      name: 'Starting',
      price: '€59',
      period: 'per year',
      features: [
        'Enhanced Profile',
        'Priority in Search Results',
        'Application Tracking',
        'Resume Builder',
        'Career Advice',
        'Priority Support',
      ],
    },
    {
      name: 'Premium',
      price: '€299',
      period: 'per year',
      features: [
        'Featured Profile',
        'Top Search Placement',
        'Video Introduction',
        'Portfolio Showcase',
        'Direct Employer Contact',
        'Career Coaching',
        'Interview Preparation',
      ],
      highlighted: true,
    },
  ];

  const packages = userType === 'employer' ? employerPackages : candidatePackages;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-h1 font-heading text-foreground mb-2">Choose Your Plan</h1>
          <p className="text-body text-muted-foreground mb-8">
            Select the perfect package for your needs
          </p>

          <div className="inline-flex rounded-lg border border-border bg-muted p-1">
            <Button
              variant={userType === 'employer' ? 'default' : 'ghost'}
              onClick={() => setUserType('employer')}
              className={`font-normal ${
                userType === 'employer'
                  ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                  : 'bg-transparent text-foreground hover:bg-background hover:text-foreground'
              }`}
            >
              For Employers
            </Button>
            <Button
              variant={userType === 'candidate' ? 'default' : 'ghost'}
              onClick={() => setUserType('candidate')}
              className={`font-normal ${
                userType === 'candidate'
                  ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                  : 'bg-transparent text-foreground hover:bg-background hover:text-foreground'
              }`}
            >
              For Candidates
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <Card
              key={pkg.name}
              className={`p-8 border ${
                pkg.highlighted
                  ? 'border-primary shadow-xl scale-105'
                  : 'border-border'
              } bg-card relative`}
            >
              {pkg.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center space-x-1 px-4 py-1 bg-primary text-primary-foreground rounded-full text-caption font-medium">
                    <Star className="w-3 h-3" strokeWidth={2} fill="currentColor" />
                    <span>Best Value</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-h3 font-heading text-foreground mb-2">{pkg.name}</h3>
                <div className="mb-2">
                  <span className="text-h1 font-heading text-foreground">{pkg.price}</span>
                  <span className="text-body text-muted-foreground ml-2">/ {pkg.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-body-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-normal ${
                  pkg.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                    : 'bg-transparent text-foreground border border-border hover:bg-muted hover:text-foreground'
                }`}
                variant={pkg.highlighted ? 'default' : 'outline'}
              >
                {pkg.price === '€0' ? 'Get Started' : 'Upgrade Now'}
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-body text-muted-foreground mb-4">
            Need a custom solution? Contact our sales team.
          </p>
          <Button
            variant="outline"
            className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Packages;
