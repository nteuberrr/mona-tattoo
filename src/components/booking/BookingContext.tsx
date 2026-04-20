"use client";

import * as React from "react";
import type {
  PersonalData,
  ScheduleData,
  TattooData
} from "@/lib/validations/booking";
import type { HoursMatrices, PricingMatrices } from "@/lib/pricing/types";
import type { DiscountConfig } from "@/lib/pricing/calculator";
import type { DaySchedule } from "@/lib/scheduling/availability";

export type PaymentInfo = {
  holderName: string;
  rut: string;
  bank: string;
  accountType: string;
  accountNumber: string;
  contactEmail: string;
  depositMode: "FIXED" | "PERCENTAGE";
  depositValue: number;
};

export type BookingStep = 1 | 2 | 3 | 4 | 5;

type State = {
  step: BookingStep;
  personal: PersonalData | null;
  tattoos: TattooData[];
  schedule: ScheduleData | null;
  acceptedTerms: boolean;
};

type Action =
  | { type: "setPersonal"; data: PersonalData }
  | { type: "setTattoos"; data: TattooData[] }
  | { type: "setSchedule"; data: ScheduleData }
  | { type: "setAcceptedTerms"; value: boolean }
  | { type: "goTo"; step: BookingStep }
  | { type: "reset" };

const initialState: State = {
  step: 1,
  personal: null,
  tattoos: [],
  schedule: null,
  acceptedTerms: false
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setPersonal":
      return { ...state, personal: action.data, step: 2 };
    case "setTattoos":
      return { ...state, tattoos: action.data, step: 3 };
    case "setSchedule":
      return { ...state, schedule: action.data, step: 4 };
    case "setAcceptedTerms":
      return { ...state, acceptedTerms: action.value };
    case "goTo":
      return { ...state, step: action.step };
    case "reset":
      return initialState;
  }
}

type Ctx = State & {
  dispatch: React.Dispatch<Action>;
  pricing: PricingMatrices;
  hours: HoursMatrices;
  payment: PaymentInfo;
  discount: DiscountConfig;
  scheduleSnapshot: DaySchedule[];
  source: "sheets" | "fallback";
};

const BookingContext = React.createContext<Ctx | null>(null);

export function BookingProvider({
  children,
  pricing,
  hours,
  payment,
  discount,
  scheduleSnapshot,
  source
}: {
  children: React.ReactNode;
  pricing: PricingMatrices;
  hours: HoursMatrices;
  payment: PaymentInfo;
  discount: DiscountConfig;
  scheduleSnapshot: DaySchedule[];
  source: "sheets" | "fallback";
}) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <BookingContext.Provider
      value={{ ...state, dispatch, pricing, hours, payment, discount, scheduleSnapshot, source }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = React.useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
