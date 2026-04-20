/**
 * Cliente HTTP para el backend de Google Apps Script.
 * Acciones soportadas: las 7 del script en docs/apps-script/Code.gs.
 */

export type SheetsAction =
  | "createBooking"
  | "updateBookingStatus"
  | "createSpecialRequest"
  | "logEmail"
  | "getBookings"
  | "getConfig"
  | "getPricing"
  | "savePricing"
  | "saveHours"
  | "saveConfig";

export type SheetsResponse<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; reason: "not_configured" | "http_error" | "remote_error" };

function env() {
  const url = process.env.SHEETS_WEBHOOK_URL;
  const secret = process.env.SHEETS_WEBHOOK_SECRET;
  return { url, secret };
}

export function isSheetsConfigured(): boolean {
  const { url, secret } = env();
  return !!url && !!secret;
}

export async function callSheets<T = unknown>(
  action: SheetsAction,
  payload?: Record<string, unknown>
): Promise<SheetsResponse<T>> {
  const { url, secret } = env();
  if (!url || !secret) {
    return {
      ok: false,
      reason: "not_configured",
      error:
        "SHEETS_WEBHOOK_URL o SHEETS_WEBHOOK_SECRET no configurados. Usando fallback mock."
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, secret, payload }),
      cache: "no-store",
      // Apps Script redirige de /exec a googleusercontent — seguir redirects
      redirect: "follow"
    });

    if (!res.ok) {
      return {
        ok: false,
        reason: "http_error",
        error: `HTTP ${res.status}: ${await res.text().catch(() => res.statusText)}`
      };
    }

    const json = (await res.json()) as T & { error?: string };
    if (json && typeof json === "object" && "error" in json && json.error) {
      return {
        ok: false,
        reason: "remote_error",
        error: String(json.error)
      };
    }
    return { ok: true, data: json };
  } catch (e) {
    return {
      ok: false,
      reason: "http_error",
      error: e instanceof Error ? e.message : "Error desconocido"
    };
  }
}
