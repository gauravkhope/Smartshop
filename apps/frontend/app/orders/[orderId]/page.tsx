"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getOrderById } from "@/services/orderService";
import axios from "@/lib/axios";
import { API_BASE_URL } from "@/lib/config";
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
  status?: string;
  cancelledAt?: string;
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  // Always treat orderId as the global order id (not orderNumber)
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayItems, setDisplayItems] = useState<OrderDisplaySnapshotItem[]>([]);
  const [returnRequest, setReturnRequest] = useState<ReturnReplaceRequest | null>(null);
  const [requestType, setRequestType] = useState<"return" | "replace" | null>(null);
  const [requestReason, setRequestReason] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (!order?.orderNumber || typeof window === "undefined") return;
    try {
      setDisplayItems(readOrderDisplaySnapshot(order.orderNumber));
    } catch (err) {
      console.warn("Failed to read order display snapshot:", err);
    }
  }, [order?.orderNumber]);

  useEffect(() => {
    if (!order?.id) return;
    const fetchReturnReplaceRequest = async () => {
      try {
        const res = await axios.get(`/orders/${order.id}/return-replace`);
        setReturnRequest(res.data);
      } catch (err: any) {
        setReturnRequest(null);
      }
    };
    fetchReturnReplaceRequest();
  }, [order?.id]);

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
      const response = await axios.patch(`/orders/${orderId}/cancel`);
      const data = response.data;
      toast.success("Order cancelled successfully!");
      await fetchOrder();
    } catch (err: any) {
      console.error("Cancel order error:", err);
      const message = err?.response?.data?.message || err?.message || "Something went wrong while canceling the order.";
      toast.error(message);
    }
  };

  const getStatusInfo = (status: string, request?: ReturnReplaceRequest | null) => {
    const statusInfo: {
      [key: string]: { color: string; icon: React.ReactNode; label: string };
    } = {
      placed: {
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <Package size={20} />,
        label: "Order Placed",
      },
      processing: {
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <Clock size={20} />,
        label: "Processing",
      },
      packed: {
        color: "bg-violet-100 text-violet-700 border-violet-200",
        icon: <Package size={20} />,
        label: "Order Packed",
      },
      shipped: {
        color: "bg-orange-100 text-orange-700 border-orange-200",
        icon: <Truck size={20} />,
        label: "Shipped",
      },
      delivered: {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle size={20} />,
        label: "Delivered",
      },
      return_requested: {
        color: "bg-orange-100 text-orange-700 border-orange-200",
        icon: <Clock size={20} />,
        label: request?.type === "replace" ? "Replacement Requested" : "Return Requested",
      },
      returned: {
        color: "bg-orange-200 text-orange-800 border-orange-300",
        icon: <CheckCircle size={20} />,
        label: "Order Returned",
      },
      cancelled: {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle size={20} />,
        label: "Cancelled",
      },
      order_replaced: {
        color: "bg-blue-200 text-blue-800 border-blue-300",
        icon: <CheckCircle size={20} />,
        label: "Order Replaced",
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

  const getEffectiveOrderStatus = (currentOrder: Order, request: ReturnReplaceRequest | null) => {
    const backendStatus = (currentOrder.orderStatus || "").toLowerCase();
    if (backendStatus === "cancelled") return "cancelled";

    const placedAt = new Date(currentOrder.createdAt).getTime();
    const now =
      typeof window !== "undefined" &&
      typeof (window as any).__TEST_NOW__ === "number"
        ? (window as any).__TEST_NOW__
        : Date.now();

    const elapsedSincePlaced = now - placedAt;
    const timedStatus =
      elapsedSincePlaced >= DELIVERED_AFTER_MS
        ? "delivered"
        : elapsedSincePlaced >= SHIPPED_AFTER_MS
        ? "shipped"
        : elapsedSincePlaced >= PACKED_AFTER_MS
        ? "packed"
        : "placed";

    // Only treat as return_requested if request exists and is pending
    if (!request || request.status !== "pending") return timedStatus;

    const requestedAt = new Date(request.requestedAt).getTime();
    const elapsedSinceRequest = now - requestedAt;
        // If replacement completed, set status to 'Order Replaced'
        if (request.type === "replace" && elapsedSinceRequest >= RETURNED_AFTER_MS) {
          return "order_replaced";
        }
        // If return completed, set status to 'returned'
        if (request.type === "return" && elapsedSinceRequest >= RETURNED_AFTER_MS) {
          return "returned";
        }
        return "return_requested";
  };

  const getTrackingSteps = (status: string, createdAt: string, request?: ReturnReplaceRequest | null) => {
    const now =
      typeof window !== "undefined" &&
      typeof (window as any).__TEST_NOW__ === "number"
        ? (window as any).__TEST_NOW__
        : Date.now();
    const lower = status.toLowerCase();
    const placedDate = new Date(createdAt);
    const packedDate = new Date(placedDate.getTime() + PACKED_AFTER_MS);
    const shippedDate = new Date(placedDate.getTime() + SHIPPED_AFTER_MS);
    const deliveredDate = new Date(placedDate.getTime() + DELIVERED_AFTER_MS);
    const returnedOrReplacedDate = request?.requestedAt
      ? new Date(new Date(request.requestedAt).getTime() + RETURNED_AFTER_MS)
      : null;

    // Unified logic for both return and replace
    if (lower === "cancelled") {
      return [
        { label: "Order Placed", completed: true, isCancelled: false, date: placedDate },
        { label: "Cancelled", completed: true, isCancelled: true, date: new Date(now) },
      ];
    }

    // Handle both return and replace requests
    if (lower === "return_requested") {
      return [
        { label: "Order Placed", completed: true, isCancelled: false, date: placedDate },
        { label: "Order Packed", completed: true, isCancelled: false, date: packedDate },
        { label: "Order Shipped", completed: true, isCancelled: false, date: shippedDate },
        { label: "Order Delivered", completed: true, isCancelled: false, date: deliveredDate },
        {
          label: request?.type === "replace" ? "Replacement Requested" : "Return Requested",
          completed: true,
          isCancelled: false,
          date: request?.requestedAt ? new Date(request.requestedAt) : new Date(now),
        },
        {
          label: request?.type === "replace" ? "Order Replaced" : "Order Picked",
          completed: false,
          isCancelled: false,
          date: returnedOrReplacedDate,
        },
      ];
    }

    // Handle both returned and replaced as completed
    if (lower === "returned" || lower === "order_replaced") {
      return [
        { label: "Order Placed", completed: true, isCancelled: false, date: placedDate },
        { label: "Order Packed", completed: true, isCancelled: false, date: packedDate },
        { label: "Order Shipped", completed: true, isCancelled: false, date: shippedDate },
        { label: "Order Delivered", completed: true, isCancelled: false, date: deliveredDate },
        {
          label: request?.type === "replace" ? "Order Replaced" : "Order Picked",
          completed: true,
          isCancelled: false,
          date: returnedOrReplacedDate ?? new Date(now),
        },
      ];
    }

    // Default steps for normal orders
    return [
      { label: "Order Placed", completed: true, isCancelled: false, date: placedDate },
      {
        label: "Order Packed",
        completed: ["packed", "shipped", "delivered"].includes(lower),
        isCancelled: false,
        date: packedDate,
      },
      {
        label: "Order Shipped",
        completed: ["shipped", "delivered"].includes(lower),
        isCancelled: false,
        date: shippedDate,
      },
      {
        label: "Order Delivered",
        completed: lower === "delivered",
        isCancelled: false,
        date: deliveredDate,
      },
    ];
  };

  const handleSubmitReturnReplaceRequest = async () => {
    if (!order || !requestType) return;
    const reason = requestReason.trim();
    if (reason.length < 5) {
      toast.error("Please enter a valid reason (minimum 5 characters)");
      return;
    }
    try {
      const now =
  typeof window !== "undefined" &&
  typeof (window as any).__TEST_NOW__ === "number"
    ? (window as any).__TEST_NOW__
    : Date.now();

const res = await axios.post(`/orders/${order.id}/return-replace`, {
  type: requestType,
  reason,
  requestedAt: new Date(now).toISOString(), // 🔥 ADD THIS
});
      
      setReturnRequest(res.data.request);
      setRequestType(null);
      setRequestReason("");
      toast.success(
        requestType === "replace"
          ? "Replacement request submitted successfully"
          : "Return request submitted successfully"
      );
    } catch (err) {
      console.error("Failed to submit return/replace request:", err);
      toast.error("Unable to submit request right now");
    }
  };

  const handleCancelReturnReplaceRequest = async () => {
    if (!order?.id || !returnRequest) return;
    try {
      await axios.patch(`/orders/${order.id}/return-replace/cancel`);
      setRequestType(null);
      setRequestReason("");
      toast.success(
        returnRequest.type === "replace"
          ? "Replacement request cancelled successfully"
          : "Return request cancelled successfully"
      );
      // Re-fetch order and return/replace request to update UI and status
      await fetchOrder();
      try {
        const res = await axios.get(`/orders/${order.id}/return-replace`);
        setReturnRequest(res.data);
      } catch {
        setReturnRequest(null);
      }
    } catch (err: any) {
      console.error("Failed to cancel return/replace request:", err);
      const backendMsg = err?.response?.data?.error || err?.response?.data?.message;
      toast.error(backendMsg || "Unable to cancel request right now");
      if (backendMsg && backendMsg.toLowerCase().includes("no pending request")) {
        setReturnRequest(null);
      }
    }
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

  const effectiveStatus = getEffectiveOrderStatus(order, returnRequest);
  const statusInfo = getStatusInfo(effectiveStatus, returnRequest);
  // Always use the label for display, fallback to capitalized status if missing
  const statusDisplayLabel = statusInfo && statusInfo.label ? statusInfo.label : (effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1).replace(/_/g, ' '));
  const trackingSteps = getTrackingSteps(effectiveStatus, order.createdAt, returnRequest);
  const expectedTrackingLabels = new Set(["Order Packed", "Order Shipped", "Order Delivered"]);
  const paymentMethodNormalized = String(order.paymentMethod ?? "").toLowerCase().trim();
  const isCashOnDelivery =
    paymentMethodNormalized === "cod" ||
    paymentMethodNormalized === "cash on delivery" ||
    paymentMethodNormalized === "cash_on_delivery";
  const isPrepaidMethod =
    paymentMethodNormalized.includes("card") ||
    paymentMethodNormalized === "upi" ||
    paymentMethodNormalized.includes("net banking") ||
    paymentMethodNormalized.includes("netbanking") ||
    paymentMethodNormalized.includes("internet banking");

  let effectivePaymentStatus = "pending";
  if (isPrepaidMethod) {
    if (effectiveStatus === "cancelled" || effectiveStatus === "returned") {
      effectivePaymentStatus = "refunded";
    } else if (effectiveStatus === "delivered" || effectiveStatus === "order_replaced") {
      effectivePaymentStatus = "paid";
    } else {
      effectivePaymentStatus = "paid";
    }
  } else if (isCashOnDelivery) {
    if (effectiveStatus === "cancelled") {
      effectivePaymentStatus = "cancel";
    } else if (effectiveStatus === "returned") {
      effectivePaymentStatus = "refunded";
    } else if (effectiveStatus === "delivered" || effectiveStatus === "order_replaced") {
      effectivePaymentStatus = "paid";
    } else {
      effectivePaymentStatus = "pending";
    }
  } else {
    // fallback to whatever is in order.paymentStatus
    effectivePaymentStatus = String(order.paymentStatus ?? "pending").toLowerCase();
  }
  const payableAmount = order.totalAmount * 1.18;

  // FORMAT INR
  const formatINR = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

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
              <h1 data-testid="order-id" className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                Order #{order.orderNumber}
              </h1>
              <p data-testid="order-date" className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
              {/* 🔥 ADD THIS FOR TESTING */}
<span data-testid="order-createdAt" hidden>
  {order.createdAt}
</span>
            </div>
            <div
             data-testid="order-status" className={`px-6 py-3 rounded-xl font-semibold border-2 ${statusInfo.color} flex items-center gap-2`}
            >
              {statusInfo.icon}
              {statusDisplayLabel}
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
                  <div key={index}  data-testid={`tracking-step-${step.label.toLowerCase().replace(/\s/g, '-')}`} className="flex items-center mb-8 last:mb-0">
                    
                    <div
                    data-testid={`tracking-icon-${step.label.toLowerCase().replace(/\s/g, '-')}`}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold z-10 ${
                        step.isCancelled
                          ? "bg-red-500 text-white"
                          : step.label === "Return Requested"
                          ? "bg-orange-400 text-white"
                          : step.label === "Order Picked"
                          ? step.completed
                            ? "bg-orange-600 text-white"
                            : "bg-orange-100 text-orange-500"
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
                          step.label === "Return Requested"
                            ? "bg-orange-400"
                            : step.completed
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                        style={{ top: `${index * 5 + 3}rem` }}
                      />
                    )}

                    <div className="ml-4">
                      <p
                        data-testid={`tracking-text-${step.label.toLowerCase().replace(/\s/g, '-')}`}
                        className={`font-semibold ${
                          step.label === "Return Requested"
                            ? "text-orange-700"
                            : step.label === "Order Picked"
                            ? step.completed
                              ? "text-orange-800"
                              : "text-orange-400"
                            : step.completed
                            ? "text-gray-800"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.date && step.completed && (
                        <p data-testid={`tracking-date-actual-${step.label.toLowerCase().replace(/\s/g, '-')}`} className="text-sm text-gray-500">
                          {new Date(step.date).toLocaleDateString("en-IN")}
                        </p>
                      )}
                      {step.date && !step.completed && (expectedTrackingLabels.has(step.label) || ((step.label === "Order Picked" || step.label === "Order Replaced"))) && (
                        <p data-testid={`tracking-date-expected-${step.label.toLowerCase().replace(/\s/g, '-')}`} className="text-sm text-indigo-600">
                          {`Expected: ${new Date(step.date).toLocaleDateString("en-IN")}`}
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
                {(() => {
                  const usedDisplayIndexes = new Set<number>();
                  return order.items.map((item) => {
                  const display = matchDisplaySnapshotItem(displayItems, item, usedDisplayIndexes);
                  const title = display?.name || item.displayName || item.product.name;
                  const brand = display?.brand || item.displayBrand || item.product.brand;
                  const image = getProductImageSrc(display?.image || item.displayImage || item.product.image, item.product.id);

                  return (
                    <div
                      key={item.id}
                      data-testid="order-item-card"
                      className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-white shadow-md flex-shrink-0">
                          <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 data-testid="product-name" className="font-bold text-gray-800 text-base sm:text-lg leading-snug line-clamp-2">{title}</h3>
                          <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">{brand}</p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span data-testid="product-qty" className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                              Qty: {item.quantity}
                            </span>
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                              {formatINR(item.price)} each
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {item.product.category}
                            </span>
                          </div>
                        </div>

                        <div className="hidden sm:block text-right pl-3">
                          <p data-testid="product-price" className="text-xl sm:text-2xl font-bold text-purple-500 whitespace-nowrap">
                            {formatINR(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between rounded-xl bg-white/90 px-3 py-2 sm:hidden">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Item Total</span>
                        <span data-testid="order-item-total" className="text-lg font-bold text-purple-600">{formatINR(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  );
                });
                })()}
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

              <div data-testid="shipping-address" className="space-y-3 text-gray-700">
                <p className="font-semibold">{order.shippingAddress}</p>
                <p>
                  {order.shippingCity}, {order.shippingState} {order.shippingZip}
                </p>
                <p>{order.shippingCountry}</p>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-gray-500" />
                    <span data-testid="shipping-phone">{order.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-gray-500" />
                    <span data-testid="shipping-email">{order.email}</span>
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
                  <span data-testid="payment-method" className="font-semibold capitalize">
                    {order.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span
                    data-testid="payment-status"
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${effectivePaymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : effectivePaymentStatus === "refunded"
                        ? "bg-blue-100 text-blue-700"
                        : effectivePaymentStatus === "cancel"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"}
                    `}
                  >
                    {effectivePaymentStatus.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {effectivePaymentStatus === "paid" ? "Paid Amount" : "Amount"}
                  </span>
                  <span data-testid="payment-amount" className="font-semibold text-gray-800">
                    {formatINR(payableAmount)}
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
                  <span data-testid="subtotal">{formatINR(order.totalAmount)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>

                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span data-testid="gst">{formatINR(order.totalAmount * 0.18)}</span>
                </div>

                <div className="flex justify-between text-2xl font-bold text-gray-800 border-t-2 border-gray-300 pt-4">
                  <span>Total</span>
                  <span data-testid="order-total" className="text-purple-600">
                    {formatINR(order.totalAmount * 1.18)}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.print()}
                className="w-full rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 via-orange-100 to-rose-100 py-3 font-semibold text-amber-900 shadow-lg shadow-amber-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:from-amber-100 hover:via-orange-200 hover:to-rose-200 hover:shadow-xl"
              >
                Print Invoice
              </button>

              {!["delivered", "cancelled", "returned", "return_requested"].includes(effectiveStatus) && (
                  <button
                    onClick={handleCancelOrder}
                    className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl shadow-lg hover:bg-red-600 hover:scale-105 transition-all"
                  >
                    Cancel Order
                  </button>
                )}

              {effectiveStatus === "delivered" && (!returnRequest || returnRequest.status !== "pending") && !requestType && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRequestType("return")}
                    className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-orange-600 hover:via-amber-600 hover:to-rose-600 hover:shadow-xl"
                  >
                    Order Return
                  </button>
                  <button
                    onClick={() => setRequestType("replace")}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-4 py-3 font-semibold text-white shadow-lg shadow-teal-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-cyan-600 hover:via-teal-600 hover:to-emerald-600 hover:shadow-xl"
                  >
                    Order Replace
                  </button>
                </div>
              )}

              {requestType && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="mb-2 text-sm font-semibold text-gray-800">
                    {requestType === "replace" ? "Replacement" : "Return"} Reason
                  </p>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Please tell us the reason..."
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-orange-400"
                    rows={3}
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleSubmitReturnReplaceRequest}
                      className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Submit Request
                    </button>
                    <button
                      onClick={() => {
                        setRequestType(null);
                        setRequestReason("");
                      }}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {effectiveStatus === "return_requested" && returnRequest && returnRequest.status === "pending" && (
                <div className="space-y-2">
                  <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                    {returnRequest.type === "replace" ? "Replacement" : "Return"} request submitted. Status will update to
                    {" "}<span className="font-semibold">{returnRequest.type === "replace" ? "Order Replaced" : "Order Picked"}</span> after 1 day.
                  </p>
                  {returnRequest.type === "return" && (
                    <button
                      onClick={handleCancelReturnReplaceRequest}
                      className="w-full rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-orange-300/40 transition-all duration-300 hover:-translate-y-0.5 hover:from-rose-600 hover:via-orange-600 hover:to-amber-600 hover:shadow-xl"
                    >
                      Return Cancel
                    </button>
                  )}
                  {returnRequest.type === "replace" && (
                    <button
                      onClick={handleCancelReturnReplaceRequest}
                      className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-rose-300/40 transition-all duration-300 hover:-translate-y-0.5 hover:from-fuchsia-600 hover:via-rose-600 hover:to-orange-600 hover:shadow-xl"
                    >
                      Cancel Replace
                    </button>
                  )}
                </div>
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
