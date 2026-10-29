import { FIREBASE_URL } from "./crash-config";

export const DEFAULT_USER_ID = "11020000102087";

const clean = (id: string) => id.replace(/[.#$\[\]/]/g, "").slice(0, 64);

export async function getBalance(userId: string): Promise<number | null> {
  const r = await fetch(`${FIREBASE_URL}/users/${clean(userId)}/balance.json`);
  const d = await r.json();
  return typeof d === "number" ? d : null;
}

export async function setBalance(userId: string, balance: number) {
  await fetch(`${FIREBASE_URL}/users/${clean(userId)}/balance.json`, {
    method: "PUT",
    body: JSON.stringify(Number(balance.toFixed(2))),
  });
}

export async function changeBalance(userId: string, delta: number): Promise<number> {
  const current = (await getBalance(userId)) ?? 0;
  const next = Math.max(0, Number((current + delta).toFixed(2)));
  await setBalance(userId, next);
  return next;
}

export async function listUsers(): Promise<{ userId: string; balance: number }[]> {
  const r = await fetch(`${FIREBASE_URL}/users.json`);
  const d = (await r.json()) as Record<string, { balance?: number }> | null;
  return Object.entries(d ?? {}).map(([userId, v]) => ({ userId, balance: Number(v?.balance ?? 0) }));
}
