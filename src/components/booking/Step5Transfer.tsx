"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Copy, Upload, Check } from "lucide-react";
import { useBooking } from "./BookingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { totals, calculateDeposit } from "@/lib/pricing/calculator";
import { estimate } from "@/lib/pricing/calculator";
import { formatCLP } from "@/lib/utils";

// En Fase 2 estos datos vienen del modelo PaymentSettings
const PAYMENT_INFO = {
  holderName: "Mona Tatt SpA",
  rut: "77.123.456-7",
  bank: "Banco de Chile",
  accountType: "Cuenta Corriente",
  accountNumber: "0012345678",
  contactEmail: "agenda.monatatt@gmail.com"
};

export function Step5Transfer() {
  const router = useRouter();
  const { personal, tattoos, schedule, dispatch, pricing, hours } = useBooking();
  const [reference, setReference] = React.useState("");
  const [receipt, setReceipt] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);

  const { price: tTotal } = totals(tattoos, { pricing, hours });
  const deposit = calculateDeposit(tTotal, "PERCENTAGE", 30);

  const copy = (v: string) => {
    navigator.clipboard.writeText(v);
    setCopied(v);
    setTimeout(() => setCopied(null), 1500);
  };

  const submit = async () => {
    if (!personal || !schedule) return;
    setLoading(true);
    try {
      // Enriquecemos cada tatuaje con su precio/horas calculados
      const enrichedTattoos = tattoos.map((t) => {
        const e = estimate(t, { pricing, hours });
        return { ...t, price: e.price, hours: e.hours };
      });
      const totalHoursVal = enrichedTattoos.reduce((acc, t) => acc + (t.hours as number), 0);
      const endTime = computeEndTime(schedule?.startTime, totalHoursVal);

      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personal,
          tattoos: enrichedTattoos,
          schedule: { ...schedule, endTime },
          totalHours: totalHoursVal,
          totalPrice: tTotal,
          depositAmount: deposit,
          transferReference: reference || null
        })
      });
      const data = await res.json();
      dispatch({ type: "reset" });
      router.push(`/reserva-enviada/${data.id ?? "demo"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h2 className="display-md">Último paso ✦</h2>
        <p className="mt-3 text-ink-soft">
          Transfiere el abono para confirmar tu cupo. Cuando te aparezca el
          comprobante de tu banco, vuelve aquí y presiona <strong>Ya transferí</strong>.
        </p>
      </div>

      <section className="border border-ink p-6 md:p-8">
        <div className="flex items-baseline justify-between mb-6">
          <span className="eyebrow">Monto del abono</span>
          <span className="font-display text-4xl">{formatCLP(deposit)}</span>
        </div>

        <div className="divide-y divide-line">
          <CopyRow label="Titular" value={PAYMENT_INFO.holderName} onCopy={copy} copied={copied === PAYMENT_INFO.holderName} />
          <CopyRow label="RUT" value={PAYMENT_INFO.rut} onCopy={copy} copied={copied === PAYMENT_INFO.rut} />
          <CopyRow label="Banco" value={PAYMENT_INFO.bank} onCopy={copy} copied={copied === PAYMENT_INFO.bank} />
          <CopyRow label="Tipo de cuenta" value={PAYMENT_INFO.accountType} onCopy={copy} copied={copied === PAYMENT_INFO.accountType} />
          <CopyRow label="Número de cuenta" value={PAYMENT_INFO.accountNumber} onCopy={copy} copied={copied === PAYMENT_INFO.accountNumber} />
          <CopyRow label="Email" value={PAYMENT_INFO.contactEmail} onCopy={copy} copied={copied === PAYMENT_INFO.contactEmail} />
        </div>
      </section>

      <section className="space-y-5">
        <h3 className="eyebrow">Opcional · para agilizar la confirmación</h3>

        <div>
          <Label>Número de operación / referencia</Label>
          <Input
            placeholder="Ej: 1234567"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>

        <div>
          <Label>Comprobante (imagen o PDF)</Label>
          <label className="mt-2 flex items-center gap-3 border border-dashed border-line p-5 cursor-pointer hover:border-ink transition-colors">
            <Upload className="h-5 w-5 text-muted" />
            <span className="text-sm text-ink-soft">
              {receipt ? receipt.name : "Seleccionar archivo"}
            </span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </section>

      <div className="pt-4 flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" onClick={() => dispatch({ type: "goTo", step: 4 })}>
          ← Volver
        </Button>
        <Button onClick={submit} disabled={loading} size="lg">
          {loading ? "Enviando…" : "Ya transferí"}
        </Button>
      </div>
    </div>
  );
}

function computeEndTime(start: string | undefined, totalHours: number): string | undefined {
  if (!start) return undefined;
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + (m ?? 0) + totalHours * 60;
  const eh = Math.floor(total / 60);
  const em = Math.round(total % 60);
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
}

function CopyRow({
  label,
  value,
  onCopy,
  copied
}: {
  label: string;
  value: string;
  onCopy: (v: string) => void;
  copied: boolean;
}) {
  return (
    <div className="py-3 flex items-center justify-between gap-4">
      <div>
        <div className="text-xs uppercase tracking-editorial text-muted">{label}</div>
        <div className="font-body">{value}</div>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value)}
        className="text-xs uppercase tracking-editorial inline-flex items-center gap-2 text-ink-soft hover:text-ink"
        aria-label={`Copiar ${label}`}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
