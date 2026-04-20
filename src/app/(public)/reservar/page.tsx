import { fetchMatrices } from "@/lib/pricing/sheets";
import { configValue, getConfig } from "@/lib/config/sheets";
import { BookingClient } from "@/components/booking/BookingClient";
import type { PaymentInfo } from "@/components/booking/BookingContext";

export const revalidate = 60;

export default async function ReservarPage() {
  const [{ pricing, hours, source }, config] = await Promise.all([
    fetchMatrices(),
    getConfig()
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

  return (
    <BookingClient pricing={pricing} hours={hours} payment={payment} source={source} />
  );
}
