import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataWithKey = {
      ...formData,
      access_key: "a0665fed-6590-4256-8348-11cebb3c756a", // Replace with your actual Web3Forms access key
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formDataWithKey),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        toast.error("Failed to send message. Try again later.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.5 },
    }),
  };

  return (
    <AppLayout isPublic={true}>
      <section className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            Contact Us
          </h1>
          <p className="text-body-lg text-muted-foreground">
            We’d love to hear from you! Please use the form below or reach out via our contact details.
          </p>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          className="border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 bg-card mb-8"
        >
          <h2 className="text-2xl font-heading font-bold mb-4">Our Contact Details</h2>
          <p className="text-foreground font-semibold">Talentospot</p>
          <p className="text-muted-foreground">Example Street 123, 12345 City, Country</p>
          <p className="text-muted-foreground mt-4">Email: contact@talentospot.com</p>
          <p className="text-muted-foreground">Phone: +123 456 789</p>
        </motion.div>

        {/* Contact Form */}
        <motion.form
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
          onSubmit={handleSubmit}
          className="border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 bg-card"
        >
          <h2 className="text-2xl font-heading font-bold mb-6">Send us a Message</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none bg-background"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none bg-background"
                placeholder="Your Email"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="mt-6">
            <label className="block text-sm font-bold mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none bg-background"
              placeholder="Your Phone Number"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-bold mb-2">Message</label>
            <textarea
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className="w-full border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none resize-none bg-background"
              placeholder="Your Message"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-60"
          >
            {isLoading ? "Sending..." : "Send Message"}
          </button>
        </motion.form>
      </section>
    </AppLayout>
  );
};

export default ContactUs;
