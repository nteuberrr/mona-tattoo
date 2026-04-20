"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Mail, Phone, Calendar, Clock, FileText, ImageIcon } from "lucide-react";
import type { Booking, BookingStatus } from "@/lib/mock-bookings";
import { statusColor, statusLabel } from "@/lib/mock-bookings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatCLP, formatDateLong, cn } from "@/lib/utils";

type Props = {
  booking: Booking | null;
  onClose: () => void;
  onAction: (id: string, action: BookingAction, payload?: { reason?: string }) => void;
};

export type BookingAction =
  | "confirm"
  | "reject"
  | "request_more_info"
  | "mark_completed"
  | "cancel"
  | "reschedule";

export function BookingPanel({ booking, onClose, onAction }: Props) {
  const [rejectMode, setRejectMode] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");

  React.useEffect(() => {
    setRejectMode(false);
    setRejectReason("");
  }, [booking?.id]);

  return (
    <DialogPrimitive.Root open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed right-0 top-0 z-50 h-screen w-full sm:max-w-md md:max-w-lg overflow-y-auto bg-surface border-l border-line",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-300"
          )}
        >
          {booking && (
            <BookingDetail
              booking={booking}
              onClose={onClose}
              onAction={onAction}
              rejectMode={rejectMode}
              setRejectMode={setRejectMode}
              rejectReason={rejectReason}
              setRejectReason={setRejectReason}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function BookingDetail({
  booking,
  onClose,
  onAction,
  rejectMode,
  setRejectMode,
  rejectReason,
  setRejectReason
}: {
  booking: Booking;
  onClose: () => void;
  onAction: Props["onAction"];
  rejectMode: boolean;
  setRejectMode: (v: boolean) => void;
  rejectReason: string;
  setRejectReason: (v: string) => void;
}) {
  const c = statusColor(booking.status);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 bg-surface border-b border-line px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Badge
            className={cn(c.bg, c.text, "border-0")}
          >
            {statusLabel(booking.status)}
          </Badge>
          <span className="text-xs text-muted">#{booking.id}</span>
        </div>
        <button onClick={onClose} aria-label="Cerrar" className="p-1 hover:bg-line/50">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-6 space-y-8 flex-1">
        <section>
          <h3 className="font-display text-2xl">{booking.client.name}</h3>
          <div className="mt-3 space-y-1.5 text-sm text-ink-soft">
            <a href={`mailto:${booking.client.email}`} className="flex items-center gap-2 hover:text-ink">
              <Mail className="h-3.5 w-3.5" /> {booking.client.email}
            </a>
            <a href={`tel:${booking.client.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-ink">
              <Phone className="h-3.5 w-3.5" /> {booking.client.phone}
            </a>
            <div className="text-xs text-muted">
              {booking.client.age} años
            </div>
          </div>
        </section>

        <section className="border-t border-line pt-6">
          <span className="eyebrow">Cita</span>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted" />
              <span className="capitalize">{formatDateLong(booking.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted" />
              {booking.startTime} – {booking.endTime} · {booking.totalHours} h
            </div>
          </div>
        </section>

        <section className="border-t border-line pt-6">
          <span className="eyebrow">Tatuajes ({booking.tattoos.length})</span>
          <div className="mt-3 space-y-4">
            {booking.tattoos.map((t, i) => (
              <div key={t.id} className="border border-line p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-editorial text-muted">
                    #{i + 1} · {t.style}
                  </span>
                  <span className="font-display">{formatCLP(t.price)}</span>
                </div>
                <p className="mt-2 text-sm">{t.description}</p>
                <div className="mt-3 text-xs text-ink-soft flex flex-wrap gap-x-3 gap-y-1">
                  <span>{t.widthCm} × {t.heightCm} cm</span>
                  <span className="capitalize">· {t.bodyPart}</span>
                  <span className="capitalize">· {t.color}</span>
                </div>
                {t.referenceImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {t.referenceImages.map((src, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={idx}
                        src={src}
                        alt={`Ref ${idx + 1}`}
                        className="aspect-square object-cover bg-line/40"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-line pt-6">
          <span className="eyebrow">Pago</span>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs uppercase tracking-editorial text-muted">Total</div>
              <div className="font-display text-xl">{formatCLP(booking.totalPrice)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-editorial text-muted">Abono</div>
              <div className="font-display text-xl">{formatCLP(booking.depositAmount)}</div>
              <div className="text-xs text-muted mt-1">
                {booking.depositPaid ? "✓ Pagado" : "Pendiente"}
              </div>
            </div>
          </div>
          {booking.transferReference && (
            <div className="mt-3 text-sm">
              <span className="text-xs uppercase tracking-editorial text-muted">Ref. transferencia</span>
              <div className="font-mono text-sm">{booking.transferReference}</div>
            </div>
          )}
          {booking.transferReceiptUrl && (
            <a
              href={booking.transferReceiptUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm underline underline-offset-4"
            >
              <ImageIcon className="h-3.5 w-3.5" /> Ver comprobante
            </a>
          )}
        </section>

        {booking.rejectionReason && (
          <section className="border-t border-line pt-6">
            <span className="eyebrow text-danger">Motivo de rechazo</span>
            <p className="mt-2 text-sm text-ink-soft">{booking.rejectionReason}</p>
          </section>
        )}

        {booking.notes && (
          <section className="border-t border-line pt-6">
            <span className="eyebrow flex items-center gap-2">
              <FileText className="h-3 w-3" /> Notas
            </span>
            <p className="mt-2 text-sm text-ink-soft">{booking.notes}</p>
          </section>
        )}
      </div>

      <div className="sticky bottom-0 bg-surface border-t border-line p-4 space-y-3">
        {rejectMode ? (
          <>
            <Textarea
              placeholder="Motivo del rechazo (lo verá el cliente en el correo)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRejectMode(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={rejectReason.length < 5}
                onClick={() => onAction(booking.id, "reject", { reason: rejectReason })}
                className="flex-1"
              >
                Confirmar rechazo
              </Button>
            </div>
          </>
        ) : (
          <ActionButtons booking={booking} onAction={onAction} setRejectMode={setRejectMode} />
        )}
      </div>
    </div>
  );
}

function ActionButtons({
  booking,
  onAction,
  setRejectMode
}: {
  booking: Booking;
  onAction: Props["onAction"];
  setRejectMode: (v: boolean) => void;
}) {
  if (booking.status === "PENDING_CONFIRMATION") {
    return (
      <div className="space-y-2">
        <Button
          className="w-full bg-[#3E5E3E] border-[#3E5E3E] hover:opacity-90"
          onClick={() => onAction(booking.id, "confirm")}
        >
          ✓ Confirmar reserva
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={() => onAction(booking.id, "request_more_info")}>
            Pedir + info
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setRejectMode(true)} className="text-danger">
            Rechazar
          </Button>
        </div>
      </div>
    );
  }
  if (booking.status === "CONFIRMED") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" onClick={() => onAction(booking.id, "reschedule")}>
          Reagendar
        </Button>
        <Button size="sm" onClick={() => onAction(booking.id, "mark_completed")}>
          Marcar completada
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAction(booking.id, "cancel")} className="col-span-2 text-danger">
          Cancelar reserva
        </Button>
      </div>
    );
  }
  if (booking.status === "QUOTED") {
    return (
      <p className="text-xs text-muted text-center py-2">
        Cotización sin transferencia. Auto-libera el slot al expirar el hold.
      </p>
    );
  }
  return (
    <p className="text-xs text-muted text-center py-2">
      Sin acciones disponibles para este estado.
    </p>
  );
}
