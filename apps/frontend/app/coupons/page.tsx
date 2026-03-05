"use client";

import React from "react";
import { Gift } from "lucide-react";

const coupons = [
  {
    id: 1,
    code: "ELEC20",
    title: "20% Off Electronics",
    description: "Get 20% off on all electronics items. Valid for orders above $100.",
    expiry: "2025-12-31",
    type: "Gift Card"
  },
  {
    id: 2,
    code: "GIFT50",
    title: "₹50 Gift Card",
    description: "Receive a ₹50 gift card on purchase of electronics above ₹500.",
    expiry: "2025-12-15",
    type: "Gift Card"
  },
  {
    id: 3,
    code: "FREESHIP",
    title: "Free Shipping",
    description: "Enjoy free shipping on electronics orders over ₹200.",
    expiry: "2025-12-20",
    type: "Gift Card"
  },
  {
    id: 4,
    code: "EXTRA10",
    title: "Extra 10% Off",
    description: "Get an extra 10% off on select electronics brands.",
    expiry: "2025-12-10",
    type: "Gift Card"
  },
  {
    id: 5,
    code: "BUY1GET1",
    title: "Buy 1 Get 1 Free",
    description: "Buy one electronic accessory and get another free.",
    expiry: "2025-12-25",
    type: "Gift Card"
  },
  {
    id: 6,
    code: "SMART30",
    title: "30% Off Smart Devices",
    description: "Save 30% on smart home devices. Limited time offer.",
    expiry: "2025-12-18",
    type: "Gift Card"
  }
];

export default function CouponsPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Gift className="w-8 h-8 text-pink-500" /> Coupons & Gift Cards
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="p-6 rounded-xl shadow-lg border border-pink-200 bg-gradient-to-br from-pink-50 via-white to-orange-50 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-6 h-6 text-pink-400" />
              <span className="font-semibold text-lg text-pink-700">{coupon.title}</span>
            </div>
            <div className="text-base text-gray-700 mb-1">{coupon.description}</div>
            <div className="text-sm text-gray-500">Coupon Code: <span className="font-mono text-pink-600 bg-pink-100 px-2 py-0.5 rounded">{coupon.code}</span></div>
            <div className="text-xs text-gray-400">Expires: {coupon.expiry}</div>
            <div className="text-xs text-orange-500 font-bold">Type: {coupon.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
