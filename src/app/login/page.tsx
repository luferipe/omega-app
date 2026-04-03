"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#111114" }}>
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#eee" }}>
            OMEGA
          </h1>
          <div className="w-10 h-px mx-auto mt-3" style={{ background: "#c4a265" }} />
          <p className="text-xs mt-3 tracking-widest uppercase" style={{ color: "#555" }}>
            Admin Panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="text-sm text-center py-2 px-4 rounded-lg" style={{ background: "rgba(248,113,113,.1)", color: "#f87171", border: "1px solid rgba(248,113,113,.2)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "#666" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-1"
              style={{
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.06)",
                color: "#eee",
              }}
              placeholder="admin@omegahomes.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "#666" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-1"
              style={{
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.06)",
                color: "#eee",
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-medium tracking-wider uppercase"
            style={{
              background: loading ? "#555" : "#c4a265",
              color: "#060606",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
