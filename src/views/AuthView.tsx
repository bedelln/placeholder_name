import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';

/**
 * The AuthView handles user login and registration.
 * It manages the authentication form state and interacts with the API's auth endpoints.
 */
export function AuthView({ onAuthSuccess }: { onAuthSuccess: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emptyForm = {
    username: "",
    email: "",
    password: "",
    displayName: "",
  };
  const [form, setForm] = useState(emptyForm);

  /**
   * Handles form submission for both login and registration.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let res;
      if (mode === "login") {
        // Use username or email as the identifier for login
        res = await api.auth.login(form.username || form.email, form.password);
      } else {
        res = await api.auth.register(form);
      }
      // Store the token in local storage and notify the parent component of success
      localStorage.setItem("sq_token", res.token);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
    setForm(emptyForm);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      width: "100%", height: "100%", padding: 32, gap: 24, textAlign: "center"
    }}>
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 32, fontWeight: 900 }} className="gold-text">
          SIDEQUESTING
        </h1>
        <p style={{ color: "var(--muted)", letterSpacing: "0.2em", fontSize: 12, fontWeight: 700 }}>
          {mode === "login" ? "RETURN TO THE JOURNEY" : "BEGIN YOUR LEGEND"}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 16 }}>
        {mode === "register" && (
          <>
            <input
              placeholder="Display Name"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, padding: "14px 16px", color: "var(--parchment)", fontSize: 14,
              }}
              required
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, padding: "14px 16px", color: "var(--parchment)", fontSize: 14,
              }}
              required
            />
          </>
        )}
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          style={{
            width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "14px 16px", color: "var(--parchment)", fontSize: 14,
          }}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={{
            width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "14px 16px", color: "var(--parchment)", fontSize: 14,
          }}
          required
        />

        {error && <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div>}

        <button className="btn-gold" disabled={loading} style={{ marginTop: 8, padding: 14 }}>
          {loading ? "COMMUNING WITH SERVERS..." : mode.toUpperCase()}
        </button>
      </form>

      <div style={{ fontSize: 14, color: "var(--muted)" }}>
        {mode === "login" ? "New to these lands?" : "Already a legend?"}{" "}
        <button
          onClick={handleModeSwitch}
          style={{ background: "transparent", color: "var(--teal)", fontWeight: 700 }}
        >
          {mode === "login" ? "Register" : "Login"}
        </button>
      </div>
    </div>
  );
}
