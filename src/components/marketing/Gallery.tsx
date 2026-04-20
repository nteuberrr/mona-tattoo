"use client";

import { motion } from "framer-motion";

const PLACEHOLDER_WORKS = [
  { src: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=800&q=80", alt: "Trabajo 1", tall: false },
  { src: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=800&q=80", alt: "Trabajo 2", tall: true },
  { src: "https://images.unsplash.com/photo-1542728928-0011f81446e5?auto=format&fit=crop&w=800&q=80", alt: "Trabajo 3", tall: false },
  { src: "https://images.unsplash.com/photo-1517148815978-75f6acaaf32c?auto=format&fit=crop&w=800&q=80", alt: "Trabajo 4", tall: true },
  { src: "https://images.unsplash.com/photo-1551887335-b58c7cb17f15?auto=format&fit=crop&w=800&q=80", alt: "Trabajo 5", tall: false },
  { src: "https://images.unsplash.com/photo-1581579185169-d4f36162057b?auto=format&fit=crop&w=800&q=80", alt: "Trabajo 6", tall: false }
];

export function Gallery() {
  return (
    <section id="trabajos" className="section">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="eyebrow">Portfolio</span>
            <h2 className="display-lg mt-3">Mis trabajos</h2>
          </div>
          <p className="max-w-sm text-ink-soft">
            Una selección de piezas recientes. Trazos finos, composiciones con
            respiración y una paleta contenida.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLACEHOLDER_WORKS.map((w, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
              className={`relative overflow-hidden bg-line/40 group ${w.tall ? "aspect-[3/4]" : "aspect-[4/5]"}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${w.src}')` }}
                role="img"
                aria-label={w.alt}
              />
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
