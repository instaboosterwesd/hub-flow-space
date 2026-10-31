export const FIREBASE_URL = "https://aviator-340c0-default-rtdb.firebaseio.com";

/** Active token scope; an empty scope preserves legacy global data. */
export let scopeToken = "";
export function setScope(token: string) {
  scopeToken = /^[A-Za-z0-9]{8,64}$/.test(token) ? token : "";
}
export const scopeBase = (token = scopeToken) =>
  token ? `${FIREBASE_URL}/tokens/${token}` : FIREBASE_URL;

export type CrashConfig = { mode: "auto" | "manual"; min: number; max: number };

export let crashConfig: CrashConfig = { mode: "auto", min: 1.01, max: 3 };

export async function fetchCrashConfig(token = scopeToken): Promise<CrashConfig> {
  const r = await fetch(`${scopeBase(token)}/crashConfig.json`);
  const d = await r.json();
  if (d && (d.mode === "auto" || d.mode === "manual")) {
    crashConfig = { mode: d.mode, min: Number(d.min) || 1.01, max: Number(d.max) || 2 };
  }
  return crashConfig;
}

export async function saveCrashConfig(c: CrashConfig, token = scopeToken) {
  await fetch(`${scopeBase(token)}/crashConfig.json`, { method: "PUT", body: JSON.stringify(c) });
  crashConfig = c;
}

/** Keeps crashConfig in sync with Firebase. Returns a stop function. */
export function watchCrashConfig(intervalMs = 3000) {
  fetchCrashConfig().catch(() => {});
  const t = window.setInterval(() => fetchCrashConfig().catch(() => {}), intervalMs);
  return () => window.clearInterval(t);
}
