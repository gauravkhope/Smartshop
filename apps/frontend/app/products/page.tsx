"use client";
import { Suspense } from "react";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  ShoppingCart,
  Heart,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

// Format price to INR (e.g. ₹1,23,456)
const formatPrice = (value: number | string) => {
  const num =
    typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  if (Number.isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

// Enhanced Shimmer Loading Component with Gradient Animation
const ShimmerCard = () => (
  <div className="bg-orange-50 rounded-xl shadow-md overflow-hidden border border-gray-100">
    <div className="relative h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 overflow-hidden animate-shimmer-wave">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-gradient"></div>
    </div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded overflow-hidden animate-shimmer-wave">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
      </div>
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3 overflow-hidden animate-shimmer-wave"></div>
      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/2 overflow-hidden animate-shimmer-wave"></div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded flex-1 animate-shimmer-wave"></div>
        <div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer-wave"></div>
      </div>
    </div>
  </div>
);



export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllProductsPage />
    </Suspense>
  );
}

function AllProductsPage() {
  const searchParams = useSearchParams();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMainCategory, setSelectedMainCategory] =
    useState<string>("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [imageLoadingStates, setImageLoadingStates] = useState<{
    [key: number]: boolean;
  }>({});

  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [showFilters, setShowFilters] = useState(false);

  // Animation state
  const [burstingHearts, setBurstingHearts] = useState<{
    [key: number]: boolean;
  }>({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Show 20 products per page

  // Set search query from URL params
  useEffect(() => {
    const search = searchParams ? searchParams.get("search") : null;
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
          {
            cache: "no-store",
          }
        );
        const data = await res.json();
        // Accept array, {products: [...]}, or {data: [...]}
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Wishlist toggle handler - optimized with useCallback
  const handleToggleWishlist = useCallback(
    (product: any, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const wishlistItem = {
        id: product.id,
        name: product.name,
        brand: product.brand || "Unknown Brand",
        price: product.price,
        image: product.image,
        category: product.category,
        mainCategory: product.mainCategory,
      };

      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(wishlistItem);
        // Trigger heart burst animation
        setBurstingHearts((prev) => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
          setBurstingHearts((prev) => ({ ...prev, [product.id]: false }));
        }, 600);
      }
    },
    [addToWishlist, removeFromWishlist, isInWishlist]
  );

  // Add to cart handler - optimized with useCallback
  const handleAddToCart = useCallback(
    (product: any, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const cartItem = {
        id: product.id,
        name: product.name,
        brand: product.brand || "Unknown Brand",
        price:
          typeof product.price === "string"
            ? parseFloat(product.price.replace(/,/g, ""))
            : product.price,
        image: product.image || "",
        category: product.category,
        mainCategory: product.mainCategory,
      };

      addToCart(cartItem);
    },
    [addToCart]
  );

  const getFallbackImage = (product: any) => {
    return `https://picsum.photos/seed/${product.id}/600/600`;
  };

  // Group products by main category and subcategory
  const categorizedProducts = useMemo(() => {
    const grouped: { [key: string]: { [key: string]: any[] } } = {};

    products.forEach((product) => {
      const mainCat = product.mainCategory || "Other";
      const subCat = product.category || "Uncategorized";

      if (!grouped[mainCat]) {
        grouped[mainCat] = {};
      }
      if (!grouped[mainCat][subCat]) {
        grouped[mainCat][subCat] = [];
      }
      grouped[mainCat][subCat].push(product);
    });

    return grouped;
  }, [products]);

  const mainCategories = useMemo(
    () => ["All", ...Object.keys(categorizedProducts).sort()],
    [categorizedProducts]
  );

  // Get subcategories for selected main category
  const subCategories = useMemo(() => {
    if (selectedMainCategory === "All") {
      const allSubs = new Set<string>();
      Object.values(categorizedProducts).forEach((mainCat) => {
        Object.keys(mainCat).forEach((sub) => allSubs.add(sub));
      });
      return ["All", ...Array.from(allSubs).sort()];
    }
    return [
      "All",
      ...Object.keys(categorizedProducts[selectedMainCategory] || {}).sort(),
    ];
  }, [selectedMainCategory, categorizedProducts]);

  // Get all unique brands
  const allBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  // Get price range from products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map((p) => p.price);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setMinPrice(min);
      setMaxPrice(max);
      setPriceRange([min, max]);
    }
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered: any[] = [];

    // If search is active, search across ALL products (ignore category filters)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category?.name?.toLowerCase().includes(query) ||
          p.subCategory?.name?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
      );
    } else {
      // Category filtering (only when no search)
      if (selectedMainCategory === "All" && selectedSubCategory === "All") {
        filtered = products;
      } else if (
        selectedMainCategory !== "All" &&
        selectedSubCategory === "All"
      ) {
        Object.values(categorizedProducts[selectedMainCategory] || {}).forEach(
          (subCatProducts) => {
            filtered = [...filtered, ...subCatProducts];
          }
        );
      } else if (
        selectedMainCategory !== "All" &&
        selectedSubCategory !== "All"
      ) {
        filtered =
          categorizedProducts[selectedMainCategory]?.[selectedSubCategory] ||
          [];
      } else if (
        selectedMainCategory === "All" &&
        selectedSubCategory !== "All"
      ) {
        Object.values(categorizedProducts).forEach((mainCat) => {
          if (mainCat[selectedSubCategory]) {
            filtered = [...filtered, ...mainCat[selectedSubCategory]];
          }
        });
      }
    }

    // Brand filtering
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
    }

    // Price range filtering
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-az":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-za":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Keep default order
        break;
    }

    return filtered;
  }, [
    products,
    categorizedProducts,
    selectedMainCategory,
    selectedSubCategory,
    selectedBrands,
    priceRange,
    searchQuery,
    sortBy,
  ]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedMainCategory,
    selectedSubCategory,
    selectedBrands,
    priceRange,
    searchQuery,
    sortBy,
  ]);

  // Reset subcategory when main category changes
  useEffect(() => {
    setSelectedSubCategory("All");
  }, [selectedMainCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50">
        <div className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 text-white py-12 mb-8">
          <div className="max-w-7xl mx-auto px-8">
            <h1 className="text-5xl font-bold mb-3">Loading Collection...</h1>
            <p className="text-lg opacity-90">
              Please wait while we fetch amazing products for you
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 20 }).map((_, index) => (
              <ShimmerCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-orange-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 text-white py-6 sm:py-8 md:py-12 mb-6 sm:mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 line-clamp-2">Explore Our Collection</h1>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">2000+</p>
              <p className="text-xs sm:text-sm opacity-90 uppercase tracking-wide">
                Products
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">18</p>
              <p className="text-xs sm:text-sm opacity-90 uppercase tracking-wide">
                Categories
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">122</p>
              <p className="text-sm opacity-90 uppercase tracking-wide">
                Subcategories
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">ALL</p>
              <p className="text-sm opacity-90 uppercase tracking-wide">
                Major Brands
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-12">
        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-6 bg-gradient-to-r from-orange-100 to-pink-100 border-l-4 border-orange-500 rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 text-white rounded-full p-2">
                  <Search className="w-5 h-5" />
                </div>
                <div data-testid="search-results-header">
                  <h2 className="text-lg font-bold text-gray-800">
                    Search Results for:{" "}
                    <span className="text-orange-600">"{searchQuery}"</span>
                  </h2>
                  <p className="text-sm text-gray-600">
                    Found {filteredProducts.length} product
                    {filteredProducts.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  window.history.pushState({}, "", "/products");
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Sort and Filter Controls */}
        <div className="mb-6 flex gap-3 items-center justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            data-testid="filters-toggle" className="px-4 py-2 bg-orange-50 border border-gray-300 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-2"
          >
            <SlidersHorizontal size={18} className="text-gray-600" />
            <span className="font-medium">Filters</span>
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-orange-50"
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-az">Name: A-Z</option>
            <option value="name-za">Name: Z-A</option>
          </select>
        </div>

        {/* Advanced Filters Sidebar */}
        {showFilters && (
          <div data-testid="filters-panel" className="mb-6 bg-orange-50 border border-gray-200 rounded-xl p-4 sm:p-6 shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Brand Filter */}
              <div data-testid="filter-brands">
                <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded"></span>
                  Brands
                </h3>
                <div className="max-h-40 sm:max-h-48 overflow-y-auto space-y-1 sm:space-y-2 pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                  {allBrands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-2 cursor-pointer hover:bg-orange-100 p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand]);
                          } else {
                            setSelectedBrands(
                              selectedBrands.filter((b) => b !== brand)
                            );
                          }
                        }}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{brand}</span>
                      <span data-testid={`brand-count-${brand}`} className="text-xs text-gray-500 ml-auto">
                        ({products.filter((p) => p.brand === brand).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div data-testid="filter-price">
                <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-green-500 to-blue-500 rounded"></span>
                  Price Range
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                      placeholder="Max"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between mb-1">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                data-testid="clear-filters"
                  onClick={() => {
                    setSelectedBrands([]);
                    setPriceRange([minPrice, maxPrice]);
                    setSelectedMainCategory("All");
                    setSelectedSubCategory("All");
                    setSearchQuery("");
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-md font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Category Filter - Hidden when search is active */}
        {!searchQuery && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-orange-500 to-pink-500 rounded"></span>
              Main Categories
            </h2>
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100">
              <div className="flex gap-2 pb-2 min-w-max">
                {mainCategories.map((category) => {
                  const productCount =
                    category === "All"
                      ? products.length
                      : Object.values(
                          categorizedProducts[category] || {}
                        ).reduce((acc, arr) => acc + arr.length, 0);
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedMainCategory(category)}
                      className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-500 whitespace-nowrap ${
                        selectedMainCategory === category
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-200 scale-105"
                          : "bg-orange-50 text-gray-700 hover:bg-orange-100 shadow-md hover:shadow-[0_10px_40px_-10px_rgba(239,68,68,0.4),0_10px_40px_-10px_rgba(251,146,60,0.4),0_10px_40px_-10px_rgba(236,72,153,0.4)] hover:-translate-y-1 border border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">
                          {category === "All" ? "ALL" : category}
                        </span>
                        <span
                          className={`text-xs mt-0.5 ${
                            selectedMainCategory === category
                              ? "opacity-90"
                              : "opacity-60"
                          }`}
                        >
                          {category === "All"
                            ? `2000+ ITEMS`
                            : `${productCount} items`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sub Category Filter - Hidden when search is active */}
        {!searchQuery && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded"></span>
              Sub Categories
            </h2>
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
              <div className="flex gap-2 pb-2 min-w-max">
                {subCategories.map((subCat) => {
                  let productCount = 0;

                  if (subCat === "All") {
                    if (selectedMainCategory === "All") {
                      productCount = products.length;
                    } else {
                      Object.values(
                        categorizedProducts[selectedMainCategory] || {}
                      ).forEach((arr) => {
                        productCount += arr.length;
                      });
                    }
                  } else if (selectedMainCategory === "All") {
                    Object.values(categorizedProducts).forEach((mainCat) => {
                      if (mainCat[subCat]) {
                        productCount += mainCat[subCat].length;
                      }
                    });
                  } else {
                    productCount =
                      categorizedProducts[selectedMainCategory]?.[subCat]
                        ?.length || 0;
                  }

                  return (
                    <button
                      key={subCat}
                      onClick={() => setSelectedSubCategory(subCat)}
                      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-500 whitespace-nowrap ${
                        selectedSubCategory === subCat
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md shadow-blue-200 scale-105"
                          : "bg-orange-50 text-gray-600 hover:bg-orange-100 shadow-md hover:shadow-[0_10px_40px_-10px_rgba(239,68,68,0.4),0_10px_40px_-10px_rgba(251,146,60,0.4),0_10px_40px_-10px_rgba(236,72,153,0.4)] hover:-translate-y-1 border border-gray-200"
                      }`}
                    >
                      {subCat === "All" ? "ALL" : subCat}
                      <span
                        className={`ml-2 text-xs ${
                          selectedSubCategory === subCat
                            ? "opacity-90"
                            : "opacity-60"
                        }`}
                      >
                        {subCat === "All" ? "(2000+)" : `(${productCount})`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(selectedMainCategory !== "All" ||
          selectedSubCategory !== "All" ||
          searchQuery ||
          selectedBrands.length > 0 ||
          priceRange[0] !== minPrice ||
          priceRange[1] !== maxPrice) && (
          <div data-testid="active-filters" className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 font-medium">
              Active Filters:
            </span>
            {selectedMainCategory !== "All" && (
              <span data-testid="active-filter-chip" className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-2">
                Main: {selectedMainCategory}
                <button
                  onClick={() => setSelectedMainCategory("All")}
                  className="hover:text-orange-900"
                >
                  ×
                </button>
              </span>
            )}
            {selectedSubCategory !== "All" && (
              <span data-testid="active-filter-chip" className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                Sub: {selectedSubCategory}
                <button
                  onClick={() => setSelectedSubCategory("All")}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {selectedBrands.map((brand) => (
              <span
                key={brand}
                data-testid="active-filter-chip"
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
              >
                Brand: {brand}
                <button
                  onClick={() =>
                    setSelectedBrands(selectedBrands.filter((b) => b !== brand))
                  }
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            ))}
            {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
              <span data-testid="active-filter-chip" className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                Price: {formatPrice(priceRange[0])} -{" "}
                {formatPrice(priceRange[1])}
                <button
                  onClick={() => setPriceRange([minPrice, maxPrice])}
                  className="hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span data-testid="active-filter-chip" className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
            <button
            data-testid="clear-filters"
              onClick={() => {
                setSelectedMainCategory("All");
                setSelectedSubCategory("All");
                setSearchQuery("");
              }}
              className="text-sm text-red-600 hover:text-red-800 font-medium underline"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600 mb-2">No products found</p>
            <p className="text-gray-500">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div>
            <div data-testid="showing-summary" className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-bold text-gray-800">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                -{" "}
                <span className="font-bold text-gray-800">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredProducts.length
                  )}
                </span>{" "}
                of{" "}
                <span data-testid="total-products" className="font-bold text-gray-800">
                  {filteredProducts.length}
                </span>{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </p>
            </div>
            <div className="gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid" data-testid="product-grid">
              {paginatedProducts.map((product) => {
                const isWishlisted = isInWishlist(product.id);
                const isBursting = burstingHearts[product.id] || false;

                return (
                  <div
                    key={product.id}
                    data-testid="product-card"
                    className="group bg-orange-50 rounded-xl shadow-md hover:shadow-[0_10px_40px_-10px_rgba(239,68,68,0.4),0_10px_40px_-10px_rgba(251,146,60,0.4),0_10px_40px_-10px_rgba(236,72,153,0.4)] transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100 relative will-change-transform"
                  >
                    <Link href={`/details/${product.id}`}>
                      <div className="relative overflow-hidden bg-gray-50 h-48">
                        {/* Animated Shimmer Effect While Loading */}
                        {imageLoadingStates[product.id] !== false && (
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer-wave"></div>
                        )}

                        <img
                          src={
                            product.image && product.image.trim() !== ""
                              ? product.image
                              : getFallbackImage(product)
                          }
                          alt={product.name}
                          loading="lazy"
                          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 will-change-transform ${
                            imageLoadingStates[product.id] === false
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                          onLoad={() =>
                            setImageLoadingStates((prev) => ({
                              ...prev,
                              [product.id]: false,
                            }))
                          }
                          onError={(e) => {
                            const target = e.currentTarget;
                            setImageLoadingStates((prev) => ({
                              ...prev,
                              [product.id]: false,
                            }));
                            if (!target.dataset.fallbackAttempted) {
                              target.dataset.fallbackAttempted = "true";
                              target.src = getFallbackImage(product);
                            } else {
                              target.src =
                                "https://via.placeholder.com/400x300/f0f0f0/666666?text=Product";
                            }
                          }}
                        />

                        {product.brand && (
                          <div data-testid="product-brand" className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                            {product.brand}
                          </div>
                        )}

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => handleToggleWishlist(product, e)}
                          className={`absolute top-2 right-2 z-20 transition-transform duration-300 hover:scale-110 ${
                            isBursting ? "animate-heartPop" : ""
                          }`}
                        >
                          <Heart
                            size={22}
                            className={`transition-all duration-500 ${
                              isWishlisted
                                ? "fill-[url(#heartGradient)] text-transparent drop-shadow-[0_0_8px_rgba(255,120,100,0.6)]"
                                : "text-gray-400 hover:text-red-500"
                            }`}
                          />

                          {/* SVG Gradient */}
                          <svg width="0" height="0">
                            <defs>
                              <linearGradient
                                id="heartGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop stopColor="#ff4d4d" offset="0%" />
                                <stop stopColor="#ff9966" offset="50%" />
                                <stop stopColor="#ff66b2" offset="100%" />
                              </linearGradient>
                            </defs>
                          </svg>

                          {/* Floating Hearts Animation */}
                          {isBursting && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="animate-floatHeart absolute text-pink-400 text-sm left-0">
                                ❤
                              </span>
                              <span className="animate-floatHeart2 absolute text-red-400 text-sm left-1/2">
                                ❤
                              </span>
                              <span className="animate-floatHeart3 absolute text-orange-400 text-sm right-0">
                                ❤
                              </span>
                            </div>
                          )}
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 data-testid="product-title" className="font-semibold text-sm mb-1 text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-gray-500 text-xs mb-2">
                          {product.category}
                        </p>
                        <div className="flex items-center justify-between">
                          <p data-testid="product-price" className="font-bold text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </div>
                    </Link>

                    {/* Add to Cart Button */}
                    <div
                      className={`absolute bottom-[-45px] left-0 right-0
                    text-white text-center py-2 transform transition-all duration-500
                    ease-[cubic-bezier(0.28,1.65,0.32,1)]
                    rounded-b-xl opacity-0 group-hover:opacity-100 group-hover:bottom-0
                    cursor-pointer will-change-transform
                    ${
                      isInCart(product.id)
                        ? "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.7),0_0_40px_rgba(20,184,166,0.5)] group-hover:shadow-[0_0_35px_rgba(16,185,129,0.9),0_0_60px_rgba(20,184,166,0.7)] animate-gradient-shift"
                        : "bg-gradient-to-r from-red-500 via-orange-400 to-pink-500 shadow-[0_0_15px_rgba(255,100,70,0.6)] group-hover:shadow-[0_0_30px_rgba(255,130,100,0.9)]"
                    }`}
                    >
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="flex items-center justify-center gap-2 w-full font-medium tracking-wide"
                      >
                        <ShoppingCart size={16} />
                        {isInCart(product.id) ? "In Cart ✓" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div data-testid="pagination-controls" className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-orange-50 border border-gray-300 rounded-lg hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div data-testid="pagination-numbers" className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md"
                            : "bg-orange-50 border border-gray-300 hover:bg-orange-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-orange-50 border border-gray-300 rounded-lg hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
