"use client";

import React from "react";
import GlassMorphismSkeletonLoader from "@/components/GlassMorphismSkeleton";

/**
 * Test Page for Glassmorphism Skeleton Loaders
 * Visit this page at `/skeleton-test` to verify animations are working
 */

export default function SkeletonTest() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            ✨ Skeleton Loader Test
          </h1>
          <p className="text-lg text-gray-700">
            Watch the animations - shimmer, pulse, float & glow should all be visible
          </p>
        </div>

        {/* Main Test Grid */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Product Grid Skeleton (fullSize={true})</h2>
          <p className="text-gray-600 mb-4 text-sm">This shows 20 skeleton cards with all animations:</p>
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <GlassMorphismSkeletonLoader count={20} fullSize />
          </div>
        </section>

        {/* Small Grid */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Small Grid (count={8})</h2>
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <GlassMorphismSkeletonLoader count={8} />
          </div>
        </section>

        {/* Text Lines */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Text Line Skeletons (variant="line")</h2>
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-2xl">
            <GlassMorphismSkeletonLoader count={5} variant="line" />
          </div>
        </section>

        {/* Circles */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Circle Skeletons (variant="circle")</h2>
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <GlassMorphismSkeletonLoader count={8} variant="circle" />
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 What to Look For</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-blue-600 mb-3">✨ Shimmer Effect</h3>
              <p className="text-gray-700 mb-3">
                A bright white light sweeps horizontally across each skeleton card from left to right. This creates a "glass catching light" effect.
              </p>
              <p className="text-sm text-gray-600">Duration: 1.8 seconds, repeats infinitely</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-purple-600 mb-3">💫 Pulse Effect</h3>
              <p className="text-gray-700 mb-3">
                The colored gradient inside each card (orange/pink) breathes in and out, with opacity and scale changing smoothly.
              </p>
              <p className="text-sm text-gray-600">Duration: 2.5 seconds, repeats infinitely</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-green-600 mb-3">🎈 Float Effect</h3>
              <p className="text-gray-700 mb-3">
                The entire skeleton card slowly moves up and down, creating a gentle levitating/floating motion.
              </p>
              <p className="text-sm text-gray-600">Duration: 3 seconds, repeats infinitely</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-red-600 mb-3">🌟 Glow Effect</h3>
              <p className="text-gray-700 mb-3">
                The outer glow and inner shadow of the card pulses with orange and purple colors, making it feel alive and bright.
              </p>
              <p className="text-sm text-gray-600">Duration: 4 seconds, repeats infinitely</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h4 className="font-bold text-blue-900 mb-2">💡 Pro Tip</h4>
            <p className="text-blue-800">
              Open your browser's DevTools (F12) and check the Elements/Inspector tab. 
              You should see the CSS animations being applied to elements with classes like 
              <code className="bg-white px-2 py-1 rounded mx-1">.glass-skeleton-card</code>.
              All animations run simultaneously for a luxurious effect!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
