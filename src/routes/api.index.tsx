import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listUsers, setBalance } from "@/lib/balance";

export const Route = createFileRoute("/api/")({
  head: () => ({
    meta: [
      { title: "Balance API Panel" },
      { name: "description", content: "Manage user balances by user ID." },
      { property: "og:title", content: "Balance API Panel" },
      { property: "og:description", content: "Manage user balances by user ID." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ApiPanel,
});

const box = { maxWidth: 560, margin: "40px auto", padding: 20, fontFamily: "sans-serif" } as const;
const input = { padding: 8, marginRight: 8, border: "1px solid #888", borderRadius: 6, background: "transparent", color: "inherit" } as const;
const btn = { padding: "8px 14px", borderRadius: 6, border: "none", background: "#28a909", color: "#fff", cursor: "pointer" } as const;

function ApiPanel() {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [users, setUsers] = useState<{ userId: string; balance: number }[]>([]);
  const [uid, setUid] = useState("");
  const [bal, setBal] = useState("");

  const load = () => listUsers().then(setUsers).catch(() => {});
  useEffect(() => { if (ok) load(); }, [ok]);

  if (!ok) {
    return (
      <form style={box} onSubmit={(e) => { e.preventDefault(); if (pw === "dev") setOk(true); else setErr(true); }}>
        <h2>Password</h2>
        <input style={input} type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        <button style={btn} type="submit">Open</button>
        {err && <p style={{ color: "#e33" }}>Wrong password</p>}
      </form>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid.trim() || bal === "") return;
    await setBalance(uid.trim(), Number(bal));
    setUid(""); setBal("");
    load();
  };

  return (
    <div style={box}>
      <h2>User Balances</h2>
      <form onSubmit={save} style={{ marginBottom: 20 }}>
        <input style={input} placeholder="User ID" value={uid} onChange={(e) => setUid(e.target.value)} />
        <input style={input} placeholder="Balance" type="number" value={bal} onChange={(e) => setBal(e.target.value)} />
        <button style={btn} type="submit">Save</button>
      </form>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><th align="left">User ID</th><th align="right">Balance (INR)</th><th /></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.userId} style={{ borderTop: "1px solid #444" }}>
              <td style={{ padding: 6 }}>{u.userId}</td>
              <td align="right">{u.balance.toFixed(2)}</td>
              <td align="right"><button style={{ ...btn, background: "#555" }} onClick={() => { setUid(u.userId); setBal(String(u.balance)); }}>Edit</button></td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan={3} style={{ padding: 6 }}>No users yet</td></tr>}
        </tbody>
      </table>
      <Docs />
    </div>
  );
}

const pre = { background: "rgba(127,127,127,0.15)", padding: 10, borderRadius: 6, overflowX: "auto", fontSize: 12, whiteSpace: "pre-wrap" } as const;

function Docs() {
  const o = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <div style={{ marginTop: 32, fontSize: 14, lineHeight: 1.5 }}>
      <h2>API Documentation</h2>
      <p><b>User ID format:</b> letters, numbers, <code>_</code> or <code>-</code>, max 64 characters. Example: <code>11020000102087</code>. Balance is in INR (number, 2 decimals).</p>

      <h3>1. Check balance</h3>
      <pre style={pre}>{`GET ${o}/api/balance?userId=11020000102087`}</pre>
      <pre style={pre}>{`Response 200: {"userId":"11020000102087","balance":4077}
Response 404: {"userId":"...","error":"user not found"}`}</pre>

      <h3>2. Set / send balance (creates user if not found)</h3>
      <p>Sets the user's balance to the given amount. If the user ID does not exist, it is created automatically.</p>
      <pre style={pre}>{`POST ${o}/api/balance
Content-Type: application/json

{"userId":"11020000102087","balance":50,"key":"dev"}`}</pre>
      <p>Or as a simple link:</p>
      <pre style={pre}>{`GET ${o}/api/balance?userId=11020000102087&balance=50&key=dev`}</pre>
      <pre style={pre}>{`Response 200: {"userId":"11020000102087","balance":50,"created":false,"updated":true}
Response 401: {"error":"invalid key"}
Response 400: {"error":"balance must be a number >= 0"}`}</pre>

      <h3>3. Play game as a user</h3>
      <pre style={pre}>{`${o}/?user=11020000102087`}</pre>
      <p>The game shows that user's balance, deducts the bet when a round starts and adds winnings on cash out. Without <code>?user=</code> it uses the default ID 11020000102087.</p>
    </div>
  );
}
