"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import DecorativeBlob from "./DecorativeBlob";
import DotPattern from "./DotPattern";
import { useAppDispatch } from "@/store/hooks";
import { resetDecorate } from "@/store/slices/decorateSlice";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HeroSection() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  function handleEnter() {
    dispatch(resetDecorate());
    setIsLoading(true);
    router.push("/decorate");
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 pt-8 pb-20 overflow-hidden bg-[#FFF9E0]">
      {/* Decorative blobs */}
      <DecorativeBlob
        color="#FEF3C7"
        size={400}
        className="absolute -top-20 -right-20 opacity-80"
      />
      <DecorativeBlob
        color="#FEF3C7"
        size={200}
        className="absolute bottom-40 left-10 opacity-60"
      />

      {/* Dot pattern - top right */}
      <div className="absolute top-8 right-8 w-[120px] h-[80px] opacity-40">
        <DotPattern color="#4338CA" dotSize={3} spacing={14} />
      </div>

      {/* Dot pattern - bottom left */}
      <div className="absolute bottom-20 left-20 w-[140px] h-[100px] opacity-30">
        <DotPattern color="#4338CA" dotSize={3} spacing={14} />
      </div>

      <motion.div
        className="relative z-10 max-w-[1200px] mx-auto w-full flex flex-col items-center gap-16 lg:gap-0 lg:grid lg:grid-cols-[2fr_3fr] lg:items-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Left: text */}
        <motion.div
          variants={item}
          className="flex flex-col gap-7 items-center lg:items-start text-center lg:text-left order-2 lg:order-1"
        >
          {/* Headline */}
          <h1
            className="text-[48px] sm:text-[64px] lg:text-[80px] font-medium text-[#1a1a2e]"
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              letterSpacing: "-3px",
              lineHeight: "1.0",
              fontWeight: 500,
            }}
          >
            Decorate Your
            <br />
            Photos Instantly
          </h1>

          {/* Sub-headline */}
          <p className="text-[17px] leading-[1.6] max-w-[420px] text-[#64748b]">
            Our easy-to-use tool lets you add beautiful paper textures and
            scattered dots to any photo. No sign-up required.
          </p>

          {/* CTA */}
          <div className="mt-1 min-h-[52px] flex items-center">
            <AnimatePresence mode="wait">
              {!isLoading ? (
                <motion.button
                  key="cta"
                  onClick={handleEnter}
                  className="bg-[#4338CA] text-white text-[15px] font-medium px-7 py-3 rounded-full cursor-pointer hover:bg-[#3730A3] transition-colors"
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
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center gap-1.5 bg-[#4338CA] px-7 py-3 rounded-full"
                  style={{ minWidth: "120px" }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 rounded-full bg-white"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right: product image */}
        <motion.div
          variants={item}
          className="relative w-full mx-auto lg:mx-0 lg:ml-auto order-1 lg:order-2"
        >
          {/* Dot pattern behind image */}
          <div className="absolute -bottom-6 left-0 w-[100px] h-[80px] opacity-30">
            <DotPattern color="#4338CA" dotSize={3} spacing={14} />
          </div>

          <div
            className="rounded-[12px] overflow-hidden relative z-10"
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.08) 0px 4px 24px, rgba(0, 0, 0, 0.04) 0px 1px 2px",
            }}
          >
            <Image
              src="/hero-before-after.png"
              alt="Paper Dots — before and after adding dot decorations to a photo"
              width={2752}
              height={1536}
              priority
              className="w-full block"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
