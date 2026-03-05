"use client";
import React from "react";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

interface Product {
  id: number | string;
  name: string;
  image: string;
  price: string | number;
  brand?: string;
  category?: string;
  mainCategory?: string;
}

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  isBursting?: boolean;
  onToggleWishlist?: (id: number | string) => void;
  onAddToCart?: (product: Product) => void;
  isHomepageProduct?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted = false,
  isBursting = false,
  onToggleWishlist,
  onAddToCart,
  isHomepageProduct = false,
}) => {
  const { addToCart, isInCart } = useCart();

  if (!product) return null;

  const getNumericId = (id: string | number): number => {
    if (typeof id === "number") return id;

    const parsed = parseInt(id);
    if (!isNaN(parsed)) return parsed;

    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product || !product.id) {
      console.error("Invalid product data:", product);
      return;
    }

    const numericId = getNumericId(product.id);

    const cartItem = {
      id: numericId,
      name: product.name || "Unknown Product",
      brand: product.brand || "Unknown Brand",
      price:
        typeof product.price === "string"
          ? parseFloat(product.price.replace(/,/g, ""))
          : product.price || 0,
      image: product.image || "",
      category: product.category,
      mainCategory: product.mainCategory,
    };

    addToCart(cartItem);
  };

  const productInCart = isInCart(getNumericId(product.id));

  const detailRoute = isHomepageProduct
    ? `/home-product/${product.id}`
    : `/details/${product.id}`;

  const getImageKeywords = (name: string) => {
    const commonWords = [
      "variant",
      "edition",
      "model",
      "the",
      "a",
      "an",
      "for",
      "with",
      "and",
      "or",
    ];
    const words = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 &&
          !commonWords.includes(word) &&
          !/^\d+$/.test(word)
      )
      .slice(0, 3);
    return words.join("+");
  };

  const imageKeywords = getImageKeywords(product.name);
  const fallbackImageUrl = `https://picsum.photos/seed/${product.id}/600/600`;

  return (
    <Link href={detailRoute}>
      <div data-testid="trending-product-card"
        className="group relative flex-shrink-0 w-full
  bg-gradient-to-br from-[#fffaf0] via-[#fff7e6] to-[#fef3d7]
  dark:from-[#2a2a2a] dark:via-[#1f1f1f] dark:to-[#141414]
  border border-[#f5deb3]/40 rounded-2xl shadow-md 
  hover:shadow-[0_10px_40px_-10px_rgba(255,107,107,0.4),0_10px_40px_-10px_rgba(251,146,60,0.4),0_10px_40px_-10px_rgba(236,72,153,0.4)]
  hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
  overflow-hidden flex flex-col justify-between"
      >
        {/* Product Image */}
        <div className="relative h-52 flex items-center justify-center overflow-hidden rounded-t-2xl bg-gray-100">
          <img
            src={
              product.image && product.image.trim() !== ""
                ? product.image
                : fallbackImageUrl
            }
            alt={product.name}
            className="object-cover w-full h-52 rounded-t-2xl transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallbackAttempted) {
                target.dataset.fallbackAttempted = "true";
                target.src = fallbackImageUrl;
              } else {
                target.src =
                  "https://via.placeholder.com/400x300/f0f0f0/666666?text=Product";
              }
            }}
          />

          {/* ❤️ Wishlist FIXED */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // ⛔ prevents product page navigation

              onToggleWishlist?.(product.id);

              toast.success(
                isWishlisted
                  ? `${product.name} removed from wishlist 💔`
                  : `${product.name} added to wishlist 💖`
              );
            }}
            className={`absolute top-3 right-3 z-20 transition-transform duration-300 hover:scale-110 ${
              isBursting ? "animate-heartPop" : ""
            }`}
          >
            <Heart
              size={22}
              className={`transition-all duration-500 ${
                isWishlisted
                  ? "fill-[url(#heartGradient)] text-transparent drop-shadow-[0_0_8px_rgba(255,120,100,0.6)]"
                  : "text-gray-400 hover:text-red-500"
              }`}
            />

            <svg width="0" height="0">
              <defs>
                <linearGradient
                  id="heartGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop stopColor="#ff4d4d" offset="0%" />
                  <stop stopColor="#ff9966" offset="50%" />
                  <stop stopColor="#ff66b2" offset="100%" />
                </linearGradient>
              </defs>
            </svg>

            {isBursting && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="animate-floatHeart absolute text-pink-400 text-sm left-0">
                  ❤
                </span>
                <span className="animate-floatHeart2 absolute text-red-400 text-sm left-1/2">
                  ❤
                </span>
                <span className="animate-floatHeart3 absolute text-orange-400 text-sm right-0">
                  ❤
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="p-4 text-center">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white line-clamp-1">
            {product.name}
          </h3>
          <p className="text-orange-600 dark:text-orange-400 font-bold mt-1">
            ₹{product.price}
          </p>
        </div>

        <div
          className={`absolute bottom-[-45px] left-0 right-0 text-white text-center py-2 transform transition-all duration-500
        ease-[cubic-bezier(0.28,1.65,0.32,1)]
        rounded-b-2xl opacity-0 group-hover:opacity-100 group-hover:bottom-0
        cursor-pointer
        ${
          productInCart
            ? "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.7),0_0_40px_rgba(20,184,166,0.5)] group-hover:shadow-[0_0_35px_rgba(16,185,129,0.9),0_0_60px_rgba(20,184,166,0.7)] animate-gradient-shift"
            : "bg-gradient-to-r from-red-500 via-orange-400 to-pink-500 shadow-[0_0_15px_rgba(255,100,70,0.6)] group-hover:shadow-[0_0_30px_rgba(255,130,100,0.9)]"
        }`}
        >
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-2 w-full font-medium tracking-wide"
          >
            <ShoppingCart size={16} />
            {productInCart ? "In Cart ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;


