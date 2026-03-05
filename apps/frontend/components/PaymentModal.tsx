/**
 * Payment Modal Component
 * 
 * ⚠️ WARNING: This uses a FAKE payment gateway for demo purposes only.
 * NEVER enter real card details. Use test tokens provided.
 * 
 * Supports:
 * - Card payments (with fake card form)
 * - UPI payments (with deep link and QR)
 * - Wallet payments (GooglePay/PhonePe style)
 * 
 * Features:
 * - Method selection
 * - Provider-specific UI
 * - Status polling for async payments
 * - Test controls (force success/fail)
 * - Error handling and retry
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, CreditCard, Smartphone, Wallet, CheckCircle, XCircle, Loader, AlertCircle, Building2, DollarSign } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import CardPaymentForm from "./CardPaymentForm";
import UpiPaymentForm from "./UpiPaymentForm";

type PaymentMethod = "card" | "upi" | "wallet" | "netbanking" | "emi" | "cod";
type PaymentStatus = "idle" | "creating" | "pending" | "confirming" | "succeeded" | "failed";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number; // Amount in paise (INR) or cents (USD)
  currency?: string;
  productName?: string; // Added for card form
  onSuccess: (paymentId: string) => void;
  onError?: (error: string) => void;
  initialMethod?: PaymentMethod; // Preferred method chosen on checkout page
}

interface PaymentResponse {
  paymentId: string;
  providerId: string;
  status: string;
  clientSecret?: string;
  deeplink?: string;
  upiDeepLink?: string;
  qrCode?: string;
  metadata?: any;
}

export default function PaymentModal({
  isOpen,
  onClose,
  orderId,
  amount,
  currency = "INR",
  productName = "Your Order",
  onSuccess,
  onError,
  initialMethod,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(initialMethod || "card");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string>("");
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [showCardForm, setShowCardForm] = useState(false); // New state for card form
  const [cardProcessing, setCardProcessing] = useState(false); // Track card flow processing
  const [showUpiForm, setShowUpiForm] = useState(false); // New state for UPI form
  const [upiProcessing, setUpiProcessing] = useState(false); // Track UPI flow processing
  const [methodLocked, setMethodLocked] = useState(false); // Hide method grid once user proceeds
  
  // Card form state
  const [cardToken, setCardToken] = useState("card_token_demo_4242");
  
  // UPI form state
  const [upiId, setUpiId] = useState("demo@upi");
  
  // Wallet state
  const [walletId, setWalletId] = useState("demo_wallet_01");
  
  // Polling
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Format amount for display
  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amt / 100);
  };

  // Clear state on close
  useEffect(() => {
    if (!isOpen) {
      setStatus("idle");
      setError("");
      setPaymentData(null);
      setCardToken("card_token_demo_4242");
      setUpiId("demo@upi");
      setWalletId("demo_wallet_01");
      setShowCardForm(false);
      setShowUpiForm(false);
      setMethodLocked(false);
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [isOpen]);

  // Auto-start payment creation when modal opened with a predefined method
  useEffect(() => {
    if (isOpen && status === "idle" && initialMethod) {
      // Lock method grid and prepare chosen form
      setSelectedMethod(initialMethod);
      setMethodLocked(true);
      if (initialMethod === "card") {
        setShowCardForm(true);
      } else if (initialMethod === "upi") {
        setShowUpiForm(true);
      }
      if (initialMethod !== "cod") {
        // Automatically create payment for online methods
        createPayment();
      }
    }
  }, [isOpen, initialMethod, status]);

  // Create payment
  const createPayment = async () => {
    try {
      setStatus("creating");
      setError("");
      // Ensure only the relevant form is shown for the chosen method
      if (selectedMethod !== "card") setShowCardForm(false);
      if (selectedMethod !== "upi") setShowUpiForm(false);
      // Optimistically show the selected method form to avoid UI flicker
      if (selectedMethod === "upi") setShowUpiForm(true);
      if (selectedMethod === "card") setShowCardForm(true);
  setMethodLocked(true);

  const response = await axios.post("http://localhost:5000/api/payments/create", {
        orderId,
        amount,
        currency,
        method: selectedMethod,
        metadata: {
          customerNote: `Demo payment for order ${orderId}`,
        },
      });

      const payment = response.data.payment;
      setPaymentData(payment);

      // For Wallet start polling immediately (redirect style)
      if (selectedMethod === "wallet") {
        setStatus("pending");
        startPolling(payment.providerId);
      } else if (selectedMethod === "card") {
        // For card, move to pending and show the dedicated card form
        setStatus("pending");
        setShowCardForm(true);
      } else if (selectedMethod === "upi") {
        // For UPI, show the custom form first; polling will begin after confirm if still pending
        setStatus("pending");
        setShowUpiForm(true);
      } else {
        // Other methods transition to pending and render their specific UIs
        setStatus("pending");
      }
    } catch (err: any) {
      console.error("Error creating payment:", err);
      setError(err.response?.data?.error || "Failed to create payment");
      setStatus("failed");
      onError?.(err.response?.data?.error || "Failed to create payment");
    }
  };

  // Confirm payment
  const confirmPayment = async (token: string) => {
    if (!paymentData) return;

    try {
      setStatus("confirming");
      setError("");

  const response = await axios.post("http://localhost:5000/api/payments/confirm", {
        providerId: paymentData.providerId,
        confirmToken: token,
      });

      const result = response.data.payment;

      if (result.status === "succeeded") {
        setStatus("succeeded");
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        setTimeout(() => {
          onSuccess(paymentData.paymentId);
        }, 1500);
      } else if (result.status === "failed") {
        setStatus("failed");
        setError(result.message || "Payment failed");
        onError?.(result.message || "Payment failed");
      } else {
        // Still pending
        setStatus("pending");
        startPolling(paymentData.providerId);
      }
    } catch (err: any) {
      console.error("Error confirming payment:", err);
      setError(err.response?.data?.error || "Failed to confirm payment");
      setStatus("failed");
      onError?.(err.response?.data?.error || "Failed to confirm payment");
    }
  };

  // Poll payment status
  const startPolling = (providerId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
  const response = await axios.get(`http://localhost:5000/api/payments/status/${providerId}`);
        const payment = response.data.payment;

        if (payment.status === "succeeded") {
          setStatus("succeeded");
          clearInterval(interval);
          setPollingInterval(null);
          setTimeout(() => {
            onSuccess(paymentData?.paymentId || "");
          }, 1500);
        } else if (payment.status === "failed") {
          setStatus("failed");
          setError("Payment failed");
          clearInterval(interval);
          setPollingInterval(null);
          onError?.("Payment failed");
        }
      } catch (err) {
        console.error("Error polling status:", err);
      }
    }, 2000);

    setPollingInterval(interval);
  };

  // Simulate webhook (for testing)
  const simulateWebhook = async (event: "payment_succeeded" | "payment_failed") => {
    if (!paymentData) return;

    try {
  await axios.post("http://localhost:5000/api/payments/webhook", {
        providerId: paymentData.providerId,
        event,
      });

      // Poll status will pick up the change
    } catch (err) {
      console.error("Error simulating webhook:", err);
    }
  };

  // Handle method change
  const handleMethodChange = (method: PaymentMethod) => {
    if (status === "idle") {
      setSelectedMethod(method);
      
      // Reset forms based on selected method; show will occur after createPayment
      setShowCardForm(method === "card" ? false : false);
      setShowUpiForm(false);
    }
  };

  // Handle card form confirmation
  const handleCardConfirm = async (cardData: any) => {
    try {
      setStatus("creating");
      setCardProcessing(true);
      // Keep the form visible while processing
      if (!paymentData) {
        await createPayment();
      }
      setTimeout(async () => {
        setStatus("confirming");
        const cardToken = `card_token_${cardData.cardNumber.slice(-4)}`;
        await confirmPayment(cardToken);
        setCardProcessing(false);
      }, 800);
    } catch (err) {
      console.error("Card payment error:", err);
      setError("Card payment failed");
      setStatus("failed");
      setCardProcessing(false);
    }
  };

  // Handle card form cancel
  const handleCardCancel = () => {
    if (cardProcessing) return; // Prevent cancel during processing
    setShowCardForm(false);
    setSelectedMethod("card");
    setStatus("idle");
    setMethodLocked(false);
  };

  // Handle UPI form confirmation
  const handleUpiConfirm = async (upiIdValue: string) => {
    // If payment not yet created (edge case), create it now
    if (!paymentData) {
      console.log('[PaymentModal][UPI] No paymentData yet, creating payment on confirm');
      await createPayment();
    }
    try {
      console.log('[PaymentModal][UPI] Confirming UPI with token:', upiIdValue);
      setUpiProcessing(true);
      setStatus("confirming");
      await confirmPayment(upiIdValue);
      // If still pending (async), hide form and polling already started in confirmPayment
      if (status === "pending") {
        setShowUpiForm(false);
      }
    } catch (err) {
      console.error("UPI payment error:", err);
      setError("UPI payment failed");
      setStatus("failed");
    } finally {
      setUpiProcessing(false);
    }
  };

  // Handle UPI form cancel
  const handleUpiCancel = () => {
    if (upiProcessing) return;
    setShowUpiForm(false);
    setSelectedMethod("upi");
    setStatus("idle");
    setMethodLocked(false);
  };

  // Handle submit based on method
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (status === "idle") {
      createPayment();
    } else if (status === "pending") {
      if (selectedMethod === "card") {
        confirmPayment(cardToken);
      } else if (selectedMethod === "upi") {
        confirmPayment(upiId);
      } else if (selectedMethod === "wallet") {
        confirmPayment(walletId);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
            <p className="text-sm text-gray-600 mt-1">
              Order #{orderId} • {formatAmount(amount)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={status === "confirming"}
          >
            <X size={24} />
          </button>
        </div>

        {/* Demo Warning */}
        <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-800">Demo Payment Gateway</p>
            <p className="text-yellow-700 mt-1">
              This is a FAKE payment system. Never enter real card details. Use test tokens provided below.
            </p>
          </div>
        </div>

        <div className="p-6">
          {/* Success State */}
          {status === "succeeded" && (
            <div className="text-center py-8">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Redirecting to order confirmation...</p>
            </div>
          )}

          {/* Failed State */}
          {status === "failed" && (
            <div className="text-center py-8">
              <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
                <XCircle size={48} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  setStatus("idle");
                  setError("");
                  setPaymentData(null);
                  setMethodLocked(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Payment Form */}
          {status !== "succeeded" && status !== "failed" && (
            <>
              {/* Method Selection */}
              {status === "idle" && paymentData === null && !showCardForm && !showUpiForm && !methodLocked && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 mb-4">Select Payment Method</h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleMethodChange("card")}
                      className={`p-4 border-2 rounded-xl transition ${
                        selectedMethod === "card"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <CreditCard size={28} className={selectedMethod === "card" ? "text-orange-500" : "text-gray-600"} />
                      <p className="mt-2 font-semibold text-xs">Credit/Debit Card</p>
                    </button>

                    <button
                      onClick={() => handleMethodChange("upi")}
                      className={`p-4 border-2 rounded-xl transition ${
                        selectedMethod === "upi"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Smartphone size={28} className={selectedMethod === "upi" ? "text-orange-500" : "text-gray-600"} />
                      <p className="mt-2 font-semibold text-xs">UPI</p>
                    </button>

                    <button
                      onClick={() => handleMethodChange("netbanking")}
                      className={`p-4 border-2 rounded-xl transition ${
                        selectedMethod === "netbanking"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Building2 size={28} className={selectedMethod === "netbanking" ? "text-orange-500" : "text-gray-600"} />
                      <p className="mt-2 font-semibold text-xs">Net Banking</p>
                    </button>

                    <button
                      onClick={() => handleMethodChange("wallet")}
                      className={`p-4 border-2 rounded-xl transition ${
                        selectedMethod === "wallet"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Wallet size={28} className={selectedMethod === "wallet" ? "text-orange-500" : "text-gray-600"} />
                      <p className="mt-2 font-semibold text-xs">Wallet</p>
                    </button>

                    <button
                      onClick={() => handleMethodChange("emi")}
                      className={`p-4 border-2 rounded-xl transition ${
                        selectedMethod === "emi"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <DollarSign size={28} className={selectedMethod === "emi" ? "text-orange-500" : "text-gray-600"} />
                      <p className="mt-2 font-semibold text-xs">EMI</p>
                    </button>

                    <button
                      onClick={() => handleMethodChange("cod")}
                      className={`p-4 border-2 rounded-xl transition ${
                        selectedMethod === "cod"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl">{selectedMethod === "cod" ? "💵" : "💴"}</span>
                      <p className="mt-2 font-semibold text-xs">Cash On Delivery</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Card Form */}
              {showCardForm && (
                <CardPaymentForm
                  amount={amount}
                  currency={currency}
                  productName={productName}
                  onConfirm={handleCardConfirm}
                  onCancel={handleCardCancel}
                />
              )}

              {/* UPI Loading Placeholder (avoid showing method grid again) */}
              {showUpiForm && selectedMethod === "upi" && !paymentData && (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <Loader size={36} className="animate-spin text-purple-600" />
                  <p className="text-sm text-gray-600">Creating UPI payment...</p>
                </div>
              )}

              {showUpiForm && selectedMethod === "upi" && paymentData && (
                <UpiPaymentForm
                  amount={amount}
                  currency={currency}
                  productName={productName}
                  qrCode={paymentData.qrCode}
                  deepLink={paymentData.upiDeepLink}
                  onConfirm={handleUpiConfirm}
                  onCancel={handleUpiCancel}
                  processing={upiProcessing || status === "confirming"}
                />
              )}

              {selectedMethod === "card" && !showCardForm && (status === "pending" || status === "confirming") && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-semibold text-gray-800 mb-4">Enter Card Details</h3>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-semibold">Test Card Tokens:</p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• <code className="bg-white px-2 py-0.5 rounded">card_token_demo_4242</code> - Success</li>
                      <li>• <code className="bg-white px-2 py-0.5 rounded">card_token_fail</code> - Failure</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Token (Demo)
                    </label>
                    <input
                      type="text"
                      value={cardToken}
                      onChange={(e) => setCardToken(e.target.value)}
                      placeholder="card_token_demo_4242"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      disabled={status === "confirming"}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "confirming"}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === "confirming" ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Pay {formatAmount(amount)}</>
                    )}
                  </button>
                </form>
              )}

              {/* UPI Form */}
              {selectedMethod === "upi" && status === "pending" && paymentData && !showUpiForm && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 mb-4">UPI Payment</h3>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800 font-semibold">Scan QR or Use Deep Link:</p>
                    <div className="mt-4 flex justify-center">
                      {paymentData.qrCode && (
                        <Image
                          src={paymentData.qrCode}
                          alt="UPI QR Code"
                          width={200}
                          height={200}
                          className="border-4 border-white shadow-lg rounded-lg"
                        />
                      )}
                    </div>
                    {paymentData.upiDeepLink && (
                      <a
                        href={paymentData.upiDeepLink}
                        className="mt-4 block text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        Open UPI App
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-center py-4">
                    <Loader size={24} className="animate-spin text-orange-500 mr-2" />
                    <span className="text-gray-600">Waiting for payment confirmation...</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600 mb-3">Test Controls (Demo Only):</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => simulateWebhook("payment_succeeded")}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                      >
                        Simulate Success
                      </button>
                      <button
                        onClick={() => simulateWebhook("payment_failed")}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                      >
                        Simulate Failure
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Form */}
              {selectedMethod === "wallet" && status === "pending" && paymentData && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 mb-4">Wallet Payment</h3>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-semibold">Redirecting to wallet app...</p>
                    {paymentData.deeplink && (
                      <a
                        href={paymentData.deeplink}
                        className="mt-4 block text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Open Wallet App
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-center py-4">
                    <Loader size={24} className="animate-spin text-orange-500 mr-2" />
                    <span className="text-gray-600">Waiting for payment confirmation...</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600 mb-3">Test Controls (Demo Only):</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => simulateWebhook("payment_succeeded")}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                      >
                        Simulate Success
                      </button>
                      <button
                        onClick={() => simulateWebhook("payment_failed")}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                      >
                        Simulate Failure
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Net Banking Form */}
              {selectedMethod === "netbanking" && status === "pending" && paymentData && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 mb-4">Net Banking</h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-semibold mb-3">Select Your Bank:</p>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { name: "State Bank of India", logo: "/images/banks/sbi.png" },
                        { name: "HDFC Bank", logo: "/images/banks/hdfc.png" },
                        { name: "ICICI Bank", logo: "/images/banks/icici.png" },
                        { name: "Axis Bank", logo: "/images/banks/axis.png" },
                        { name: "Kotak Mahindra Bank", logo: "/images/banks/kotak.png" },
                        { name: "Yes Bank", logo: "/images/banks/yes.png" },
                        { name: "Bank of Baroda", logo: "/images/banks/bob.png" },
                        { name: "Punjab National Bank", logo: "/images/banks/pnb.png" },
                        { name: "Canara Bank", logo: "/images/banks/canara.png" },
                        { name: "IndusInd Bank", logo: "/images/banks/indusind.png" },
                        { name: "IDFC FIRST Bank", logo: "/images/banks/idfc.png" },
                        { name: "Union Bank of India", logo: "/images/banks/union.png" },
                        { name: "Central Bank of India", logo: "/images/banks/cbi.png" },
                        { name: "Indian Bank", logo: "/images/banks/indian.png" },
                        { name: "UCO Bank", logo: "/images/banks/uco.png" },
                        { name: "Bank of India", logo: "/images/banks/boi.png" },
                        { name: "Federal Bank", logo: "/images/banks/federal.png" },
                        { name: "South Indian Bank", logo: "/images/banks/sib.png" },
                        { name: "RBL Bank", logo: "/images/banks/rbl.png" },
                        { name: "IDBI Bank", logo: "/images/banks/idbi.png" },
                      ].map((bank, idx) => (
                        <button
                          key={bank.name}
                          className="flex flex-col items-center p-3 bg-white rounded-xl shadow hover:shadow-lg border-2 border-transparent hover:border-blue-400 transition group"
                          onClick={() => confirmPayment(`netbanking_${bank.name.replace(/\s+/g, '').toLowerCase()}`)}
                        >
                          <div className="w-16 h-16 mb-2 flex items-center justify-center">
                            {/* Placeholder for 3D logo, replace with real images */}
                            <img
                              src={bank.logo}
                              alt={bank.name}
                              className="w-full h-full object-contain drop-shadow-3xl group-hover:scale-105 transition-transform"
                              style={{ filter: "drop-shadow(0 2px 8px #3b82f6)" }}
                              loading="lazy"
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 text-center">{bank.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600 mb-3">Test Controls (Demo Only):</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => simulateWebhook("payment_succeeded")}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                      >
                        Simulate Success
                      </button>
                      <button
                        onClick={() => simulateWebhook("payment_failed")}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                      >
                        Simulate Failure
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* EMI Form */}
              {selectedMethod === "emi" && status === "pending" && paymentData && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 mb-4">EMI Options</h3>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800 font-semibold mb-3">Choose EMI Plan:</p>
                    <div className="space-y-2">
                      {[3, 6, 9, 12].map((months) => {
                        const monthlyAmount = Math.round(amount / months);
                        return (
                          <label key={months} className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-lg cursor-pointer hover:border-purple-400 transition">
                            <div className="flex items-center gap-3">
                              <input type="radio" name="emi" className="w-4 h-4 text-purple-500" />
                              <span className="font-semibold">{months} Months</span>
                            </div>
                            <span className="text-sm">{formatAmount(monthlyAmount)}/month</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => confirmPayment("emi_demo_success")}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:shadow-lg transition"
                  >
                    Confirm EMI Payment
                  </button>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600 mb-3">Test Controls (Demo Only):</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => simulateWebhook("payment_succeeded")}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                      >
                        Simulate Success
                      </button>
                      <button
                        onClick={() => simulateWebhook("payment_failed")}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                      >
                        Simulate Failure
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cash on Delivery */}
              {selectedMethod === "cod" && (status === "idle" || status === "creating") && (
                <div className="space-y-4 mt-6">
                  <div className="p-6 bg-green-50 border-2 border-green-300 rounded-xl text-center">
                    <div className="text-5xl mb-4">💵</div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Cash on Delivery</h3>
                    <p className="text-gray-600 mb-4">Pay when you receive your order</p>
                    <div className="text-left space-y-2 text-sm text-gray-700">
                      <p>✓ Pay in cash to delivery partner</p>
                      <p>✓ Check product before payment</p>
                      <p>✓ No online payment required</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setStatus("succeeded");
                      setTimeout(() => {
                        onSuccess("cod_" + Date.now());
                      }, 500);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg transition"
                  >
                    Confirm Cash on Delivery Order
                  </button>
                </div>
              )}

              {/* Initial State Button */}
              {(status === "idle" || status === "creating") && selectedMethod !== "cod" && !showCardForm && !showUpiForm && !methodLocked && (
                <button
                  onClick={createPayment}
                  disabled={status === "creating"}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === "creating" ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Creating Payment...
                    </>
                  ) : (
                    <>Continue to Pay {formatAmount(amount)}</>
                  )}
                </button>
              )}

              {/* Generic creating placeholder to avoid grid flash */}
              {status === "creating" && methodLocked && !showCardForm && !showUpiForm && (
                <div className="py-10 flex flex-col items-center justify-center gap-3">
                  <Loader size={28} className="animate-spin text-orange-500" />
                  <p className="text-sm text-gray-600">Starting payment...</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
