/**
 * Mock store de reservas para Fase 2 (UI sin DB todavía).
 * Cuando conectemos Prisma, este archivo desaparece y los componentes leen
 * del API real. La forma del objeto Booking ya imita el schema de Prisma.
 */

import { addDays, format, startOfWeek } from "date-fns";

export type BookingStatus =
  | "QUOTED"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED";

export type Tattoo = {
  id: string;
  description: string;
  style: "lineal" | "realista";
  widthCm: number;
  heightCm: number;
  bodyPart: string;
  color: "negro" | "rojo" | "blanco";
  price: number;
  referenceImages: string[];
};

export type Booking = {
  id: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    age: number;
  };
  date: string; // YYYY-MM-DD
  startTime: string; // "HH:mm"
  endTime: string;
  totalHours: number;
  totalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  status: BookingStatus;
  tattoos: Tattoo[];
  notes?: string;
  transferReference?: string;
  transferReceiptUrl?: string;
  rejectionReason?: string;
  pendingSince?: string;
  confirmedAt?: string;
  createdAt: string;
};

const today = new Date();
const monday = startOfWeek(today, { weekStartsOn: 1 });
const dayStr = (offset: number) => format(addDays(monday, offset), "yyyy-MM-dd");

export const SEED_BOOKINGS: Booking[] = [
  {
    id: "bk_001",
    client: {
      id: "c_001",
      name: "Javiera Rojas",
      email: "javi.rojas@example.com",
      phone: "+56 9 8765 4321",
      age: 27
    },
    date: dayStr(1),
    startTime: "11:00",
    endTime: "13:00",
    totalHours: 2,
    totalPrice: 110_000,
    depositAmount: 33_000,
    depositPaid: true,
    status: "CONFIRMED",
    tattoos: [
      {
        id: "t_001",
        description: "Rama de olivo fineline en antebrazo, sin sombra.",
        style: "lineal",
        widthCm: 10,
        heightCm: 10,
        bodyPart: "antebrazo",
        color: "negro",
        price: 110_000,
        referenceImages: []
      }
    ],
    confirmedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: "bk_002",
    client: {
      id: "c_002",
      name: "Camila Soto",
      email: "cami.soto@example.com",
      phone: "+56 9 1234 5678",
      age: 24
    },
    date: dayStr(2),
    startTime: "14:00",
    endTime: "15:30",
    totalHours: 1.5,
    totalPrice: 85_000,
    depositAmount: 25_500,
    depositPaid: false,
    status: "PENDING_CONFIRMATION",
    transferReference: "OP-9912345",
    pendingSince: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    tattoos: [
      {
        id: "t_002",
        description: "Mariposa pequeña fineline en muñeca interior.",
        style: "lineal",
        widthCm: 5,
        heightCm: 5,
        bodyPart: "muñeca",
        color: "negro",
        price: 85_000,
        referenceImages: []
      }
    ],
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
  },
  {
    id: "bk_003",
    client: {
      id: "c_003",
      name: "Antonia Vega",
      email: "ant.vega@example.com",
      phone: "+56 9 4567 8901",
      age: 32
    },
    date: dayStr(0),
    startTime: "10:00",
    endTime: "12:00",
    totalHours: 2,
    totalPrice: 130_000,
    depositAmount: 39_000,
    depositPaid: true,
    status: "COMPLETED",
    tattoos: [
      {
        id: "t_003",
        description: "Constelación pequeña con líneas conectoras detrás del cuello.",
        style: "lineal",
        widthCm: 8,
        heightCm: 12,
        bodyPart: "cuello",
        color: "negro",
        price: 130_000,
        referenceImages: []
      }
    ],
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: "bk_004",
    client: {
      id: "c_004",
      name: "Ignacia Pérez",
      email: "igna.perez@example.com",
      phone: "+56 9 5555 7777",
      age: 29
    },
    date: dayStr(3),
    startTime: "11:00",
    endTime: "14:00",
    totalHours: 3,
    totalPrice: 195_000,
    depositAmount: 58_500,
    depositPaid: false,
    status: "PENDING_CONFIRMATION",
    transferReference: "OP-7788991",
    pendingSince: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    tattoos: [
      {
        id: "t_004a",
        description: "Hojas de eucalipto en el costado izquierdo.",
        style: "lineal",
        widthCm: 12,
        heightCm: 15,
        bodyPart: "costilla",
        color: "negro",
        price: 145_000,
        referenceImages: []
      },
      {
        id: "t_004b",
        description: "Iniciales pequeñas en la muñeca derecha.",
        style: "lineal",
        widthCm: 3,
        heightCm: 3,
        bodyPart: "muñeca",
        color: "negro",
        price: 50_000,
        referenceImages: []
      }
    ],
    createdAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString()
  },
  {
    id: "bk_005",
    client: {
      id: "c_005",
      name: "Florencia Muñoz",
      email: "flor.m@example.com",
      phone: "+56 9 3434 5656",
      age: 21
    },
    date: dayStr(4),
    startTime: "10:00",
    endTime: "11:00",
    totalHours: 1,
    totalPrice: 65_000,
    depositAmount: 19_500,
    depositPaid: true,
    status: "CONFIRMED",
    tattoos: [
      {
        id: "t_005",
        description: "Pequeño sol minimalista en tobillo.",
        style: "lineal",
        widthCm: 4,
        heightCm: 4,
        bodyPart: "tobillo",
        color: "negro",
        price: 65_000,
        referenceImages: []
      }
    ],
    confirmedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: "bk_006",
    client: {
      id: "c_006",
      name: "Valentina Ríos",
      email: "vale.rios@example.com",
      phone: "+56 9 9090 1212",
      age: 26
    },
    date: dayStr(7),
    startTime: "13:00",
    endTime: "15:00",
    totalHours: 2,
    totalPrice: 120_000,
    depositAmount: 36_000,
    depositPaid: false,
    status: "QUOTED",
    tattoos: [
      {
        id: "t_006",
        description: "Mano abierta con girasol pequeño dentro.",
        style: "realista",
        widthCm: 8,
        heightCm: 10,
        bodyPart: "antebrazo",
        color: "negro",
        price: 120_000,
        referenceImages: []
      }
    ],
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  }
];

// Helpers
export function statusLabel(s: BookingStatus): string {
  return {
    QUOTED: "Cotizada",
    PENDING_CONFIRMATION: "Pend. confirmar",
    CONFIRMED: "Confirmada",
    REJECTED: "Rechazada",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
    RESCHEDULED: "Reagendada"
  }[s];
}

export function statusColor(s: BookingStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (s) {
    case "QUOTED":
      return { bg: "bg-line/60", text: "text-ink-soft", border: "border-line" };
    case "PENDING_CONFIRMATION":
      return { bg: "bg-[#F6E6C4]", text: "text-[#6B5217]", border: "border-[#D9B860]" };
    case "CONFIRMED":
      return { bg: "bg-[#3E5E3E]", text: "text-bg", border: "border-[#3E5E3E]" };
    case "COMPLETED":
      return { bg: "bg-ink-soft/20", text: "text-muted line-through", border: "border-line" };
    case "REJECTED":
    case "CANCELLED":
      return { bg: "bg-danger/10", text: "text-danger", border: "border-danger/40" };
    case "RESCHEDULED":
      return { bg: "bg-line", text: "text-ink-soft", border: "border-line" };
  }
}
