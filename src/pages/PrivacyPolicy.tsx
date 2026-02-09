import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";

const PrivacyPolicy: React.FC = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.5 },
    }),
  };

  const sections = [
    {
      title: "1. Data Collection",
      content: (
        <p>
          We collect personal data such as name, email, and address when you
          register, apply for jobs, or post job listings.
        </p>
      ),
    },
    {
      title: "2. Data Usage",
      content: (
        <p>
          Your information is used to provide and improve our services,
          including job matching, communication, and account management.
        </p>
      ),
    },
    {
      title: "3. Data Protection",
      content: (
        <p>
          We implement security measures to protect your personal data. We do
          not sell or share your data with third parties without your consent.
        </p>
      ),
    },
    {
      title: "4. Your Rights",
      content: (
        <p>
          You have the right to access, update, or delete your personal data at
          any time by contacting us.
        </p>
      ),
    },
  ];

  return (
    <AppLayout isPublic={true}>
      <section className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-body-lg text-muted-foreground">
            Your privacy is important to us. This Privacy Policy explains how we
            collect, use, and protect your personal data.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6 text-foreground">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
              className="border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 bg-card"
            >
              <h2 className="text-2xl font-heading font-bold mb-4">{section.title}</h2>
              <div className="text-muted-foreground leading-relaxed">{section.content}</div>
            </motion.div>
          ))}
        </div>

        {/* Optional Legal Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 bg-primary/5 rounded-2xl p-8 border border-primary/10"
        >
          <h3 className="text-xl font-heading font-bold text-primary mb-3">
            Legal Notice
          </h3>
          <p className="text-primary/80 leading-relaxed">
            By using our services, you agree to this Privacy Policy. We are
            committed to protecting your data and privacy.
          </p>
        </motion.div>
      </section>
    </AppLayout>
  );
};

export default PrivacyPolicy;
