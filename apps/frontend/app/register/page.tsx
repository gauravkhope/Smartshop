"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "../../lib/axios";

const RESEND_TIMEOUT_SECONDS = 60;
const OTP_EXPIRY_MINUTES = 10;

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (step !== 2 || resendCooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, resendCooldown]);

  // Step 1: Enter Name + Email
  const handleNameEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    let hasErrors = false;
    setNameError("");
    setEmailError("");
    setError("");

    if (!trimmedName) {
      setNameError("Name is required");
      hasErrors = true;
    } else if (trimmedName.length < 2) {
      setNameError("Name must be at least 2 characters");
      hasErrors = true;
    }

    if (!trimmedEmail) {
      setEmailError("Email is required");
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setEmailError("Enter a valid email");
      hasErrors = true;
    }

    if (hasErrors) return;

    setLoading(true);
    setError("");

    try {
      await axios.post("/auth/register", { name: trimmedName, email: trimmedEmail });
      setStep(2);
      setSuccess("");
      setResendCooldown(RESEND_TIMEOUT_SECONDS);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post("/auth/register", { name, email });
      setSuccess("A new OTP has been sent to your Gmail.");
      setResendCooldown(RESEND_TIMEOUT_SECONDS);
    } catch (err: any) {
      setSuccess("");
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedOtp = otp.trim();
    setOtpError("");
    setError("");

    if (!trimmedOtp) {
      setOtpError("OTP is required");
      return;
    }

    if (trimmedOtp.length !== 6) {
      setOtpError("Enter the 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      await axios.post("/auth/verifyOtp", { email, otp: trimmedOtp });
      setStep(3);
      setSuccess("Email verified! Set your password.");
    } catch (err: any) {
      const message = err.response?.data?.message || "OTP verification failed";
      const remainingAttempts = err.response?.data?.remainingAttempts;

      if (typeof remainingAttempts === "number") {
        setError(`${message}. Remaining attempts: ${remainingAttempts}`);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    setError("");

    try {
      await axios.post("/auth/register", { name, email, password });
      setSuccess("Your Account has been Created Successfully!");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gradient bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-lg mb-2">
            SmartShop
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Join us and Start Shopping!</p>
        </div>

        {/* Registration Box */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleNameEmailSubmit} data-testid="auth-register-form" className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Name</label>
                <div className="group relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 p-1.5 text-white shadow-[0_6px_14px_rgba(147,51,234,0.35)]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 10-16 0" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    data-testid="auth-name-input"
                    className="w-full rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-3 pl-14 text-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_-12px_rgba(15,23,42,0.35)] outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-fuchsia-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(232,121,249,0.22),0_14px_26px_-14px_rgba(168,85,247,0.65)] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError("");
                      setError("");
                    }}
                  />
                </div>
                {nameError && <p className="mt-2 text-sm text-red-500">{nameError}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
                <div className="group relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 p-1.5 text-white shadow-[0_6px_14px_rgba(249,115,22,0.35)]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7l8 6 8-6" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    data-testid="auth-email-input"
                    className="w-full rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white via-amber-50/30 to-rose-50/40 px-4 py-3 pl-14 text-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_-12px_rgba(15,23,42,0.35)] outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(251,146,60,0.22),0_14px_26px_-14px_rgba(249,115,22,0.65)] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                      setError("");
                    }}
                  />
                </div>
                {emailError && <p className="mt-2 text-sm text-red-500">{emailError}</p>}
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && (
                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-teal-50 px-4 py-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Success</p>
                      <p className="text-base font-bold text-emerald-900">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                data-testid="auth-send-otp-btn"
                disabled={loading}
                className="group relative isolate w-full overflow-hidden rounded-2xl border border-indigo-300/60 px-4 py-3.5 font-extrabold tracking-wide text-white transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600" />
                <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(49,46,129,0.45),0_14px_24px_-14px_rgba(79,70,229,0.8)]" />
                <span className="pointer-events-none absolute -left-10 top-0 h-full w-14 rotate-12 bg-white/20 blur-sm transition-transform duration-500 group-hover:translate-x-[240px]" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? "Sending..." : "Send OTP"}
                </span>
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleOtpSubmit} data-testid="otp-form" className="space-y-6">
              {/* Gmail notification banner */}
              <div data-testid="otp-info-container" className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                <div className="relative w-10 h-10 shrink-0">
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-[0_10px_18px_rgba(234,88,12,0.35)] rotate-6" />
                  <span className="absolute inset-[2px] rounded-[10px] bg-white/85 border border-white/70" />
                  <span className="absolute inset-0 grid place-items-center text-xl drop-shadow-[0_3px_2px_rgba(0,0,0,0.25)] -rotate-3">📧</span>
                </div>
                <div>
                  <p className="font-semibold text-red-600 text-sm">Check Your Gmail</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    OTP sent to <span data-testid="otp-email" className="font-medium text-orange-700">{email}</span>
                  </p>
                  <p data-testid="otp-expiry-text" className="text-gray-500 text-xs mt-1">
                    This OTP expires in {OTP_EXPIRY_MINUTES} minutes.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Enter OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  data-testid="otp-input"
                  className="w-full px-4 py-3 border rounded-xl text-center tracking-widest bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={otp}
                  onChange={(e) => {
                    const numericOtp = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(numericOtp);
                    setOtpError("");
                    setError("");
                  }}
                />
                {otpError && <p className="mt-2 text-sm text-red-500">{otpError}</p>}
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}

              <div data-testid="otp-resend-container" className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3 border border-gray-200">
                <p className="text-sm text-gray-600">
                  Didn&apos;t get the OTP?
                </p>
                <button
                  type="button"
                  data-testid="otp-resend-btn"
                  onClick={handleResendOtp}
                  disabled={loading || resendCooldown > 0}
                  className="text-sm font-semibold text-indigo-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                > <span data-testid="otp-resend-timer">
                  {resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : "Resend OTP"}
                    </span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                data-testid="otp-verify-btn"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:scale-[1.02] transition-all"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <form data-testid="auth-password-form" onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Set Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    data-testid="auth-password-input"
                    className="w-full px-4 py-3 pr-12 border rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                  data-testid="auth-password-toggle-btn"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 102.83 2.83" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.11 11 7.5a11.8 11.8 0 01-4.04 5.19" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.61A11.84 11.84 0 001 11.5C2.73 15.89 7 19 12 19a10.9 10.9 0 005.23-1.32" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                  data-testid="auth-confirm-password-input"
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 border rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    data-testid="auth-confirm-password-toggle-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58a2 2 0 102.83 2.83" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.11 11 7.5a11.8 11.8 0 01-4.04 5.19" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.61A11.84 11.84 0 001 11.5C2.73 15.89 7 19 12 19a10.9 10.9 0 005.23-1.32" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:scale-[1.02] transition-all"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
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

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <a href="/login" data-testid="auth-login-link" className="text-blue-600 font-semibold">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
