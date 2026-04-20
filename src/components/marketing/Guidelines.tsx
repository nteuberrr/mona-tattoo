"use client";

import { motion } from "framer-motion";

const GUIDELINES_BEFORE = [
  "Hidrata la zona con crema la semana previa.",
  "Duerme bien y come antes de venir — no asistas en ayuno.",
  "Evita alcohol y drogas 24 horas antes de la sesión.",
  "Llega 10 minutos antes. Atraso máximo permitido: 15 minutos."
];

const GUIDELINES_POLICY = [
  "El abono no es reembolsable.",
  "Se puede reagendar con máximo 48 hrs de anticipación; después se pierde el abono.",
  "Si se ajusta o cambia el diseño durante la sesión, pueden aplicar costos adicionales.",
  "El valor es por persona. No se hacen descuentos por hacerse el mismo diseño entre varias personas.",
  "No asistas con niños pequeños ni mascotas.",
  "No hagas ejercicio los 2 días posteriores a tu sesión."
];

export function Guidelines() {
  return (
    <section id="guidelines" className="section bg-surface border-y border-line">
      <div className="container mx-auto">
        <div className="max-w-xl mb-16">
          <span className="eyebrow">Recomendaciones</span>
          <h2 className="display-lg mt-3">Para una buena sesión.</h2>
          <p className="mt-6 text-ink-soft">
            Cuidar tu piel antes y después hace la diferencia en el trazo y en
            la cicatrización. Lee estas indicaciones antes de tu cita.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-display text-2xl mb-6">Antes de tu cita</h3>
            <ul className="space-y-4">
              {GUIDELINES_BEFORE.map((g) => (
                <li key={g} className="flex gap-4 text-ink-soft">
                  <span className="text-ink font-display">✦</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="font-display text-2xl mb-6">Políticas</h3>
            <ul className="space-y-4">
              {GUIDELINES_POLICY.map((g) => (
                <li key={g} className="flex gap-4 text-ink-soft">
                  <span className="text-ink font-display">✦</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
