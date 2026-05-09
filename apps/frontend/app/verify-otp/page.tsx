"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "../../lib/axios";

export default function VerifyOtpPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validations
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/verifyOtp", { email, otp });
      setSuccess(res.data.message || "Email verified successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      const message = err.response?.data?.message || "Verification failed";
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

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Verify Your Email</h2>

      {/* Gmail notification banner */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-2 border-orange-400 rounded-xl px-4 py-3 mb-6 shadow-sm">
        <span className="text-3xl">📧</span>
        <div>
          <p className="font-bold text-orange-600 text-sm leading-tight">Check Your Gmail!</p>
          <p className="text-gray-700 text-sm leading-tight">
            OTP has been sent to your{" "}
            <span className="font-bold text-red-500 underline decoration-dotted">Gmail</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
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

        {/* OTP Input */}
        <div>
          <label className="block mb-1 font-medium">OTP</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 tracking-widest text-center"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            required
            maxLength={6}
          />
        </div>

        {/* Error & Success Messages */}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}

        {/* Verify Button */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 text-white font-bold rounded hover:opacity-90 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
}
