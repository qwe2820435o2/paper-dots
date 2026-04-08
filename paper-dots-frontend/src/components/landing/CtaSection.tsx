"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import SketchLoader from "@/components/common/SketchLoader";

export default function CtaSection() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function handleEnter() {
    setIsLoading(true);
    router.push("/decorate");
  }

  return (
    <section className="bg-black px-5 sm:px-8 py-24 sm:py-32">
      <div
        className="max-w-[1200px] mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <motion.div
          className="pt-20 sm:pt-24 flex flex-col items-center text-center gap-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="text-[48px] sm:text-[72px] lg:text-[88px] font-medium text-white"
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              letterSpacing: "-4.5px",
              lineHeight: "0.88",
              fontWeight: 500,
            }}
          >
            Ready to dot
            <br />
            your photo?
          </h2>

          <p
            className="text-[17px] leading-[1.6] max-w-[340px]"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              color: "#a6a6a6",
              fontFeatureSettings: '"cv01","cv05","cv09","cv11","ss03","ss07"',
            }}
          >
            Free, instant, no account needed.
          </p>

          <div className="min-h-[52px] flex items-center">
            <AnimatePresence mode="wait">
              {!isLoading ? (
                <motion.button
                  key="cta"
                  onClick={handleEnter}
                  className="bg-white text-black text-[15px] font-medium px-8 py-3.5 rounded-[100px] cursor-pointer"
                  style={{
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    fontWeight: 500,
                  }}
                  whileHover={{ opacity: 0.88 }}
                  whileTap={{ scale: 0.96 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                >
                  Start decorating →
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
