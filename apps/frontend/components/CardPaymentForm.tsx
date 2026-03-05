"use client";

import React, { useState } from "react";
import { CreditCard, Check, Info } from "lucide-react";

interface CardPaymentFormProps {
  amount: number;
  currency: string;
  productName: string;
  onConfirm: (cardData: CardData) => void;
  onCancel: () => void;
  processing?: boolean;
}

interface CardData {
  cardNumber: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
  cardType: string;
}

export default function CardPaymentForm({
  amount,
  currency,
  productName,
  onConfirm,
  onCancel,
  processing = false,
}: CardPaymentFormProps) {
  // Demo whitelist: 12 VISA, 12 MASTERCARD, 12 RUPAY last4 with their CVVs
  const VISA_LAST4 = ['4242','1111','1234','6789','0001','2468','1357','9000','7007','8888','1212','3434'] as const;
  const MC_LAST4 = ['5555','5100','2222','2720','5412','5123','2233','2600','2711','5309','5511','5522'] as const;
  const RUPAY_LAST4 = ['6080','6521','5081','8192','8266','6011','6500','5085','8123','8210','6060','6585'] as const;
  const VISA_CVV = VISA_LAST4.map((_, i) => (100 + i).toString().slice(-3)); // 100-111
  const MC_CVV = MC_LAST4.map((_, i) => (200 + i).toString().slice(-3)); // 200-211
  const RUPAY_CVV = RUPAY_LAST4.map((_, i) => (300 + i).toString().slice(-3)); // 300-311
  const last4ToCvv = new Map<string, string>([
    ...VISA_LAST4.map((l4, i) => [l4, VISA_CVV[i]] as [string, string]),
    ...MC_LAST4.map((l4, i) => [l4, MC_CVV[i]] as [string, string]),
    ...RUPAY_LAST4.map((l4, i) => [l4, RUPAY_CVV[i]] as [string, string]),
  ]);

  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cardType, setCardType] = useState<"visa" | "mastercard" | "rupay" | "unknown">("unknown");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showTokenHelp, setShowTokenHelp] = useState(false);

  // Format amount for display — show full rupee amount with two decimals
  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amt);
  };

  // Detect card type based on card number
  const detectCardType = (number: string): "visa" | "mastercard" | "rupay" | "unknown" => {
    const cleanNumber = number.replace(/\s/g, "");
    if (/^4/.test(cleanNumber)) return "visa";
    if (/^5[1-5]/.test(cleanNumber) || /^2(22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(cleanNumber))
      return "mastercard";
    if (/^(60|65|81|82|508)/.test(cleanNumber)) return "rupay";
    return "unknown";
  };

  // Format card number with spaces (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, "");
    value = value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    setCardNumber(formatCardNumber(value));
    setCardType(detectCardType(value));
    if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: "" }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
    if (errors.cvv) setErrors(prev => ({ ...prev, cvv: "" }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) value = value.slice(0,2) + "/" + value.slice(2);
    setExpiry(value);
    if (errors.expiry) setErrors(prev => ({ ...prev, expiry: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (!cleanCardNumber) newErrors.cardNumber = "Card number is required";
    else if (cleanCardNumber.length !== 16) newErrors.cardNumber = "Card number must be 16 digits";
    else {
      const last4 = cleanCardNumber.slice(-4);
      if (!last4ToCvv.has(last4)) newErrors.cardNumber = "Invalid demo card. Open Test Tokens and use a listed card.";
    }

    if (!cvv) newErrors.cvv = "CVV is required";
    else if (cvv.length !== 3) newErrors.cvv = "CVV must be 3 digits";
    else if (!newErrors.cardNumber) {
      const last4 = cardNumber.replace(/\s/g, "").slice(-4);
      const expected = last4ToCvv.get(last4);
      if (expected && cvv !== expected) newErrors.cvv = "CVV does not match this demo card";
    }

    if (!expiry) newErrors.expiry = "Expiry date is required";
    else {
      const parts = expiry.split("/");
      if (parts.length !== 2) newErrors.expiry = "Invalid format (use MM/YY)";
      else {
        const month = parseInt(parts[0], 10);
        const year = parseInt(parts[1], 10);
        if (Number.isNaN(month) || Number.isNaN(year)) newErrors.expiry = "Invalid expiry";
        else if (month < 1 || month > 12) newErrors.expiry = "Invalid month (01-12)";
        else {
          const now = new Date();
          const currentYear = now.getFullYear() % 100;
          const currentMonth = now.getMonth() + 1;
          if (year < currentYear || (year === currentYear && month < currentMonth)) {
            newErrors.expiry = "Card has expired";
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsConfirmed(true);
  };

  const handlePlaceOrder = () => {
    const parts = expiry.split("/");
    const cardData: CardData = {
      cardNumber: cardNumber.replace(/\s/g, ""),
      cvv,
      expiryMonth: parts[0],
      expiryYear: parts[1],
      cardType,
    };
    onConfirm(cardData);
  };

  const getCardLogo = () => {
    const shine = (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 100% at 30% 0%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0) 70%)",
        }}
      />
    );

    switch (cardType) {
      case "visa":
        return (
          <div
            className="relative w-24 h-14 rounded-xl overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.25)] ring-1 ring-white/10 bg-gradient-to-br from-[#1a237e] via-[#1e3a8a] to-[#0f172a]"
            aria-label="Visa"
          >
            <div className="absolute -top-6 -left-6 w-20 h-20 rotate-[-20deg] bg-white/10 rounded-full blur-[8px]" />
            {shine}
            <span className="absolute bottom-1 right-2 text-white font-extrabold tracking-widest text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
              VISA
            </span>
          </div>
        );
      case "mastercard":
        return (
          <div
            className="relative w-24 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1f2937] shadow-[0_10px_24px_rgba(0,0,0,0.25)] ring-1 ring-white/10 flex items-center justify-center"
            aria-label="Mastercard"
          >
            {shine}
            <div className="relative flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff3b30] to-[#b71c1c] shadow-[0_6px_12px_rgba(183,28,28,0.45)]" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffb300] to-[#ef6c00] -ml-3 shadow-[0_6px_12px_rgba(239,108,0,0.45)]" />
            </div>
          </div>
        );
      case "rupay":
        return (
          <div
            className="relative w-24 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[#0b5e3c] via-[#127c4d] to-[#0a3d25] shadow-[0_10px_24px_rgba(0,0,0,0.25)] ring-1 ring-white/10"
            aria-label="RuPay"
          >
            {shine}
            <span className="absolute bottom-1 right-2 text-white font-extrabold tracking-wide text-xs drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
              RuPay
            </span>
            <div className="absolute top-0 left-0 w-16 h-16 -translate-x-4 -translate-y-6 rotate-12 bg-white/10 blur-[10px] rounded-full" />
          </div>
        );
      default:
        return (
          <div className="w-24 h-14 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-inner">
            <CreditCard size={24} className="text-gray-600" />
          </div>
        );
    }
  };

  if (isConfirmed) {
    return (
      <div className="p-8 bg-white rounded-2xl max-w-md mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Check size={40} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Confirmed!</h3>
          <p className="text-gray-600 mb-6">Your card details have been verified</p>

          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-1">Card Number</p>
            <p className="font-mono font-bold text-gray-800">
              {cardNumber.slice(0, -4).replace(/\d/g, "•")} {cardNumber.slice(-4)}
            </p>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition"
          >
            Place Order {formatAmount(amount)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-6 bg-white rounded-2xl max-w-2xl mx-auto">
      {/* Tiny token helper toggle (positioned inside relative container) */}
      <div className="absolute -mt-4 right-4">
        <button
          type="button"
          onClick={() => setShowTokenHelp((s) => !s)}
          className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow hover:shadow-md transition"
        >
          <Info size={12} />
          <span>Test Tokens</span>
        </button>
      </div>

      {showTokenHelp && (
        <div className="mb-4 p-3 rounded-xl bg-gray-900 text-gray-100 text-[11px] shadow-inner space-y-2 animate-fadeIn">
          <p className="font-semibold text-xs text-white">Valid Demo Cards (use any 16 digits ending with these 4 + CVV):</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] font-bold text-blue-300 mb-1">VISA</p>
              {VISA_LAST4.map((last4,i)=>(
                <div key={i} className="flex justify-between text-[11px]">
                  <span>{last4}</span><span className="text-green-400">CVV {VISA_CVV[i]}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-bold text-orange-300 mb-1">MASTER</p>
              {MC_LAST4.map((last4,i)=>(
                <div key={i} className="flex justify-between text-[11px]">
                  <span>{last4}</span><span className="text-green-400">CVV {MC_CVV[i]}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-bold text-green-300 mb-1">RUPAY</p>
              {RUPAY_LAST4.map((last4,i)=>(
                <div key={i} className="flex justify-between text-[11px]">
                  <span>{last4}</span><span className="text-green-400">CVV {RUPAY_CVV[i]}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Type any 16-digit number ending with one of the above last 4 & matching CVV. Others will fail.</p>
        </div>
      )}

      {/* Header with Product Info */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Card Payment</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Product</p>
            <p className="font-semibold text-gray-800">{productName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Amount</p>
            <p className="text-2xl font-bold text-orange-500">{formatAmount(amount)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Number with Logo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Card Number *
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="XXXX XXXX XXXX XXXX"
                className={`w-full px-4 py-3 text-lg font-mono border-2 rounded-xl outline-none transition ${
                  errors.cardNumber
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                }`}
              />
              <p className="mt-1 text-[10px] text-gray-500">Use a 16-digit number ending in a valid last 4 (open Test Tokens).</p>
              {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
            </div>
            <div className="flex items-start pt-2">
              {getCardLogo()}
            </div>
          </div>
        </div>

        {/* CVV and Expiry */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CVV *</label>
            <input
              type="password"
              value={cvv}
              onChange={handleCvvChange}
              placeholder="***"
              maxLength={3}
              className={`w-full px-4 py-3 text-lg font-mono border-2 rounded-xl outline-none transition ${
                errors.cvv ? "border-red-500 focus:ring-2 focus:ring-red-200" : "border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              }`}
            />
            <p className="mt-1 text-[10px] text-gray-500">CVV must match listed CVV for chosen last 4.</p>
            {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Valid Thru *</label>
            <input
              type="text"
              value={expiry}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              maxLength={5}
              className={`w-full px-4 py-3 text-lg font-mono border-2 rounded-xl outline-none transition ${
                errors.expiry ? "border-red-500 focus:ring-2 focus:ring-red-200" : "border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              }`}
            />
            <p className="mt-1 text-[10px] text-gray-500">Use a future expiry.</p>
            {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={processing}
            className={`flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${processing ? 'animate-pulse' : ''}`}
          >
            {processing ? 'Processing…' : 'Confirm Card'}
          </button>
        </div>
      </form>

      {/* Security Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">🔒 Your card details are encrypted and secure. We never store your CVV.</p>
      </div>
    </div>
  );
}
