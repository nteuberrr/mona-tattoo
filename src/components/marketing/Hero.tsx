"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden">
      <div className="container mx-auto grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow"
          >
            Estudio de tatuaje · Chile
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="display-xl mt-6"
          >
            Mona
            <br />
            <span className="italic font-light">Tatt</span>
            <span className="text-muted"> ✦</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 max-w-md text-lg text-ink-soft"
          >
            Tatuaje fineline, botánico y de línea delicada. Sesiones agendadas
            con cuidado, a tu ritmo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Button asChild size="lg">
              <Link href="/reservar">Quiero reservar</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/#trabajos">Ver trabajos</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="lg:col-span-5 relative aspect-[3/4] bg-line/40 overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=900&q=80')"
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted text-[0.65rem] uppercase tracking-editorial">
        Desliza para explorar ↓
      </div>
    </section>
  );
}
