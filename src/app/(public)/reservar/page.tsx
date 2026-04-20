"use client";

import { BookingProvider, useBooking } from "@/components/booking/BookingContext";
import { Stepper } from "@/components/booking/Stepper";
import { Step1Personal } from "@/components/booking/Step1Personal";
import { Step2Tattoos } from "@/components/booking/Step2Tattoos";
import { Step3Schedule } from "@/components/booking/Step3Schedule";
import { Step4Quote } from "@/components/booking/Step4Quote";
import { Step5Transfer } from "@/components/booking/Step5Transfer";
import { motion, AnimatePresence } from "framer-motion";

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

export default function ReservarPage() {
  return (
    <BookingProvider>
      <Stepper />
      <section className="container mx-auto py-12 md:py-20 min-h-[60vh]">
        <ActiveStep />
      </section>
    </BookingProvider>
  );
}
