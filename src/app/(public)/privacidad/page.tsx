import Link from "next/link";

export const metadata = { title: "Política de privacidad" };

export default function PrivacidadPage() {
  return (
    <article className="container mx-auto max-w-3xl py-24 md:py-32 px-6 prose">
      <Link href="/" className="eyebrow hover:text-ink">← Volver al inicio</Link>
      <h1 className="display-lg mt-4 mb-8">Política de privacidad</h1>

      <p className="text-ink-soft">
        Última actualización: {new Date().toLocaleDateString("es-CL")}.
      </p>

      <section className="mt-10 space-y-4 text-ink-soft">
        <h2 className="font-display text-2xl text-ink">1. Quiénes somos</h2>
        <p>
          <strong>Mona Tatt</strong> es un estudio de tatuaje operado por la
          tatuadora identificada en el sitio. Para contactarnos:{" "}
          <a href="mailto:agenda.monatatt@gmail.com" className="underline">
            agenda.monatatt@gmail.com
          </a>
          .
        </p>

        <h2 className="font-display text-2xl text-ink mt-8">2. Qué datos recopilamos</h2>
        <p>Al reservar una sesión, solicitamos:</p>
        <ul className="list-disc ml-6 space-y-1">
          <li>Nombre completo, correo, teléfono y edad.</li>
          <li>Descripción e imágenes de referencia del tatuaje.</li>
          <li>Datos de la cita (fecha, hora, lugar del cuerpo).</li>
          <li>Comprobante o referencia de transferencia del abono, si aplica.</li>
        </ul>

        <h2 className="font-display text-2xl text-ink mt-8">3. Para qué los usamos</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Gestionar tu reserva, agenda y confirmar tu cita.</li>
          <li>Contactarte por dudas o recordatorios asociados a tu sesión.</li>
          <li>Llevar historial de sesiones (para cuidados y continuidad).</li>
        </ul>
        <p>
          No vendemos ni compartimos tus datos con terceros con fines
          comerciales.
        </p>

        <h2 className="font-display text-2xl text-ink mt-8">4. Cómo los guardamos</h2>
        <p>
          Tus datos se almacenan en servicios estándar (Google Sheets, Vercel).
          Aplicamos las medidas razonables para evitar accesos no autorizados.
        </p>

        <h2 className="font-display text-2xl text-ink mt-8">5. Derechos</h2>
        <p>
          Puedes solicitar, en cualquier momento, acceder, rectificar o
          eliminar tus datos escribiéndonos a{" "}
          <a href="mailto:agenda.monatatt@gmail.com" className="underline">
            agenda.monatatt@gmail.com
          </a>
          .
        </p>

        <h2 className="font-display text-2xl text-ink mt-8">6. Cambios</h2>
        <p>
          Si modificamos esta política, actualizaremos la fecha al inicio de
          esta página.
        </p>
      </section>
    </article>
  );
}
