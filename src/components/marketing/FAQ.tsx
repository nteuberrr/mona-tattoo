"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "¿Cuánto cuesta una sesión?",
    a: "El precio depende del tamaño, color y complejidad. Al reservar obtendrás una cotización detallada antes de confirmar."
  },
  {
    q: "¿Qué abono necesito pagar?",
    a: "Se pide un abono al confirmar la reserva. El monto es configurable (fijo o porcentaje) y se descuenta del total. No es reembolsable."
  },
  {
    q: "¿Puedo llevar una idea propia?",
    a: "Sí. Puedes mandar referencias al reservar y conversamos sobre la adaptación para que funcione en la piel."
  },
  {
    q: "¿Cuidan la higiene?",
    a: "Uso materiales estériles de un solo uso, guantes de nitrilo y tinta vegana. El estudio se desinfecta antes y después de cada cita."
  },
  {
    q: "¿Puedo reagendar?",
    a: "Sí, con mínimo 48 horas de anticipación. Pasado ese plazo se pierde el abono."
  },
  {
    q: "¿Atiendes menores de edad?",
    a: "Solo mayores de 18 años. Si eres menor, es posible con autorización notarial de tu tutor legal."
  }
];

export function FAQ() {
  return (
    <section id="faq" className="section">
      <div className="container mx-auto grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <span className="eyebrow">Preguntas</span>
          <h2 className="display-lg mt-3">FAQ</h2>
          <p className="mt-6 text-ink-soft max-w-sm">
            Lo que más me preguntan. Si queda algo pendiente, escríbeme al
            correo del estudio.
          </p>
        </div>

        <div className="lg:col-span-8">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
