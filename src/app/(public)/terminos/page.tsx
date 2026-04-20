import Link from "next/link";

export const metadata = { title: "Términos y condiciones" };

export default function TerminosPage() {
  return (
    <article className="container mx-auto max-w-3xl py-24 md:py-32 px-6">
      <Link href="/" className="eyebrow hover:text-ink">← Volver al inicio</Link>
      <h1 className="display-lg mt-4 mb-8">Términos y condiciones</h1>

      <p className="text-ink-soft">
        Última actualización: {new Date().toLocaleDateString("es-CL")}.
      </p>

      <section className="mt-10 space-y-4 text-ink-soft">
        <h2 className="font-display text-2xl text-ink">1. Reservas y abono</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            El cupo queda <strong>reservado temporalmente por 30 minutos</strong>{" "}
            después de generar la cotización, tiempo suficiente para hacer la
            transferencia.
          </li>
          <li>
            La reserva se confirma <strong>solo cuando recibimos el abono</strong>{" "}
            y enviamos el correo de confirmación.
          </li>
          <li>
            El abono <strong>no es reembolsable</strong> bajo ninguna circunstancia.
          </li>
        </ul>

        <h2 className="font-display text-2xl text-ink mt-8">2. Reagendamientos y cancelaciones</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            Puedes reagendar tu cita con un mínimo de{" "}
            <strong>48 horas de anticipación</strong> sin perder el abono.
          </li>
          <li>
            Pasado ese plazo, el abono se considera perdido y deberás pagar uno
            nuevo si quieres reprogramar.
          </li>
          <li>
            Si llegas con más de <strong>15 minutos de atraso</strong>, nos
            reservamos el derecho a reagendar tu cita (con las mismas
            condiciones anteriores).
          </li>
        </ul>

        <h2 className="font-display text-2xl text-ink mt-8">3. Sobre el diseño y el valor</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>
            Si el diseño se ajusta o cambia durante la sesión, pueden aplicar
            costos adicionales proporcionales al nuevo alcance.
          </li>
          <li>
            El valor es <strong>por persona</strong>. No hay descuentos por
            hacerse el mismo diseño entre varias personas.
          </li>
        </ul>

        <h2 className="font-display text-2xl text-ink mt-8">4. Antes de tu sesión</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>No asistas en ayuno.</li>
          <li>Evita alcohol y drogas 24 horas antes.</li>
          <li>Hidrata la zona con crema la semana previa.</li>
          <li>No asistas con niños pequeños ni mascotas.</li>
        </ul>

        <h2 className="font-display text-2xl text-ink mt-8">5. Después de tu sesión</h2>
        <p>
          No hagas ejercicio intenso los 2 días posteriores. Sigue las
          indicaciones de cuidado que te entregue la tatuadora.
        </p>

        <h2 className="font-display text-2xl text-ink mt-8">6. Edad</h2>
        <p>
          Atendemos a partir de los 18 años. Si eres menor, necesitas
          autorización notarial de tu tutor legal.
        </p>

        <h2 className="font-display text-2xl text-ink mt-8">7. Derecho de admisión</h2>
        <p>
          Nos reservamos el derecho a rechazar o cancelar una reserva si se
          detecta información falsa, mal trato o comportamiento inapropiado.
        </p>
      </section>
    </article>
  );
}
