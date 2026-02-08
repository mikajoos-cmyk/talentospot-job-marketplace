import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  ClipboardList,
  Briefcase,
  Clock,
  CheckCircle,
  Building2,
  Users,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";

const HowItWorks: React.FC = () => {
  const stepCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.4 },
    }),
  };

  return (
    <AppLayout isPublic={true}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            How It Works
          </h1>
          <p className="text-body-lg text-muted-foreground max-w-3xl mx-auto">
            Talentospot makes it simple for candidates to find their dream jobs
            and for employers to connect with top talent.
          </p>
        </motion.div>

        {/* Candidate Section */}
        <div className="mb-28">
          <h2 className="text-3xl font-heading font-bold mb-10">
            For Candidates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <ClipboardList className="text-primary w-8 h-8" />,
                title: "Register & Showcase Yourself",
                content:
                  "Show your strengths, skills, awards and let employers know when you can start.",
              },
              {
                icon: <Briefcase className="text-primary w-8 h-8" />,
                title: "Complete Profile & Set Conditions",
                content:
                  "Set your salary expectations, bonuses, vacation days, and flexible hours.",
              },
              {
                icon: <Clock className="text-primary w-8 h-8" />,
                title: "Wait for Offers & Stay Active",
                content:
                  "Receive offers, chat internally, or actively apply to jobs.",
              },
              {
                icon: <CheckCircle className="text-primary w-8 h-8" />,
                title: "Choose Your Employer",
                content: "Pick the best offer and conditions that suit you.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={stepCardVariants}
                initial="hidden"
                animate="visible"
              >
                <StepCard {...step} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Employer Section */}
        <div>
          <h2 className="text-3xl font-heading font-bold mb-10">
            For Employers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Building2 className="text-primary w-8 h-8" />,
                title: "Register With Us",
                content:
                  "Create your employer account to start finding qualified candidates.",
              },
              {
                icon: <Users className="text-primary w-8 h-8" />,
                title: "Create Your Profile",
                content:
                  "Set up your company profile and define what you're looking for.",
              },
              {
                icon: <Search className="text-primary w-8 h-8" />,
                title: "Find The Right Talent",
                content:
                  "Use our super filter to find staff quickly — even beyond Germany.",
              },
              {
                icon: <CheckCircle className="text-primary w-8 h-8" />,
                title: "Hire & Manage Employees",
                content:
                  "Choose the best candidates and manage them efficiently.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={stepCardVariants}
                initial="hidden"
                animate="visible"
              >
                <StepCard {...step} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

// StepCard Component
interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

const StepCard: React.FC<StepCardProps> = ({ icon, title, content }) => (
  <div className="flex flex-col items-start p-8 bg-card rounded-2xl shadow-sm border border-border hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-center w-16 h-16 mb-6 bg-primary/10 rounded-2xl">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{content}</p>
  </div>
);

export default HowItWorks;
