import React from 'react';
import AppLayout from '@/components/layout/AppLayout';

const HowItWorks: React.FC = () => {
    return (
        <AppLayout isPublic={true}>
            <div className="max-w-4xl mx-auto py-12 px-6">
                <h1 className="text-4xl font-heading font-bold mb-8 text-center">How It Works</h1>
                <p className="text-body-lg text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
                    Discover how TalentoSpot makes recruitment simple, fast, and effective for everyone involved.
                </p>

                <div className="space-y-16">
                    <section className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold mb-4">1</span>
                            <h2 className="text-2xl font-heading font-semibold mb-4">Create Your Profile</h2>
                            <p className="text-body text-muted-foreground">
                                Whether you're a job seeker or an employer, start by creating a comprehensive profile that highlights your skills or your company's culture.
                            </p>
                        </div>
                        <div className="flex-1 w-full aspect-video bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                            [Profile Setup Illustration]
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row-reverse gap-8 items-center">
                        <div className="flex-1">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent text-white font-bold mb-4">2</span>
                            <h2 className="text-2xl font-heading font-semibold mb-4">Search & Match</h2>
                            <p className="text-body text-muted-foreground">
                                Use our powerful filters to find precisely what you're looking for. Our AI helps prioritize the best matches for you.
                            </p>
                        </div>
                        <div className="flex-1 w-full aspect-video bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                            [Search Interface Illustration]
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-info text-white font-bold mb-4">3</span>
                            <h2 className="text-2xl font-heading font-semibold mb-4">Connect & Succeed</h2>
                            <p className="text-body text-muted-foreground">
                                Message directly through our platform, schedule interviews, and finalize your next big move or hire.
                            </p>
                        </div>
                        <div className="flex-1 w-full aspect-video bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                            [Success Illustration]
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
};

export default HowItWorks;
