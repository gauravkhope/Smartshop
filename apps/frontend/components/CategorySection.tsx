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

interface CategorySectionProps {
  title: string;
  products: Product[];
  seeAllLink?: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  products,
  seeAllLink,
}) => {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [burstingId, setBurstingId] = useState<number | null>(null);
  const { addToCart } = useCart();

  const toggleWishlist = useCallback((id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
    setBurstingId(id);
    setTimeout(() => setBurstingId(null), 1200); // 💖 slow 3 hearts
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

  // Only 5 products visible on homepage
  const visibleProducts = products.slice(0, 5);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 mt-8 sm:mt-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2 line-clamp-1">
          {title}
        </h2>
        {seeAllLink && (
          <a
            href={seeAllLink}
            className="text-xs sm:text-sm text-blue-600 hover:underline font-medium whitespace-nowrap"
          >
            See All →
          </a>
        )}
      </div>

      {/* Product Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
        style={{ justifyItems: "center" }}
      >
        {visibleProducts.map((product, index) => (
          <div
            key={product.id}
            className="w-full animate-sequential-slide"
            style={{ animationDelay: `${index * 0.1}s` }}
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
    </section>
  );
};

export default CategorySection;
