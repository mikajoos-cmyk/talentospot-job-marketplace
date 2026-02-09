import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";

const Terms: React.FC = () => {
  const faqs = [
    {
      id: 1,
      title: "Introduction",
      description1: "By accessing and using TalentoSpot, you agree to be bound by these Terms and Conditions. Our platform connects candidates with potential employers globally.",
    },
    {
      id: 2,
      title: "User Accounts",
      description1: "Users are responsible for maintaining the confidentiality of their account information. You must provide accurate and complete information during registration.",
    },
    {
      id: 3,
      title: "Platform Usage",
      description1: "The platform may only be used for lawful purposes. Candidates can browse and apply for jobs, while employers can post job listings and search for talent.",
    },
    {
        id: 4,
        title: "Intellectual Property",
        description1: "All content on this website, including text, graphics, and logos, is the property of TalentoSpot and protected by international copyright laws.",
    }
  ];

  const SlideLeft = (delay: number) => ({
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay, duration: 0.5 },
    },
  });

  const SlideUp = (delay: number) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.5 },
    },
  });

  return (
    <AppLayout isPublic={true}>
      <section className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            Terms and Conditions
          </h1>
          <p className="text-body-lg text-muted-foreground">
            Please read these terms and conditions carefully before using our services.
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              variants={SlideLeft(index * 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 bg-card"
            >
              <h2 className="text-2xl font-heading font-bold mb-4 flex items-start">
                <span className="text-primary mr-4">{faq.id}.</span>
                {faq.title}
              </h2>
              <div className="text-muted-foreground space-y-4 pl-9 leading-relaxed">
                <p>{faq.description1}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Legal Notice */}
        <motion.div
          variants={SlideUp(0.3)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 bg-primary/5 rounded-2xl p-8 border border-primary/10 shadow-sm"
        >
          <h3 className="text-xl font-heading font-bold text-primary mb-3">
            Legal Notice
          </h3>
          <p className="text-primary/80 leading-relaxed">
            By using our services, you agree to these terms and conditions in
            full. If you disagree with any part of these terms, please do not
            use our services.
          </p>
        </motion.div>
      </section>
    </AppLayout>
  );
};

export default Terms;
