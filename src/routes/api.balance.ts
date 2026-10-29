import { createFileRoute } from "@tanstack/react-router";
import { getBalance } from "@/lib/balance";

const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

export const Route = createFileRoute("/api/balance")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = new URL(request.url).searchParams.get("userId")?.trim();
        if (!userId) return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers });
        const balance = await getBalance(userId);
        if (balance === null) return new Response(JSON.stringify({ userId, error: "user not found" }), { status: 404, headers });
        return new Response(JSON.stringify({ userId, balance }), { headers });
      },
    },
  },
});
