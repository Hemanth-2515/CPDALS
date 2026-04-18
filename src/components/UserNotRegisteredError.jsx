import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: ""
};

export default function UserNotRegisteredError() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "register") {
        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/40 to-blue-50">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-xl shadow-slate-200/70 backdrop-blur">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg">
            <span className="text-lg font-bold">CP</span>
          </div>
          <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-900">
            Adaptive learning built around focus, progress, and consistency.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Sign in to access your dashboard, continue your sessions, and track your learning journey in one place.
          </p>
          <div className="mt-8 grid gap-4">
            {[
              ["Personal dashboard", "Access your learning space, sessions, and saved progress."],
              ["Smart recommendations", "See content suggestions based on your profile and activity."],
              ["Progress tracking", "Monitor completion, study sessions, streaks, and scores."]
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white p-8 shadow-xl shadow-slate-200/70">
          <div className="mb-6 inline-flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${mode === "login" ? "bg-violet-600 text-white shadow" : "text-slate-600"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${mode === "register" ? "bg-violet-600 text-white shadow" : "text-slate-600"}`}
            >
              Register
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {mode === "login" ? "Enter your credentials to continue." : "Set up your account to access the platform."}
              </p>
            </div>

            {mode === "register" && (
              <label className="block text-sm font-medium text-slate-700">
                Full name
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  name="name"
                  onChange={updateField}
                  required
                  value={form.name}
                />
              </label>
            )}

            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                name="email"
                onChange={updateField}
                required
                type="email"
                value={form.email}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                minLength="6"
                name="password"
                onChange={updateField}
                required
                type="password"
                value={form.password}
              />
            </label>

            {mode === "register" && (
              <label className="block text-sm font-medium text-slate-700">
                Confirm password
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  minLength="6"
                  name="confirmPassword"
                  onChange={updateField}
                  required
                  type="password"
                  value={form.confirmPassword}
                />
              </label>
            )}

            {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

            <button
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              type="submit"
            >
              {busy ? "Please wait..." : mode === "login" ? "Enter app" : "Create account"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
