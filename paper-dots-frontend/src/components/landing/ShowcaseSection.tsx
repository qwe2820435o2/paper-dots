"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, willChange: "transform, opacity", transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function ShowcaseSection() {
  return (
    <section id="gallery" className="relative py-28 px-6 bg-background border-t-2 border-foreground/10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
<motion.h2
              className="text-4xl md:text-5xl font-serif font-semibold text-primary leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
            >
              See What You Can Create
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/booth">
              <Button variant="outline" className="px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground" style={{ borderRadius: "12px 4px 10px 6px" }}>
                Try It Now
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Showcase grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* Photo strip examples */}
          <motion.div variants={item} className="flex justify-center gap-6 lg:col-span-1">
            <div
              className="relative w-32 sm:w-36 overflow-hidden shadow-[3px_3px_0_#1a1a1a] hover:-translate-y-2 transition-transform duration-300"
              style={{ transform: "rotate(-3deg)", borderRadius: "10px 3px 8px 5px" }}
            >
              <Image
                src="/showcase/strip-1.png"
                alt="Photo strip example"
                width={144}
                height={432}
                priority
                className="object-cover w-full"
              />
            </div>
            <div
              className="relative w-32 sm:w-36 overflow-hidden shadow-[3px_3px_0_#1a1a1a] hover:-translate-y-2 transition-transform duration-300 mt-8"
              style={{ transform: "rotate(2deg)", borderRadius: "10px 3px 8px 5px" }}
            >
              <Image
                src="/showcase/strip-2.png"
                alt="Photo strip example"
                width={144}
                height={432}
                priority
                className="object-cover w-full"
              />
            </div>
          </motion.div>

          {/* Edit page preview */}
          <motion.div
            variants={item}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-lg hover:-translate-y-1 transition-transform duration-300">
              {/* Browser-style top bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <div className="w-3 h-3 rounded-full bg-foreground/30" />
                <div className="w-3 h-3 rounded-full bg-foreground/20" />
                <div className="w-3 h-3 rounded-full bg-foreground/15" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">paperdots.example.com/booth/edit</span>
              </div>
              <Image
                src="/showcase/edit-preview.png"
                alt="Edit page preview showing templates and stickers"
                width={960}
                height={540}
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover w-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
    </section>
  );
}
