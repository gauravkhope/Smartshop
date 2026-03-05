"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "@/services/orderService";
import { Package, Calendar, Truck, Eye, ShoppingBag } from "lucide-react";
import Image from "next/image";
import type { Order } from "@/services/orderService";

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const ordersData = await getUserOrders(user.id);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
      shipped: "bg-blue-100 text-blue-700 border-blue-200",
      delivered: "bg-green-100 text-green-700 border-green-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">View and track all your orders</p>
        </div>

        {/* No Orders */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-block p-6 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full mb-6">
              <ShoppingBag size={64} className="text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Orders Yet</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't placed any orders yet. Start shopping now!
            </p>
            <button
              onClick={() => router.push("/products")}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden border border-gray-100"
              >
                
                {/* Order Header */}
                <div className="bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 p-6 border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Order #{order.id}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          <span>{order.items.length} items</span>
                        </div>
                      </div>
                    </div>

                    {/* TOTAL (INR) */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-500">
                        {formatINR(order.totalAmount * 1.18)}
                      </p>
                      <span
                        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mt-2 border ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                    {order.items.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                      >
                        <Image
                          src={item.product.image || "/placeholder.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                        {item.quantity > 1 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                            x{item.quantity}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.items.length > 6 && (
                    <p className="text-sm text-gray-500 mb-4">
                      +{order.items.length - 6} more items
                    </p>
                  )}

                  {/* Address */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl mb-4">
                    <Truck size={20} className="text-gray-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Shipping to:</p>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingZip}
                      </p>
                    </div>
                  </div>

                  {/* View Details */}
                  <button
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={20} />
                    View Order Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
