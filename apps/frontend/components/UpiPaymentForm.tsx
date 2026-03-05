"use client";

import React, { useState } from "react";
import { Smartphone, Check, X, QrCode, Info } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface UpiPaymentFormProps {
  amount: number;
  currency: string;
  productName: string;
  qrCode?: string;
  deepLink?: string;
  onConfirm: (upiId: string) => void | Promise<any>;
  onCancel: () => void;
  processing?: boolean;
}

const DEMO_UPI_IDS = [
  "demo@upi",
  "test@okaxis",
  "sample@okhdfcbank",
  "user@okicici",
  "pay@oksbi",
  "order@okbank",
  "gaurav@upi",
  "shop@okicici",
  "client@okaxis",
  "payment@okhdfcbank",
  "check@okicici",
  "cash@okbank",
  "valid1@upi",
  "valid2@upi",
  "valid3@upi",
  "valid4@upi",
  "valid5@upi",
  "valid6@upi",
  "test1@oksbi",
  "test2@oksbi",
  "test3@oksbi",
  "test4@oksbi",
  "test5@oksbi",
  "test6@oksbi",
  "order1@okhdfcbank",
  "order2@okhdfcbank",
  "order3@okhdfcbank",
  "order4@okhdfcbank",
  "order5@okhdfcbank",
  "order6@okhdfcbank",
  "demo1@okaxis",
  "demo2@okaxis",
  "demo3@okaxis",
  "demo4@okaxis",
  "demo5@okaxis",
  "demo6@okaxis",
];

export default function UpiPaymentForm({
  amount,
  currency,
  productName,
  qrCode,
  deepLink,
  onConfirm,
  onCancel,
  processing = false,
}: UpiPaymentFormProps) {
  const [mode, setMode] = useState<"upi" | "qr">("upi");
  const [upiId, setUpiId] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [errors, setErrors] = useState("");

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amt / 100);
  };

  const validateUpiId = (id: string) => {
    const pattern = /^[A-Za-z0-9._-]{2,}@[A-Za-z]{2,}$/;
    return pattern.test(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "upi") {
      if (!upiId) {
        setErrors("UPI ID is required");
        return;
      }
      if (!validateUpiId(upiId)) {
        setErrors("Invalid UPI ID format (example: username@okhdfcbank)");
        return;
      }

      setErrors("");
      const res = onConfirm(upiId);

      if (res && typeof (res as Promise<any>).then === "function") {
        (res as Promise<any>).then((v) => {
          if (typeof v === "string" && v.toLowerCase().includes("success")) {
            toast.success("Payment Successful (Demo)");
          }
        });
      }
    } else {
      const res = onConfirm("demo@upi");
      if (res && typeof (res as Promise<any>).then === "function") {
        (res as Promise<any>).then((v) => {
          if (typeof v === "string" && v.toLowerCase().includes("success")) {
            toast.success("Payment Successful (Demo)");
          }
        });
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl max-w-2xl mx-auto relative">
      {/* Help Button */}
      <div className="absolute -mt-4 right-4">
        <button
          onClick={() => setShowHelp((s) => !s)}
          className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow hover:shadow-md transition"
        >
          <Info size={12} />
          <span>UPI Help</span>
        </button>
      </div>

      {showHelp && (
        <div className="mb-4 p-3 rounded-xl bg-gray-900 text-gray-100 text-[11px] shadow-inner space-y-2 animate-fade-in">
          <p className="font-semibold text-xs text-white">
            Only the listed UPI IDs will simulate{" "}
            <span className="text-green-400">success</span>.
            Others simulate <span className="text-red-400">failure</span>.
          </p>

          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
            {DEMO_UPI_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setUpiId(id)}
                className="text-left px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Smartphone size={20} className="text-purple-600" /> UPI Payment
        </h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Product</p>
            <p className="font-semibold text-gray-800 truncate max-w-[240px]">
              {productName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Amount</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatAmount(amount)}
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Select Mode
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "upi" | "qr")}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm"
        >
          <option value="upi">Enter UPI ID</option>
          <option value="qr">Scan QR Code</option>
        </select>
      </div>

      {/* UPI INPUT MODE */}
      {mode === "upi" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              UPI ID *
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value.trim())}
              placeholder="username@bankhandle"
              className={`w-full px-4 py-3 text-sm border-2 rounded-xl outline-none transition ${
                errors
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              }`}
              disabled={processing}
            />
            {errors && <p className="text-red-500 text-xs mt-1">{errors}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={processing}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className={`flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50 ${
                processing ? "animate-pulse" : ""
              }`}
            >
              {processing ? "Processing…" : "Pay via UPI"}
            </button>
          </div>
        </form>
      )}

      {/* QR MODE */}
      {mode === "qr" && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Scan QR Code
            </p>

            {qrCode ? (
              <div className="flex justify-center">
                <Image
                  src={qrCode}
                  alt="UPI QR Code"
                  width={200}
                  height={200}
                  className="border-4 border-white shadow-lg rounded-lg"
                />
              </div>
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-xl text-gray-500 text-sm">
                QR not available
              </div>
            )}

            {deepLink && (
              <a
                href={deepLink}
                className="mt-4 block text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
              >
                Open UPI App
              </a>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={processing}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={() => onConfirm("demo@upi")}
              className={`flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50 ${
                processing ? "animate-pulse" : ""
              }`}
            >
              {processing ? "Processing…" : "Confirm QR Payment"}
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-xs text-purple-800">
          Demo UPI flow. No real payment is processed.
        </p>
      </div>
    </div>
  );
}
