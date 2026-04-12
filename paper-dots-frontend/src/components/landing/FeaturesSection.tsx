"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Upload & Auto-Analyze",
    description:
      "Drop your favorite photos! Our smart engine analyzes your photo's color palette to automatically generate a matching polka dot pattern and layout that perfectly fits the vibe.",
  },
  {
    number: "02",
    title: "Customize Your Style",
    description:
      "Make it yours! Tweak the dot pattern, swap the background, or play with the layout until it's \"grid-ready.\"",
  },
  {
    number: "03",
    title: "Download & Glow Up",
    description:
      "Save your high-res creation instantly. No watermarks, no hassle—just pure aesthetic.",
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
              fontFamily: "var(--font-quicksand), sans-serif",
              letterSpacing: "-2px",
              lineHeight: "1.1",
            }}
          >
            How to Generate an Aesthetic Dot Image?
          </h2>
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
              className="rounded-2xl overflow-hidden flex flex-col bg-white border border-[#E8F5D2] shadow-[0_4px_24px_rgba(197,232,154,0.18)]"
            >
              {/* Image placeholder */}
              <div className="w-full aspect-[4/3] bg-slate-100 flex items-center justify-center">
                <span className="text-[13px] text-slate-400">Image coming soon</span>
              </div>

              {/* Text */}
              <div className="p-7 flex flex-col gap-3">
                <h3 className="text-[18px] font-semibold text-[#1a1a2e] leading-[1.2]">
                  Step {step.number.replace(/^0/, "")}: {step.title}
                </h3>
                <p className="text-[14px] leading-[1.6] text-[#64748b]">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
