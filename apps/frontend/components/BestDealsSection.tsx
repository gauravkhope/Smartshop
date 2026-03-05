import React, { useState, useCallback } from "react";
import ProductCard from "./ProductCard";
import { useCart } from "../app/context/CartContext";

interface Product {
  id: number;
  name: string;
  image: string;
  price: string | number;
  brand?: string;
  category?: string;
  mainCategory?: string;
}

interface BestDealsSectionProps {
  products: Product[];
  title?: string;
  seeAllLink?: string;
  previewCount?: number;
}

const BestDealsSection: React.FC<BestDealsSectionProps> = ({
  products,
  title = "🔥 Best Deals",
  seeAllLink,
  previewCount = 10,
}) => {
  // Wishlist and heart animation state (local)
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [burstingId, setBurstingId] = useState<number | null>(null);
  const { addToCart } = useCart();

  // Handle wishlist toggle (local version) - optimized with useCallback
  const toggleWishlist = useCallback((id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
    setBurstingId(id);
    setTimeout(() => setBurstingId(null), 800);
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      brand: product.brand || "Unknown Brand",
      price: typeof product.price === 'string' ? parseFloat(product.price.replace(/,/g, '')) : product.price,
      image: product.image,
      category: product.category,
      mainCategory: product.mainCategory,
    };
    addToCart(cartItem);
  }, [addToCart]);

  // Only show limited products on homepage
  const visibleProducts = products.slice(0, previewCount);

  return (
    <section className="max-w-7xl mx-auto px-6 mt-14 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          {title}
        </h2>

        {seeAllLink && (
          <a
            href={seeAllLink}
            className="text-sm text-blue-600 hover:underline"
          >
            See all →
          </a>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {visibleProducts.map((p, index) => (
          <div
            key={p.id}
            className="w-full animate-sequential-slide"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <ProductCard
              product={p}
              isWishlisted={wishlist.includes(p.id)}
              isBursting={burstingId === p.id}
              onToggleWishlist={() => toggleWishlist(p.id)}
              onAddToCart={() => handleAddToCart(p)}
              isHomepageProduct={true}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestDealsSection;
