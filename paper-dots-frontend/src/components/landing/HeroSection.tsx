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
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 pt-8 pb-20 overflow-hidden bg-[#F8FCF2]">
      {/* Decorative blobs */}
      <DecorativeBlob
        color="#E8F5D2"
        size={480}
        className="absolute -top-32 -right-24 opacity-70"
      />
      <DecorativeBlob
        color="#F7F6D3"
        size={180}
        className="absolute bottom-32 left-6 opacity-50"
      />

      {/* Dot pattern - top right */}
      <div className="absolute top-8 right-8 w-[120px] h-[80px] opacity-40">
        <DotPattern color="#C5E89A" dotSize={3} spacing={14} />
      </div>

      {/* Dot pattern - bottom left */}
      <div className="absolute bottom-20 left-20 w-[140px] h-[100px] opacity-30">
        <DotPattern color="#C5E89A" dotSize={3} spacing={14} />
      </div>

      <motion.div
        className="relative z-10 max-w-[1200px] mx-auto w-full flex flex-col items-center gap-16 lg:gap-12 lg:grid lg:grid-cols-[1fr_1fr] lg:items-center"
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
            className="text-[40px] sm:text-[48px] lg:text-[56px] font-medium text-[#1a1a2e]"
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              letterSpacing: "-3px",
              lineHeight: "1.0",
              fontWeight: 500,
            }}
          >
            Mochipic: Your Aesthetic
            <br />
            Dot Image Generator
          </h1>

          {/* Sub-headline */}
          <p className="text-[17px] leading-[1.6] max-w-[420px] text-[#64748b]">
            Create dreamy, &ldquo;Ins-style&rdquo; collages in seconds. Turn your memories into polka-dot masterpieces with the ultimate Automatic Photo Collage Maker.
          </p>

          {/* CTA */}
          <div className="mt-1 min-h-[52px] flex items-center">
            <AnimatePresence mode="wait">
              {!isLoading ? (
                <motion.button
                  key="cta"
                  onClick={handleEnter}
                  className="bg-[#C5E89A] text-white text-[15px] font-medium px-7 py-3 rounded-full cursor-pointer hover:bg-[#9ED06C] transition-colors"
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
                  className="flex items-center justify-center gap-1.5 bg-[#C5E89A] px-7 py-3 rounded-full"
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
          {/* Blob peeking from behind - bottom left */}
          <div
            className="absolute -bottom-12 -left-12 w-[220px] h-[220px] rounded-full z-0 pointer-events-none"
            style={{ backgroundColor: "#D2EAAA", opacity: 0.7 }}
          />

          {/* Blob peeking from behind - top right */}
          <div
            className="absolute -top-8 -right-8 w-[150px] h-[150px] rounded-full z-0 pointer-events-none"
            style={{ backgroundColor: "#F7F6D3", opacity: 0.85 }}
          />

          {/* Floating dot - top right, large solid */}
          <div
            className="absolute -top-3 right-10 w-5 h-5 rounded-full z-20 pointer-events-none"
            style={{
              backgroundColor: "#C5E89A",
              animation: "float 4s ease-in-out infinite",
              "--float-rot": "0deg",
            } as React.CSSProperties}
          />

          {/* Floating dot - left middle, medium outline */}
          <div
            className="absolute top-1/3 -left-5 w-4 h-4 rounded-full z-20 pointer-events-none"
            style={{
              backgroundColor: "#F7F6D3",
              border: "2px solid #D2EAAA",
              animation: "float 5.5s ease-in-out infinite 0.8s",
              "--float-rot": "0deg",
            } as React.CSSProperties}
          />

          {/* Floating dot - bottom right, small */}
          <div
            className="absolute -bottom-3 right-1/4 w-3 h-3 rounded-full z-20 pointer-events-none"
            style={{
              backgroundColor: "#C5E89A",
              opacity: 0.6,
              animation: "float 6s ease-in-out infinite 1.5s",
              "--float-rot": "0deg",
            } as React.CSSProperties}
          />

          {/* Polaroid frame */}
          <div
            className="relative z-10 bg-white"
            style={{
              padding: "10px 10px 34px 10px",
              transform: "rotate(-2deg)",
              boxShadow:
                "rgba(197, 232, 154, 0.28) 0px 8px 32px, rgba(197, 232, 154, 0.14) 0px 2px 6px",
            }}
          >
            <Image
              src="/hero-before-after.png"
              alt="Mochipic — before and after adding dot decorations to a photo"
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
