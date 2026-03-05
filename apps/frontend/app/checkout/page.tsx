"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "@/services/orderService";
import toast from "react-hot-toast";
import { CreditCard, Truck, ShieldCheck, ArrowLeft, Package } from "lucide-react";
import Image from "next/image";
import PaymentModal from "@/components/PaymentModal";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart, buyNowItem, clearBuyNowItem } = useCart();
  const { user } = useAuth();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tempOrderData, setTempOrderData] = useState<any>(null);
  
  // Shipping form state
  const [shippingData, setShippingData] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    phone: "",
    email: user?.email || "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    // Redirect if both cart and buyNowItem are empty
    if (cart.length === 0 && !buyNowItem) {
      router.push("/cart");
    }

    // Redirect if not logged in
    if (!user) {
      router.push("/login");
      toast.error("Please login to continue");
    }

    // Set email from user
    if (user?.email) {
      setShippingData((prev) => ({ ...prev, email: user.email }));
    }
  }, [cart, buyNowItem, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { address, city, state, zip, phone, email } = shippingData;

    if (!address || !city || !state || !zip || !phone || !email) {
      toast.error("Please fill in all shipping fields");
      return false;
    }

    if (!/^\d{6}$/.test(zip)) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }

    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleProceedToPayment = () => {
    if (!validateForm()) return;
    if (!user) {
      toast.error("Please login to place order");
      return;
    }

    // Prepare order data but don't create order yet
    const itemsToOrder = buyNowItem 
      ? [{ productId: buyNowItem.id, quantity: buyNowItem.quantity, price: buyNowItem.price }]
      : cart.map((item) => ({ productId: item.id, quantity: item.quantity, price: item.price }));

    const totalAmount = buyNowItem 
      ? buyNowItem.price * buyNowItem.quantity 
      : getCartTotal();

    // Generate temporary order ID for payment
    const tempOrderId = `temp_${Date.now()}_${user.id}`;

    const orderData = {
      tempOrderId, // Add temp ID for payment tracking
      userId: user.id,
      items: itemsToOrder,
      totalAmount: totalAmount,
      paymentMethod,
      shippingAddress: shippingData.address,
      shippingCity: shippingData.city,
      shippingState: shippingData.state,
      shippingZip: shippingData.zip,
      shippingCountry: shippingData.country,
      phone: shippingData.phone,
      email: shippingData.email,
    };

    // Store order data temporarily and open payment modal
    setTempOrderData(orderData);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    setIsPlacingOrder(true);
    
    try {
      // Now create the order with payment confirmed
      const orderDataWithPayment = {
        ...tempOrderData,
        paymentId, // Link payment to order
        paymentStatus: "paid",
      };

      const order = await createOrder(orderDataWithPayment);
      
      // Clear cart or buyNowItem after successful order
      if (buyNowItem) {
        clearBuyNowItem();
      } else {
        clearCart();
      }
      
      setShowPaymentModal(false);
      toast.success("Payment successful! Order placed 🎉");
      
      // Redirect to order confirmation
      router.push(`/order-confirmation/${order.id}`);
    } catch (error: any) {
      console.error("Error creating order after payment:", error);
      toast.error(error.response?.data?.error || "Failed to create order. Please contact support.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
    setShowPaymentModal(false);
  };

  if ((cart.length === 0 && !buyNowItem) || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/cart")}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Checkout
          </h1>
          <p className="text-gray-600 mt-2">Complete your order by filling in the details below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl">
                  <Truck size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Shipping Information</h2>
                  <p className="text-gray-600 text-sm">Where should we deliver your order?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street, Apt 4B"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingData.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingData.state}
                      onChange={handleInputChange}
                      placeholder="Maharashtra"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={shippingData.zip}
                      onChange={handleInputChange}
                      placeholder="110001"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value="India"
                      readOnly
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={shippingData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <CreditCard size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Payment Method</h2>
                  <p className="text-gray-600 text-sm">Select your preferred payment method</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { value: "card", label: "Credit / Debit Card", icon: "💳" },
                  { value: "upi", label: "UPI", icon: "📱" },
                  { value: "netbanking", label: "Net Banking", icon: "🏦" },
                  { value: "emi", label: "EMI", icon: "💰" },
                  { value: "cod", label: "Cash On Delivery", icon: "💵" },
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      paymentMethod === method.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <span className="font-semibold text-gray-800">{method.label}</span>
                    {paymentMethod === method.value && (
                      <span className="ml-auto text-orange-500">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    <ShieldCheck size={16} className="inline mr-2" />
                    This is a demo. No actual payment will be processed.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                  <Package size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
                  <p className="text-gray-600 text-sm">
                    {buyNowItem ? "1 item" : `${cart.length} items`}
                  </p>
                </div>
              </div>

              {/* Cart Items or Buy Now Item */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {buyNowItem ? (
                  <div key={buyNowItem.id} className="flex gap-3 items-center pb-4 border-b border-gray-100">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={buyNowItem.image || "/placeholder.jpg"}
                        alt={buyNowItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">{buyNowItem.name}</h3>
                      <p className="text-xs text-gray-500">{buyNowItem.brand}</p>
                      <p className="text-sm text-gray-600 mt-1">Qty: {buyNowItem.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">₹{(buyNowItem.price * buyNowItem.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center pb-4 border-b border-gray-100">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-gray-500">{item.brand}</p>
                        <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Price Summary */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>
                    ₹{buyNowItem 
                      ? (buyNowItem.price * buyNowItem.quantity).toFixed(2) 
                      : getCartTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>
                    ₹{buyNowItem 
                      ? ((buyNowItem.price * buyNowItem.quantity) * 0.08).toFixed(2) 
                      : (getCartTotal() * 0.08).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-800 border-t-2 border-gray-300 pt-3">
                  <span>Total</span>
                  <span className="text-orange-500">
                    ₹{buyNowItem 
                      ? ((buyNowItem.price * buyNowItem.quantity) * 1.08).toFixed(2) 
                      : (getCartTotal() * 1.08).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Proceed to Payment Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={isPlacingOrder || showPaymentModal}
                className={`w-full mt-6 py-4 rounded-xl font-bold text-white text-lg shadow-xl transition-all ${
                  isPlacingOrder || showPaymentModal
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:shadow-2xl hover:scale-105"
                }`}
              >
                {isPlacingOrder ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Order...
                  </span>
                ) : (
                  "Proceed to Payment 💳"
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By proceeding, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {tempOrderData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderId={tempOrderData.tempOrderId} // Use temporary order ID for payment
          amount={Math.round(tempOrderData.totalAmount * 100)} // Convert to paise/cents
          currency="INR"
          initialMethod={paymentMethod as any}
          productName={buyNowItem
            ? buyNowItem.name
            : cart.length === 1
              ? cart[0].name
              : `${cart[0].name} + ${cart.length - 1} more item${cart.length - 1 > 1 ? 's' : ''}`}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
}
