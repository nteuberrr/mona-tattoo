"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type FormValues = {
  banco_titular: string;
  banco_rut: string;
  banco_nombre: string;
  banco_cuenta_tipo: string;
  banco_cuenta_numero: string;
  banco_email_comprobante: string;
  deposito_modo: string;
  deposito_valor: string;
  estudio_direccion: string;
  instagram: string;
};

export function PaymentEditor({ initial }: { initial: FormValues }) {
  const router = useRouter();
  const [values, setValues] = React.useState<FormValues>(initial);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const update = (k: keyof FormValues, v: string) => {
    setSaved(false);
    setValues((prev) => ({ ...prev, [k]: v }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="border border-line bg-surface p-6 md:p-8">
        <h2 className="eyebrow mb-5">Cuenta bancaria</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Titular de la cuenta" value={values.banco_titular} onChange={(v) => update("banco_titular", v)} />
          <Field label="RUT" value={values.banco_rut} onChange={(v) => update("banco_rut", v)} />
          <Field label="Banco" value={values.banco_nombre} onChange={(v) => update("banco_nombre", v)} />
          <Field label="Tipo de cuenta" value={values.banco_cuenta_tipo} onChange={(v) => update("banco_cuenta_tipo", v)} />
          <Field label="Número de cuenta" value={values.banco_cuenta_numero} onChange={(v) => update("banco_cuenta_numero", v)} />
          <Field label="Email para comprobantes" type="email" value={values.banco_email_comprobante} onChange={(v) => update("banco_email_comprobante", v)} />
        </div>
      </section>

      <section className="border border-line bg-surface p-6 md:p-8">
        <h2 className="eyebrow mb-5">Abono</h2>
        <div className="space-y-5">
          <div>
            <Label>Modo</Label>
            <RadioGroup
              value={values.deposito_modo}
              onValueChange={(v) => update("deposito_modo", v)}
              className="flex gap-6 mt-3"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="PERCENTAGE" id="mode-pct" />
                Porcentaje del total
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="FIXED" id="mode-fixed" />
                Monto fijo (CLP)
              </label>
            </RadioGroup>
          </div>
          <div className="max-w-xs">
            <Label>
              {values.deposito_modo === "PERCENTAGE" ? "Porcentaje (%)" : "Monto (CLP)"}
            </Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={values.deposito_valor}
              onChange={(e) => update("deposito_valor", e.target.value)}
            />
            <p className="text-xs text-muted mt-1">
              {values.deposito_modo === "PERCENTAGE"
                ? "Ej: 30 = 30% del total cotizado"
                : "Ej: 30000 = CLP $30.000 fijos por reserva"}
            </p>
          </div>
        </div>
      </section>

      <section className="border border-line bg-surface p-6 md:p-8">
        <h2 className="eyebrow mb-5">Estudio</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Dirección" value={values.estudio_direccion} onChange={(v) => update("estudio_direccion", v)} />
          <Field label="Instagram" value={values.instagram} onChange={(v) => update("instagram", v)} />
        </div>
      </section>

      {error && (
        <div className="bg-danger/10 text-danger border border-danger/40 p-3 text-sm">
          Error al guardar: {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-[#3E5E3E]">✓ Guardado</span>}
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando…" : saved ? "Guardar de nuevo" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}

function Field({
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
