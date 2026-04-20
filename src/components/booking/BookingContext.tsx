"use client";

import * as React from "react";
import type {
  PersonalData,
  ScheduleData,
  TattooData
} from "@/lib/validations/booking";

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
};

const BookingContext = React.createContext<Ctx | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <BookingContext.Provider value={{ ...state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = React.useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
