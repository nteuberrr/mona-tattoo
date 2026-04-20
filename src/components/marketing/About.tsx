"use client";

import { motion } from "framer-motion";

export function About() {
  return (
    <section id="sobre-mi" className="section">
      <div className="container mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5 relative aspect-[4/5] bg-line/40 overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1604881991720-f91add269bed?auto=format&fit=crop&w=900&q=80')"
            }}
            aria-hidden
          />
        </motion.div>

        <div className="lg:col-span-7">
          <span className="eyebrow">Sobre mí</span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="display-lg mt-3"
          >
            Trabajo lento, <span className="italic">con cuidado</span>.
          </motion.h2>
          <div className="mt-8 space-y-5 text-ink-soft max-w-xl">
            <p>
              Soy Mona, tatuadora enfocada en fineline, botánica y líneas
              orgánicas. Cada pieza es única y se diseña a partir de una
              conversación — quiero entender qué te mueve antes de dibujar.
            </p>
            <p>
              Mi estudio es un espacio pequeño, íntimo y seguro. Trabajo con
              materiales veganos y bajo protocolos de higiene estrictos.
            </p>
            <p className="font-display italic text-2xl text-ink">
              "La piel recuerda lo que elegimos con intención."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
