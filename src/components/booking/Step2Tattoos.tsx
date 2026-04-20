"use client";

import * as React from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { useBooking } from "./BookingContext";
import {
  BODY_PARTS,
  TATTOO_COLORS,
  TATTOO_STYLES,
  tattooSchema,
  type TattooData
} from "@/lib/validations/booking";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

function blank(): TattooData {
  return {
    id: crypto.randomUUID(),
    description: "",
    style: "lineal",
    widthCm: 0,
    heightCm: 0,
    isSpecialSize: false,
    bodyPart: "antebrazo",
    color: "negro",
    referenceImages: []
  };
}

export function Step2Tattoos() {
  const { tattoos, dispatch } = useBooking();
  const [items, setItems] = React.useState<TattooData[]>(
    tattoos.length ? tattoos : [blank()]
  );
  const [errors, setErrors] = React.useState<Record<number, string>>({});

  const update = (idx: number, patch: Partial<TattooData>) => {
    setItems((prev) => prev.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  };

  const add = () => setItems((prev) => [...prev, blank()]);
  const remove = (idx: number) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const submit = () => {
    const next: Record<number, string> = {};
    items.forEach((it, i) => {
      const r = tattooSchema.safeParse(it);
      if (!r.success) next[i] = r.error.errors[0]?.message ?? "Revisa los campos";
    });
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    dispatch({ type: "setTattoos", data: items });
  };

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h2 className="display-md">Háblame de tus tatuajes</h2>
        <p className="mt-3 text-ink-soft">
          Puedes agregar uno o varios. Trata de ser clara con la idea y adjunta
          referencias si las tienes.
        </p>
      </div>

      <div className="space-y-8">
        {items.map((t, i) => (
          <TattooCard
            key={t.id}
            index={i}
            value={t}
            error={errors[i]}
            onChange={(p) => update(i, p)}
            onRemove={() => remove(i)}
            canRemove={items.length > 1}
          />
        ))}

        <Button variant="secondary" type="button" onClick={add}>
          <Plus className="h-4 w-4" /> Agregar otro tatuaje
        </Button>
      </div>

      <div className="pt-4 flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" type="button" onClick={() => dispatch({ type: "goTo", step: 1 })}>
          ← Volver
        </Button>
        <Button onClick={submit}>Continuar →</Button>
      </div>
    </div>
  );
}

function TattooCard({
  index,
  value,
  error,
  onChange,
  onRemove,
  canRemove
}: {
  index: number;
  value: TattooData;
  error?: string;
  onChange: (patch: Partial<TattooData>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="border border-line p-6 md:p-8 bg-surface relative">
      <div className="flex items-center justify-between mb-6">
        <span className="eyebrow">Tatuaje {index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-muted hover:text-danger text-xs inline-flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" /> Quitar
          </button>
        )}
      </div>

      <div className="grid gap-6">
        <div>
          <Label>Describe la idea</Label>
          <Textarea
            value={value.description}
            maxLength={500}
            placeholder="Ej: un ramillete de lavanda fineline, líneas muy delgadas, sin sombra."
            onChange={(e) => onChange({ description: e.target.value })}
          />
          <span className="text-xs text-muted">{value.description.length}/500</span>
        </div>

        <div>
          <Label>Estilo</Label>
          <RadioGroup
            value={value.style}
            onValueChange={(v) => onChange({ style: v as TattooData["style"] })}
            className="flex gap-6 mt-2"
          >
            {TATTOO_STYLES.map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer capitalize">
                <RadioGroupItem value={s} id={`style-${index}-${s}`} />
                {s}
              </label>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label>Dimensiones del tatuaje</Label>
          <div className="grid grid-cols-2 gap-6 mt-2">
            <div>
              <span className="text-xs text-muted">Ancho (cm)</span>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={30}
                step={1}
                placeholder="Ej: 8"
                value={value.widthCm || ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const n = raw === "" ? 0 : Math.trunc(Number(raw));
                  onChange({ widthCm: n });
                }}
                onKeyDown={(e) => {
                  // bloquear , . e para evitar decimales y notación científica
                  if ([",", ".", "e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                }}
              />
            </div>
            <div>
              <span className="text-xs text-muted">Alto (cm)</span>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={30}
                step={1}
                placeholder="Ej: 10"
                value={value.heightCm || ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const n = raw === "" ? 0 : Math.trunc(Number(raw));
                  onChange({ heightCm: n });
                }}
                onKeyDown={(e) => {
                  if ([",", ".", "e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                }}
              />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">
            ✦ Solo números enteros, sin decimales. Rango: 1 a 30 cm por lado.
          </p>
        </div>

        <div>
          <Label>Lugar del cuerpo</Label>
          <Select
            value={value.bodyPart}
            onValueChange={(v) => onChange({ bodyPart: v as TattooData["bodyPart"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BODY_PARTS.map((b) => (
                <SelectItem key={b} value={b} className="capitalize">
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Color</Label>
          <div className="flex gap-3 mt-2">
            {TATTOO_COLORS.map((c) => {
              const active = value.color === c;
              const swatch =
                c === "negro" ? "#141414" : c === "rojo" ? "#A23A2C" : "#F7F4EF";
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ color: c })}
                  className={cn(
                    "flex items-center gap-2 px-4 h-11 border transition-colors capitalize",
                    active ? "border-ink bg-ink text-bg" : "border-line hover:border-ink"
                  )}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-ink/30"
                    style={{ background: swatch }}
                  />
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <ReferenceImages
          value={value.referenceImages}
          onChange={(imgs) => onChange({ referenceImages: imgs })}
        />
      </div>

      {error && <p className="mt-5 text-xs text-danger">{error}</p>}
    </div>
  );
}

function ReferenceImages({
  value,
  onChange
}: {
  value: string[];
  onChange: (imgs: string[]) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const next: string[] = [...value];
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    Array.from(files).forEach((f) => {
      if (next.length >= 5) return;
      if (!allowed.includes(f.type)) return;
      if (f.size > 10 * 1024 * 1024) return;
      next.push(URL.createObjectURL(f));
    });
    onChange(next);
  };

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <Label>Imágenes de referencia (máx 5)</Label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "mt-2 border border-dashed p-6 text-center cursor-pointer transition-colors",
          dragging ? "border-ink bg-line/40" : "border-line hover:border-ink"
        )}
      >
        <Upload className="h-5 w-5 mx-auto text-muted mb-2" />
        <p className="text-sm text-ink-soft">
          Arrastra o haz clic para subir referencias
        </p>
        <p className="text-xs text-muted mt-1">JPG, PNG o WEBP · máx 10 MB cada una</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-3">
          {value.map((src, i) => (
            <div key={i} className="relative aspect-square bg-line/40 overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Referencia ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1.5 right-1.5 bg-ink text-bg rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Quitar imagen"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
