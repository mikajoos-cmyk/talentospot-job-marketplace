import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      id: 1,
      title: "How do I create an account as a candidate?",
      description1:
        "Simply click on the 'Candidate Signup' button and fill in your details. Once registered, you can browse jobs, apply directly, and manage your applications easily.",
    },
    {
      id: 2,
      title: "I’m an employer. How do I post a job?",
      description1:
        "To post jobs, create a recruiter account. Once logged in, you’ll have access to a dashboard where you can create job listings, manage applications, and view candidate profiles.",
    },
    {
      id: 3,
      title: "Is TalentoSpot free to use?",
      description1:
        "Yes, candidates can sign up and apply to jobs for free. Employers can also post a limited number of jobs for free. For premium features like highlighted job postings and advanced candidate search, subscription plans are available.",
    },
    {
      id: 4,
      title: "How can I track my job applications?",
      description1:
        "Once you apply for a job, you can view the status of your application in your candidate dashboard. You’ll also receive email notifications for updates from recruiters.",
    },
    {
      id: 5,
      title: "Can I update or edit my profile later?",
      description1:
        "Yes, you can update your profile details, skills, and resume anytime from your candidate dashboard. Recruiters will always see your most up-to-date profile.",
    },
    {
      id: 6,
      title: "How secure is my data on TalentoSpot?",
      description1:
        "We take data security seriously. Your personal information is encrypted and only shared with employers when you apply for their job postings.",
    },
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
            Frequently Asked Questions
          </h1>
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
            Find quick answers to common questions about TalentoSpot’s job
            board, whether you’re a candidate or a recruiter.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              variants={SlideLeft(index * 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="border border-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-card overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center p-6 md:p-8 text-left"
              >
                <h2 className="text-lg md:text-xl font-bold flex items-center gap-3">
                  <HelpCircle
                    size={24}
                    className="text-primary flex-shrink-0"
                  />
                  {faq.title}
                </h2>
                {openIndex === index ? (
                  <ChevronUp className="text-primary" />
                ) : (
                  <ChevronDown className="text-muted-foreground" />
                )}
              </button>

              {/* Answer */}
              {openIndex === index && (
                <div className="px-6 md:px-8 pb-8 text-muted-foreground leading-relaxed">
                  <p className="text-body">{faq.description1}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Extra Note */}
        <motion.div
          variants={SlideUp(0.3)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 bg-primary/5 rounded-2xl p-8 border border-primary/10 shadow-sm"
        >
          <h3 className="text-xl font-heading font-bold text-primary mb-3">
            Still have questions?
          </h3>
          <p className="text-primary/80">
            If you didn’t find your answer here, feel free to{" "}
            <span className="font-bold text-primary underline cursor-pointer">contact our support</span> team. We’re always happy to help!
          </p>
        </motion.div>
      </section>
    </AppLayout>
  );
};

export default FAQ;
