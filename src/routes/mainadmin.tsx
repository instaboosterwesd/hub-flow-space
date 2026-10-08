import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchCrashConfig, saveCrashConfig, type CrashConfig } from "@/lib/crash-config";

const FB = "https://aviator-340c0-default-rtdb.firebaseio.com";

export const Route = createFileRoute("/mainadmin")({
  head: () => ({
    meta: [
      { title: "Admin Login — Aviator" },
      { name: "description", content: "Aviator admin panel login." },
      { property: "og:title", content: "Admin Login — Aviator" },
      { property: "og:description", content: "Aviator admin panel login." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Log = { at: number; ua: string };

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem("mainadmin") === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch(`${FB}/adminLogins.json?orderBy="$key"&limitToLast=20`)
      .then((r) => r.json())
      .then((d) => setLogs(d ? (Object.values(d) as Log[]).reverse() : []))
      .catch(() => {});
  }, [authed]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (u.trim() === "dev" && p === "dev") {
      setErr("");
      sessionStorage.setItem("mainadmin", "1");
      await fetch(`${FB}/adminLogins.json`, {
        method: "POST",
        body: JSON.stringify({ at: Date.now(), ua: navigator.userAgent }),
      }).catch(() => {});
      setAuthed(true);
    } else setErr("Galat username ya password");
  };

  const logout = () => {
    sessionStorage.removeItem("mainadmin");
    setAuthed(false);
    setU("");
    setP("");
  };

  if (!authed)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <form onSubmit={login} className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-6">
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground" placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} />
          <input type="password" className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground" placeholder="Password" value={p} onChange={(e) => setP(e.target.value)} />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button className="w-full rounded-md bg-primary py-2 font-semibold text-primary-foreground">Login</button>
        </form>
      </div>
    );

  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button onClick={logout} className="rounded-md border border-border px-4 py-2">Logout</button>
        </div>
        <CrashControl />
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 font-semibold">Recent admin logins (Firebase)</h2>
          {logs.length === 0 ? <p className="text-muted-foreground">Koi record nahi</p> : (
            <ul className="space-y-1 text-sm">
              {logs.map((l, i) => <li key={i}>{new Date(l.at).toLocaleString()}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function CrashControl() {
  const [cfg, setCfg] = useState<CrashConfig>({ mode: "auto", min: 1.01, max: 3 });
  const [msg, setMsg] = useState("");
  useEffect(() => {
    fetchCrashConfig().then(setCfg).catch(() => {});
  }, []);
  const save = async () => {
    if (cfg.mode === "manual" && (cfg.min < 1.01 || cfg.max < cfg.min)) {
      setMsg("Min kam se kam 1.01 aur Max, Min se bada hona chahiye");
      return;
    }
    await saveCrashConfig(cfg);
    setMsg("Save ho gaya! Agle round se lagu hoga.");
  };
  const btn = (active: boolean) =>
    `flex-1 rounded-md py-2 font-semibold ${active ? "bg-primary text-primary-foreground" : "border border-border"}`;
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <h2 className="font-semibold">Plane Crash Control</h2>
      <div className="flex gap-2">
        <button className={btn(cfg.mode === "auto")} onClick={() => setCfg({ ...cfg, mode: "auto" })}>Auto (Random)</button>
        <button className={btn(cfg.mode === "manual")} onClick={() => setCfg({ ...cfg, mode: "manual" })}>Manual Range</button>
      </div>
      {cfg.mode === "manual" && (
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Min (x)
            <input type="number" step="0.01" min="1.01" value={cfg.min} onChange={(e) => setCfg({ ...cfg, min: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
          </label>
          <label className="text-sm">Max (x)
            <input type="number" step="0.01" min="1.01" value={cfg.max} onChange={(e) => setCfg({ ...cfg, max: Number(e.target.value) })} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
          </label>
          <p className="col-span-2 text-sm text-muted-foreground">Plane {cfg.min}x se {cfg.max}x ke beech random crash hoga.</p>
        </div>
      )}
      <button onClick={save} className="w-full rounded-md bg-primary py-2 font-semibold text-primary-foreground">Save</button>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </div>
  );
}
