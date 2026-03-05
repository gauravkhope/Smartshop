"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, ArrowLeft, X } from "lucide-react";
import { useWishlist } from "@/app/context/WishlistContext";
import { useCart } from "@/app/context/CartContext";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      image: item.image,
      category: item.category,
      mainCategory: item.mainCategory,
    });
  };

  const handleMoveToCart = (item: any) => {
    handleAddToCart(item);
    removeFromWishlist(item.id);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  // --------------------------------------------------------------------
  // EMPTY WISHLIST UI
  // --------------------------------------------------------------------
  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            <h1 className="text-4xl font-bold text-gray-800">My Wishlist</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center">
              <Heart size={64} className="text-red-400" />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Your Wishlist is Empty
            </h2>

            <p className="text-gray-600 mb-8 text-lg">
              Save your favorite items here and never lose track of them!
            </p>

            <button
              onClick={() => router.push("/products")}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Explore Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------
  // MAIN WISHLIST PAGE
  // --------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            <h1 className="text-4xl font-bold text-gray-800">
              My Wishlist ({wishlist.length})
            </h1>
          </div>

          <button
            onClick={clearWishlist}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-semibold"
          >
            <Trash2 size={20} />
            Clear All
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item, index) => (
            <div
              key={`wishlist-${item.id}-${index}`}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:scale-105 group relative"
            >
              {/* Remove Icon */}
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-red-50 hover:scale-110 transition-all"
              >
                <X size={20} className="text-red-500" />
              </button>

              {/* Discount Badge */}
              {item.discount && (
                <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {item.discount}% OFF
                </div>
              )}

              {/* Product Image */}
              <div
                className="relative h-64 bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/details/${item.id}`)}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div className="text-sm font-semibold text-orange-600 uppercase">
                  {item.brand}
                </div>

                <h3
                  className="text-lg font-bold text-gray-800 line-clamp-2 cursor-pointer hover:text-orange-500 transition"
                  onClick={() => router.push(`/details/${item.id}`)}
                >
                  {item.name}
                </h3>

                {item.category && (
                  <div className="text-xs text-gray-500">{item.category}</div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {formatPrice(item.price)}
                  </span>

                  {item.discount && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(item.price * (1 + item.discount / 100))}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  {isInCart(item.id) ? (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      <ShoppingCart size={20} />
                      Add More
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      <ShoppingCart size={20} />
                      Move to Cart
                    </button>
                  )}

                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={18} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push("/products")}
            className="px-8 py-4 bg-white text-gray-800 border-2 border-gray-300 rounded-xl font-bold text-lg hover:border-orange-500 hover:text-orange-500 hover:shadow-lg transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
