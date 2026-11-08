import { useState } from "react";
import { BrandMark } from "../components/BrandMark.jsx";
import { supabase } from "../lib/supabaseClient.js";

const profileIcons = ["noun_Owl_7392195.svg", "noun_Owl_7417114.svg", "noun_Owl_7562088.svg", "noun_Owl_7834524.svg"];

export function AuthPage({ mode, onNavigate }) {
  const isSignup = mode === "signup";
  const [values, setValues] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  function update(event) { setValues((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (isSignup && values.password !== values.confirmPassword) { setError("Passwords do not match."); return; }
    if (values.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    const result = isSignup
      ? await supabase.auth.signUp({ email: values.email, password: values.password, options: { data: { username: values.username, icon_key: profileIcons[Math.floor(Math.random() * profileIcons.length)] } } })
      : await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
    setLoading(false);
    if (result.error) { setError(result.error.message); return; }
    if (!result.data.session) { setNotice("Check your email to confirm your account, then log in."); return; }
    onNavigate("/");
  }
  return <>
    <header className="auth-header"><BrandMark onNavigate={onNavigate} className="auth-brand" /><a className="header-link" href={isSignup ? "/login" : "/signup"} onClick={(event) => { event.preventDefault(); onNavigate(isSignup ? "/login" : "/signup"); }}>{isSignup ? "Log in" : "Create an account"}</a></header>
    <main className="auth-main"><section className="auth-card" aria-labelledby="auth-title"><h1 id="auth-title">{isSignup ? "Create your account" : "Welcome back"}</h1><p className="auth-intro">{isSignup ? "Join DataOwls to create and share your data stories." : "Log in to continue exploring and sharing data stories."}</p><form className="auth-form" onSubmit={submit}>
      {isSignup && <><label htmlFor="username">Username</label><input id="username" name="username" value={values.username} onChange={update} required /></>}
      <label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={update} required />
      <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} value={values.password} onChange={update} required />
      {isSignup && <><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type="password" value={values.confirmPassword} onChange={update} required /></>}
      {error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="form-notice" role="status">{notice}</p>}<button className="submit-button" type="submit" disabled={loading}>{loading ? "Please wait..." : isSignup ? "Create Account" : "Log In"}</button>
    </form></section></main>
  </>;
}
