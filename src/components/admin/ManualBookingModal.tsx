"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

type Form = {
  name: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  hours: string;
  description: string;
  style: "lineal" | "realista";
  widthCm: string;
  heightCm: string;
  bodyPart: string;
  color: "negro" | "rojo" | "blanco";
  price: string;
  notes: string;
};

const INITIAL: Form = {
  name: "",
  email: "",
  phone: "+56 ",
  date: "",
  startTime: "11:00",
  hours: "2",
  description: "",
  style: "lineal",
  widthCm: "10",
  heightCm: "10",
  bodyPart: "antebrazo",
  color: "negro",
  price: "",
  notes: ""
};

export function ManualBookingModal({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [f, setF] = React.useState<Form>(INITIAL);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setF(INITIAL);
      setError(null);
    }
  }, [open]);

  const update = (k: keyof Form, v: string) => setF((prev) => ({ ...prev, [k]: v }));

  const computeEnd = (start: string, h: number): string => {
    if (!start) return "";
    const [hh, mm] = start.split(":").map(Number);
    const total = hh * 60 + (mm ?? 0) + h * 60;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(Math.round(total % 60)).padStart(2, "0")}`;
  };

  const submit = async () => {
    setError(null);
    if (!f.name || !f.email || !f.date || !f.startTime) {
      setError("Completa nombre, email, fecha y hora.");
      return;
    }
    const hours = Number(f.hours) || 1;
    const price = Number(f.price) || 0;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: {
            name: f.name,
            email: f.email,
            phone: f.phone,
            age: 0,
            gender: ""
          },
          schedule: {
            date: f.date,
            startTime: f.startTime,
            endTime: computeEnd(f.startTime, hours)
          },
          tattoos: [
            {
              description: f.description,
              style: f.style,
              widthCm: Number(f.widthCm),
              heightCm: Number(f.heightCm),
              isSpecialSize: false,
              bodyPart: f.bodyPart,
              color: f.color,
              price,
              referenceImages: []
            }
          ],
          totalHours: hours,
          totalPrice: price,
          depositAmount: 0,
          notes: f.notes
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear cita manual</DialogTitle>
          <DialogDescription>
            Para citas que llegan por Instagram, WhatsApp u otro canal. Entran
            directo en <strong>Confirmada</strong>, sin cotización ni abono.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <h3 className="eyebrow mb-3">Cliente</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <F label="Nombre completo" value={f.name} onChange={(v) => update("name", v)} />
              <F label="Email" type="email" value={f.email} onChange={(v) => update("email", v)} />
              <F label="Teléfono" value={f.phone} onChange={(v) => update("phone", v)} />
            </div>
          </div>

          <div>
            <h3 className="eyebrow mb-3">Cita</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <F label="Fecha" type="date" value={f.date} onChange={(v) => update("date", v)} />
              <F label="Hora inicio" type="time" value={f.startTime} onChange={(v) => update("startTime", v)} />
              <F label="Duración (h)" type="number" value={f.hours} onChange={(v) => update("hours", v)} />
            </div>
          </div>

          <div>
            <h3 className="eyebrow mb-3">Tatuaje</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <F label="Ancho (cm)" type="number" value={f.widthCm} onChange={(v) => update("widthCm", v)} />
              <F label="Alto (cm)" type="number" value={f.heightCm} onChange={(v) => update("heightCm", v)} />
              <F label="Zona del cuerpo" value={f.bodyPart} onChange={(v) => update("bodyPart", v)} />
              <F label="Precio total (CLP)" type="number" value={f.price} onChange={(v) => update("price", v)} />
            </div>
            <div className="mt-4">
              <Label>Descripción</Label>
              <Textarea rows={2} value={f.description} onChange={(e) => update("description", e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Notas internas (no se muestran al cliente)</Label>
            <Textarea rows={2} value={f.notes} onChange={(e) => update("notes", e.target.value)} />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Creando…" : "Crear cita"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function F({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
