"use client";

import React from "react";

/**
 * Premium Glassmorphism Skeleton Loader Component
 * - Luxurious glass effect with backdrop blur
 * - Multiple animated gradient effects
 * - Floating animation
 * - Shimmer wave overlay
 */

interface GlassMorphismSkeletonLoaderProps {
  count?: number;
  variant?: "card" | "line" | "circle";
  fullSize?: boolean;
}

export const GlassMorphismSkeletonCard = () => (
  <div className="glass-skeleton-card">
    {/* Image Skeleton */}
    <div className="glass-skeleton-image">
      <div className="glass-shimmer-overlay"></div>
      <div className="glass-pulse-light"></div>
    </div>

    {/* Content Skeleton */}
    <div className="glass-skeleton-content">
      {/* Title */}
      <div className="glass-skeleton-line glass-skeleton-title">
        <div className="glass-shimmer-overlay"></div>
      </div>

      {/* Subtitle */}
      <div className="glass-skeleton-line glass-skeleton-subtitle">
        <div className="glass-shimmer-overlay"></div>
      </div>

      {/* Price */}
      <div className="glass-skeleton-line glass-skeleton-price">
        <div className="glass-shimmer-overlay"></div>
      </div>

      {/* Button Area */}
      <div className="glass-skeleton-buttons">
        <div className="glass-skeleton-button glass-skeleton-btn-primary">
          <div className="glass-shimmer-overlay"></div>
        </div>
        <div className="glass-skeleton-button glass-skeleton-btn-secondary">
          <div className="glass-shimmer-overlay"></div>
        </div>
      </div>
    </div>
  </div>
);

export const GlassMorphismSkeletonLine = () => (
  <div className="glass-skeleton-line-wrapper">
    <div className="glass-skeleton-line">
      <div className="glass-shimmer-overlay"></div>
    </div>
  </div>
);

export const GlassMorphismSkeletonCircle = () => (
  <div className="glass-skeleton-circle">
    <div className="glass-shimmer-overlay"></div>
    <div className="glass-pulse-light"></div>
  </div>
);

export default function GlassMorphismSkeletonLoader({
  count = 4,
  variant = "card",
  fullSize = false,
}: GlassMorphismSkeletonLoaderProps) {
  if (variant === "line") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <GlassMorphismSkeletonLine key={i} />
        ))}
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <div className="flex gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <GlassMorphismSkeletonCircle key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={`glass-skeleton-grid ${fullSize ? "glass-skeleton-grid-full" : ""}`}>
      {Array.from({ length: count }).map((_, i) => (
        <GlassMorphismSkeletonCard key={i} />
      ))}
    </div>
  );
}
