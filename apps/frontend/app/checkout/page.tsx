"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "@/lib/config";
import { createOrder } from "@/services/orderService";
import { saveOrderDisplaySnapshot } from "@/lib/orderDisplaySnapshot";
import toast from "react-hot-toast";
import { CreditCard, Truck, ShieldCheck, ArrowLeft, Package } from "lucide-react";
import Image from "next/image";
import PaymentModal from "@/components/PaymentModal";

const normalizeText = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");

const tokenSet = (value: unknown): Set<string> =>
  new Set(
    normalizeText(value)
      .split(" ")
      .filter((t) => t.length > 1)
  );

const tokenOverlapScore = (a: Set<string>, b: Set<string>): number => {
  if (a.size === 0 || b.size === 0) return 0;
  let common = 0;
  a.forEach((t) => {
    if (b.has(t)) common += 1;
  });
  return common / Math.max(a.size, b.size);
};

const toValidNumericId = (value: unknown): number | null => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const getCatalogProductName = (product: any): string =>
  normalizeText(product?.name ?? product?.title ?? product?.productName ?? "");

const getCatalogProductBrand = (product: any): string =>
  normalizeText(product?.brand ?? product?.manufacturer ?? "");

const getCatalogSearchText = (product: any): string =>
  normalizeText(`${product?.brand ?? ""} ${product?.name ?? product?.title ?? product?.productName ?? ""}`);

const SHIPPING_CHARGE_THRESHOLD = 499;
const SHIPPING_CHARGE_UNDER_THRESHOLD = 99;

const getShippingCharge = (subtotal: number): number =>
  subtotal > 0 && subtotal < SHIPPING_CHARGE_THRESHOLD ? SHIPPING_CHARGE_UNDER_THRESHOLD : 0;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart, buyNowItem, clearBuyNowItem, removeFromCart } = useCart();
  const { user } = useAuth();
  const hasShownToast = useRef(false);

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
  const hasCartItems = cart.length > 0;
  const checkoutItems = hasCartItems ? cart : buyNowItem ? [buyNowItem] : [];

  const summaryItems = checkoutItems.map((item) => ({
    price: Number(item.price),
    quantity: Number(item.quantity),
  }));
  const summarySubtotal = summaryItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const summaryShipping = getShippingCharge(summarySubtotal);
  const summaryTotal = summarySubtotal + summaryShipping;

  useEffect(() => {
    // Redirect if both cart and buyNowItem are empty
    if (cart.length === 0 && !buyNowItem) {
      router.push("/cart");
      return;
    }

    // Redirect if not logged in
    if (!user) {
      if (!hasShownToast.current) {
        toast.error("Please login to continue");
        hasShownToast.current = true;
      }
      router.push("/login");
      return;
    }

    // Set email from user
    if (user?.email) {
      setShippingData((prev) => ({ ...prev, email: user.email }));
    }
  }, [cart, buyNowItem, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "zip") {
      value = value.replace(/\D/g, "").slice(0, 6);
    }

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
    const itemsToOrder = checkoutItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      brand: item.brand,
      image: item.image,
    }));

    const subtotalAmount = summarySubtotal;
    const shippingAmount = getShippingCharge(subtotalAmount);
    const totalAmount = subtotalAmount + shippingAmount;

    // Generate temporary order ID for payment
    const tempOrderId = `temp_${Date.now()}_${user.id}`;

    const orderData = {
      tempOrderId, // Add temp ID for payment tracking
      userId: user.id,
      checkoutSource: hasCartItems ? "cart" : "buy-now",
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
      if (!tempOrderData) {
        throw new Error("Order data is missing. Please try checkout again.");
      }

      // Resolve homepage/static products to real DB product IDs, and also
      // verify numeric IDs actually exist in DB (to catch hashed synthetic IDs).
      const resolveOrderItems = async (rawItems: any[]) => {
        const baseUrl = API_BASE_URL.replace(/\/+$/, "");
        const catalogRes = await fetch(`${baseUrl}/api/products`);
        if (!catalogRes.ok) {
          throw new Error("Unable to load product catalog for order validation.");
        }

        const catalogJson = await catalogRes.json();
        const catalog = Array.isArray(catalogJson?.products) ? catalogJson.products : [];
        if (catalog.length === 0) {
          throw new Error("Product catalog is empty. Please try again.");
        }

        const existingIds = new Set<number>(
          catalog
            .map((p: any) => Number(p.id))
            .filter((id: number) => Number.isInteger(id) && id > 0)
        );

        const unresolved: string[] = [];
        const resolved = rawItems
          .map((item) => {
            const numericId = toValidNumericId(item.productId);
            if (numericId && existingIds.has(numericId)) {
              return {
                productId: numericId,
                sourceProductId: item.productId,
                name: item.name,
                brand: item.brand,
                image: item.image,
                quantity: Number(item.quantity),
                price: Number(item.price),
              };
            }

            const itemName = normalizeText(item.name);
            const itemBrand = normalizeText(item.brand);
            const itemSearchText = normalizeText(`${item.brand ?? ""} ${item.name ?? ""}`);
            const itemPrice = Number(item.price);

            const itemTokens = tokenSet(itemSearchText || item.name);

            let candidates = catalog.filter((p: any) => {
              const productName = getCatalogProductName(p);
              const productSearchText = getCatalogSearchText(p);
              return productName === itemName || (itemSearchText && productSearchText === itemSearchText);
            });
            if (itemBrand) {
              const brandMatched = candidates.filter((p: any) => getCatalogProductBrand(p) === itemBrand);
              if (brandMatched.length > 0) {
                candidates = brandMatched;
              }
            }

            if (candidates.length === 0) {
              candidates = catalog.filter((p: any) => {
                const productName = getCatalogProductName(p);
                const productSearchText = getCatalogSearchText(p);
                return (
                  (itemName && (productName.includes(itemName) || itemName.includes(productName))) ||
                  (itemSearchText &&
                    (productSearchText.includes(itemSearchText) || itemSearchText.includes(productSearchText)))
                );
              });
            }

            if (itemBrand && candidates.length > 1) {
              const brandMatched = candidates.filter((p: any) => getCatalogProductBrand(p) === itemBrand);
              if (brandMatched.length > 0) {
                candidates = brandMatched;
              }
            }

            // Fallback fuzzy matching: token overlap + optional brand + price distance.
            if (candidates.length === 0) {
              const scored = catalog
                .map((p: any) => {
                  const pBrand = getCatalogProductBrand(p);
                  const brandScore = itemBrand && pBrand === itemBrand ? 1 : 0;
                  const overlap = tokenOverlapScore(itemTokens, tokenSet(getCatalogSearchText(p)));
                  const priceDiff = Math.abs(Number(p.price) - itemPrice);
                  return { p, brandScore, overlap, priceDiff };
                });

              if (scored.length > 0) {
                scored.sort((a: any, b: any) => {
                  if (b.brandScore !== a.brandScore) return b.brandScore - a.brandScore;
                  if (b.overlap !== a.overlap) return b.overlap - a.overlap;
                  return a.priceDiff - b.priceDiff;
                });
                const best = scored[0];
                if (best && (best.brandScore > 0 || best.overlap > 0)) {
                  candidates = [best.p];
                }
              }
            }

            // Last fallback: if brand exists, choose closest-price product from same brand.
            if (candidates.length === 0 && itemBrand) {
              const brandPool = catalog.filter((p: any) => getCatalogProductBrand(p) === itemBrand);
              if (brandPool.length > 0) {
                brandPool.sort(
                  (a: any, b: any) => Math.abs(Number(a.price) - itemPrice) - Math.abs(Number(b.price) - itemPrice)
                );
                candidates = [brandPool[0]];
              }
            }

            // Final fallback: choose globally closest price so checkout can continue
            // even when product naming differs significantly between static UI and DB catalog.
            if (candidates.length === 0 && catalog.length > 0) {
              const catalogByPrice = [...catalog].sort(
                (a: any, b: any) => Math.abs(Number(a.price) - itemPrice) - Math.abs(Number(b.price) - itemPrice)
              );
              candidates = [catalogByPrice[0]];
            }

            if (candidates.length === 0) {
              unresolved.push(item.name || String(item.productId));
              return null;
            }

            candidates.sort((a: any, b: any) => {
              const diffA = Math.abs(Number(a.price) - itemPrice);
              const diffB = Math.abs(Number(b.price) - itemPrice);
              return diffA - diffB;
            });

            const matched = candidates[0];
            console.log(
              `🔗 Resolved order item "${item.name}" (${item.productId}) -> DB #${matched.id} (${matched.name})`
            );
            return {
              productId: Number(matched.id),
              sourceProductId: item.productId,
              name: item.name,
              brand: item.brand,
              image: item.image,
              quantity: Number(item.quantity),
              price: Number(item.price),
            };
          })
          .filter(Boolean);

        if (unresolved.length > 0 || resolved.length === 0) {
          throw new Error(`Some products could not be verified: ${unresolved.slice(0, 3).join(", ")}`);
        }

        return resolved;
      };

      const resolvedItems = await resolveOrderItems(tempOrderData.items || []);
      const normalizedTotal = resolvedItems.reduce(
        (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity),
        0
      );
      const normalizedShipping = getShippingCharge(normalizedTotal);

      // Now create the order with payment confirmed
      const orderDataWithPayment = {
        ...tempOrderData,
        items: resolvedItems,
        totalAmount:
          normalizedTotal > 0
            ? normalizedTotal + normalizedShipping
            : tempOrderData.totalAmount,
        paymentId, // Link payment to order
        paymentStatus: "paid",
      };

      console.log("🛒 Submitting order payload:", JSON.stringify(orderDataWithPayment, null, 2));

      const order = await createOrder(orderDataWithPayment);

      // Preserve original cart item display data for order confirmation UI.
      // This keeps homepage product name/image consistent even if we mapped to a nearby DB product ID.
      try {
        const rawItems = Array.isArray(tempOrderData.items) ? tempOrderData.items : [];
        const displayItems = resolvedItems.map((resolvedItem: any, index: number) => {
          const rawItem = rawItems[index] || {};
          return {
            orderProductId: Number(resolvedItem.productId),
            sourceProductId: Number(rawItem.productId),
            name: rawItem.name,
            brand: rawItem.brand,
            image: rawItem.image,
            quantity: Number(rawItem.quantity),
            price: Number(rawItem.price),
          };
        });

        saveOrderDisplaySnapshot(order.id, displayItems);
      } catch (storageError) {
        console.warn("Unable to store order display snapshot:", storageError);
      }
      
      // Clear cart or buyNowItem after successful order
      if (tempOrderData.checkoutSource === "cart") {
        clearCart();
      } else {
        clearBuyNowItem();
      }
      
      setShowPaymentModal(false);
      const isCashOnDelivery = String(tempOrderData.paymentMethod || paymentMethod).toLowerCase() === "cod";
      toast.success(isCashOnDelivery ? "Order Confirmed" : "Payment successful! Order placed 🎉");
      
      // Redirect to order confirmation
      // Ensure order has an ID before redirecting
      if (!order || !order.id) {
        console.error("❌ Order created but missing ID:", order);
        toast.error("Order created but confirmation page unavailable. Please check your orders page.");
        router.push("/orders");
        return;
      }
      
      console.log(`✅ Order #${order.id} created successfully, redirecting to confirmation...`);
      // Add a small delay to ensure database sync
      setTimeout(() => {
        router.push(`/order-confirmation/${order.id}`);
      }, 500);
    } catch (error: any) {
      console.error("Error creating order after payment:", error);
      console.error("❌ Request URL:", error.config?.url);
      console.error("❌ Response status:", error.response?.status);
      console.error("❌ Response headers:", JSON.stringify(error.response?.headers));
      console.error("❌ Backend error response:", JSON.stringify(error.response?.data));

      const missingProductIds = error.response?.data?.missingProductIds;

      if (Array.isArray(missingProductIds) && missingProductIds.length > 0) {
        missingProductIds.forEach((productId: number) => removeFromCart(Number(productId)));

        if (buyNowItem && missingProductIds.includes(buyNowItem.id)) {
          clearBuyNowItem();
        }

        setShowPaymentModal(false);
        toast.error("Some products in your cart are no longer available. We removed them. Please review your cart and try again.");
        router.push("/cart");
      } else {
        toast.error(error.response?.data?.error || error.message || "Failed to create order. Please contact support.");
      }
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push("/cart")}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft size={18} />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent line-clamp-2">
            Checkout
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Complete your order by filling in the details below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl">
                  <Truck size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Shipping Information</h2>
                  <p className="text-gray-600 text-xs sm:text-sm">Where should we deliver your order?</p>
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
                      inputMode="numeric"
                      maxLength={10}
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
            <div data-testid="payment-method" className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
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
            <div data-testid="checkout-order-summary" className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                  <Package size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
                  <p className="text-gray-600 text-sm">
                    {checkoutItems.length === 1 ? "1 item" : `${checkoutItems.length} items`}
                  </p>
                </div>
              </div>

              {/* Checkout Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {checkoutItems.map((item) => (
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
                        <p data-testid="checkout-item-quantity" className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p data-testid="checkout-item-price" className="font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Price Summary */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div data-testid="checkout-subtotal" className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{summarySubtotal.toFixed(2)}</span>
                </div>
                <div data-testid="checkout-shipping" className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {summaryShipping > 0 ? `₹${summaryShipping.toFixed(2)}` : <span className="text-green-600">FREE</span>}
                  </span>
                </div>
                <div data-testid="checkout-total" className="flex justify-between text-xl font-bold text-gray-800 border-t-2 border-gray-300 pt-3">
                  <span>Total</span>
                  <span className="text-orange-500">₹{summaryTotal.toFixed(2)}</span>
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
                  paymentMethod === "cod" ? "Proceed to COD" : "Proceed to Payment 💳"
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
          productName={
            checkoutItems.length === 1
              ? checkoutItems[0].name
              : `${checkoutItems[0].name} + ${checkoutItems.length - 1} more item${checkoutItems.length - 1 > 1 ? 's' : ''}`
          }
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
}
