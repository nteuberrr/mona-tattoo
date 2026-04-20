import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReservaEnviadaPage() {
  return (
    <section className="container mx-auto py-24 md:py-32 min-h-[70vh] max-w-2xl text-center">
      <span className="eyebrow">Solicitud recibida</span>
      <h1 className="display-lg mt-4">
        Hemos recibido tu solicitud <span className="italic">de reserva</span> ✦
      </h1>
      <p className="mt-8 text-ink-soft text-lg max-w-xl mx-auto">
        Nos pondremos en contacto contigo a tu correo una vez que hayamos
        confirmado la transferencia y tu reserva. Esto suele tomar pocas horas
        en horario laboral.
      </p>
      <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="secondary">
          <Link href="/">Volver al inicio</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="mailto:agenda.monatatt@gmail.com">Escribirme un correo</Link>
        </Button>
      </div>

      <div className="mt-16 pt-12 border-t border-line text-sm text-muted">
        Si pasaron más de 24 horas hábiles, escríbeme directo a{" "}
        <a href="mailto:agenda.monatatt@gmail.com" className="text-ink underline">
          agenda.monatatt@gmail.com
        </a>
        .
      </div>
    </section>
  );
}
