import crypto from "node:crypto";
import { concatBytes, sha256, utf8ToBytes } from "./sha256";

export const DEMO_SECRET = process.env.DEMO_SECRET ?? "server-side-super-secret";
export const FLAG = process.env.CTF_FLAG ?? "flag{sha256_length_extension_mastered}";
export const ADMIN_FLAG = process.env.CTF_ADMIN_FLAG ?? "flag{admin_privilege_escalation_success}";

export const BASE_PAYMENT_MESSAGE = "user=arif&amount=100&to=shop";

export const vulnerableSign = (message: Uint8Array): string => {
  return sha256(concatBytes(utf8ToBytes(DEMO_SECRET), message));
};

export const safeSign = (message: Uint8Array): string => {
  return crypto.createHmac("sha256", DEMO_SECRET).update(message).digest("hex");
};

export const parseQueryStringBytes = (message: Uint8Array): Map<string, string[]> => {
  const out = new Map<string, string[]>();
  const text = Buffer.from(message).toString("latin1");
  const segments = text.split("&");

  for (const segment of segments) {
    if (!segment) continue;
    const eqIndex = segment.indexOf("=");
    if (eqIndex < 0) continue;

    const rawKey = segment.slice(0, eqIndex);
    const rawValue = segment.slice(eqIndex + 1);

    const key = rawKey;
    const value = rawValue;
    const current = out.get(key) ?? [];
    current.push(value);
    out.set(key, current);
  }

  return out;
};

export const getLastValue = (map: Map<string, string[]>, key: string): string | null => {
  const values = map.get(key);
  if (!values || values.length === 0) return null;
  return values[values.length - 1] ?? null;
};
