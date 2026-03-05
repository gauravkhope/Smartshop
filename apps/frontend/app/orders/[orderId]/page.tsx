"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getOrderById } from "@/services/orderService";
import {
  ArrowLeft,
  Package,
  Truck,
  Home,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import type { Order } from "@/services/orderService";
import { toast } from "react-hot-toast";

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const orderData = await getOrderById(parseInt(orderId));
      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  // CANCEL ORDER
  const handleCancelOrder = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/cancel`,
        { method: "PATCH" }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Order cancelled successfully!");
        await fetchOrder();
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error("Something went wrong while canceling the order.");
    }
  };

  const getStatusInfo = (status: string) => {
    const statusInfo: {
      [key: string]: { color: string; icon: React.ReactNode; label: string };
    } = {
      processing: {
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <Clock size={20} />,
        label: "Processing",
      },
      shipped: {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <Truck size={20} />,
        label: "Shipped",
      },
      delivered: {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle size={20} />,
        label: "Delivered",
      },
      cancelled: {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle size={20} />,
        label: "Cancelled",
      },
    };
    return (
      statusInfo[status.toLowerCase()] || {
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: <Package size={20} />,
        label: status,
      }
    );
  };

  const getTrackingSteps = (status: string) => {
    const lower = status.toLowerCase();

    if (lower === "cancelled") {
      return [
        { label: "Order Placed", completed: true, isCancelled: false },
        { label: "Processing", completed: true, isCancelled: false },
        { label: "Cancelled", completed: false, isCancelled: true },
      ];
    }

    return [
      { label: "Order Placed", completed: true, isCancelled: false },
      { label: "Processing", completed: true, isCancelled: false },
      {
        label: "Shipped",
        completed: ["shipped", "delivered"].includes(lower),
        isCancelled: false,
      },
      {
        label: "Delivered",
        completed: lower === "delivered",
        isCancelled: false,
      },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">Order not found</p>
          <button
            onClick={() => router.push("/orders")}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.orderStatus);
  const trackingSteps = getTrackingSteps(order.orderStatus);

  // FORMAT INR
  const formatINR = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/orders")}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Orders</span>
          </button>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                Order #{order.id}
              </h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div
              className={`px-6 py-3 rounded-xl font-semibold border-2 ${statusInfo.color} flex items-center gap-2`}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Truck size={24} className="text-orange-500" />
                Order Tracking
              </h2>

              <div className="relative">
                {trackingSteps.map((step, index) => (
                  <div key={index} className="flex items-center mb-8 last:mb-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold z-10 ${
                        step.isCancelled
                          ? "bg-red-500 text-white"
                          : step.completed
                          ? "bg-gradient-to-r from-green-400 to-green-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {step.isCancelled ? (
                        <XCircle size={24} />
                      ) : step.completed ? (
                        <CheckCircle size={24} />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {index < trackingSteps.length - 1 && (
                      <div
                        className={`absolute left-6 w-0.5 h-16 -ml-px ${
                          step.completed ? "bg-green-500" : "bg-gray-300"
                        }`}
                        style={{ top: `${index * 5 + 3}rem` }}
                      />
                    )}

                    <div className="ml-4">
                      <p
                        className={`font-semibold ${
                          step.completed ? "text-gray-800" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.completed && (
                        <p className="text-sm text-gray-500">
                          {new Date(order.updatedAt).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Package size={24} className="text-purple-500" />
                Order Items ({order.items.length})
              </h2>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100"
                  >
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white shadow-md flex-shrink-0">
                      <Image
                        src={item.product.image || "/placeholder.jpg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500">{item.product.brand}</p>

                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-semibold">Category:</span>{" "}
                        {item.product.category}
                      </p>

                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold">Quantity:</span>{" "}
                          {item.quantity}
                        </span>

                        <span className="text-sm text-gray-600">
                          <span className="font-semibold">Price:</span>{" "}
                          {formatINR(item.price)} each
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-500">
                        {formatINR(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipping */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Home size={20} className="text-blue-500" />
                Shipping Address
              </h2>

              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">{order.shippingAddress}</p>
                <p>
                  {order.shippingCity}, {order.shippingState} {order.shippingZip}
                </p>
                <p>{order.shippingCountry}</p>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-gray-500" />
                    <span>{order.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-gray-500" />
                    <span>{order.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-green-500" />
                Payment Information
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Method</span>
                  <span className="font-semibold capitalize">
                    {order.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatINR(order.totalAmount)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>

                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>{formatINR(order.totalAmount * 0.18)}</span>
                </div>

                <div className="flex justify-between text-2xl font-bold text-gray-800 border-t-2 border-gray-300 pt-4">
                  <span>Total</span>
                  <span className="text-purple-600">
                    {formatINR(order.totalAmount * 1.18)}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg border-2 border-gray-200 hover:scale-105 transition-all"
              >
                Print Invoice
              </button>

              {order.orderStatus !== "delivered" &&
                order.orderStatus !== "cancelled" && (
                  <button
                    onClick={handleCancelOrder}
                    className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl shadow-lg hover:bg-red-600 hover:scale-105 transition-all"
                  >
                    Cancel Order
                  </button>
                )}

              <button
                onClick={() => router.push("/products")}
                className="w-full py-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
