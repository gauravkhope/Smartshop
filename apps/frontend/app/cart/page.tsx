"use client";

import { useCart } from "../context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Heart, ShoppingBag, Plus, Minus, ArrowRight } from "lucide-react";

export default function CartPage() {
  const {
    cart,
    savedForLater,
    removeFromCart,
    updateQuantity,
    clearCart,
    saveForLater,
    moveToCart,
    removeSavedItem,
    getCartTotal,
  } = useCart();

  const deliveryCharge = cart.length > 0 ? (getCartTotal() > 500 ? 0 : 40) : 0;
  const discount = Math.floor(getCartTotal() * 0.05); // 5% discount
  const finalTotal = getCartTotal() + deliveryCharge - discount;

  if (cart.length === 0 && savedForLater.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({cart.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cart Actions */}
          {cart.length > 0 && (
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-4">
              <p className="text-sm text-gray-600">{cart.length} item(s) in your cart</p>
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            </div>
          )}

          {/* Cart Items List */}
          {cart.map((item, index) => (
            <div
              key={`cart-${item.id}-${index}`}
              className="bg-white rounded-lg shadow-sm p-6 flex gap-6 hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden relative">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <Link
                      href={`/details/${item.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-orange-600"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">{item.brand}</p>
                    {item.category && (
                      <p className="text-xs text-gray-400 mt-1">{item.category}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">₹{item.price.toLocaleString()} each</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => saveForLater(item.id)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Save for Later
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Saved for Later */}
          {savedForLater.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Saved for Later ({savedForLater.length})
              </h2>
              <div className="space-y-4">
                {savedForLater.map((item, index) => (
                  <div
                    key={`saved-${item.id}-${index}`}
                    className="bg-white rounded-lg shadow-sm p-6 flex gap-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Heart className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex justify-between items-center">
                      <div>
                        <Link
                          href={`/details/${item.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-orange-600"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">{item.brand}</p>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          ₹{item.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => moveToCart(item.id)}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => removeSavedItem(item.id)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        {cart.length > 0 && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-semibold">₹{getCartTotal().toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-semibold">
                    {deliveryCharge === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (5%)</span>
                    <span className="font-semibold">-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <Link href="/checkout" className="w-full inline-flex items-center justify-center bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white py-4 rounded-lg font-bold text-lg mt-6 hover:shadow-xl transition-all">
                Proceed to Checkout
              </Link>

              <button
                onClick={clearCart}
                className="w-full inline-flex items-center justify-center gap-2 bg-red-100 text-red-600 py-3 rounded-lg font-semibold mt-3 hover:bg-red-200 transition-all border border-red-300"
              >
                <Trash2 className="w-5 h-5" />
                Clear Cart
              </button>

              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Safe and Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Easy Returns & Refunds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{deliveryCharge === 0 ? "Free Delivery" : "Delivery in 2-3 days"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
