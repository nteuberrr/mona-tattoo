"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookingProvider, useBooking, type PaymentInfo } from "./BookingContext";
import { Stepper } from "./Stepper";
import { Step1Personal } from "./Step1Personal";
import { Step2Tattoos } from "./Step2Tattoos";
import { Step3Schedule } from "./Step3Schedule";
import { Step4Quote } from "./Step4Quote";
import { Step5Transfer } from "./Step5Transfer";
import type { HoursMatrices, PricingMatrices } from "@/lib/pricing/types";
import type { DiscountConfig } from "@/lib/pricing/calculator";

function ActiveStep() {
  const { step } = useBooking();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {step === 1 && <Step1Personal />}
        {step === 2 && <Step2Tattoos />}
        {step === 3 && <Step3Schedule />}
        {step === 4 && <Step4Quote />}
        {step === 5 && <Step5Transfer />}
      </motion.div>
    </AnimatePresence>
  );
}

export function BookingClient({
  pricing,
  hours,
  payment,
  discount,
  source
}: {
  pricing: PricingMatrices;
  hours: HoursMatrices;
  payment: PaymentInfo;
  discount: DiscountConfig;
  source: "sheets" | "fallback";
}) {
  return (
    <BookingProvider
      pricing={pricing}
      hours={hours}
      payment={payment}
      discount={discount}
      source={source}
    >
      <Stepper />
      <section className="container mx-auto py-12 md:py-20 min-h-[60vh]">
        <ActiveStep />
      </section>
    </BookingProvider>
  );
}
