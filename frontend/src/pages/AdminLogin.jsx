import { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./Auth.css";

const API = "/api/admin";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", password: "", secret: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "register") {
        const res = await fetch(`${API}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: form.username, password: form.password, secret: form.secret }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Registration failed");
        setInfo("Admin account created. You can sign in now.");
        setMode("login");
      } else {
        const res = await fetch(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: form.username, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Login failed");
        login(data.token);
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
        <span className="auth-brand-name">TourGuide AI · Admin</span>
      </div>

      <div className="auth-card fade-up">
        <h1 className="auth-title">
          {mode === "login" ? "Admin sign in" : "Register admin"}
        </h1>
        <p className="auth-sub">
          {mode === "login"
            ? "Manage the knowledge base and AI ingestion pipeline."
            : "Create a new admin account using the system secret key."}
        </p>

        <form onSubmit={submit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input
              className="auth-input"
              type="text"
              placeholder="admin_user"
              value={form.username}
              onChange={set("username")}
              required
              autoFocus
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
          {mode === "register" && (
            <div className="auth-field">
              <label className="auth-label">Admin secret</label>
              <input
                className="auth-input"
                type="password"
                placeholder="System ADMIN_SECRET"
                value={form.secret}
                onChange={set("secret")}
                required
              />
            </div>
          )}

          {error && <p className="error-msg">{error}</p>}
          {info && <p className="error-msg" style={{ color: "var(--jade)", background: "var(--jade-soft)", borderColor: "var(--jade)" }}>{info}</p>}

          <button className="btn-primary auth-submit" type="submit" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create admin account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "Need an admin account? " : "Already registered? "}
          <button
            className="auth-switch-btn"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); setInfo(null); }}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>

        <p className="auth-admin-link" style={{ marginTop: 16, textAlign: "center" }}>
          <a href="/">← Back to traveller app</a>
        </p>
      </div>
    </div>
  );
}
