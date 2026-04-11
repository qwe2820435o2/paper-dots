"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import SketchLoader from "@/components/common/SketchLoader";
import DotPattern from "./DotPattern";

export default function CtaSection() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function handleEnter() {
    setIsLoading(true);
    router.push("/decorate");
  }

  return (
    <section className="relative bg-white px-5 sm:px-8 py-24 sm:py-32 overflow-hidden">
      {/* Dot pattern decoration */}
      <div className="absolute top-10 right-10 w-[120px] h-[80px] opacity-20">
        <DotPattern color="#F39EB6" dotSize={3} spacing={14} />
      </div>
      <div className="absolute bottom-10 left-10 w-[100px] h-[60px] opacity-15">
        <DotPattern color="#F39EB6" dotSize={3} spacing={14} />
      </div>

      <div className="max-w-[1200px] mx-auto border-t border-slate-200">
        <motion.div
          className="pt-20 sm:pt-24 flex flex-col items-center text-center gap-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="text-[42px] sm:text-[56px] lg:text-[72px] font-medium text-[#1a1a2e]"
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              letterSpacing: "-3px",
              lineHeight: "1.0",
              fontWeight: 500,
            }}
          >
            Ready to Dot
            <br />
            Your Photo?
          </h2>

          <p className="text-[17px] leading-[1.6] max-w-[340px] text-[#64748b]">
            Free, instant, no account needed.
          </p>

          <div className="min-h-[52px] flex items-center">
            <AnimatePresence mode="wait">
              {!isLoading ? (
                <motion.button
                  key="cta"
                  onClick={handleEnter}
                  className="bg-[#F39EB6] text-white text-[15px] font-medium px-8 py-3.5 rounded-full cursor-pointer hover:bg-[#E8809E] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                >
                  Get Started
                </motion.button>
              ) : (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <SketchLoader message="Setting up..." compact />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
