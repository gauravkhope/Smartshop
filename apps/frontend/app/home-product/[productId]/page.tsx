"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  Star,
  Plus,
  Minus,
  ArrowLeft,
  ZoomIn,
  Eye,
  CheckCircle,
  ChevronDown,
  ThumbsUp,
  Package,
  Award,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import homepageData from "@/data/homepageData";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";

// Homepage product interface
interface HomeProduct {
  id: string;
  name: string;
  brand: string;
  price: number | string;
  image: string;
  discount?: number;
}

// Review Section Component
const ReviewSection = ({ productName }: { productName: string }) => {
  const [filterOption, setFilterOption] = useState("most-helpful");
  const [showAllImages, setShowAllImages] = useState(false);
  
  // Mock data for reviews
  const totalReviews = 1247;
  const averageRating = 4.5;
  const verifiedPurchasePercent = 87;
  
  const ratingDistribution = [
    { stars: 5, percentage: 60, count: 748 },
    { stars: 4, percentage: 25, count: 312 },
    { stars: 3, percentage: 10, count: 125 },
    { stars: 2, percentage: 3, count: 37 },
    { stars: 1, percentage: 2, count: 25 },
  ];

  // Mock customer images (20 images)
  const customerImages = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    url: `https://picsum.photos/200/200?random=${i + 1}`,
  }));

  // Mock customer videos
  const customerVideos = [
    { id: 1, thumbnail: "https://picsum.photos/300/200?random=v1", duration: "0:45" },
    { id: 2, thumbnail: "https://picsum.photos/300/200?random=v2", duration: "1:20" },
    { id: 3, thumbnail: "https://picsum.photos/300/200?random=v3", duration: "0:58" },
  ];

  const displayedImages = showAllImages ? customerImages : customerImages.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
          Customer Reviews & Ratings
        </h3>
        <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition font-semibold">
          Write a Review
        </button>
      </div>

      {/* Rating Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8">
        
        {/* Circular Rating Display */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-40 h-40">
            {/* Circular Progress Bar */}
            <svg className="transform -rotate-90 w-40 h-40">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(averageRating / 5) * 439.6} 439.6`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{averageRating}</span>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(averageRating) ? "fill-orange-400 text-orange-400" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Based on <strong>{totalReviews.toLocaleString()}</strong> reviews
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            <CheckCircle size={14} className="inline mr-1" />
            {verifiedPurchasePercent}% Verified Purchases
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Rating Breakdown</h4>
          {ratingDistribution.map((rating) => (
            <div key={rating.stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{rating.stars}</span>
                <Star size={16} className="fill-orange-400 text-orange-400" />
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-400 to-pink-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${rating.percentage}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-16 text-right">
                {rating.percentage}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">
                ({rating.count})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-semibold text-gray-700 dark:text-gray-300">Sort by:</span>
        {[
          { value: "most-helpful", label: "Most Helpful" },
          { value: "recent", label: "Most Recent" },
          { value: "highest", label: "Highest Rating" },
          { value: "lowest", label: "Lowest Rating" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterOption(option.value)}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              filterOption === option.value
                ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Customer Images Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Eye size={20} className="text-orange-500" />
          Customer Photos ({customerImages.length})
        </h4>
        <div className="grid grid-cols-5 gap-3">
          {displayedImages.map((img, idx) => (
            <div
              key={img.id}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 transition cursor-pointer group"
            >
              <Image
                src={img.url}
                alt={`Customer photo ${img.id}`}
                fill
                className="object-cover group-hover:scale-110 transition"
                unoptimized
              />
            </div>
          ))}
          
          {!showAllImages && customerImages.length > 5 && (
            <button
              onClick={() => setShowAllImages(true)}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition flex flex-col items-center justify-center gap-2 group"
            >
              <Plus size={32} className="text-orange-500 group-hover:scale-110 transition" />
              <span className="text-sm font-semibold text-orange-500">
                +{customerImages.length - 5}
              </span>
            </button>
          )}
        </div>
        {showAllImages && (
          <button
            onClick={() => setShowAllImages(false)}
            className="mt-4 text-orange-500 font-semibold hover:underline"
          >
            Show Less
          </button>
        )}
      </div>

      {/* Customer Videos Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          Customer Videos ({customerVideos.length})
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {customerVideos.map((video) => (
            <div
              key={video.id}
              className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 transition cursor-pointer group"
            >
              <Image
                src={video.thumbnail}
                alt={`Customer video ${video.id}`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                  <svg className="w-8 h-8 text-orange-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-white text-xs font-semibold">
                {video.duration}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h4>
        {[
          {
            name: "Rahul Sharma",
            rating: 5,
            verified: true,
            comment: "Excellent product! Totally worth the price. The quality is amazing and delivery was super fast. I've been using it for 2 weeks now and it exceeded all my expectations.",
            date: "2 days ago",
            helpful: 124,
            images: 3,
          },
          {
            name: "Priya Patel",
            rating: 4,
            verified: true,
            comment: "Good quality, fast delivery. Very satisfied with my purchase! The only reason I'm giving 4 stars instead of 5 is because the packaging could be better.",
            date: "1 week ago",
            helpful: 87,
            images: 0,
          },
          {
            name: "Amit Kumar",
            rating: 5,
            verified: true,
            comment: "Amazing! Exceeded my expectations. Highly recommended! This is my second purchase and the quality remains consistent.",
            date: "2 weeks ago",
            helpful: 56,
            images: 2,
          },
          {
            name: "Sneha Reddy",
            rating: 3,
            verified: false,
            comment: "Average product. Expected better quality for this price point. It works fine but not as premium as described.",
            date: "3 weeks ago",
            helpful: 23,
            images: 1,
          },
        ].map((review, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {review.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white text-lg">
                      {review.name}
                    </span>
                    {review.verified && (
                      <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <CheckCircle size={12} />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-lg">
                      <span className="font-bold">{review.rating}</span>
                      <Star size={14} className="fill-white" />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{review.date}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {review.comment}
            </p>

            {review.images > 0 && (
              <div className="flex gap-2 mb-4">
                {Array.from({ length: review.images }).map((_, i) => (
                  <div
                    key={i}
                    className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 transition cursor-pointer"
                  >
                    <Image
                      src={`https://picsum.photos/200/200?random=review${idx}${i}`}
                      alt={`Review image ${i + 1}`}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full hover:scale-110 transition"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 transition font-medium">
                <ThumbsUp size={18} />
                <span>Helpful ({review.helpful})</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 transition font-medium">
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center">
        <button className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold">
          Load More Reviews
        </button>
      </div>
    </div>
  );
};

export default function HomeProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.productId as string;
  const { addToCart, isInCart, setBuyNowItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<HomeProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"overview" | "specs">("overview");
  const [selectedSize, setSelectedSize] = useState("");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<HomeProduct[]>([]);
  const [pincode, setPincode] = useState("");
  const [productCategory, setProductCategory] = useState<string>("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedViewIndex, setSelectedViewIndex] = useState(3); // Track which view is in main - start with normal view (Detail)
  const [deliveryDate, setDeliveryDate] = useState<string>(""); // Store delivery date
  const addToCartRef = useRef<HTMLDivElement>(null);

  // Social proof state
  const [viewersCount] = useState(Math.floor(Math.random() * 20) + 5);
  const [recentlySold] = useState(Math.floor(Math.random() * 50) + 10);

  // Find product from homepage data
  useEffect(() => {
    if (productId) {
      const allProducts = [
        ...homepageData.trending,
        ...homepageData.mobiles,
        ...homepageData.laptops,
        ...homepageData.appliances,
        ...homepageData.clothes,
        ...homepageData.footwear,
        ...homepageData.bestDeals,
        ...homepageData.moreProducts,
      ];

      const foundProduct = allProducts.find((p) => p.id === productId);

      if (foundProduct) {
        setProduct(foundProduct);
        setSelectedImage(foundProduct.image);
        
        // Determine product category
        let category = "";
        if (homepageData.clothes.some(p => p.id === productId)) {
          category = "clothes";
          setSelectedSize("M"); // Default for clothes
        } else if (homepageData.footwear.some(p => p.id === productId)) {
          category = "footwear";
          setSelectedSize("8"); // Default for footwear
        }
        setProductCategory(category);
        
        // Get related products from same brand
        const related = allProducts
          .filter((p) => p.id !== productId && p.brand === foundProduct.brand)
          .slice(0, 4);
        setRelatedProducts(related);
      } else {
        toast.error("Product not found");
      }
      setLoading(false);
    }
  }, [productId]);

  // Wishlist status is managed by WishlistContext

  // Sticky add to cart bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showImageModal) {
        setShowImageModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageModal]);

  // Convert string ID to number (for homepage products with string IDs like "t1", "m1")
  const getNumericId = (id: string): number => {
    // Try to parse as number first
    const parsed = parseInt(id);
    if (!isNaN(parsed)) return parsed;
    
    // If string like "t1", "m1", create hash
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const handleAddToCart = () => {
    if (!product) return;

    const numericId = getNumericId(product.id);
    const originalPrice = typeof product.price === "string" ? parseFloat(product.price.replace(/,/g, "")) : product.price;
    const price = product.discount ? originalPrice - (originalPrice * product.discount) / 100 : originalPrice;

    const cartItem = {
      id: numericId,
      name: product.name,
      brand: product.brand,
      price: price,
      image: product.image,
      category: productCategory,
      mainCategory: "",
    };

    // Add multiple quantities
    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem);
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;

    const numericId = getNumericId(product.id);
    const originalPrice = typeof product.price === "string" ? parseFloat(product.price.replace(/,/g, "")) : product.price;
    const price = product.discount ? originalPrice - (originalPrice * product.discount) / 100 : originalPrice;

    const wishlistItem = {
      id: numericId,
      name: product.name,
      brand: product.brand,
      price: price,
      image: product.image,
      category: productCategory,
      discount: product.discount,
    };

    if (isInWishlist(numericId)) {
      removeFromWishlist(numericId);
    } else {
      addToWishlist(wishlistItem);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out ${product?.name} by ${product?.brand}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const getDiscountedPrice = () => {
    if (!product) return 0;
    const price = typeof product.price === "string" ? parseFloat(product.price.replace(/,/g, "")) : product.price;
    if (product.discount) {
      return price - (price * product.discount) / 100;
    }
    return price;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDeliveryDate = () => {
    const days = Math.floor(Math.random() * 3) + 3;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-IN", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };

  const checkPincode = () => {
    if (pincode.length === 6) {
      // Set delivery date only when pincode is successfully checked
      setDeliveryDate(calculateDeliveryDate());
      toast.success(`Delivery available for pincode ${pincode}!`);
    } else {
      toast.error("Please enter a valid 6-digit pincode");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-2xl text-gray-600 mb-4">Product not found</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const originalPrice = typeof product.price === "string" ? parseFloat(product.price.replace(/,/g, "")) : product.price;
  const finalPrice = getDiscountedPrice();
  
  // Define sizes based on product category
  const clothesSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const footwearSizes = ["6", "7", "8", "9", "10", "11"];
  const sizes = productCategory === "clothes" ? clothesSizes : productCategory === "footwear" ? footwearSizes : [];
  const showSizeSelector = productCategory === "clothes" || productCategory === "footwear";

  // Handle thumbnail click - swap the view
  const handleThumbnailClick = (clickedIndex: number) => {
    // Swap: the clicked thumbnail view becomes main, current main becomes that thumbnail
    const temp = selectedViewIndex;
    setSelectedViewIndex(clickedIndex);
    // We don't actually need to update anything else since we're using indices
  };

  // Get scale and position for each view type
  const getViewStyle = (viewIndex: number) => {
    const styles = [
      { scale: "scale-150", translate: "translate-y-4", crop: true },  // Cropped
      { scale: "scale-125", translate: "", crop: false },              // Zoom
      { scale: "scale-175", translate: "", crop: false },              // Extra zoom
      { scale: "scale-110", translate: "", crop: false },              // Detail
    ];
    return styles[viewIndex] || styles[0];
  };

  const getViewLabel = (viewIndex: number) => {
    const labels = ["Crop", "Zoom", "Extra", "Detail"];
    return labels[viewIndex] || "View";
  };

  return (
    <>
      {/* Sticky Add to Cart Bar */}
      <div
        className={`fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-xl z-50 transition-transform duration-300 border-b border-gray-200 dark:border-gray-700 ${
          showStickyBar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={product.image}
              alt={product.name}
              width={50}
              height={50}
              className="object-contain bg-white rounded-lg p-1"
              unoptimized
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
              <p className="text-orange-500 font-bold">{formatPrice(finalPrice)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:shadow-lg transition ${
                isInCart(getNumericId(product.id))
                  ? "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 animate-gradient-shift"
                  : "bg-gradient-to-r from-orange-500 to-pink-500"
              }`}
            >
              <ShoppingCart size={20} />
              {isInCart(getNumericId(product.id)) ? "Add More ✓" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 transition mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
            <span>Back</span>
          </button>

          {/* Social Proof Banner */}
          <div className="flex items-center gap-6 mb-6 bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-orange-500" />
              <span><strong>{viewersCount}</strong> people viewing now</span>
            </div>
            <div className="flex items-center gap-2">
              <Package size={18} className="text-green-500" />
              <span><strong>{recentlySold}</strong> sold in last 24 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={18} className="text-purple-500" />
              <span>⚡ <strong>Trending</strong> Product</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Simple Image Gallery */}
            <div className="space-y-4">
              {/* Main Image - Shows Selected View */}
              <div 
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden aspect-square"
              >
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={selectedImage}
                    alt={`${product.name} - ${getViewLabel(selectedViewIndex)}`}
                    fill
                    className={`${getViewStyle(selectedViewIndex).crop ? 'object-cover' : 'object-contain'} p-8 transition-transform duration-300 ${getViewStyle(selectedViewIndex).scale} ${getViewStyle(selectedViewIndex).translate}`}
                    unoptimized
                  />
                </div>
                
                {product.discount && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-pulse z-10">
                    {product.discount}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery with Different Views */}
              <div className="grid grid-cols-4 gap-3">
                {[3, 2, 1, 0].map((viewIdx) => {
                  const viewStyle = getViewStyle(viewIdx);
                  const isSelected = selectedViewIndex === viewIdx;
                  
                  return (
                    <button
                      key={viewIdx}
                      onClick={() => handleThumbnailClick(viewIdx)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all transform hover:scale-105 hover:shadow-lg ${
                        isSelected
                          ? "border-orange-500 shadow-lg ring-4 ring-orange-300/50"
                          : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                      }`}
                    >
                      <div className="relative w-full h-full overflow-hidden bg-white dark:bg-gray-800">
                        <Image
                          src={selectedImage}
                          alt={`${getViewLabel(viewIdx)} View`}
                          fill
                          className={`${viewStyle.crop ? 'object-cover' : 'object-contain'} p-2 transition-transform duration-300 ${viewStyle.scale} ${viewStyle.translate}`}
                          unoptimized
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Enhanced Product Info */}
            <div className="space-y-6">
              {/* Brand & Badge */}
              <div className="flex items-center gap-3">
                <div className="inline-block px-4 py-1 bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-full">
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                    {product.brand}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Verified Seller</span>
                </div>
              </div>

              {/* Product Name */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-lg">
                  <span className="font-bold">4.2</span>
                  <Star size={16} className="fill-white" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  <strong>1,234</strong> Ratings & <strong>345</strong> Reviews
                </span>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    {formatPrice(finalPrice)}
                  </span>
                  {product.discount && (
                    <>
                      <span className="text-2xl text-gray-400 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                      <span className="text-green-600 font-bold text-xl">
                        Save {formatPrice(originalPrice - finalPrice)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Size Selector - Only for Clothes and Footwear */}
              {showSizeSelector && (
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Select Size {productCategory === "footwear" ? "(UK)" : ""}:
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all ${
                          selectedSize === size
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600"
                            : "border-gray-300 dark:border-gray-600 hover:border-orange-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Checker */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={20} className="text-blue-500" />
                  <span className="font-semibold">Check Delivery</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.slice(0, 6))}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={checkPincode}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                  >
                    Check
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={16} className="text-green-500" />
                  {deliveryDate ? (
                    <span>Estimated Delivery: <strong>{deliveryDate}</strong></span>
                  ) : (
                    <span>Enter pincode to check delivery date</span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div ref={addToCartRef}>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Quantity:
                </label>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-md px-2 py-1 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="font-bold text-2xl w-16 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Buy Now and Add to Cart Row */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (!product) return;
                      const buyNowCartItem = {
                        id: getNumericId(product.id),
                        name: product.name,
                        brand: product.brand || "Unknown Brand",
                        price: finalPrice,
                        image: product.image,
                        category: productCategory,
                        mainCategory: "",
                        quantity: quantity,
                      };
                      setBuyNowItem(buyNowCartItem);
                      router.push('/checkout');
                    }}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    <ShoppingCart size={24} />
                    Buy Now
                  </button>

                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all ${
                      isInCart(getNumericId(product.id))
                        ? "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.7)] animate-gradient-shift"
                        : "bg-gradient-to-r from-orange-500 to-pink-500"
                    }`}
                  >
                    <ShoppingCart size={24} />
                    {isInCart(getNumericId(product.id)) ? `Add More (${quantity}) ✓` : `Add to Cart (${quantity})`}
                  </button>
                </div>

                {/* Wishlist and Share Row */}
                <div className="flex gap-4">
                  <button
                    onClick={handleToggleWishlist}
                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl shadow-lg transition-all hover:scale-105 ${
                      isInWishlist(getNumericId(product.id))
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Heart
                      size={24}
                      className={isInWishlist(getNumericId(product.id)) ? "fill-white" : ""}
                    />
                    <span className="font-semibold">
                      {isInWishlist(getNumericId(product.id)) ? "Wishlisted" : "Add to Wishlist"}
                    </span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl shadow-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105 border-2 border-gray-200 dark:border-gray-700"
                  >
                    <Share2 size={24} />
                    <span className="font-semibold">Share</span>
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
                <div className="flex flex-col items-center text-center">
                  <Truck size={32} className="text-orange-500 mb-2" />
                  <span className="text-sm font-semibold">Free Delivery</span>
                  <span className="text-xs text-gray-500">On orders above ₹499</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Shield size={32} className="text-green-500 mb-2" />
                  <span className="text-sm font-semibold">Secure Payment</span>
                  <span className="text-xs text-gray-500">100% Protected</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <RefreshCw size={32} className="text-blue-500 mb-2" />
                  <span className="text-sm font-semibold">Easy Returns</span>
                  <span className="text-xs text-gray-500">7 Days Return</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-12">
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
              {(["overview", "specs"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-semibold capitalize transition-all relative ${
                    activeTab === tab
                      ? "text-orange-500"
                      : "text-gray-600 dark:text-gray-400 hover:text-orange-400"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-pink-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Product Overview</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                    Premium quality {product.name} from {product.brand}. Experience excellence 
                    with cutting-edge features and stunning design. Perfect blend of style and 
                    functionality for modern living. Crafted with precision and attention to detail,
                    this product ensures durability and long-lasting performance.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {[
                      "Premium Quality Material",
                      "Modern & Sleek Design",
                      "Durable & Long-lasting",
                      "Easy to Use & Maintain"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle size={24} className="text-green-500" />
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "specs" && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    Product Specifications
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Brand", value: product.brand },
                      { label: "Model", value: product.name },
                      { label: "Warranty", value: "1 Year Manufacturer Warranty" },
                      { label: "Availability", value: "In Stock", highlight: true },
                      { label: "Material", value: "Premium Quality" },
                      { label: "Country of Origin", value: "India" },
                    ].map((spec, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                      >
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {spec.label}
                        </span>
                        <span className={spec.highlight ? "text-green-600 font-semibold" : "text-gray-600 dark:text-gray-400"}>
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Reviews Section - Separate */}
          <div className="mt-12">
            <ReviewSection productName={product.name} />
          </div>

          {/* FAQ Section */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "What is the return policy?",
                  a: "We offer a 7-day return policy from the date of delivery. Product must be unused and in original packaging."
                },
                {
                  q: "Is Cash on Delivery available?",
                  a: "Yes, COD is available for orders below ₹50,000. A small COD fee may apply."
                },
                {
                  q: "How long will delivery take?",
                  a: "Delivery typically takes 3-5 business days depending on your location."
                }
              ].map((faq, idx) => (
                <details key={idx} className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 dark:text-white">
                    {faq.q}
                    <ChevronDown className="group-open:rotate-180 transition" />
                  </summary>
                  <p className="mt-3 text-gray-600 dark:text-gray-300">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.id} className="animate-fadeInUp">
                    <ProductCard
                      product={relatedProduct as any}
                      isHomepageProduct={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition z-10"
          >
            <X size={24} />
          </button>
          
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col items-center justify-center">
            {/* Product Name */}
            <div className="absolute top-0 left-0 right-0 text-center py-4 bg-gradient-to-b from-black/50 to-transparent">
              <h2 className="text-white text-2xl font-bold">{product.name}</h2>
              <p className="text-gray-300 text-sm mt-1">{product.brand}</p>
            </div>

            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {/* Thumbnail Navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-3 rounded-xl backdrop-blur-sm">
              {[0, 1, 2, 3].map((viewIdx) => (
                <button
                  key={viewIdx}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleThumbnailClick(viewIdx);
                  }}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedViewIndex === viewIdx
                      ? "border-orange-500 scale-110"
                      : "border-white/30 hover:border-white/60"
                  }`}
                >
                  <div className="relative w-full h-full bg-white/10">
                    <Image
                      src={selectedImage}
                      alt={`${getViewLabel(viewIdx)} View`}
                      fill
                      className={`${getViewStyle(viewIdx).crop ? 'object-cover' : 'object-contain'} p-1 ${getViewStyle(viewIdx).scale} ${getViewStyle(viewIdx).translate}`}
                      unoptimized
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Instructions */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              Click outside or press ESC to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}
