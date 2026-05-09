"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "../../lib/axios";

export default function StepRegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Step 1: Enter Name & Email
  const handleNameEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/auth/register", { name, email });
      setStep(2); // go to OTP step
      setSuccess(res.data?.message || "Register OTP sent on SmartShop.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/auth/verifyOtp", { email, otp });
      setStep(3); // go to password step
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
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/auth/register", { name, email, password });
      setSuccess("Account created successfully!");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={handleNameEmailSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 text-white font-bold rounded hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          {/* Gmail notification banner */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <div className="relative w-10 h-10 shrink-0">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-[0_10px_18px_rgba(14,116,144,0.35)] rotate-6" />
              <span className="absolute inset-[2px] rounded-[10px] bg-white/85 border border-white/70" />
              <span className="absolute inset-0 grid place-items-center text-xl drop-shadow-[0_3px_2px_rgba(0,0,0,0.25)] -rotate-3">📧</span>
            </div>
            <div>
              <p className="font-semibold text-blue-800 text-sm">Check Your Gmail</p>
              <p className="text-gray-500 text-xs mt-0.5">
                OTP sent to <span className="font-medium text-blue-700">{email}</span>
              </p>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Enter OTP</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 text-white font-bold rounded hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Set Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Confirm Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 text-white font-bold rounded hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      )}
    </div>
  );
}
