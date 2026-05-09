"use client";

/**
 * 🎨 Glassmorphism Skeleton Loader - Component Showcase
 * 
 * This file demonstrates all available skeleton loader components
 * and their different usage patterns. Use this as a reference guide
 * when implementing skeleton loaders in different pages.
 * 
 * Visit this page to see live previews of all skeleton variations!
 */

import React, { useState } from "react";
import GlassMorphismSkeletonLoader, {
  GlassMorphismSkeletonCard,
  GlassMorphismSkeletonLine,
  GlassMorphismSkeletonCircle,
} from "@/components/GlassMorphismSkeleton";
import {
  ProductGridSkeleton,
  ProductDetailsSkeleton,
  CarouselSkeleton,
  ProfileCardSkeleton,
  TableRowSkeleton,
  ListItemSkeleton,
  CheckoutSkeleton,
} from "@/components/SkeletonLayouts";

export default function SkeletonShowcase() {
  const [activeTab, setActiveTab] = useState("card");

  const tabs = [
    { id: "card", label: "Card Grid", icon: "🎴" },
    { id: "line", label: "Text Lines", icon: "📝" },
    { id: "circle", label: "Circle", icon: "⭕" },
    { id: "details", label: "Product Details", icon: "📦" },
    { id: "carousel", label: "Carousel", icon: "🎠" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "table", label: "Table", icon: "📊" },
    { id: "list", label: "List", icon: "📋" },
    { id: "checkout", label: "Checkout", icon: "🛒" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
            ✨ Glassmorphism Skeleton Showcase
          </h1>
          <p className="text-gray-300 text-lg">
            Beautiful loading animations with glass effect, shimmer, pulse, float & glow
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                  : "bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-md border border-white/20"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* Card Grid */}
        {activeTab === "card" && (
          <div className="glass-bg p-8 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🎴</span> Card Grid Skeleton
            </h2>
            <p className="text-gray-300 mb-6">
              Perfect for product listings, collections, and grid layouts. Shows 20 skeleton cards.
            </p>
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md border border-white/10">
              <GlassMorphismSkeletonLoader count={20} variant="card" fullSize />
            </div>
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-sm text-gray-200">
              <code>
                &lt;GlassMorphismSkeletonLoader count={"{20}"} variant="card" fullSize /&gt;
              </code>
            </div>
          </div>
        )}

        {/* Text Lines */}
        {activeTab === "line" && (
          <div className="glass-bg p-8 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📝</span> Text Line Skeleton
            </h2>
            <p className="text-gray-300 mb-6">
              Perfect for loading text content, descriptions, and paragraphs.
            </p>
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md border border-white/10">
              <GlassMorphismSkeletonLoader count={5} variant="line" />
            </div>
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-sm text-gray-200">
              <code>&lt;GlassMorphismSkeletonLoader count={"{5}"} variant="line" /&gt;</code>
            </div>
          </div>
        )}

        {/* Circle */}
        {activeTab === "circle" && (
          <div className="glass-bg p-8 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>⭕</span> Circle Skeleton
            </h2>
            <p className="text-gray-300 mb-6">
              Ideal for avatars, profile pictures, and circular elements.
            </p>
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md border border-white/10">
              <GlassMorphismSkeletonLoader count={6} variant="circle" />
            </div>
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-sm text-gray-200">
              <code>&lt;GlassMorphismSkeletonLoader count={"{6}"} variant="circle" /&gt;</code>
            </div>
          </div>
        )}

        {/* Product Details */}
        {activeTab === "details" && (
          <div className="glass-bg p-8 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📦</span> Product Details Skeleton
            </h2>
            <p className="text-gray-300 mb-6">
              Complete skeleton layout for product detail pages with image and specifications.
            </p>
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md border border-white/10">
              <ProductDetailsSkeleton />
            </div>
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-sm text-gray-200">
              <code>&lt;ProductDetailsSkeleton /&gt;</code>
            </div>
          </div>
        )}

        {/* Carousel */}
        {activeTab === "carousel" && (
          <div className="glass-bg p-8 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🎠</span> Carousel Skeleton
            </h2>
            <p className="text-gray-300 mb-6">
              Perfect for horizontal scrolling carousels and featured product sections.
            </p>
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md border border-white/10 overflow-x-auto">
              <CarouselSkeleton count={6} />
            </div>
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-sm text-gray-200">
              <code>&lt;CarouselSkeleton count={"{6}"} /&gt;</code>
            </div>
          </div>
        )}

        {/* Profile */}
        {activeTab === "profile" && (
          <div className="glass-bg p-8 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>👤</span> Profile Card Skeleton
            </h2>
            <p className="text-gray-300 mb-6">
              Loading skeleton for user profile information and cards.
            </p>
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md border border-white/10 max-w-sm">
              <ProfileCardSkeleton />
            </div>
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-sm text-gray-200">
              <code>&lt;ProfileCardSkeleton /&gt;</code>
            </div>
          </div>
        )}

        {/* Table */}
        {activeTab === "table" && (
          <div className="glass-bg p-8 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📊</span> Table Row Skeleton
            </h2>
            <p className="text-gray-300 mb-6">
              Loading skeleton for data tables and structured information.
            </p>
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md border border-white/10">
              <TableRowSkeleton rows={5} />
            </div>
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-sm text-gray-200">
              <code>&lt;TableRowSkeleton rows={"{5}"} /&gt;</code>
            </div>
          </div>
        )}

        {/* List */}
        {activeTab === "list" && (
          <div className="glass-bg p-8 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📋</span> List Item Skeleton
            </h2>
            <p className="text-gray-300 mb-6">
              Perfect for loading lists with avatars and text information.
            </p>
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md border border-white/10">
              <ListItemSkeleton count={5} />
            </div>
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-sm text-gray-200">
              <code>&lt;ListItemSkeleton count={"{5}"} /&gt;</code>
            </div>
          </div>
        )}

        {/* Checkout */}
        {activeTab === "checkout" && (
          <div className="glass-bg p-8 rounded-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🛒</span> Checkout Skeleton
            </h2>
            <p className="text-gray-300 mb-6">
              Complete skeleton layout for checkout and payment pages.
            </p>
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-md border border-white/10">
              <CheckoutSkeleton />
            </div>
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-sm text-gray-200">
              <code>&lt;CheckoutSkeleton /&gt;</code>
            </div>
          </div>
        )}
      </div>

      {/* Features Info */}
      <div className="max-w-7xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:border-purple-500/50 transition-all">
          <div className="text-3xl mb-3">✨</div>
          <h3 className="text-lg font-bold text-white mb-2">Glass Effect</h3>
          <p className="text-sm text-gray-300">Frosted glass appearance with backdrop blur</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:border-purple-500/50 transition-all">
          <div className="text-3xl mb-3">🌈</div>
          <h3 className="text-lg font-bold text-white mb-2">Multi-Animations</h3>
          <p className="text-sm text-gray-300">Shimmer, pulse, float & glow effects</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:border-purple-500/50 transition-all">
          <div className="text-3xl mb-3">💎</div>
          <h3 className="text-lg font-bold text-white mb-2">Premium Design</h3>
          <p className="text-sm text-gray-300">Luxury gradients and lighting effects</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:border-purple-500/50 transition-all">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="text-lg font-bold text-white mb-2">Performance</h3>
          <p className="text-sm text-gray-300">GPU-accelerated CSS animations</p>
        </div>
      </div>

      {/* Quick Start */}
      <div className="max-w-7xl mx-auto mt-12 glass-bg p-8 rounded-2xl border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">🚀 Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
          <div>
            <h3 className="font-bold text-white mb-2">Import Component</h3>
            <code className="block bg-black/40 p-3 rounded text-xs">
              import Glassm... from <br />
              '@/components/GlassMorphismSkeleton'
            </code>
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">Use in Your Code</h3>
            <code className="block bg-black/40 p-3 rounded text-xs">
              {`{loading ? (<GlassMorphismSkeleton />) : (<Content />)}`}
            </code>
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">See Documentation</h3>
            <code className="block bg-black/40 p-3 rounded text-xs">
              Read GLASSMORPHISM_
              <br />
              SKELETON_GUIDE.md
            </code>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-bg {
          background: linear-gradient(135deg, rgba(200, 180, 255, 0.1), rgba(150, 100, 255, 0.05));
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}</style>
    </main>
  );
}
