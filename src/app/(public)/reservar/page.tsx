import { fetchMatrices } from "@/lib/pricing/sheets";
import { BookingClient } from "@/components/booking/BookingClient";

// Se revalida cada 60s. El admin puede invalidar manualmente al guardar
// precios/horas (revalidatePath("/reservar")) para propagación inmediata.
export const revalidate = 60;

export default async function ReservarPage() {
  const { pricing, hours, source } = await fetchMatrices();
  return <BookingClient pricing={pricing} hours={hours} source={source} />;
}
