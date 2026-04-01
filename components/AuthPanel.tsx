"use client";

import { useState } from "react";
import { isValidPassword, loginWithEmail, loginWithGoogle, registerWithEmail } from "@/lib/auth-client";

type Props = {
  title?: string;
};

export default function AuthPanel({ title = "Sign in to continue shopping" }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (!isValidPassword(password)) {
          setError("Password must be at least 8 chars, include one letter and one special symbol.");
          setLoading(false);
          return;
        }
        await registerWithEmail(name, email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setError("Authentication failed. Check credentials and Firebase auth settings.");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      setError("Google sign-in failed. Enable Google provider in Firebase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <section className="cart-page">
        <h2>{title}</h2>
        <p className="store-tagline">Login required before viewing products and purchasing.</p>
        {mode === "register" && (
          <input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
          />
        )}
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
        <button className="primary" onClick={submit} disabled={loading}>
          {mode === "register" ? "Create account" : "Sign in"}
        </button>
        <button className="btn-add" onClick={google} disabled={loading}>
          Continue with Google
        </button>
        <button className="header-link auth-switch" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "No account? Register" : "Already have an account? Sign in"}
        </button>
        {error && <p className="danger">{error}</p>}
      </section>
    </div>
  );
}
