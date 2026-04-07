"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const steps = [
  {
    image: "/how-it-works-1.png",
    title: "Lights, Camera, Action!",
    description: "Tweak your glow with the ring light, pick a filter, and show us your best angles.",
  },
  {
    image: "/how-it-works-2.png",
    title: "Make it Yours",
    description: "Choose a signature photo strip layout and deck it out with stickers.",
  },
  {
    image: "/how-it-works-3.png",
    title: "Take it With You",
    description: "Hit download to keep the memories and let your friends in on the fun.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, willChange: "transform, opacity", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function HowItWorksSection() {
  return (
    <section className="relative py-28 px-6 overflow-hidden bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-serif font-semibold text-primary leading-tight mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
        >
          How It Works
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.title}
              variants={item}
              className="flex flex-col items-center gap-4 p-6 sketch-border bg-white hover:-translate-y-1 transition-transform"
            >
              <div className="relative w-full h-56">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain"
                />
              </div>
              <div className="text-center pt-2">
                <h3 className="text-lg font-serif font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
