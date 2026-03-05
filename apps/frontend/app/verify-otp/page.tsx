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
      const res = await axios.post("/api/auth/verifyOtp", { email, otp });
      setSuccess(res.data.message || "Email verified successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Verify Your Email</h2>

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
