"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Upload Your Photo",
    description:
      "Drop any photo into Paper Dots — portraits, landscapes, everyday moments. Works with JPEG and PNG files of any size.",
  },
  {
    number: "02",
    title: "Pick a Paper Texture",
    description:
      "Choose from our collection of hand-drawn paper styles. Each texture gives your photo a different tactile, artistic feel.",
  },
  {
    number: "03",
    title: "Scatter the Dots",
    description:
      "Adjust density, size, and spread to create your perfect look. Export a crisp PNG ready to print or share anywhere.",
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
    <section className="bg-[#F8FAFC] px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-[1200px] mx-auto">
        {/* Section heading */}
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="text-[36px] sm:text-[48px] font-medium text-[#1a1a2e] mb-4"
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              letterSpacing: "-2px",
              lineHeight: "1.1",
            }}
          >
            How to Decorate Your
            <br />
            Photo in 3 Easy Steps
          </h2>
          <p className="text-[16px] text-[#64748b] max-w-[520px] mx-auto leading-[1.6]">
            With our free online photo decorator, you can easily create dotted
            photo art that tells your story.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-14"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={item}
              className="rounded-2xl p-7 flex flex-col gap-5 bg-white border border-slate-200 shadow-sm"
            >
              <span className="text-[13px] font-semibold text-[#4338CA] tracking-wide">
                {step.number}
              </span>

              <h3 className="text-[18px] font-semibold text-[#1a1a2e] leading-[1.2]">
                {step.title}
              </h3>

              <p className="text-[14px] leading-[1.6] text-[#64748b]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
