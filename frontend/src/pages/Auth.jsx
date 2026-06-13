import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const API = "/api";

export default function Auth() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Authentication failed");

      if (mode === "register") {
        // After register, auto-login
        const loginRes = await fetch(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error || "Login after register failed");
        login(loginData.token, { username: form.username, email: form.email });
      } else {
        login(data.token, { email: form.email, username: data.username || form.email.split("@")[0] });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="auth-logo-mark">⬡</span>
        <span className="auth-brand-name">TourGuide AI</span>
      </div>

      <div className="auth-card fade-up">
        <h1 className="auth-title">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="auth-sub">
          {mode === "login"
            ? "Sign in to explore Sri Lanka's landmarks."
            : "Join to start exploring with AI."}
        </p>

        <form onSubmit={submit} className="auth-form">
          {mode === "register" && (
            <div className="auth-field">
              <label className="auth-label">Username</label>
              <input
                className="auth-input"
                type="text"
                placeholder="your_name"
                value={form.username}
                onChange={set("username")}
                required
                autoFocus
              />
            </div>
          )}
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              required
              autoFocus={mode === "login"}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
              required
              minLength={6}
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="btn-primary auth-submit" type="submit" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            className="auth-switch-btn"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>

      <p className="auth-footer">Powered by Gemini · ChromaDB · MongoDB</p>
      <p className="auth-admin-link"><a href="/admin">Staff &amp; admin sign in →</a></p>
    </div>
  );
}
