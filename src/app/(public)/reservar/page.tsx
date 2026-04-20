import { fetchMatrices } from "@/lib/pricing/sheets";
import { configValue, getConfig } from "@/lib/config/sheets";
import { getAllBookings } from "@/lib/bookings";
import { fetchBlocks } from "@/lib/blocks/sheets";
import { buildScheduleSnapshot } from "@/lib/scheduling/availability";
import { BookingClient } from "@/components/booking/BookingClient";
import type { PaymentInfo } from "@/components/booking/BookingContext";
import type { DiscountConfig } from "@/lib/pricing/calculator";

export const revalidate = 60;

export default async function ReservarPage() {
  const [{ pricing, hours, source }, config, { bookings }, blocks] = await Promise.all([
    fetchMatrices(),
    getConfig(),
    getAllBookings(),
    fetchBlocks()
  ]);

  const depositMode = configValue(config, "deposito_modo");
  const depositValue = Number(configValue(config, "deposito_valor")) || 30;

  const payment: PaymentInfo = {
    holderName: configValue(config, "banco_titular"),
    rut: configValue(config, "banco_rut"),
    bank: configValue(config, "banco_nombre"),
    accountType: configValue(config, "banco_cuenta_tipo"),
    accountNumber: configValue(config, "banco_cuenta_numero"),
    contactEmail: configValue(config, "banco_email_comprobante"),
    depositMode: depositMode === "FIXED" ? "FIXED" : "PERCENTAGE",
    depositValue
  };

  const discount: DiscountConfig = {
    multiTattooActive: String(configValue(config, "descuento_multi_tatuaje_activo")).toUpperCase() === "TRUE",
    multiTattooPct: Number(configValue(config, "descuento_multi_tatuaje_pct")) || 0
  };

  const schedule = buildScheduleSnapshot({
    bookings,
    blocks,
    config,
    fromDate: new Date(),
    daysAhead: 42 // 6 semanas
  });

  return (
    <BookingClient
      pricing={pricing}
      hours={hours}
      payment={payment}
      discount={discount}
      schedule={schedule}
      source={source}
    />
  );
}
