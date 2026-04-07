"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import SketchLoader from "@/components/common/SketchLoader";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, willChange: "transform, opacity", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function HeroSection() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function handleEnter() {
    setIsLoading(true);
    router.push("/booth");
  }

  return (
    <section className="relative min-h-screen flex items-center px-4 sm:px-8 pt-12 pb-8">
      <motion.div
        className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[11fr_9fr] gap-6 lg:gap-0 items-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Left: Booth illustration */}
        <motion.div variants={item}>
          <div className="relative w-full max-w-2xl mx-auto lg:mx-0">
            <Image
              src="/hero-booth.webp"
              alt="Paper Dots hero illustration"
              width={1200}
              height={900}
              priority
              className="w-full"
            />
          </div>
        </motion.div>

        {/* Right: Text content */}
        <motion.div variants={item} className="flex flex-col gap-5 text-center items-center pt-16 lg:pt-36 lg:-ml-[136px]">
          {/* TODO: replace with real Paper Dots hero copy */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-foreground leading-snug">
            Paper Dots
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
            TODO: Paper Dots hero description.
          </p>
          <div className="relative flex items-center justify-center mt-2 min-h-[68px]">
            <AnimatePresence mode="wait">
              {!isLoading ? (
                <motion.button
                  key="enter"
                  onClick={handleEnter}
                  className="inline-block w-fit cursor-pointer"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.6 }}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.95 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Image
                    src="/start-arrow.png"
                    alt="Start Here"
                    width={180}
                    height={68}
                  />
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
      </motion.div>
    </section>
  );
}
