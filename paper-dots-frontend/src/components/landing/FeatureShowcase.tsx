"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import DecorativeBlob from "./DecorativeBlob";

interface FeatureShowcaseProps {
  heading: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
  blobColor?: string;
  blendMultiply?: boolean;
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function FeatureShowcase({
  heading,
  description,
  imageSrc,
  imageAlt,
  reverse = false,
  blobColor = "#E8F5D2",
  blendMultiply = false,
}: FeatureShowcaseProps) {
  return (
    <section className="bg-white px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-[1200px] mx-auto">
        <div
          className={`flex flex-col gap-12 lg:gap-16 lg:grid lg:grid-cols-2 lg:items-center ${
            reverse ? "" : ""
          }`}
        >
          {/* Image */}
          <motion.div
            className={`relative ${reverse ? "lg:order-2" : "lg:order-1"}`}
            variants={item}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <DecorativeBlob
              color={blobColor}
              size={280}
              className={`absolute -z-0 ${
                reverse ? "-top-10 -right-10" : "-bottom-10 -left-10"
              }`}
            />
            <div
              className="relative z-10 rounded-xl overflow-hidden"
              style={blendMultiply ? undefined : {
                boxShadow:
                  "rgba(197, 232, 154, 0.28) 0px 4px 24px, rgba(197, 232, 154, 0.14) 0px 1px 2px",
              }}
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={600}
                height={450}
                className="w-full block"
                style={blendMultiply ? { mixBlendMode: "multiply" } : undefined}
              />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            className={`flex flex-col gap-5 ${reverse ? "lg:order-1" : "lg:order-2"}`}
            variants={item}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <h2
              className="text-[36px] sm:text-[48px] font-medium text-[#1a1a2e]"
              style={{
                fontFamily: "var(--font-quicksand), sans-serif",
                letterSpacing: "-2px",
                lineHeight: "1.1",
              }}
            >
              {heading}
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#64748b] max-w-[480px]">
              {description}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
