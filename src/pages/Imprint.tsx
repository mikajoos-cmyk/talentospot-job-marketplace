import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";

const Imprint: React.FC = () => {
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
      title: "Company Information",
      content: (
        <>
          <p className="font-semibold">Talentospot</p>
          <p>Example Street 123</p>
          <p>12345 City, Country</p>
        </>
      ),
    },
    {
      title: "Contact",
      content: (
        <>
          <p>Email: contact@talentospot.com</p>
          <p>Phone: +123 456 789</p>
        </>
      ),
    },
    {
      title: "Responsible for Content",
      content: <p>Dino</p>,
    },
    {
      title: "Disclaimer",
      content: (
        <p>
          While we make every effort to keep the information on this website up to
          date, we do not accept liability for the content provided. External links
          are the responsibility of their respective owners.
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
            Legal Notice (Imprint)
          </h1>
          <p className="text-body-lg text-muted-foreground">
            This page provides mandatory legal information in accordance with European regulations.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8 text-foreground">
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
      </section>
    </AppLayout>
  );
};

export default Imprint;
