"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  LayoutGrid,
  Heart,
  Type,
  Gift,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  bubbleColor: string;
};

const features: Feature[] = [
  {
    icon: Sparkles,
    title: "Instant AI Color-Match",
    description:
      "Stop stressing over color palettes. Dottypic automatically analyzes your images to generate a polka dot background that complements your photos effortlessly.",
    bubbleColor: "#E8F5D2",
  },
  {
    icon: LayoutGrid,
    title: "Creative Layouts & Custom Backdrops",
    description:
      "Choose from a variety of chic grid styles. Want more flair? Upload your own custom background to let your creativity run wild.",
    bubbleColor: "#F7F6D3",
  },
  {
    icon: Heart,
    title: "More Than Just Dots",
    description:
      "Why stop at circles? Choose from various dot patterns, including sweet hearts, dewy waterdrops, twinkling stars, classic polka dots and more.",
    bubbleColor: "#FDE7EE",
  },
  {
    icon: Type,
    title: 'Add That "Vibe" with Text',
    description:
      "Elevate the atmosphere by adding custom text. Perfect for quotes, dates, or just expressing your mood.",
    bubbleColor: "#E8F5D2",
  },
  {
    icon: Gift,
    title: "No Sign-ups, No Watermarks",
    description:
      "We believe in free creativity. Use all features for free without creating an account. Plus, your downloads are always watermark-free.",
    bubbleColor: "#F7F6D3",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "Your photos are your business. Everything happens directly in your browser; we never store or see your images.",
    bubbleColor: "#FDE7EE",
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

export default function WhyLoveSection() {
  return (
    <section className="bg-[#F8FCF2] px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="text-[36px] sm:text-[48px] font-medium text-[#1a1a2e]"
            style={{
              fontFamily: "var(--font-quicksand), sans-serif",
              letterSpacing: "-2px",
              lineHeight: "1.1",
            }}
          >
            Why You&rsquo;ll Love Dottypic?
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={item}
                className="rounded-3xl p-7 flex flex-col gap-4 bg-white border border-[#E8F5D2] shadow-[0_4px_24px_rgba(197,232,154,0.18)] hover:shadow-[0_8px_32px_rgba(197,232,154,0.28)] transition-shadow"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: feature.bubbleColor }}
                >
                  <Icon size={24} strokeWidth={2} color="#1a1a2e" />
                </div>

                <h3 className="text-[18px] font-semibold text-[#1a1a2e] leading-[1.2]">
                  {feature.title}
                </h3>

                <p className="text-[14px] leading-[1.6] text-[#64748b]">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
