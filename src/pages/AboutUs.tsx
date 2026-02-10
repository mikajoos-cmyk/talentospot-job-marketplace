import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { motion } from "framer-motion";
// import Testimonials from "@/components/ReviewCard"; // Angenommen, Testimonials ist hier
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const AboutUs: React.FC = () => {
  const SlideUp = (delay: number) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.5 },
    },
  });

  const SlideLeft = (delay: number) => ({
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay, duration: 0.5 },
    },
  });

  return (
    <AppLayout isPublic={true}>
      <section className="w-full px-6 py-12">
        {/* About Section */}
        <div className="mt-8">
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-8 text-center">
            About Talentospot.com
          </h1>
          <div className="max-w-4xl text-center mx-auto space-y-8">
            <motion.p
              variants={SlideUp(0.3)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-body-lg text-muted-foreground leading-relaxed"
            >
              Find the perfect fit for your team among a pool of skilled professionals waiting to make a difference. 
              Use our super filter to find your staff quickly and easily.
            </motion.p>
            
            <motion.div
              variants={SlideUp(0.4)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12"
            >
              <div className="text-left p-8 rounded-2xl bg-card border border-border">
                <h3 className="text-2xl font-heading font-bold mb-4">You are an employer</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We help you find talent faster, easier and more efficiently! Use our super filter to find the right candidate for you. 
                  Don't just limit your search to Germany. You can also filter by other countries. Many refugees or immigrants with 
                  a wide range of qualifications are also available to you as potential staff.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You can also benefit from the many years of experience and knowledge of our retirees. Take a close look at the conditions 
                  the candidate sets for you so that he or she can join you as a new member. Get in touch with him directly.
                </p>
              </div>

              <div className="text-left p-8 rounded-2xl bg-card border border-border">
                <h3 className="text-2xl font-heading font-bold mb-4">You are a talent</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Are you a student, trainee, already established in your job, dissatisfied with your current job or simply looking for a new challenge?
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Then you've come to the right place. Create a profile, maybe even a CV. Set your conditions to the new employer for your new job. 
                  For example, your minimum number of vacation days, entry bonus or the length of the probationary period.
                </p>
              </div>
            </motion.div>

            {/* Find Talent Button */}
            <motion.div
              variants={SlideUp(0.6)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="pt-8"
            >
              <Link
                to="/candidates"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-10 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Search className="w-5 h-5" />
                Find Talent
              </Link>
            </motion.div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              How It Works?
            </h2>
            <p className="text-lg text-muted-foreground">Job for anyone, anywhere</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              variants={SlideLeft(0.2)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-card p-10 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 text-center"
            >
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">1</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4">
                Free Resume Assessments
              </h3>
              <p className="text-muted-foreground">
                Employers on average spend 31 seconds scanning resumes to
                identify potential matches.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              variants={SlideLeft(0.4)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-card p-10 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 text-center"
            >
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">2</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4">
                Job Fit Scoring
              </h3>
              <p className="text-muted-foreground">
                Our advanced algorithm scores your resume against job criteria.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              variants={SlideLeft(0.6)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-card p-10 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 text-center"
            >
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4">
                Help Every Step
              </h3>
              <p className="text-muted-foreground">
                Receive expert guidance throughout your job search journey.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default AboutUs;
