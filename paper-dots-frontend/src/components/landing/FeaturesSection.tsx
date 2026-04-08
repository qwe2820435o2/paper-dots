"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Upload your photo",
    description:
      "Drop any photo — portraits, landscapes, everyday moments. Works with JPEG and PNG.",
  },
  {
    number: "02",
    title: "Pick a paper texture",
    description:
      "Choose from hand-drawn paper styles. Each texture gives your photo a different tactile feel.",
  },
  {
    number: "03",
    title: "Scatter the dots",
    description:
      "Adjust density, size, and spread. Export a crisp PNG ready to print or share.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function FeaturesSection() {
  return (
    <section className="bg-black px-5 sm:px-8 py-24 sm:py-32">
      <div className="max-w-[1200px] mx-auto">
        {/* Section heading */}
        <motion.div
          className="mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="text-[42px] sm:text-[62px] font-medium text-white"
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              letterSpacing: "-3px",
              lineHeight: "1.0",
              fontWeight: 500,
            }}
          >
            Three steps.
            <br />
            That&apos;s it.
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={item}
              className="rounded-[12px] p-7 flex flex-col gap-5"
              style={{
                background: "#090909",
                boxShadow: "rgba(0, 153, 255, 0.15) 0px 0px 0px 1px",
              }}
            >
              <span
                className="text-[13px] font-medium"
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  color: "#0099ff",
                  letterSpacing: "0.02em",
                }}
              >
                {step.number}
              </span>

              <h3
                className="text-[20px] font-semibold text-white"
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  letterSpacing: "-0.8px",
                  lineHeight: "1.2",
                }}
              >
                {step.title}
              </h3>

              <p
                className="text-[14px] leading-[1.6]"
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  color: "#a6a6a6",
                  fontFeatureSettings: '"cv01","cv09","cv11","ss03"',
                }}
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
