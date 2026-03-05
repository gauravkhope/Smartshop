
import React, { useState, useCallback } from "react";
import ProductCard from "./ProductCard";
import { Check } from "lucide-react";
import { useCart } from "../app/context/CartContext";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  brand?: string;
  category?: string;
  mainCategory?: string;
}

interface MoreProductsSectionProps {
  products: Product[];
}

export default function MoreProductsSection({ products }: MoreProductsSectionProps) {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [burstingId, setBurstingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ id: string; message: string } | null>(null);
  const { addToCart } = useCart();

  const toggleWishlist = useCallback((id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
    setBurstingId(id);
    setTimeout(() => setBurstingId(null), 900);
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      brand: product.brand || "Unknown Brand",
      price: product.price,
      image: product.image,
      category: product.category,
      mainCategory: product.mainCategory,
    };
    addToCart(cartItem);
  }, [addToCart]);

  if (!products || products.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No more products available.
      </div>
    );
  }

  return (
    <>
      {/* ✅ Toast Notification */}
      <div className="fixed top-6 right-6 z-50 pointer-events-none">
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 dark:bg-gray-900 rounded-lg px-4 py-2 shadow-lg flex items-center gap-3 min-w-[220px] border"
          >
            <div className="bg-green-50 dark:bg-green-900/30 rounded-full p-1">
              <Check className="text-green-600" size={18} />
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-100">{toast.message}</div>
          </div>
        )}
      </div>

      {/* ✅ Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="w-full animate-sequential-slide"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ProductCard
              product={product}
              isWishlisted={wishlist.includes(product.id)}
              isBursting={burstingId === product.id}
              onToggleWishlist={() => toggleWishlist(product.id)}
              onAddToCart={() => handleAddToCart(product)}
              isHomepageProduct={true}
            />
          </div>
        ))}
      </div>
    </>
  );
}
                   