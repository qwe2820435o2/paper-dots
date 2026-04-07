"use client";

import { Camera, Sparkles, Sun, LayoutTemplate, Sticker, Download } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Camera,
    title: "Multi-Shot Webcam Capture",
    description:
      "Take 2\u20139 automatic shots with a countdown timer. Flip, mirror, or switch cameras \u2014 it all happens in your browser.",
  },
  {
    icon: Sparkles,
    title: "20+ Real-Time Filters",
    description:
      "From classic B&W and Sepia to fun distortions like Fisheye and Big Head. Preview every filter live before you shoot.",
  },
  {
    icon: Sun,
    title: "Virtual Ring Light",
    description:
      "Simulate studio lighting with 18 color presets, adjustable intensity and saturation.",
  },
  {
    icon: LayoutTemplate,
    title: "12 Photo Strip Templates",
    description:
      "Classic, Retro Film, Neon Glow, Polaroid, Tokyo Night, and more. Each template gives your strip a unique look.",
  },
  {
    icon: Sticker,
    title: "80+ Stickers",
    description:
      "Animals, emoji, food, sports \u2014 11 categories of drag-and-drop stickers to personalize your strip.",
  },
  {
    icon: Download,
    title: "Instant Download",
    description:
      "Save your photo strip as a high-quality PNG in one click \u2014 no account, no watermark, ready to share anywhere.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, willChange: "transform, opacity", transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function FeaturesSection() {
  return (
    <section id="about" className="relative py-28 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
<motion.h2
            className="text-4xl md:text-5xl font-serif font-semibold text-primary leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
          >
            Everything in One Click
          </motion.h2>
        </div>

        <motion.div
          className="sketch-border bg-card p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            {features.map(({ icon: Icon, title, description }) => (
              <motion.div key={title} variants={item} className="flex flex-col items-start gap-4">
                <Icon className="w-8 h-8 text-primary stroke-[1.8]" />
                <div>
                  <h3 className="text-lg font-serif font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
