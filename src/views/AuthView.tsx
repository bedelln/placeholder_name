import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';

/**
 * The AuthView handles user login and registration.
 * It manages the authentication form state and interacts with the API's auth endpoints.
 */
export function AuthView({ onAuthSuccess }: { onAuthSuccess: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [registrationType, setRegistrationType] = useState<"user" | "admin" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emptyForm = {
    username: "",
    email: "",
    password: "",
    displayName: "",
    adminAccessCode: "",
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
        const payload: any = {
          ...form,
          registrationType: registrationType || "user"
        };
        if (registrationType === "admin") {
          payload.adminAccessCode = form.adminAccessCode;
        }
        res = await api.auth.register(payload);
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
    setRegistrationType(null);
  };

  const handleBackToTypeSelection = () => {
    setRegistrationType(null);
    setForm(emptyForm);
    setError(null);
  };

  // Show registration type selection
  if (mode === "register" && registrationType === null) {
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
            BEGIN YOUR LEGEND
          </p>
        </div>

        <div style={{ fontSize: 16, marginBottom: 16 }}>
          <p style={{ color: "var(--parchment)", marginBottom: 8 }}>Register as:</p>
        </div>

        <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 320 }}>
          <button
            onClick={() => setRegistrationType("user")}
            className="btn-gold"
            style={{ flex: 1, padding: 14 }}
          >
            MEMBER
          </button>
          <button
            onClick={() => setRegistrationType("admin")}
            className="btn-gold"
            style={{ flex: 1, padding: 14 }}
          >
            ADMIN
          </button>
        </div>

        <div style={{ fontSize: 14, color: "var(--muted)" }}>
          <button
            onClick={handleModeSwitch}
            style={{ background: "transparent", color: "var(--teal)", fontWeight: 700, cursor: "pointer" }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

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
          {mode === "login" ? "RETURN TO THE JOURNEY" : `BEGIN YOUR LEGEND (${registrationType?.toUpperCase()})`}
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

        {mode === "register" && registrationType === "admin" && (
          <input
            placeholder="Admin Access Code"
            type="password"
            value={form.adminAccessCode}
            onChange={(e) => setForm({ ...form, adminAccessCode: e.target.value })}
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, padding: "14px 16px", color: "var(--parchment)", fontSize: 14,
            }}
            required
          />
        )}

        {error && <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div>}

        <button className="btn-gold" disabled={loading} style={{ marginTop: 8, padding: 14 }}>
          {loading ? "COMMUNING WITH SERVERS..." : mode.toUpperCase()}
        </button>
      </form>

      <div style={{ fontSize: 14, color: "var(--muted)" }}>
        {mode === "login" ? "New to these lands?" : "Already a legend?"}{" "}
        <button
          onClick={handleModeSwitch}
          style={{ background: "transparent", color: "var(--teal)", fontWeight: 700, cursor: "pointer" }}
        >
          {mode === "login" ? "Register" : "Login"}
        </button>
      </div>

      {mode === "register" && registrationType && (
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          <button
            onClick={handleBackToTypeSelection}
            style={{ background: "transparent", color: "var(--muted)", cursor: "pointer", textDecoration: "underline" }}
          >
            Choose different registration type
          </button>
        </div>
      )}
    </div>
  );
}
