import { createFileRoute } from "@tanstack/react-router";
import { getBalance, setBalance } from "@/lib/balance";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
const API_KEY = "dev";
const validId = (id: unknown): id is string => typeof id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(id);

async function update(userId: unknown, balance: unknown, key: unknown) {
  if (key !== API_KEY) return json({ error: "invalid key" }, 401);
  if (!validId(userId)) return json({ error: "userId required (letters, numbers, _ or -, max 64)" }, 400);
  const amount = Number(balance);
  if (balance === null || balance === undefined || balance === "" || !Number.isFinite(amount) || amount < 0)
    return json({ error: "balance must be a number >= 0" }, 400);
  const existed = (await getBalance(userId)) !== null;
  await setBalance(userId, amount);
  return json({ userId, balance: Number(amount.toFixed(2)), created: !existed, updated: existed });
}

export const Route = createFileRoute("/api/balance")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers }),
      GET: async ({ request }) => {
        const p = new URL(request.url).searchParams;
        const userId = p.get("userId")?.trim();
        if (p.has("balance")) return update(userId, p.get("balance"), p.get("key"));
        if (!userId) return json({ error: "userId required" }, 400);
        const balance = await getBalance(userId);
        if (balance === null) return json({ userId, error: "user not found" }, 404);
        return json({ userId, balance });
      },
      POST: async ({ request }) => {
        let b: Record<string, unknown> = {};
        try { b = await request.json(); } catch { return json({ error: "invalid JSON body" }, 400); }
        return update(typeof b.userId === "string" ? b.userId.trim() : b.userId, b.balance, b.key);
      },
    },
  },
});
