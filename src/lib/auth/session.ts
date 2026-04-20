/**
 * Cookie de sesión firmada con HMAC-SHA256 (Web Crypto, compatible con Edge).
 *
 * Formato del token: `${base64url(payload)}.${base64url(signature)}`
 * Payload: `${email}|${expiresAtMs}`
 *
 * Fase 2 temporal — Fase 3 migrar a NextAuth si se necesita multi-user.
 */

export const ADMIN_COOKIE = "monatatt_admin_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(bytes: Uint8Array | ArrayBuffer): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  arr.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice(0, (4 - (s.length % 4)) % 4);
  const raw = atob(padded);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(email: string, secret: string): Promise<string> {
  const payload = `${email}|${Date.now() + SESSION_TTL_MS}`;
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return `${b64url(enc.encode(payload))}.${b64url(sig)}`;
}

export async function verifySession(
  token: string | undefined,
  secret: string | undefined
): Promise<{ email: string; expiresAt: number } | null> {
  if (!token || !secret) return null;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  try {
    const payloadBytes = fromB64url(payloadB64);
    const sigBytes = fromB64url(sigB64);
    const key = await getKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as BufferSource,
      payloadBytes as BufferSource
    );
    if (!valid) return null;

    const payload = dec.decode(payloadBytes);
    const [email, expStr] = payload.split("|");
    const expiresAt = Number(expStr);
    if (!email || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

    return { email, expiresAt };
  } catch {
    return null;
  }
}
