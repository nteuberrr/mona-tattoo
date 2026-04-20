"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Envía tu idea",
    body: "Cuéntame en pocas líneas la idea, medidas y zona del cuerpo. Adjunta imágenes de referencia si las tienes."
  },
  {
    n: "02",
    title: "Revisa tu cotización",
    body: "Recibirás una cotización con el valor y la duración estimada de tu sesión."
  },
  {
    n: "03",
    title: "Elige tu horario",
    body: "Ve los días y horas disponibles. La agenda se ajusta automáticamente al tiempo que necesita tu pieza."
  },
  {
    n: "04",
    title: "Transfiere el abono",
    body: "Un abono reserva tu cupo. Apenas lo confirmo, recibes un correo con todos los detalles."
  }
];

export function HowToBook() {
  return (
    <section id="como-reservar" className="section bg-surface border-y border-line">
      <div className="container mx-auto">
        <div className="max-w-2xl mb-16">
          <span className="eyebrow">Proceso</span>
          <h2 className="display-lg mt-3">Cómo reservar</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="border-t border-ink pt-6"
            >
              <span className="font-display text-5xl text-ink">{s.n}</span>
              <h3 className="font-display text-2xl mt-4">{s.title}</h3>
              <p className="mt-3 text-ink-soft">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
