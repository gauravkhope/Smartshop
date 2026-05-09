"use client";

import GlassMorphismSkeletonLoader, {
  GlassMorphismSkeletonCard,
  GlassMorphismSkeletonLine,
  GlassMorphismSkeletonCircle,
} from "./GlassMorphismSkeleton";

/**
 * Premium Skeleton Loading Layouts
 * Ready-to-use compositions for different page sections
 */

// Product Grid Skeleton
export const ProductGridSkeleton = ({ count = 20 }: { count?: number }) => (
  <GlassMorphismSkeletonLoader count={count} variant="card" fullSize />
);

// Product Details Skeleton
export const ProductDetailsSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image Skeleton */}
      <div className="glass-skeleton-card !h-96"></div>

      {/* Details Skeleton */}
      <div className="space-y-6">
        <div className="glass-skeleton-line glass-skeleton-title"></div>
        <div className="glass-skeleton-line glass-skeleton-subtitle"></div>
        <div className="glass-skeleton-line glass-skeleton-price"></div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <GlassMorphismSkeletonLine key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Carousel/List Skeleton
export const CarouselSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="flex gap-4 overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="min-w-[200px]">
        <GlassMorphismSkeletonCard />
      </div>
    ))}
  </div>
);

// Profile Card Skeleton
export const ProfileCardSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <GlassMorphismSkeletonCircle />
      <div className="flex-1 space-y-2">
        <GlassMorphismSkeletonLine />
        <GlassMorphismSkeletonLine />
      </div>
    </div>
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: 4 }).map((_, j) => (
          <div key={j} className="flex-1">
            <GlassMorphismSkeletonLine />
          </div>
        ))}
      </div>
    ))}
  </div>
);

// List Item Skeleton
export const ListItemSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-4 items-center">
        <GlassMorphismSkeletonCircle />
        <div className="flex-1 space-y-2">
          <GlassMorphismSkeletonLine />
          <GlassMorphismSkeletonLine />
        </div>
      </div>
    ))}
  </div>
);

// Checkout Page Skeleton
export const CheckoutSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Items List */}
    <div className="lg:col-span-2 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass-skeleton-card !h-24 flex gap-4 p-4">
          <div className="w-20 h-20 bg-white/20 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <GlassMorphismSkeletonLine />
            <GlassMorphismSkeletonLine />
          </div>
        </div>
      ))}
    </div>

    {/* Order Summary */}
    <div className="glass-skeleton-card !h-64 p-6 space-y-4">
      <GlassMorphismSkeletonLine />
      <GlassMorphismSkeletonLine />
      <GlassMorphismSkeletonLine />
      <GlassMorphismSkeletonLine />
    </div>
  </div>
);

export default ProductGridSkeleton;
