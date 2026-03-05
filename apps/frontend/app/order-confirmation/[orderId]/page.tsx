"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getOrderById } from "@/services/orderService";
import { CheckCircle, Package, Truck, Home, Mail, Phone, Calendar } from "lucide-react";
import Image from "next/image";
import type { Order } from "@/services/orderService";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

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

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days from now
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
          <p className="text-xl text-gray-600">Order not found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle size={64} className="text-green-500" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 text-lg">Thank you for your purchase 🎉</p>
          <p className="text-gray-500 mt-2">Order #{order.id}</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          {/* Delivery Info */}
          <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl mb-8">
            <div className="p-3 bg-white rounded-xl shadow-md">
              <Truck size={32} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Estimated Delivery</h2>
              <p className="text-2xl font-bold text-orange-500">{getEstimatedDelivery()}</p>
              <p className="text-sm text-gray-600 mt-1">Your order is being processed</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={24} className="text-purple-500" />
              Order Items ({order.items?.length ?? 0})
            </h3>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-center p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                    <Image
                      src={item.product?.image || "/placeholder.jpg"}
                      alt={item.product?.name || "Product"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{item.product?.name}</h4>
                    <p className="text-sm text-gray-500">{item.product?.brand}</p>
                    <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">
                      {formatCurrencyINR(item.price * item.quantity)}
                    </p>
                    <p className="text-sm text-gray-500">{formatCurrencyINR(item.price)} each</p>
                  </div>
                </div>
              )) ?? <p className="text-gray-500">No items found for this order.</p>}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Home size={24} className="text-blue-500" />
              Shipping Address
            </h3>
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
              <p className="font-semibold text-gray-800">{order.shippingAddress}</p>
              <p className="text-gray-600">
                {order.shippingCity}, {order.shippingState} {order.shippingZip}
              </p>
              <p className="text-gray-600">{order.shippingCountry}</p>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} />
                  <span>{order.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  <span>{order.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrencyINR(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>{formatCurrencyINR(order.totalAmount * 0.08)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-800 border-t-2 border-gray-300 pt-3">
                <span>Total Paid</span>
                <span className="text-purple-500">{formatCurrencyINR(order.totalAmount * 1.08)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  Order Date
                </span>
                <span>{new Date(order.createdAt ?? Date.now()).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Payment Method</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Order Status</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold capitalize">
                  {order.orderStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push(`/orders/${order.id}`)}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            View Order Details
          </button>
          <button
            onClick={() => router.push("/products")}
            className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all border-2 border-gray-200"
          >
            Continue Shopping
          </button>
        </div>

        {/* Email Confirmation Notice */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl text-center">
          <Mail size={24} className="inline text-blue-500 mb-2" />
          <p className="text-blue-800 font-semibold">
            A confirmation email has been sent to {order.email}
          </p>
          <p className="text-blue-600 text-sm mt-1">
            You can track your order status in your orders page
          </p>
        </div>
      </div>
    </div>
  );
}
