"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import SketchLoader from "@/components/common/SketchLoader";

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

  function handleEnter() {
    setIsLoading(true);
    router.push("/decorate");
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 pt-8 pb-20 overflow-hidden bg-black">
      {/* Blue radial glow behind image */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,153,255,0.08) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="max-w-[1200px] mx-auto w-full flex flex-col items-center gap-16 lg:gap-0 lg:grid lg:grid-cols-2 lg:items-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Left: text */}
        <motion.div
          variants={item}
          className="flex flex-col gap-7 items-center lg:items-start text-center lg:text-left order-2 lg:order-1"
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[100px] text-[12px] font-medium"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              color: "#0099ff",
              boxShadow: "rgba(0, 153, 255, 0.25) 0px 0px 0px 1px",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#0099ff" }}
            />
            Free · No sign-up required
          </div>

          {/* Headline */}
          <h1
            className="text-[62px] sm:text-[85px] lg:text-[110px] font-medium text-white"
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              letterSpacing: "-5.5px",
              lineHeight: "0.87",
              fontWeight: 500,
            }}
          >
            Your photos,
            <br />
            dotted.
          </h1>

          {/* Sub-headline */}
          <p
            className="text-[17px] leading-[1.6] max-w-[360px]"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              color: "#a6a6a6",
              fontFeatureSettings:
                '"cv01","cv05","cv09","cv11","ss03","ss07"',
            }}
          >
            Upload a photo, pick a paper texture, scatter dots.
            <br />
            Make it yours in seconds.
          </p>

          {/* CTA */}
          <div className="mt-1 min-h-[52px] flex items-center">
            <AnimatePresence mode="wait">
              {!isLoading ? (
                <motion.button
                  key="cta"
                  onClick={handleEnter}
                  className="bg-white text-black text-[15px] font-medium px-7 py-3 rounded-[100px] cursor-pointer"
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

        {/* Right: product image */}
        <motion.div
          variants={item}
          className="relative w-full max-w-[580px] mx-auto lg:mx-0 lg:ml-auto order-1 lg:order-2"
        >
          <div
            className="rounded-[12px] overflow-hidden"
            style={{
              boxShadow:
                "rgba(0, 153, 255, 0.15) 0px 0px 0px 1px, rgba(255, 255, 255, 0.08) 0px 0.5px 0px 0.5px, rgba(0, 0, 0, 0.5) 0px 30px 70px",
            }}
          >
            <Image
              src="/hero-booth.webp"
              alt="Paper Dots — decorate your photos with paper textures and dots"
              width={1200}
              height={900}
              priority
              className="w-full block"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
