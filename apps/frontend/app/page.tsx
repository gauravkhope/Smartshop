"use client";

import React, { useMemo, useEffect, useRef, useState } from "react";
import HeroCarousel from "@/components/HeroCarousel";
import TrendingCarousel from "@/components/TrendingCarousel";
import CategorySection from "@/components/CategorySection";
import BestDealsSection from "@/components/BestDealsSection";
import MoreProductsSection from "@/components/MoreProductSection";
import homepageData from "@/data/homepageData";


export default function HomePage() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set([...prev, entry.target.id]));
        }
      });
    }, observerOptions);

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
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
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes staggerFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-section {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-gradient-border {
          position: relative;
          background: linear-gradient(270deg, #ff6b6b, #f06595, #cc5de8, #845ef7);
          background-size: 400% 400%;
          animation: gradientShift 3s ease infinite;
        }

        .stagger-item {
          opacity: 0;
          animation: staggerFadeIn 0.6s ease-out forwards;
        }

        .stagger-item:nth-child(1) { animation-delay: 0.1s; }
        .stagger-item:nth-child(2) { animation-delay: 0.2s; }
        .stagger-item:nth-child(3) { animation-delay: 0.3s; }
        .stagger-item:nth-child(4) { animation-delay: 0.4s; }
        .stagger-item:nth-child(5) { animation-delay: 0.5s; }
        .stagger-item:nth-child(6) { animation-delay: 0.6s; }
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
                    Limited time offer
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
          ref={(el) => { sectionRefs.current['trending-section'] = el; }}
          className={`mb-8 sm:mb-12 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 ${visibleSections.has('trending-section') ? 'animate-section' : 'opacity-0'}`}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent line-clamp-2">
            🔥 Trending Products
          </h2>
          <TrendingCarousel products={processedData.trending} />
        </section>

        {/* Category Sections */}
        <section 
          id="categories-section"
          ref={(el) => { sectionRefs.current['categories-section'] = el; }}
          className={`max-w-7xl mx-auto px-3 sm:px-4 md:px-6 space-y-8 sm:space-y-12 ${visibleSections.has('categories-section') ? 'animate-section' : 'opacity-0'}`}
        >
          <div data-testid="category-section-block" className="stagger-item">
            <CategorySection
              title="Mobiles"
              products={processedData.mobiles as any}
              seeAllLink="/products/mobiles"
            />
          </div>
          <div data-testid="category-section-block" className="stagger-item">
            <CategorySection
              title="Laptops"
              products={processedData.laptops as any}
              seeAllLink="/products/laptops"
            />
          </div>
          <div data-testid="category-section-block" className="stagger-item">
            <CategorySection
              title="Appliances"
              products={processedData.appliances as any}
              seeAllLink="/products/appliances"
            />
          </div>
          <div data-testid="category-section-block" className="stagger-item">
            <CategorySection
              title="Clothes"
              products={processedData.clothes as any}
              seeAllLink="/products/clothes"
            />
          </div>
          <div data-testid="category-section-block" className="stagger-item">
            <CategorySection
              title="Footwear"
              products={processedData.footwear as any}
              seeAllLink="/products/footwear"
            />
          </div>
        </section>
        {/* Best Deals Section */}
        <section 
          id="deals-section"
          ref={(el) => { sectionRefs.current['deals-section'] = el; }}
          className={`mt-8 sm:mt-12 ${visibleSections.has('deals-section') ? 'animate-section' : 'opacity-0'}`}
        >
          <BestDealsSection products={processedData.bestDeals as any} />
        </section>

        {/* More Products */}
        <section 
          id="more-products-section"
          ref={(el) => { sectionRefs.current['more-products-section'] = el; }}
          className={`max-w-7xl mx-auto px-3 sm:px-4 md:px-6 mt-12 sm:mt-16 mb-8 sm:mb-12 ${visibleSections.has('more-products-section') ? 'animate-section' : 'opacity-0'}`}
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
