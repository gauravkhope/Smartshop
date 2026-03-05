"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

interface Product {
  id: number | string;
  name: string;
  image: string;
  price: string | number;
}

interface TrendingCarouselProps {
  products: Product[];
}

const TrendingCarousel: React.FC<TrendingCarouselProps> = ({
  products = [],
}) => {
  const [current, setCurrent] = useState(0);
  const [wishlist, setWishlist] = useState<(number | string)[]>([]);
  const [bursting, setBursting] = useState<number | string | null>(null);
  const itemsPerView = 4;
  const totalSlides = Math.ceil(products.length / itemsPerView);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const currentRef = useRef(0);

  const stopAutoSlide = useCallback(() => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
  }, []);

  const slide = useCallback((dir: "left" | "right") => {
    if (!containerRef.current) return;
    const c = containerRef.current;
    const next =
      dir === "right"
        ? (currentRef.current + 1) % totalSlides
        : (currentRef.current - 1 + totalSlides) % totalSlides;
    const nextPos = next * c.clientWidth;
    c.scrollTo({ left: nextPos, behavior: "smooth" });
    currentRef.current = next;
    setCurrent(next);
  }, [totalSlides]);

  const startAutoSlide = useCallback(() => {
    stopAutoSlide();
    autoSlideRef.current = setInterval(() => slide("right"), 3500);
  }, [slide, stopAutoSlide]);

  useEffect(() => {
    startAutoSlide();
    return stopAutoSlide;
  }, [startAutoSlide, stopAutoSlide]);

  const toggleWishlist = (id: number | string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
    setBursting(id);
    setTimeout(() => setBursting(null), 800);
  };

  return (
    <div
      className="relative max-w-7xl mx-auto px-4 mt-10 select-none"
      onMouseEnter={stopAutoSlide}
      onMouseLeave={startAutoSlide}
    >
      {/* Arrows */}
      <button data-testid="trending-prev"
        onClick={() => slide("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-10 shadow-md"
      >
        <ChevronLeft size={22} />
      </button>

      <button  data-testid="trending-next"
        onClick={() => slide("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-10 shadow-md"
      >
        <ChevronRight size={22} />
      </button>

      {/* Carousel */}
      <div
        ref={containerRef}
        className="overflow-x-auto sm:overflow-hidden flex gap-4 sm:gap-6 px-2 scrollbar-hide"
      >
        <div className="flex w-full gap-6 px-2">
          {products
            ?.filter((p) => p && p.image && p.name)
            .map((product, index) => (
              <div
                key={product.id}
                style={{ animationDelay: `${index * 0.1}s` }}
                className="group relative flex-shrink-0 w-[75%] sm:w-[45%] md:w-[calc(25%-16px)]
  bg-gradient-to-br from-[#fff6e5] via-[#ffe8d6] to-[#fff0e0]
  rounded-2xl shadow-md hover:shadow-xl transition-all duration-500"
              >
                <ProductCard
                  product={product}
                  isWishlisted={wishlist.includes(product.id)}
                  isBursting={bursting === product.id}
                  onToggleWishlist={toggleWishlist}
                  isHomepageProduct={true}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingCarousel;
