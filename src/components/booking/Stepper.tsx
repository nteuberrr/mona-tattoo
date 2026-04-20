"use client";

import { useBooking } from "./BookingContext";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Tus datos" },
  { n: 2, label: "Tatuajes" },
  { n: 3, label: "Horario" },
  { n: 4, label: "Cotización" },
  { n: 5, label: "Transferencia" }
];

export function Stepper() {
  const { step } = useBooking();
  const pct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="border-b border-line bg-bg/95 backdrop-blur sticky top-16 z-20">
      <div className="container mx-auto py-5">
        <div className="flex items-center justify-between mb-3">
          <span className="eyebrow">
            Paso {step} de {STEPS.length}
          </span>
          <span className="font-display text-sm text-ink-soft">
            {STEPS[step - 1].label}
          </span>
        </div>
        <div className="relative h-px bg-line">
          <div
            className="absolute left-0 top-0 h-px bg-ink transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ol className="hidden md:flex justify-between mt-3">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className={cn(
                "text-[0.7rem] uppercase tracking-editorial",
                s.n <= step ? "text-ink" : "text-muted"
              )}
            >
              {s.n.toString().padStart(2, "0")} · {s.label}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
