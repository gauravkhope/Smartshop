"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "@/services/orderService";
import { API_BASE_URL } from "@/lib/config";
import { Package, Calendar, Truck, Eye, ShoppingBag } from "lucide-react";
import Image from "next/image";
import type { Order } from "@/services/orderService";
import {
  matchDisplaySnapshotItem,
  readOrderDisplaySnapshot,
  type OrderDisplaySnapshotItem,
} from "@/lib/orderDisplaySnapshot";

const HOUR_MS = 60 * 60 * 1000;
const PACKED_AFTER_MS = 12 * HOUR_MS;
const SHIPPED_AFTER_MS = 24 * HOUR_MS;
const DELIVERED_AFTER_MS = 48 * HOUR_MS;
const RETURNED_AFTER_MS = 24 * HOUR_MS;

type ReturnReplaceRequest = {
  type: "return" | "replace";
  reason: string;
  requestedAt: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderDisplayMap, setOrderDisplayMap] = useState<
    Record<
      number,
      OrderDisplaySnapshotItem[]
    >
  >({});
  const [returnRequestMap, setReturnRequestMap] = useState<Record<number, ReturnReplaceRequest>>({});

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    if (!user) {
      router.push("/login");
      return;
    }
    fetchOrders();
  }, [user, authLoading, router]);

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

  useEffect(() => {
    if (typeof window === "undefined" || orders.length === 0) return;
    const nextMap: Record<number, OrderDisplaySnapshotItem[]> = {};

    orders.forEach((order) => {
      try {
        const snapshot = readOrderDisplaySnapshot(order.orderNumber);
        if (snapshot.length > 0) {
          nextMap[order.orderNumber] = snapshot;
        }
      } catch {
        // Ignore bad snapshot entries
      }
    });

    setOrderDisplayMap(nextMap);
  }, [orders]);

  useEffect(() => {
    if (typeof window === "undefined" || orders.length === 0) return;

    const nextRequests: Record<number, ReturnReplaceRequest> = {};

    orders.forEach((order) => {
      try {
        const raw = localStorage.getItem(`order_return_replace_${order.orderNumber}`);
        if (!raw) return;
        const parsed = JSON.parse(raw) as ReturnReplaceRequest;
        if (parsed?.type && parsed?.reason && parsed?.requestedAt) {
          nextRequests[order.orderNumber] = parsed;
        }
      } catch {
        // Ignore bad local storage entries
      }
    });

    setReturnRequestMap(nextRequests);
  }, [orders]);

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const getProductImageSrc = (image?: string, productId?: number) => {
    const fallbackImageUrl = `https://picsum.photos/seed/${productId ?? "product"}/600/600`;

    if (!image || image.trim() === "") {
      return fallbackImageUrl;
    }

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${API_BASE_URL}${image}`;
    }

    return `${API_BASE_URL}/${image}`;
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
      placed: "bg-yellow-100 text-yellow-700 border-yellow-200",
      packed: "bg-violet-100 text-violet-700 border-violet-200",
      shipped: "bg-blue-100 text-blue-700 border-blue-200",
      delivered: "bg-green-100 text-green-700 border-green-200",
      return_requested: "bg-orange-100 text-orange-700 border-orange-200",
      order_picked: "bg-green-100 text-green-700 border-green-200",
      order_replaced: "bg-green-100 text-green-700 border-green-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getEffectiveOrderStatus = (order: Order, request?: ReturnReplaceRequest | null) => {
    const backendStatus = (order.orderStatus || "").toLowerCase();
    if (["cancelled", "canceled", "order_cancelled"].includes(backendStatus)) return "cancelled";

    const placedAt = new Date(order.createdAt).getTime();
    // const elapsedSincePlaced = Date.now() - placedAt;
  //  ✅ ADD THIS BLOCK
const now =
  typeof window !== "undefined" && (window as any).__TEST_NOW__
    ? (window as any).__TEST_NOW__
    : Date.now();

//✅ MODIFY THIS LINE
const elapsedSincePlaced = now - placedAt;
    const timedStatus =
      elapsedSincePlaced >= DELIVERED_AFTER_MS
        ? "delivered"
        : elapsedSincePlaced >= SHIPPED_AFTER_MS
        ? "shipped"
        : elapsedSincePlaced >= PACKED_AFTER_MS
        ? "packed"
        : "processing";

    if (!request) return timedStatus;

    const requestedAt = new Date(request.requestedAt).getTime();
    const elapsedSinceRequest = Date.now() - requestedAt;

    if (elapsedSinceRequest >= RETURNED_AFTER_MS) {
      return request.type === "replace" ? "order_replaced" : "order_picked";
    }

    return "return_requested";
  };

  const getStatusDisplay = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    // Show 'Completed' for these statuses
    if (["delivered", "order_picked", "order_replaced"].includes(normalizedStatus)) {
      return {
        label: "Completed",
        color: "bg-green-100 text-green-700 border-green-200",
      };
    }

    // Show 'Processing' for these statuses
    if (["placed", "picked", "shipped", "return_requested", "replace_requested"].includes(normalizedStatus)) {
      return {
        label: "Processing",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      };
    }

    if (normalizedStatus === "cancelled") {
      return {
        label: "Cancelled",
        color: "bg-red-100 text-red-700 border-red-200",
      };
    }

    // Default to 'Processing' for any other status
    return {
      label: "Processing",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
  };

  if (loading || authLoading) {
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
            {orders.map((order) => {
              const effectiveStatus = getEffectiveOrderStatus(order, returnRequestMap[order.orderNumber]);
              const statusDisplay = getStatusDisplay(effectiveStatus);

              return (
              <div
                key={order.orderNumber}
                data-testid={`order-card-${order.orderNumber}`}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden border border-gray-100"
              >
                
                {/* Order Header */}
                <div className="bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 p-6 border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 data-testid="order-id" className="text-xl font-bold text-gray-800 mb-2">
                        Order #{order.orderNumber}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span data-testid="order-date" >{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          <span data-testid="order-items-count">{order.items.length} items</span>
                        </div>
                      </div>
                    </div>

                    {/* TOTAL (INR) */}
                    <div className="text-right">
                      <p data-testid="order-price" className="text-2xl font-bold text-purple-500">
                        {formatINR(order.totalAmount * 1.18)}
                      </p>
                      <span
                        data-testid="order-status"
                        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mt-2 border ${statusDisplay.color}`}
                      >
                        {statusDisplay.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                    {(() => {
                      const usedDisplayIndexes = new Set<number>();
                      return order.items.slice(0, 6).map((item) => {
                      const display = matchDisplaySnapshotItem(orderDisplayMap[order.orderNumber] ?? [], item, usedDisplayIndexes);
                      const image = getProductImageSrc(display?.image || item.displayImage || item.product.image, item.product.id);
                      const title = display?.name || item.displayName || item.product.name;

                      return (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                      >
                        <Image
                          src={image}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform"
                          unoptimized
                        />
                        {item.quantity > 1 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                            x{item.quantity}
                          </div>
                        )}
                      </div>
                      );
                    });
                    })()}
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
                      <p data-testid="order-address" className="text-sm text-gray-600">
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
