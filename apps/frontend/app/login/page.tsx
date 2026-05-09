"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Mail, Lock, Loader2, Sparkles, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(email, password, rememberMe);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 px-4 py-8 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.12),_transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25 [mask-image:radial-gradient(circle_at_center,black,transparent_76%)] dark:opacity-10" />

<div className="absolute top-2 left-3 z-20 sm:top-3 sm:left-5 lg:top-4 lg:left-6">
  <h1 className="pb-1 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 bg-clip-text text-transparent sm:text-4xl lg:text-5xl">
    SmartShop
  </h1>
</div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="flex w-full justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <Link href="/" className="inline-flex items-center gap-3 rounded-2xl border border-white/40 bg-white/35 px-5 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5">
                <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 shadow-[0_10px_30px_rgba(168,85,247,0.45)] backdrop-blur-md border border-white/10">
  <div className="relative flex items-center justify-center">
    <div className="absolute h-8 w-8 rounded-full bg-white/20 blur-md"></div>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className="relative h-7 w-7 text-white drop-shadow-md"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6h2l2.4 9.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L21 8H7"
      />
      <circle cx="10" cy="19" r="1.4" />
      <circle cx="18" cy="19" r="1.4" />
    </svg>
  </div>
</span>
                <span className="text-2xl font-extrabold tracking-[-0.05em] bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 bg-clip-text text-transparent">
                  SmartShop
                </span>
              </Link>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to continue your shopping</p>
            </div>

            <div className="relative rounded-[2rem] border border-white/50 bg-white/45 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-gray-900/40">
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="group relative transition-transform duration-300 hover:-translate-y-0.5">
                    <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 p-1.5 text-white shadow-[0_6px_14px_rgba(249,115,22,0.35)]">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/40 via-white/20 to-white/30 opacity-0 blur-xl transition-opacity duration-300 group-focus-within:opacity-100 dark:from-orange-500/10 dark:via-fuchsia-500/10 dark:to-purple-500/10" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({ ...errors, email: undefined });
                      }}
                      className={`relative w-full rounded-2xl border px-4 py-3 pl-14 text-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_-12px_rgba(15,23,42,0.35)] outline-none transition-all duration-300 placeholder:text-gray-400 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_26px_-14px_rgba(15,23,42,0.42)] hover:border-orange-300/80 focus:bg-white focus:shadow-[0_0_0_4px_rgba(251,146,60,0.18),0_14px_26px_-14px_rgba(249,115,22,0.5)] dark:text-white ${
                        errors.email
                          ? "border-red-400 bg-white/90 dark:border-red-400/70 dark:bg-gray-800/80"
                          : "border-gray-200/80 bg-gradient-to-br from-white via-amber-50/30 to-rose-50/40 dark:border-white/10 dark:bg-white/5"
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="group relative transition-transform duration-300 hover:-translate-y-0.5">
                    <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 p-1.5 text-white shadow-[0_6px_14px_rgba(147,51,234,0.35)]">
                      <Lock className="h-4 w-4" />
                    </span>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/40 via-white/20 to-white/30 opacity-0 blur-xl transition-opacity duration-300 group-focus-within:opacity-100 dark:from-fuchsia-500/10 dark:via-purple-500/10 dark:to-blue-500/10" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors({ ...errors, password: undefined });
                      }}
                      className={`relative w-full rounded-2xl border px-4 py-3 pl-14 pr-12 text-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_-12px_rgba(15,23,42,0.35)] outline-none transition-all duration-300 placeholder:text-gray-400 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_26px_-14px_rgba(15,23,42,0.42)] hover:border-fuchsia-300/80 focus:bg-white focus:shadow-[0_0_0_4px_rgba(232,121,249,0.18),0_14px_26px_-14px_rgba(168,85,247,0.5)] dark:text-white ${
                        errors.password
                          ? "border-red-400 bg-white/90 dark:border-red-400/70 dark:bg-gray-800/80"
                          : "border-gray-200/80 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:border-white/10 dark:bg-white/5"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 transition hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="group inline-flex cursor-pointer items-center gap-3">
                    <span className="relative flex h-5 w-5 items-center justify-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="absolute inset-0 rounded-md border border-white/35 bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_8px_18px_-10px_rgba(15,23,42,0.35)] transition duration-300 peer-hover:-translate-y-0.5 peer-hover:border-orange-300/80 peer-hover:shadow-[0_0_0_4px_rgba(251,146,60,0.12),0_10px_24px_-12px_rgba(249,115,22,0.35)] peer-checked:border-transparent peer-checked:bg-gradient-to-br peer-checked:from-orange-500 peer-checked:via-fuchsia-500 peer-checked:to-purple-600 peer-checked:shadow-[0_0_0_4px_rgba(251,146,60,0.18),0_12px_26px_-12px_rgba(168,85,247,0.45)] dark:border-white/15 dark:bg-white/5" />
                      <svg className="relative h-3.5 w-3.5 scale-0 text-white transition duration-200 peer-checked:scale-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-gray-700 transition group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="group inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/55 px-4 py-2 text-sm font-semibold text-transparent shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-orange-300/70 hover:bg-white/80 hover:shadow-[0_0_0_4px_rgba(251,146,60,0.12),0_14px_30px_-14px_rgba(249,115,22,0.4)] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <span className="bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 bg-clip-text text-transparent transition group-hover:from-orange-300 group-hover:via-fuchsia-300 group-hover:to-pink-300">
                      Forgot password?
                    </span>
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative isolate flex w-full items-center justify-center overflow-hidden rounded-2xl border border-indigo-300/60 px-4 py-3.5 font-extrabold tracking-wide text-white transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600" />
                  <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(49,46,129,0.45),0_14px_24px_-14px_rgba(79,70,229,0.8)]" />
                  <span className="pointer-events-none absolute -left-10 top-0 h-full w-14 rotate-12 bg-white/20 blur-sm transition-transform duration-500 group-hover:translate-x-[240px]" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                      </>
                    )}
                  </span>
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/80 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="rounded-full border border-white/40 bg-white/70 px-3 py-1 text-gray-500 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/50 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

               {/* Social logins */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <button
              type="button"
              className="group relative isolate min-h-[72px] overflow-hidden rounded-2xl border border-gray-200/70 px-4 py-3.5 text-left transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] sm:min-h-0 sm:py-3"
            >
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100" />
              <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(148,163,184,0.35),0_12px_20px_-12px_rgba(15,23,42,0.45)]" />
              <span className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-rose-300/30 blur-2xl transition-all duration-300 group-hover:scale-125" />
              <span className="pointer-events-none absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-sky-300/25 blur-2xl transition-all duration-300 group-hover:scale-125" />

              <span className="relative flex items-center gap-3 sm:gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-[0_5px_12px_rgba(2,6,23,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] sm:h-9 sm:w-9">
                  <span className="bg-gradient-to-r from-blue-600 via-red-500 to-yellow-500 bg-clip-text text-xl font-black text-transparent sm:text-lg">
                    G
                  </span>
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 sm:text-xs sm:tracking-[0.16em]">Continue</span>
                  <span className="block text-[15px] font-extrabold leading-tight text-gray-800 sm:text-sm">Google</span>
                </span>
              </span>
            </button>

            <button
              type="button"
              className="group relative isolate min-h-[72px] overflow-hidden rounded-2xl border border-blue-200/60 px-4 py-3.5 text-left transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] sm:min-h-0 sm:py-3"
            >
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100" />
              <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(59,130,246,0.28),0_12px_20px_-12px_rgba(37,99,235,0.55)]" />
              <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-blue-300/35 blur-2xl transition-all duration-300 group-hover:scale-125" />
              <span className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-300/20 blur-2xl transition-all duration-300 group-hover:scale-125" />

              <span className="relative flex items-center gap-3 sm:gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-xl font-black text-white shadow-[0_7px_14px_rgba(37,99,235,0.45)] sm:h-9 sm:w-9 sm:text-lg">
                  f
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600 sm:text-xs sm:tracking-[0.16em]">Continue</span>
                  <span className="block text-[15px] font-extrabold leading-tight text-slate-800 sm:text-sm">Facebook</span>
                </span>
              </span>
            </button>
          </div>

              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Sign up for free
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                ← Continue as guest
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
