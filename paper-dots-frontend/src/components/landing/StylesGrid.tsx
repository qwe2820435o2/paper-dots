"use client";

import { motion } from "framer-motion";

const styles = [
  {
    title: "Grid",
    description:
      "Create a clean, uniform dot grid that gives your photo a structured, retro halftone feel.",
    color: "#EDE9FE",
  },
  {
    title: "Scatter",
    description:
      "Randomly scattered dots for an organic, hand-sprinkled look that feels natural and playful.",
    color: "#CCFBF1",
  },
  {
    title: "Pattern",
    description:
      "Combine paper textures with artistic dot patterns for a one-of-a-kind decorative effect.",
    color: "#FEF3C7",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function StylesGrid() {
  return (
    <section className="bg-white px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-[1200px] mx-auto">
        <motion.h2
          className="text-[36px] sm:text-[48px] font-medium text-[#1a1a2e] text-center mb-14"
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            letterSpacing: "-2px",
            lineHeight: "1.1",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Explore Dot Styles
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {styles.map((style) => (
            <motion.div
              key={style.title}
              variants={item}
              className="rounded-2xl overflow-hidden bg-white border border-slate-200 hover:shadow-lg transition-shadow"
            >
              {/* Placeholder preview area */}
              <div
                className="h-48 flex items-center justify-center"
                style={{ backgroundColor: style.color }}
              >
                <div className="grid grid-cols-3 gap-3 p-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg border-2 border-[#4338CA]/40"
                    />
                  ))}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-[18px] font-semibold text-[#1a1a2e] mb-2">
                  {style.title}
                </h3>
                <p className="text-[14px] leading-[1.6] text-[#64748b]">
                  {style.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
