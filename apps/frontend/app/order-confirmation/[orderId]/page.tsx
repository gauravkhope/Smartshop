"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getOrderById } from "@/services/orderService";
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Receipt,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import type { Order } from "@/services/orderService";
import {
  matchDisplaySnapshotItem,
  readOrderDisplaySnapshot,
  type OrderDisplaySnapshotItem,
} from "@/lib/orderDisplaySnapshot";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayItems, setDisplayItems] = useState<OrderDisplaySnapshotItem[]>([]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (!order?.id || typeof window === "undefined") return;
    try {
      setDisplayItems(readOrderDisplaySnapshot(order.id));
    } catch (err) {
      console.warn("Failed to read order display snapshot:", err);
    }
  }, [order?.id]);

  const fetchOrder = async () => {
    try {
      const orderData = await getOrderById(Number.parseInt(orderId));
      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    fetchOrder();
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days 
    return deliveryDate.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrencyINR = (amount: number | undefined | null) => {
    const value = amount ?? 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const firstOrderItem = order?.items?.[0];
  const firstDisplayItem = firstOrderItem
    ? matchDisplaySnapshotItem(displayItems, firstOrderItem)
    : displayItems[0];
  const primaryProductName =
    firstDisplayItem?.name || firstOrderItem?.displayName || firstOrderItem?.product?.name || "Your Product";
  const additionalItems = Math.max((order?.items?.length ?? 0) - 1, 0);
  const featuredProductLabel =
    additionalItems > 0 ? `${primaryProductName} +${additionalItems} more` : primaryProductName;
  const subtotalFromItems = (order?.items ?? []).reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );
  const shippingAmount = subtotalFromItems > 0 && subtotalFromItems < 499 ? 99 : 0;
  const totalPaid = subtotalFromItems + shippingAmount;
  const paymentMethodNormalized = String(order?.paymentMethod ?? "").toLowerCase().trim();
  const isCashOnDelivery =
    paymentMethodNormalized === "cod" ||
    paymentMethodNormalized === "cash on delivery" ||
    paymentMethodNormalized === "cash_on_delivery";

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fff7ed,_#ffe4e6_35%,_#fae8ff_70%,_#eff6ff)] flex items-center justify-center px-4">
        <div className="text-center rounded-3xl border border-white/70 bg-white/70 backdrop-blur-xl shadow-2xl p-10">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
          <p className="text-lg font-semibold text-gray-800">Loading order details</p>
          <p className="mt-1 text-sm text-gray-500">Please wait while we prepare your confirmation page.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fff7ed,_#ffe4e6_35%,_#fae8ff_70%,_#eff6ff)] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
            <Receipt className="h-7 w-7 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">Order not found</p>
          <p className="text-sm text-gray-600 mb-6">Unable to load this order right now.</p>
          <button
            onClick={handleRetry}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
          >
            Retry Loading
          </button>
          <button
            onClick={() => router.push("/orders")}
            className="mt-3 block w-full rounded-xl bg-gray-800 px-6 py-2.5 font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            View All Orders
          </button>
          <button
            onClick={() => router.push("/")}
            className="mt-3 block w-full rounded-xl border border-orange-300 bg-orange-50 px-6 py-2.5 font-semibold text-orange-700 transition-colors hover:bg-orange-100"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="order-confirmation-page" className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_0%,_#ffedd5,_#ffe4e6_35%,_#f5d0fe_65%,_#dbeafe)] py-10 sm:py-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-white/50 blur-3xl" />
      <div className="relative container mx-auto max-w-5xl px-4">
        {/* ══════════════════════════════════════════════
            SUCCESS HEADER — LUXURY CARD
            ══════════════════════════════════════════════ */}
        <div className="relative mb-8">

          {/* ── DARK LUXURY CARD ── */}
          <div
            className="overflow-hidden rounded-3xl"
            style={{
              background: "linear-gradient(135deg, #b8930a 0%, #1a0e00 35%, #065f46 100%)",
              padding: "1.5px",
              boxShadow: "0 50px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,200,50,0.08)",
            }}
          >
            <div
              className="rounded-3xl text-center"
              style={{
                background: "linear-gradient(170deg, #0a1a10 0%, #0f172a 45%, #071a0f 100%)",
                padding: "40px 32px",
              }}
            >
              {/* Star-field dots — pure CSS decoration */}
              <div style={{ position:"absolute", inset:0, overflow:"hidden", borderRadius:"inherit", pointerEvents:"none", opacity:0.4 }}>
                {[{t:"8%",l:"12%"},{t:"15%",l:"80%"},{t:"60%",l:"5%"},{t:"75%",l:"90%"},{t:"40%",l:"95%"}].map((s,i)=>(
                  <span key={i} style={{
                    position:"absolute", top:s.t, left:s.l,
                    width:"2px", height:"2px", borderRadius:"50%",
                    background:"#d4af37",
                    animation:`ringBreath ${2+i*0.4}s ease-in-out ${i*0.3}s infinite`,
                  }}/>
                ))}
              </div>

              {/* ── Compact luxury badge — inside the card ── */}
              <div data-testid="order-success-section" className="mx-auto mb-6 flex items-center justify-center" style={{ width: "fit-content", position: "relative" }}>
                {/* Soft gold ambient glow behind tile */}
                <div style={{
                  position: "absolute", inset: "-14px",
                  borderRadius: "30px",
                  background: "radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)",
                  animation: "ringBreath 3s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
                {/* Outer shimmer border */}
                <div style={{
                  position: "absolute", inset: "-5px",
                  borderRadius: "26px",
                  border: "1px solid rgba(212,175,55,0.3)",
                  animation: "ringBreath 3s ease-in-out 0.3s infinite",
                  pointerEvents: "none",
                }} />

                {/* The tile */}
                <div style={{
                  width: "90px", height: "90px",
                  borderRadius: "22px",
                  background: "linear-gradient(165deg, #1e3d28 0%, #0e2218 50%, #071510 100%)",
                  boxShadow: "none",
                  border: "1.5px solid rgba(212,175,55,0.55)",
                  position: "relative",
                  overflow: "hidden",
                  animation: "badgeFloat 3s ease-in-out infinite",
                  /* perspective tilt for 3D feel */
                  transform: "perspective(400px) rotateX(6deg)",
                }}>
                  {/* Top-face specular — wide bright strip */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "45%",
                    borderRadius: "22px 22px 0 0",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.13) 0%, transparent 100%)",
                    pointerEvents: "none",
                  }} />
                  {/* Bottom-face lighter strip to mimic the white floor reflection */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "20%",
                    borderRadius: "0 0 22px 22px",
                    background: "linear-gradient(0deg, rgba(255,255,255,0.07) 0%, transparent 100%)",
                    pointerEvents: "none",
                  }} />

                  {/* Animated SVG — fully clipped inside the tile */}
                  <svg
                    viewBox="0 0 80 80" width="90" height="90"
                    fill="none"
                    style={{ position: "absolute", top: 0, left: 0 }}
                  >
                    <style>{`
                      @keyframes ringBreath {
                        0%,100% { opacity:0.25; transform:scale(1); }
                        50%     { opacity:0.8;  transform:scale(1.04); }
                      }
                      @keyframes badgeFloat {
                        0%,100% { transform:translateY(0px); }
                        50%     { transform:translateY(-5px); }
                      }
                      @keyframes floorShadow {
                        0%,100% { transform:translateX(-50%) scaleX(1);   opacity:0.55; }
                        50%     { transform:translateX(-50%) scaleX(0.78); opacity:0.28; }
                      }
                      @keyframes drawGoldBox {
                        0%   { stroke-dashoffset:240; }
                        40%  { stroke-dashoffset:0; }
                        74%  { stroke-dashoffset:0; }
                        100% { stroke-dashoffset:240; }
                      }
                      @keyframes draw3DCheck {
                        0%,28%  { stroke-dashoffset:70; opacity:0; }
                        60%     { stroke-dashoffset:0;  opacity:1; }
                        82%     { stroke-dashoffset:0;  opacity:1; }
                        100%    { stroke-dashoffset:70; opacity:0; }
                      }
                      @keyframes stampBounce {
                        0%,30%  { transform:scale(0.88); }
                        60%     { transform:scale(1.10); }
                        76%     { transform:scale(0.98); }
                        90%,100%{ transform:scale(1);    }
                      }
                      .gb-box {
                        stroke-dasharray:240;
                        stroke-dashoffset:240;
                        animation: drawGoldBox 3s cubic-bezier(.4,0,.2,1) infinite;
                      }
                      .gb-check {
                        stroke-dasharray:70;
                        stroke-dashoffset:70;
                        animation: draw3DCheck 3s cubic-bezier(.4,0,.2,1) infinite;
                      }
                      .gb-group {
                        transform-origin: 40px 40px;
                        animation: stampBounce 3s cubic-bezier(.4,0,.2,1) infinite;
                      }
                    `}</style>
                    <defs>
                      <linearGradient id="luxGold" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                        <stop offset="0%"   stopColor="#fff4b0" />
                        <stop offset="45%"  stopColor="#d4af37" />
                        <stop offset="100%" stopColor="#7a5800" />
                      </linearGradient>
                      <filter id="checkGlow3D" x="-40%" y="-40%" width="180%" height="180%">
                        <feDropShadow dx="0" dy="2"  stdDeviation="3"  floodColor="#d4af37" floodOpacity="0.95" />
                        <feDropShadow dx="0" dy="5"  stdDeviation="9"  floodColor="#d4af37" floodOpacity="0.5"  />
                        <feDropShadow dx="0" dy="10" stdDeviation="16" floodColor="#d4af37" floodOpacity="0.2"  />
                      </filter>
                    </defs>
                    <g className="gb-group">
                      {/* Rounded-square border traces on */}
                      <rect
                        className="gb-box"
                        x="10" y="10" width="60" height="60" rx="12" ry="12"
                        stroke="url(#luxGold)" strokeWidth="2.5" strokeLinecap="round" fill="none"
                      />
                      {/* Checkmark — fully inside the box */}
                      <polyline
                        className="gb-check"
                        points="22,41 34,53 58,27"
                        stroke="url(#luxGold)"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        filter="url(#checkGlow3D)"
                      />
                    </g>
                    </svg>
                  </div>
                  {/* Surface floor shadow — cast on the card below the tile */}
                  <div style={{
                    position: "absolute",
                    bottom: "-14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "100px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.5)",
                    filter: "blur(14px)",
                    animation: "floorShadow 3s ease-in-out infinite",
                    pointerEvents: "none",
                    zIndex: 0,
                  }} />
                </div>

              {/* Payment status pill */}
              <div
                data-testid="payment-status" className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-black uppercase tracking-[0.2em]"
                style={{
                  background: "linear-gradient(90deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.08) 100%)",
                  border: "1px solid rgba(212,175,55,0.45)",
                  color: "#e8c84a",
                  boxShadow: "0 0 18px rgba(212,175,55,0.15)",
                }}
              >
                <BadgeCheck size={13} />
                {isCashOnDelivery ? "Payment Due" : "Payment Confirmed"}
              </div>
              {isCashOnDelivery && (
                <p className="mx-auto mb-4 max-w-xl text-xs text-amber-200/90 sm:text-sm">
                  Please Pay the Amount to Delivery Partner after Checking the Parcel
                </p>
              )}

              {/* Headline */}
              <div className="mx-auto mb-3 max-w-3xl" style={{ perspective: "1200px" }}>
                <style>{`
                  @keyframes luxuryHeadlineFlip {
                    0%, 38%   { transform: rotateX(0deg); }
                    48%, 88%  { transform: rotateX(180deg); }
                    100%      { transform: rotateX(360deg); }
                  }
                  @keyframes luxuryShineSweep {
                    0%   { transform: translateX(-125%); opacity: 0; }
                    14%  { opacity: 0.75; }
                    45%  { transform: translateX(125%); opacity: 0; }
                    100% { transform: translateX(125%); opacity: 0; }
                  }
                  @keyframes luxurySparkle {
                    0%, 100% { opacity: 0.25; transform: scale(0.75) translateY(0px); }
                    45%      { opacity: 1;    transform: scale(1.2)  translateY(-3px); }
                    70%      { opacity: 0.5;  transform: scale(0.95) translateY(1px); }
                  }
                  @keyframes luxuryTextGlow {
                    0%, 100% { text-shadow: 0 0 16px rgba(212,175,55,0.2), 0 0 36px rgba(212,175,55,0.08); }
                    50%      { text-shadow: 0 0 24px rgba(255,228,140,0.45), 0 0 48px rgba(212,175,55,0.18); }
                  }
                  @keyframes luxuryGradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50%      { background-position: 100% 50%; }
                  }
                  @keyframes particleFall3D {
                    0% {
                      transform: translate3d(var(--x-start), -38px, 38px) scale(0.7);
                      opacity: 0;
                    }
                    12% {
                      opacity: 0.95;
                    }
                    80% {
                      opacity: 0.8;
                    }
                    100% {
                      transform: translate3d(var(--x-end), 130px, -60px) scale(1.25);
                      opacity: 0;
                    }
                  }
                `}</style>
                <div
                  className="relative h-[108px] sm:h-[124px]"
                  style={{
                    transformStyle: "preserve-3d",
                    animation: "luxuryHeadlineFlip 7s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                  }}
                >
                  <div
                   data-testid="order-title" className="absolute inset-0 flex items-center justify-center overflow-visible px-4"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateX(0deg) translateZ(2px)",
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                    }}
                  >
                    <h1 className="relative text-center text-3xl font-black tracking-tight text-white sm:text-5xl">
                      Order Placed{" "}
                      <span
                        style={{
                          background: "linear-gradient(90deg, #fff4b0 0%, #d4af37 50%, #a07810 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Successfully
                      </span>
                    </h1>
                  </div>

                  <div
                    className="absolute inset-0 flex items-center justify-center overflow-visible px-5"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateX(180deg) translateZ(2px)",
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                    }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 overflow-hidden"
                      style={{ perspective: "800px", zIndex: 0, opacity: 0.78 }}
                    >
                      {[
                        { left: "4%", delay: "0s", duration: "3.8s", start: "-12px", end: "20px", size: "3px" },
                        { left: "10%", delay: "0.35s", duration: "4.4s", start: "9px", end: "-12px", size: "2px" },
                        { left: "16%", delay: "0.9s", duration: "3.6s", start: "-8px", end: "16px", size: "4px" },
                        { left: "23%", delay: "1.25s", duration: "4.7s", start: "12px", end: "-10px", size: "3px" },
                        { left: "30%", delay: "0.55s", duration: "4.2s", start: "8px", end: "-14px", size: "3px" },
                        { left: "36%", delay: "1.5s", duration: "3.5s", start: "-10px", end: "14px", size: "5px" },
                        { left: "42%", delay: "1.1s", duration: "3.9s", start: "-6px", end: "12px", size: "4px" },
                        { left: "48%", delay: "0.2s", duration: "4.5s", start: "10px", end: "-8px", size: "3px" },
                        { left: "54%", delay: "0.75s", duration: "4s", start: "-5px", end: "11px", size: "2px" },
                        { left: "60%", delay: "1.35s", duration: "3.9s", start: "-4px", end: "14px", size: "4px" },
                        { left: "66%", delay: "0.95s", duration: "4.6s", start: "14px", end: "-18px", size: "3px" },
                        { left: "72%", delay: "0.8s", duration: "4.1s", start: "12px", end: "-16px", size: "3px" },
                        { left: "78%", delay: "1.7s", duration: "3.8s", start: "-7px", end: "10px", size: "4px" },
                        { left: "84%", delay: "1.6s", duration: "3.7s", start: "-8px", end: "10px", size: "4px" },
                        { left: "90%", delay: "0.45s", duration: "4.3s", start: "9px", end: "-12px", size: "2px" },
                        { left: "96%", delay: "1.9s", duration: "3.6s", start: "-9px", end: "13px", size: "3px" },
                      ].map((particle, idx) => (
                        <span
                          key={idx}
                          style={{
                            position: "absolute",
                            top: "-24px",
                            left: particle.left,
                            width: particle.size,
                            height: particle.size,
                            borderRadius: "9999px",
                            background: "radial-gradient(circle, rgba(255,242,182,0.95) 0%, rgba(212,175,55,0.6) 55%, rgba(212,175,55,0) 100%)",
                            filter: "drop-shadow(0 0 8px rgba(212,175,55,0.5))",
                            animation: `particleFall3D ${particle.duration} linear ${particle.delay} infinite`,
                            transformStyle: "preserve-3d",
                            // CSS vars are used by the keyframes to create subtle lateral drift.
                            ["--x-start" as string]: particle.start,
                            ["--x-end" as string]: particle.end,
                          }}
                        />
                      ))}
                    </div>
                    <h2
                      data-testid="order-title-productname" className="relative line-clamp-2 text-center text-xl font-black tracking-tight sm:text-3xl"
                      style={{
                        background: "none",
                        backgroundImage: "none",
                        color: "#f8e9b6",
                        WebkitBackgroundClip: "border-box",
                        WebkitTextFillColor: "#f8e9b6",
                        textShadow: "none",
                        zIndex: 1,
                      }}
                    >
                      <span className="pointer-events-none absolute -left-4 top-[8%] h-2.5 w-2.5 rounded-full"
                        style={{
                          background: "radial-gradient(circle, rgba(255,247,202,1) 0%, rgba(212,175,55,0.12) 78%, transparent 100%)",
                          animation: "luxurySparkle 1.8s ease-in-out 0s infinite",
                          filter: "drop-shadow(0 0 8px rgba(255,233,150,0.6))",
                        }}
                      />
                      <span className="pointer-events-none absolute -right-3 top-[24%] h-2 w-2 rounded-full"
                        style={{
                          background: "radial-gradient(circle, rgba(255,247,202,1) 0%, rgba(212,175,55,0.12) 78%, transparent 100%)",
                          animation: "luxurySparkle 2.1s ease-in-out 0.45s infinite",
                          filter: "drop-shadow(0 0 8px rgba(255,233,150,0.6))",
                        }}
                      />
                      <span className="pointer-events-none absolute left-[18%] -bottom-1.5 h-1.5 w-1.5 rounded-full"
                        style={{
                          background: "radial-gradient(circle, rgba(255,247,202,1) 0%, rgba(212,175,55,0.12) 78%, transparent 100%)",
                          animation: "luxurySparkle 1.7s ease-in-out 0.9s infinite",
                          filter: "drop-shadow(0 0 7px rgba(255,233,150,0.6))",
                        }}
                      />
                      {featuredProductLabel}
                    </h2>
                  </div>
                </div>
              </div>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
                Thank you for your purchase. Your order is being processed and will be packed with care.
              </p>

              {/* Order ID chip */}
              <div
                data-testid="order-id"
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#cbd5e1",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Sparkles size={14} style={{ color: "#d4af37" }} />
                Order #{order.orderNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-2xl backdrop-blur-xl sm:p-8">
          {/* Delivery Info */}
          <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-orange-100 via-rose-100 to-pink-100 p-5 sm:flex-row sm:items-start sm:p-6">
            <div className="w-fit rounded-2xl bg-white p-3 shadow-md">
              <Truck size={32} className="text-orange-500" />
            </div>
            <div data-testid="delivery-info">
              <h2 className="mb-1 text-xl font-black text-gray-900">Estimated Delivery</h2>
              <p data-testid="delivery-date" className="text-xl font-bold text-orange-600 sm:text-2xl">{getEstimatedDelivery()}</p>
              <p className="mt-1 text-sm text-gray-700">Your order is packed with care and moving through processing.</p>
            </div>
          </div>

          {/* Order Items */}
          <div data-testid="order-items" className="mb-8">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-gray-900">
              <ShoppingBag size={22} className="text-fuchsia-600" />
              Order Items ({order.items?.length ?? 0})
            </h3>
            <div className="space-y-4">
              {(() => {
                const usedDisplayIndexes = new Set<number>();
                return order.items?.map((item) => {
                const display = matchDisplaySnapshotItem(displayItems, item, usedDisplayIndexes);
                const title = display?.name || item.displayName || item.product?.name || "Product";
                const brand = display?.brand || item.displayBrand || item.product?.brand || "";
                const image = display?.image || item.displayImage || item.product?.image || "/placeholder.jpg";

                return (
                  <div
                    key={item.id}
                    className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-gray-50 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-gray-100">
                      <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 data-testid="order-item-name" className="font-bold text-gray-900">{title}</h4>
                      <p className="text-sm text-gray-500">{brand}</p>
                      <p  data-testid="order-item-quantity" className="mt-1 text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div data-testid="order-item-price" className="text-right">
                      <p  className="text-lg font-black text-gray-900">
                        {formatCurrencyINR(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-500">{formatCurrencyINR(item.price)} each</p>
                    </div>
                  </div>
                );
              }) ?? <p className="text-gray-500">No items found for this order.</p>;
              })()}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-8">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-gray-900">
              <Home size={24} className="text-blue-500" />
              Shipping Address
            </h3>
            <div data-testid="shipping-address" className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
              <p className="font-bold text-gray-900">{order.shippingAddress}</p>
              <p className="text-gray-600">
                {order.shippingCity}, {order.shippingState} {order.shippingZip}
              </p>
              <p className="text-gray-600">{order.shippingCountry}</p>
              <div className="mt-4 flex flex-col gap-2 border-t border-blue-200 pt-4 sm:flex-row sm:items-center sm:gap-6">
                <div data-testid="contact-phone" className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} />
                  <span>{order.phone}</span>
                </div>
                <div data-testid="contact-email" className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  <span>{order.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div data-testid="order-summary" className="rounded-2xl bg-gradient-to-r from-fuchsia-50 via-pink-50 to-orange-50 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-gray-900">
              <Receipt size={22} className="text-fuchsia-600" />
              Order Summary
            </h3>
            <div className="space-y-3">
              <div data-testid="subtotal" className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrencyINR(subtotalFromItems)}</span>
              </div>
              <div data-testid="shipping" className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold">
                  {shippingAmount > 0 ? formatCurrencyINR(shippingAmount) : <span className="text-green-600">FREE</span>}
                </span>
              </div>
              <div data-testid="total-paid" className="flex justify-between text-xl font-bold text-gray-800 border-t-2 border-gray-300 pt-3">
                <span>Total Paid</span>
                <span className="text-fuchsia-600">{formatCurrencyINR(totalPaid)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div data-testid="order-date" className="flex justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  Order Date
                </span>
                <span>{new Date(order.createdAt ?? Date.now()).toLocaleDateString("en-IN")}</span>
              </div>
              <div data-testid="payment-method" className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Payment Method</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
              <div data-testid="order-status" className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Order Status</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold capitalize">
                  {order.orderStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div data-testid="action-buttons" className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            onClick={() => router.push(`/orders/${order.id}`)}
           data-testid="view-order-details" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-8 py-4 font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <Package size={18} />
            View Order Details
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => router.push("/products")}
            data-testid="continue-shopping" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-8 py-4 font-bold text-emerald-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-100"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </button>
        </div>

        {/* Email Confirmation Notice */}
        <div data-testid="confirmation-email" className="mt-8 rounded-2xl border border-blue-200 bg-blue-50/90 p-6 text-center shadow-md backdrop-blur-sm">
          <Mail size={24} className="mb-2 inline text-blue-500" />
          <p className="font-semibold text-blue-900">
            A confirmation email has been sent to {order.email}
          </p>
          <p className="mt-1 text-sm text-blue-700">
            You can track your order status in your orders page
          </p>
        </div>

        <p className="mt-6 text-center text-xs font-medium tracking-wide text-gray-500">
          SECURE CHECKOUT | VERIFIED PAYMENT | FAST SHIPPING
        </p>
      </div>
    </div>
  );
}
