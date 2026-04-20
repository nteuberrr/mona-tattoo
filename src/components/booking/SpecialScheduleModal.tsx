"use client";

import * as React from "react";
import { useBooking } from "./BookingContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function SpecialScheduleModal({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { personal } = useBooking();
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    if (!date || !time || reason.length < 10) return;
    setLoading(true);
    try {
      await fetch("/api/horario-especial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: personal?.name ?? "",
          clientEmail: personal?.email ?? "",
          desiredDate: date,
          desiredTime: time,
          reason
        })
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDate("");
    setTime("");
    setReason("");
    setSent(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        {sent ? (
          <div className="text-center py-6">
            <h3 className="display-md">Enviado ✦</h3>
            <p className="mt-4 text-ink-soft">
              Recibí tu solicitud de horario especial. Te escribiré por correo
              en las próximas horas.
            </p>
            <Button className="mt-8" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Solicitar horario especial</DialogTitle>
              <DialogDescription>
                Si ningún horario te calza, cuéntame cuándo te gustaría venir y
                lo revisamos.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha deseada</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <Label>Hora deseada</Label>
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Motivo o comentario</Label>
                <Textarea
                  placeholder="Cuéntame por qué necesitas un horario fuera de agenda."
                  maxLength={500}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={submit}
                  disabled={loading || !date || !time || reason.length < 10}
                >
                  {loading ? "Enviando…" : "Enviar solicitud"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
