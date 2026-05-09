"use client";

import React, { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import GlassMorphismSkeletonLoader from "@/components/GlassMorphismSkeleton";
import homepageData from "@/data/homepageData";

const HeroCarousel = dynamic(() => import("@/components/HeroCarousel"), {
  loading: () => <div className="glass-skeleton-card !h-[220px] sm:!h-[300px]" />,
});

const TrendingCarousel = dynamic(() => import("@/components/TrendingCarousel"), {
  loading: () => <GlassMorphismSkeletonLoader count={5} />,
});

const CategorySection = dynamic(() => import("@/components/CategorySection"), {
  loading: () => <GlassMorphismSkeletonLoader count={5} />,
});

const BestDealsSection = dynamic(() => import("@/components/BestDealsSection"), {
  loading: () => <GlassMorphismSkeletonLoader count={5} />,
});

const MoreProductsSection = dynamic(() => import("@/components/MoreProductSection"), {
  loading: () => <GlassMorphismSkeletonLoader count={10} fullSize />,
});

export default function HomePage() {
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const hasLoadedBefore = window.localStorage.getItem("home_page_loaded_once") === "true";
    const loadingDurationMs = hasLoadedBefore ? 2000 : 6000;
    window.localStorage.setItem("home_page_loaded_once", "true");

    const timer = window.setTimeout(() => {
      setShowSkeleton(false);
    }, loadingDurationMs);

    return () => window.clearTimeout(timer);
  }, []);

  // Memoize data processing to avoid recalculation on every render
  const processedData = useMemo(() => {
    const data = homepageData || {};
    return {
      heroBanners: Array.isArray(data.heroBanners) ? data.heroBanners.map((banner: any) => ({
        ...banner,
        image: typeof banner.image === 'string' ? banner.image : banner.image.src,
      })) : [],
      trending: Array.isArray(data.trending) ? data.trending : [],
      mobiles: Array.isArray(data.mobiles) ? data.mobiles.slice(0, 5) : [],
      laptops: Array.isArray(data.laptops) ? data.laptops.slice(0, 5) : [],
      appliances: Array.isArray(data.appliances) ? data.appliances.slice(0, 5) : [],
      clothes: Array.isArray(data.clothes) ? data.clothes.slice(0, 5) : [],
      footwear: Array.isArray(data.footwear) ? data.footwear.slice(0, 5) : [],
      bestDeals: Array.isArray(data.bestDeals) ? data.bestDeals.slice(0, 10) : [],
      moreProducts: Array.isArray(data.moreProducts) ? data.moreProducts.slice(0, 20) : [], // Reduced from 200 to 20
    };
  }, []);

  return (
    <>
      {showSkeleton && (
        <div className="fixed inset-x-0 bottom-0 top-20 md:top-16 z-[100] overflow-y-auto bg-orange-50/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 space-y-8 sm:space-y-12 py-8 sm:py-12 pb-10">
            <div className="glass-skeleton-card home-lux-shimmer !h-[220px] sm:!h-[300px]">
              <div className="home-lux-shimmer-beam" />
              <div className="home-lux-shimmer-beam home-lux-shimmer-beam-soft" />
              <div className="home-lux-shimmer-spark" />
            </div>

            <div className="glass-skeleton-card home-lux-shimmer home-lux-shimmer-delayed !h-[200px] sm:!h-[240px]">
              <div className="home-lux-shimmer-beam" />
              <div className="home-lux-shimmer-beam home-lux-shimmer-beam-soft" />
              <div className="home-lux-shimmer-spark" />
            </div>

            <div>
              <div className="glass-skeleton-line !w-64 !h-8 mb-5" />
              <GlassMorphismSkeletonLoader count={5} fullSize />
            </div>

            <div className="space-y-6">
              <div className="glass-skeleton-line !w-52 !h-8" />
              <GlassMorphismSkeletonLoader count={5} fullSize />
              <GlassMorphismSkeletonLoader count={5} fullSize />
            </div>

            <div>
              <div className="glass-skeleton-line !w-44 !h-8 mb-5" />
              <GlassMorphismSkeletonLoader count={5} fullSize />
            </div>

            <div>
              <div className="glass-skeleton-line !w-56 !h-8 mb-5" />
              <GlassMorphismSkeletonLoader count={10} fullSize />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes homeLuxSweep {
          0% {
            transform: translateX(-130%) rotate(10deg);
          }
          100% {
            transform: translateX(130%) rotate(10deg);
          }
        }

        @keyframes homeLuxGlow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.03);
          }
        }

        @keyframes homeLuxSparkle {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.72; }
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-border {
          position: relative;
          background: linear-gradient(270deg, #ff6b6b, #f06595, #cc5de8, #845ef7);
          background-size: 400% 400%;
          animation: gradientShift 3s ease infinite;
        }

        .home-lux-shimmer {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .home-lux-shimmer::before {
          content: "";
          position: absolute;
          inset: -20%;
          pointer-events: none;
          background:
            radial-gradient(80% 70% at 10% 15%, rgba(255, 255, 255, 0.25), transparent 70%),
            radial-gradient(90% 75% at 90% 85%, rgba(255, 220, 160, 0.18), transparent 75%);
          animation: homeLuxGlow 3.2s ease-in-out infinite;
          z-index: 1;
        }

        .home-lux-shimmer-beam {
          position: absolute;
          inset: -35% -25%;
          pointer-events: none;
          background: linear-gradient(
            95deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 248, 230, 0.14) 28%,
            rgba(255, 245, 210, 0.82) 48%,
            rgba(255, 220, 120, 0.42) 62%,
            rgba(255, 255, 255, 0) 100%
          );
          filter: blur(1px);
          mix-blend-mode: screen;
          animation: homeLuxSweep 2.25s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          z-index: 2;
        }

        .home-lux-shimmer-beam-soft {
          opacity: 0.55;
          filter: blur(6px);
          animation-duration: 2.8s;
          animation-delay: 0.28s;
        }

        .home-lux-shimmer-spark {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 18% 30%, rgba(255, 255, 255, 0.92) 0 1px, transparent 2px),
            radial-gradient(circle at 76% 44%, rgba(255, 240, 200, 0.85) 0 1.5px, transparent 2.5px),
            radial-gradient(circle at 56% 70%, rgba(255, 255, 255, 0.72) 0 1px, transparent 2px);
          animation: homeLuxSparkle 2.2s ease-in-out infinite;
          z-index: 3;
        }

        .home-lux-shimmer-delayed .home-lux-shimmer-beam {
          animation-delay: 0.5s;
        }

        .home-lux-shimmer-delayed .home-lux-shimmer-beam-soft {
          animation-delay: 0.8s;
        }

        .home-lux-shimmer-delayed .home-lux-shimmer-spark {
          animation-delay: 0.35s;
        }
      `}</style>

      <main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* HERO */}
        <section className="mb-8 sm:mb-12">
          <HeroCarousel banners={processedData.heroBanners} />
        </section>

        {/* Premium Promo Banner */}
        <section className="mb-8 sm:mb-12 max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-6 sm:p-8 md:p-12 shadow-2xl">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10 animate-pulse">
              <svg className="w-full h-full" viewBox="0 0 600 200">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="600" height="200" fill="url(#grid)" />
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 sm:mb-4">
                    🎉 Special Offers
                  </h2>
                  <p className="text-lg sm:text-xl text-purple-100 mb-4 sm:mb-6">
                    Get up to <span className="text-2xl sm:text-3xl font-bold text-yellow-300">50% OFF</span> on selected items!
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
                      ✨ Free Shipping
                    </span>
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
                      🚚 Fast Delivery
                    </span>
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
                      💯 Genuine Products
                    </span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="flex flex-col gap-3 md:w-auto">
                  <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-base sm:text-lg md:text-xl">
                    Shop Now 🛍️
                  </button>
                  <p className="text-white/80 text-xs sm:text-sm text-center">
                    Limited time offer today
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 pt-8 border-t border-white/20">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">10K+</p>
                  <p className="text-white/80 text-xs sm:text-sm">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">50K+</p>
                  <p className="text-white/80 text-xs sm:text-sm">Happy Customers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">24/7</p>
                  <p className="text-white/80 text-xs sm:text-sm">Support</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trending */}
        <section
          id="trending-section"
          data-testid="trending-section"
          className="mb-8 sm:mb-12 max-w-7xl mx-auto px-3 sm:px-4 md:px-6"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent line-clamp-2">
            🔥 Trending Products
          </h2>
          <TrendingCarousel products={processedData.trending} />
        </section>

        {/* Category Sections */}
        <section
          id="categories-section"
          className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 space-y-8 sm:space-y-12"
        >
          <div data-testid="category-section-block">
            <CategorySection
              title="Mobiles"
              products={processedData.mobiles as any}
              seeAllLink="/products/mobiles"
            />
          </div>
          <div data-testid="category-section-block">
            <CategorySection
              title="Laptops"
              products={processedData.laptops as any}
              seeAllLink="/products/laptops"
            />
          </div>
          <div data-testid="category-section-block">
            <CategorySection
              title="Appliances"
              products={processedData.appliances as any}
              seeAllLink="/products/appliances"
            />
          </div>
          <div data-testid="category-section-block">
            <CategorySection
              title="Clothes"
              products={processedData.clothes as any}
              seeAllLink="/products/clothes"
            />
          </div>
          <div data-testid="category-section-block">
            <CategorySection
              title="Footwear"
              products={processedData.footwear as any}
              seeAllLink="/products/footwear"
            />
          </div>
        </section>
        {/* Best Deals Section */}
        <section id="deals-section" className="mt-8 sm:mt-12">
          <BestDealsSection products={processedData.bestDeals as any} />
        </section>

        {/* More Products */}
        <section
          id="more-products-section"
          className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 mt-12 sm:mt-16 mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent line-clamp-1">More Products</h2>
            <a
              href="/products"
              className="text-sm sm:text-base text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 sm:gap-2 transition-colors hover:scale-105 duration-300 whitespace-nowrap"
            >
              View All Products
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
          <MoreProductsSection products={processedData.moreProducts as any} />
          
          {/* Call-to-Action Bar */}
          <div className="mt-12 animate-gradient-border rounded-2xl p-1 shadow-xl">
            <div className="bg-gray-900 rounded-xl p-8 text-center text-white">
              <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Explore Our Complete Collection
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Discover 2000+ products across 18 categories with 122 subcategories
              </p>
              <a
                href="/products"
                className="inline-block bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 duration-300"
              >
                Browse More Products →
              </a>
            </div>
          </div>
        </section>
      </main>

    </>
  );
}
