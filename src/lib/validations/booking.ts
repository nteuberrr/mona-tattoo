import { z } from "zod";

export const personalSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre completo"),
  email: z.string().email("Correo inválido"),
  age: z
    .coerce.number({ invalid_type_error: "Ingresa tu edad" })
    .int()
    .min(16, "Debes tener al menos 16 años")
    .max(99),
  phone: z
    .string()
    .min(8, "Ingresa un teléfono válido")
    .regex(/^[+0-9\s()-]+$/, "Formato de teléfono inválido"),
  gender: z.enum(["femenino", "masculino", "no-binario", "prefiero-no-decir"])
});
export type PersonalData = z.infer<typeof personalSchema>;

export const BODY_PARTS = [
  "antebrazo",
  "muñeca",
  "brazo superior interno",
  "brazo superior externo",
  "hombro",
  "pecho",
  "espalda",
  "cuello",
  "costilla",
  "pierna",
  "tobillo",
  "empeine"
] as const;

export const TATTOO_COLORS = ["negro", "rojo", "blanco"] as const;
export const TATTOO_STYLES = ["realista", "lineal"] as const;

const dimension = z.coerce
  .number({ invalid_type_error: "Ingresa un número entero" })
  .int("Solo se permiten números enteros, sin decimales")
  .min(1, "Mínimo 1 cm")
  .max(30, "Máximo 30 cm");

export const tattooSchema = z.object({
  id: z.string(),
  description: z
    .string()
    .min(10, "Cuéntame un poco más de la idea (mín. 10 caracteres)")
    .max(500),
  style: z.enum(TATTOO_STYLES),
  widthCm: dimension,
  heightCm: dimension,
  isSpecialSize: z.boolean().default(false),
  bodyPart: z.enum(BODY_PARTS),
  color: z.enum(TATTOO_COLORS),
  referenceImages: z.array(z.string()).max(5).default([])
});
export type TattooData = z.infer<typeof tattooSchema>;

export const scheduleSchema = z.object({
  date: z.string().min(1, "Selecciona una fecha"),
  startTime: z.string().min(1, "Selecciona una hora"),
  /** Si la sesión requiere más de 3h, los bloques adicionales se listan acá. */
  additionalBlocks: z
    .array(z.object({ date: z.string(), startTime: z.string() }))
    .optional()
});
export type ScheduleData = z.infer<typeof scheduleSchema>;

export const specialScheduleSchema = z.object({
  desiredDate: z.string().min(1),
  desiredTime: z.string().min(1),
  reason: z.string().min(10).max(500)
});
export type SpecialScheduleData = z.infer<typeof specialScheduleSchema>;

export const bookingSchema = z.object({
  personal: personalSchema,
  tattoos: z.array(tattooSchema).min(1, "Agrega al menos un tatuaje"),
  schedule: scheduleSchema,
  acceptedTerms: z.boolean().refine((v) => v === true, "Debes aceptar los términos")
});
export type BookingDraft = z.infer<typeof bookingSchema>;
