"use client";

import React from "react";
import { Bell, CheckCircle, Circle } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "New Notification",
    message: "Your order #1234 has shipped and is on the way! Track your shipment for more details.",
    date: "2025-11-11",
    read: false,
    details: "Order #1234 was shipped via Express Delivery. Expected arrival: 2 days."
  },
  {
    id: 2,
    title: "Welcome to SmartShop!",
    message: "Thank you for joining SmartShop. Explore our latest deals and offers.",
    date: "2025-11-10",
    read: true,
    details: "Get started by browsing categories and adding items to your wishlist."
  },
  {
    id: 3,
    title: "Password Changed",
    message: "Your password was changed successfully.",
    date: "2025-11-09",
    read: true,
    details: "If you did not perform this action, contact support immediately."
  },
  {
    id: 4,
    title: "Deals Available",
    message: "New deals available on electronics!",
    date: "2025-11-08",
    read: true,
    details: "Save up to 40% on select electronics until Friday."
  },
  {
    id: 5,
    title: "Wishlist Item Restocked",
    message: "Your wishlist item is back in stock.",
    date: "2025-11-07",
    read: true,
    details: "Visit your wishlist to purchase before it sells out again."
  },
  {
    id: 6,
    title: "Order Delivered",
    message: "Order #1235 delivered.",
    date: "2025-11-06",
    read: true,
    details: "We hope you enjoy your purchase! Rate your experience."
  }
];

export default function NotificationPage() {
  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Bell className="w-8 h-8 text-indigo-500" /> Notifications
      </h1>
      <div className="space-y-6">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-5 rounded-xl shadow-md border transition-all ${notif.read ? "bg-gray-100 border-gray-200" : "bg-white border-indigo-300"}`}
          >
            <div className="flex items-center gap-3 mb-2">
              {notif.read ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Circle className="w-5 h-5 text-indigo-500 animate-pulse" />
              )}
              <span className={`text-lg ${notif.read ? "text-gray-600" : "font-bold text-indigo-700"}`}>{notif.title}</span>
              <span className={`ml-auto text-xs ${notif.read ? "text-gray-400" : "text-indigo-500"}`}>{notif.read ? "Read" : "Unread"}</span>
            </div>
            <div className="text-base mb-1 text-gray-700">{notif.message}</div>
            <div className="text-sm text-gray-500 mb-2">{notif.date}</div>
            <div className="text-sm text-gray-600 italic">{notif.details}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
