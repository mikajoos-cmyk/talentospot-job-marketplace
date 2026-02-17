import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Star, Loader2, CheckCircle2 } from 'lucide-react';
import { packagesService } from '@/services/packages.service';
import { useToast } from '@/contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Pricing: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employerPackages, setEmployerPackages] = useState<any[]>([]);
  const [candidatePackages, setCandidatePackages] = useState<any[]>([]);

  useEffect(() => {
    const loadAllPackages = async () => {
      try {
        setLoading(true);
        const [empPkgs, candPkgs] = await Promise.all([
          packagesService.getPackages('employer'),
          packagesService.getPackages('candidate')
        ]);
        setEmployerPackages(empPkgs || []);
        setCandidatePackages(candPkgs || []);
      } catch (error) {
        console.error('Error loading pricing packages:', error);
        showToast({
          title: 'Error',
          description: 'Failed to load pricing information',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadAllPackages();
  }, []);

  const formatFeatures = (pkg: any) => {
    const features = [];
    if (pkg.target_role === 'employer') {
      features.push(pkg.limit_contacts === null || pkg.limit_contacts === undefined ? 'Unlimited Contact Requests' : `${pkg.limit_contacts} Contact Requests`);
      features.push(pkg.limit_jobs === null || pkg.limit_jobs === undefined ? 'Unlimited Job Postings' : `${pkg.limit_jobs} Job Postings`);
      if (pkg.limit_featured_jobs > 0) features.push(`${pkg.limit_featured_jobs} Featured Jobs`);
      if (pkg.contact_requests_limit !== undefined) {
          features.push(pkg.contact_requests_limit === null ? 'Unlimited Contact Requests' : `${pkg.contact_requests_limit} Contact Requests`);
      }
      if (pkg.job_posts_limit !== undefined) {
          features.push(pkg.job_posts_limit === null ? 'Unlimited Job Postings' : `${pkg.job_posts_limit} Job Postings`);
      }
      if (pkg.featured_jobs_limit > 0) features.push(`${pkg.featured_jobs_limit} Featured Jobs`);
      
      features.push(`${pkg.duration_days || 365} Days Active`);
    } else {
      if (pkg.can_search_jobs) {
        features.push('Unlimited Job Search');
      } else {
        features.push('Invitation Only (Passive)');
      }
      features.push(pkg.limit_applications === null || pkg.limit_applications === undefined ? 'Unlimited Applications' : `${pkg.limit_applications} Applications`);
      if (pkg.self_applications_limit !== undefined) {
          features.push(pkg.self_applications_limit === null ? 'Unlimited Applications' : `${pkg.self_applications_limit} Applications`);
      }
      if (pkg.price_yearly > 0) {
        features.push('Priority in Search Results');
        features.push('Enhanced Profile Visibility');
      }
    }
    features.push('Email Support');
    return features;
  };

  const PackageCard = ({ pkg }: { pkg: any }) => {
    const price = pkg.price_yearly !== undefined ? pkg.price_yearly : 0;
    const isHighlight = pkg.name.toLowerCase().includes('premium') || price === 499 || price === 59 || price === 899;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className={`p-6 border ${
            isHighlight
              ? 'border-primary shadow-xl scale-105'
              : 'border-border shadow-sm'
          } bg-card relative h-full flex flex-col transition-all duration-300 hover:shadow-lg`}
        >
          {isHighlight && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="flex items-center space-x-1 px-4 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold shadow-md">
                <Star className="w-3 h-3" strokeWidth={3} fill="currentColor" />
                <span>POPULAR CHOICE</span>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">{pkg.name}</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-heading font-black text-foreground">
                {price === 0 ? 'Free' : `€${price}`}
              </span>
              {price > 0 && (
                <span className="text-muted-foreground font-medium">/year</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {price === 0 ? 'Basic features for everyone' : 'Professional features for growth'}
            </p>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            {formatFeatures(pkg).map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-1 bg-primary/10 rounded-full p-0.5">
                  <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                </div>
                <span className="text-sm text-foreground/80 font-medium">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className={`w-full py-6 text-lg font-bold rounded-xl transition-all duration-300 ${
              isHighlight
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02]'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            onClick={() => navigate('/register')}
          >
            Get Started
          </Button>
        </Card>
      </motion.div>
    );
  };

  return (
    <AppLayout isPublic={true}>
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-heading font-black tracking-tight text-foreground mb-6"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Choose the plan that's right for you and start connecting with the best talent and jobs today.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Loading our best plans...</p>
          </div>
        ) : (
          <Tabs defaultValue="employer" className="w-full">
            <div className="flex justify-center mb-16">
              <TabsList className="bg-muted p-1 rounded-2xl h-auto">
                <TabsTrigger 
                  value="employer" 
                  className="px-8 py-3 rounded-xl text-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all"
                >
                  For Employers
                </TabsTrigger>
                <TabsTrigger 
                  value="candidate" 
                  className="px-8 py-3 rounded-xl text-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all"
                >
                  For Talents
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="employer">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                {employerPackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
              <div className="mt-16 p-8 rounded-3xl bg-primary/5 border border-primary/10 text-center">
                <h3 className="text-2xl font-heading font-bold mb-2">Need a Custom Enterprise Solution?</h3>
                <p className="text-muted-foreground mb-6">We offer tailored packages for large organizations with specific recruitment needs.</p>
                <Button variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white" onClick={() => navigate('/contact')}>
                  Contact Our Sales Team
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="candidate">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch justify-center mx-auto">
                {candidatePackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-muted/30 rounded-[3rem] mt-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Have Questions?</h2>
          <p className="text-muted-foreground mb-10">Check out our frequently asked questions or get in touch with our support.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary" className="rounded-xl px-8" onClick={() => navigate('/faq')}>View FAQ</Button>
            <Button variant="outline" className="rounded-xl px-8" onClick={() => navigate('/contact')}>Contact Us</Button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default Pricing;
