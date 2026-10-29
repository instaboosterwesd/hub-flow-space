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

type Row = { userId: string; balance: number };

function ApiPanel() {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [users, setUsers] = useState<Row[]>([]);
  const [uid, setUid] = useState("");
  const [bal, setBal] = useState("");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [bad, setBad] = useState(false);
  const [at, setAt] = useState("");

  const load = () =>
    listUsers()
      .then((rows) => {
        setUsers(rows);
        setAt(new Date().toLocaleTimeString());
      })
      .catch(() => {
        setMsg("Could not load users from Firebase.");
        setBad(true);
      });

  useEffect(() => {
    if (ok) load();
  }, [ok]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = uid.trim();
    if (!id) {
      setMsg("Enter a user ID.");
      setBad(true);
      return;
    }
    if (bal === "" || Number.isNaN(Number(bal))) {
      setMsg("Enter a balance amount.");
      setBad(true);
      return;
    }
    setMsg("Saving…");
    setBad(false);
    try {
      await setBalance(id, Number(bal));
      setMsg(`Saved ${id} at ₹${Number(bal).toFixed(2)}.`);
      setUid("");
      setBal("");
      load();
    } catch {
      setMsg("Save failed — Firebase rejected the write.");
      setBad(true);
    }
  };

  if (!ok) {
    return (
      <div className="api-scroll">
        <div className="api-gate">
          <form
            className="api-gate-card"
            onSubmit={(e) => {
              e.preventDefault();
              if (pw === "dev") {
                setErr(false);
                setOk(true);
              } else {
                setErr(true);
              }
            }}
          >
            <h1>Balance API</h1>
            <p>Enter the panel password to open user balances and docs.</p>
            <input
              className="api-input"
              type="password"
              value={pw}
              placeholder="Password"
              onChange={(e) => setPw(e.target.value)}
              autoFocus
            />
            <button className="api-btn" type="submit">
              Open panel
            </button>
            {err && <p className="api-note err">Wrong password</p>}
          </form>
        </div>
      </div>
    );
  }

  const total = users.reduce((s, u) => s + u.balance, 0);
  const shown = q.trim()
    ? users.filter((u) => u.userId.toLowerCase().includes(q.trim().toLowerCase()))
    : users;

  return (
    <div className="api-scroll">
      <div className="api-wrap">
        <header className="api-topbar">
          <div className="api-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
            </svg>
            Balance API
            <span className="api-tag">Firebase</span>
          </div>
          <div className="api-spacer" />
          <a className="api-link" href="/" target="_blank" rel="noreferrer">
            Open game
          </a>
          <button className="api-link" type="button" onClick={load}>
            Refresh
          </button>
          <button
            className="api-link danger"
            type="button"
            onClick={() => {
              setOk(false);
              setPw("");
              setMsg("");
            }}
          >
            Lock
          </button>
        </header>

        <section className="api-card">
          <h2>Overview</h2>
          <div className="api-stats">
            <div className="api-stat">
              <span>Users</span>
              <strong>{users.length}</strong>
            </div>
            <div className="api-stat">
              <span>Total balance</span>
              <strong>₹{total.toFixed(2)}</strong>
            </div>
            <div className="api-stat">
              <span>Updated</span>
              <strong>{at || "—"}</strong>
            </div>
          </div>

          <form className="api-form" onSubmit={submit}>
            <input
              className="api-input grow"
              placeholder="User ID — e.g. 11020000102087"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
            />
            <input
              className="api-input"
              placeholder="Balance (INR)"
              type="number"
              step="0.01"
              min="0"
              value={bal}
              onChange={(e) => setBal(e.target.value)}
            />
            <button className="api-btn" type="submit">
              Save
            </button>
            {(uid || bal) && (
              <button
                className="api-btn ghost"
                type="button"
                onClick={() => {
                  setUid("");
                  setBal("");
                  setMsg("");
                }}
              >
                Clear
              </button>
            )}
          </form>
          {msg && <p className={"api-note" + (bad ? " err" : "")}>{msg}</p>}
        </section>

        <section className="api-card">
          <h2>Users</h2>
          <div className="api-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              className="api-input"
              placeholder="Search user ID"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <table className="api-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Balance (INR)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.userId}>
                  <td>{u.userId}</td>
                  <td className="num">{u.balance.toFixed(2)}</td>
                  <td className="act">
                    <button
                      className="api-mini"
                      type="button"
                      onClick={() => {
                        setUid(u.userId);
                        setBal(String(u.balance));
                        setMsg("");
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && (
            <p className="api-empty">{users.length === 0 ? "No users yet." : "No user matches that search."}</p>
          )}
        </section>

        <Docs />
      </div>
    </div>
  );
}

function Code({ children }: { children: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(children);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = children;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setDone(true);
    window.setTimeout(() => setDone(false), 1200);
  };
  return (
    <div className="api-code">
      <pre>{children}</pre>
      <button className="api-copy" type="button" onClick={copy}>
        {done ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function Docs() {
  const o = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <section className="api-card">
      <h2>API documentation</h2>
      <p>
        <b>User ID format:</b> letters, numbers, <code>_</code> or <code>-</code>, up to 64 characters. Example:
        <code>11020000102087</code>. Balance is in INR (number, 2 decimals).
      </p>

      <h3>1. Check balance</h3>
      <p>Read-only. Returns that user's current balance.</p>
      <Code>{`GET ${o}/api/balance?userId=11020000102087`}</Code>
      <Code>{`Response 200: {"userId":"11020000102087","balance":4077}
Response 404: {"userId":"...","error":"user not found"}`}</Code>

      <h3>2. Set / send balance (creates user if not found)</h3>
      <p>
        Sets the user's balance to the given amount. If the user ID does not exist yet, it is created automatically.
        The <code>key</code> must be the panel password.
      </p>
      <Code>{`POST ${o}/api/balance
Content-Type: application/json

{"userId":"11020000102087","balance":50,"key":"dev"}`}</Code>
      <p>Or as a simple link:</p>
      <Code>{`GET ${o}/api/balance?userId=11020000102087&balance=50&key=dev`}</Code>
      <Code>{`Response 200: {"userId":"11020000102087","balance":50,"created":false,"updated":true}
Response 401: {"error":"invalid key"}
Response 400: {"error":"balance must be a number >= 0"}`}</Code>

      <h3>3. Play game as a user</h3>
      <p>Opens the flight game loaded with that user's balance.</p>
      <Code>{`${o}/?user=11020000102087`}</Code>
      <p>
        The game shows that user's balance, deducts the bet when a round starts and adds winnings on cash out.
        Without <code>?user=</code> it uses the default ID 11020000102087.
      </p>
    </section>
  );
}
