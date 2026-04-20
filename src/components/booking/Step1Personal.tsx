"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBooking } from "./BookingContext";
import { personalSchema, type PersonalData } from "@/lib/validations/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const GENDERS = [
  { value: "femenino", label: "Femenino" },
  { value: "masculino", label: "Masculino" },
  { value: "no-binario", label: "No binario" },
  { value: "prefiero-no-decir", label: "Prefiero no decir" }
];

export function Step1Personal() {
  const { personal, dispatch } = useBooking();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<PersonalData>({
    resolver: zodResolver(personalSchema),
    defaultValues: personal ?? { phone: "+56 " }
  });

  const age = watch("age");
  const gender = watch("gender");

  const onSubmit = (data: PersonalData) => {
    dispatch({ type: "setPersonal", data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-2xl">
      <div>
        <h2 className="display-md">Cuéntame quién eres</h2>
        <p className="mt-3 text-ink-soft">
          Usaremos estos datos para confirmar tu cita y contactarte.
        </p>
      </div>

      <div className="grid gap-6">
        <Field label="Nombre completo" error={errors.name?.message}>
          <Input autoComplete="name" {...register("name")} />
        </Field>

        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" autoComplete="email" {...register("email")} />
          </Field>
          <Field label="Teléfono" error={errors.phone?.message}>
            <Input type="tel" autoComplete="tel" {...register("phone")} />
          </Field>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Edad" error={errors.age?.message}>
            <Input type="number" inputMode="numeric" min={16} max={99} {...register("age")} />
            {age !== undefined && age < 18 && age >= 16 && (
              <p className="text-xs text-warning mt-2 text-[#8A6617]">
                ✦ Requerirás una autorización notarial de tu tutor el día de la sesión.
              </p>
            )}
          </Field>
          <Field label="Género" error={errors.gender?.message}>
            <Select
              value={gender ?? ""}
              onValueChange={(v) => setValue("gender", v as PersonalData["gender"], { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          Continuar →
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
