import React from 'react';
import AppLayout from '@/components/layout/AppLayout';

const AboutUs: React.FC = () => {
    return (
        <AppLayout isPublic={true}>
            <div className="max-w-4xl mx-auto py-12 px-6">
                <h1 className="text-4xl font-heading font-bold mb-8">About Us</h1>
                <p className="text-body-lg text-muted-foreground mb-6">
                    TalentoSpot is a leading job marketplace dedicated to connecting ambitious professionals with world-class opportunities.
                </p>
                <section className="mb-12">
                    <h2 className="text-2xl font-heading font-semibold mb-4 text-primary">Our Mission</h2>
                    <p className="text-body text-muted-foreground">
                        Our mission is to empower individuals and organizations by providing a platform that values transparency,
                        efficiency, and human-centric design. We believe that the right connection can change a life and a company.
                    </p>
                </section>
                <section className="mb-12">
                    <h2 className="text-2xl font-heading font-semibold mb-4 text-primary">Why TalentoSpot?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        <div className="p-6 rounded-2xl bg-card border border-border">
                            <h3 className="text-lg font-bold mb-2">Verified Profiles</h3>
                            <p className="text-muted-foreground">We ensure that all candidates and employers on our platform are thoroughly vetted.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-card border border-border">
                            <h3 className="text-lg font-bold mb-2">Smart Matching</h3>
                            <p className="text-muted-foreground">Our intelligent algorithms help you find the perfect match based on skills, culture, and goals.</p>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
};

export default AboutUs;
