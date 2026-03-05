                                                                                                                           "use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Heart,
  User,
  ClipboardList,
  Gift,
  Bell,
  LogOut,
  Store,
  Smartphone,
  Download,
  LogIn,
  Shield,
  Home,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch products for autocomplete
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products`
        );
        const data = await res.json();
        setAllProducts(Array.isArray(data) ? data : data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    }
    fetchProducts();
  }, []);

  // Generate suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const productSuggestions = new Set<string>();

      allProducts.forEach((product) => {
        // Add product name if it matches
        if (product.name.toLowerCase().includes(query)) {
          productSuggestions.add(product.name);
        }
        // Add brand if it matches
        if (product.brand && product.brand.toLowerCase().includes(query)) {
          productSuggestions.add(product.brand);
        }
        // Add category if it matches
        if (
          product.category?.name &&
          product.category.name.toLowerCase().includes(query)
        ) {
          productSuggestions.add(product.category.name);
        }
        // Add subcategory if it matches
        if (
          product.subCategory?.name &&
          product.subCategory.name.toLowerCase().includes(query)
        ) {
          productSuggestions.add(product.subCategory.name);
        }
      });

      setSuggestions(Array.from(productSuggestions).slice(0, 8)); // Limit to 8 suggestions
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allProducts]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    router.push(`/products?search=${encodeURIComponent(suggestion)}`);
  };

  return (
    <nav data-testid="navbar" className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-1 md:px-2 py-3">
        {/* LEFT */}
        <div className="flex items-center gap-2 md:gap-3">
          <ShoppingCart className="text-indigo-600 w-6 h-6" />
          <h1
            data-testid="navbar-logo"
            className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 bg-clip-text text-transparent"
            style={{
              WebkitBackgroundClip: "text",
              color: "transparent",
              backgroundClip: "text",
            }}
          >
            SmartShop
          </h1>
        </div>

        {/* CENTER + Profile */}
        <div className="flex-1 flex flex-col md:flex-row md:justify-center md:items-center">
          <div ref={searchRef} className="md:relative md:flex w-full max-w-2xl">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 bg-opacity-20 rounded-[4rem] px-2 md:px-4 py-2 w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(236,72,153,0.2) 0%, rgba(251,146,60,0.2) 50%, rgba(239,68,68,0.2) 100%)",
                borderRadius: "4rem",
              }}
            >
              <Search className="text-gray-400 mr-2" />
              <input
                data-testid="navbar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() =>
                  searchQuery.trim().length > 0 && setShowSuggestions(true)
                }
                placeholder="Search for products, brands and more..."
                className="bg-transparent w-full outline-none text-gray-800 dark:text-gray-100"
              />
              <button
                data-testid="navbar-search-button"
                type="submit"
                className="ml-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 md:px-4 py-1.5 rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg"
              >
                Search
              </button>
            </form>

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div data-testid="search-suggestion-dropdown" className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    data-testid="search-suggestion-item"
                    className="px-4 py-3 hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-800 dark:text-gray-100">
                      {suggestion}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Profile picture and name to the right of searchbar */}
          {isAuthenticated && user && (
            <div className="flex items-center mt-3 md:mt-0 md:ml-6">
              <img
              data-testid="navbar-profile-avatar"
                src={
                  user?.avatar
                    ? user.avatar.startsWith("/images") // frontend avatars (avatar1.png etc.)
                      ? user.avatar
                      : user.avatar.startsWith("http") // full URL
                      ? user.avatar
                      : `${process.env.NEXT_PUBLIC_API_URL}${user.avatar}` // backend uploads
                    : "/images/default-avatar.png"
                }
                alt="Profile"
                className="w-14 md:w-16 h-14 md:h-16 rounded-full object-cover border-2 border-indigo-500 transition-transform duration-300 hover:scale-105"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.src = "/images/default-avatar.png";
                }}
              />

              <span data-testid="navbar-profile-name" className="ml-2 md:ml-3 font-semibold text-gray-800 dark:text-gray-100 text-base">
                {user?.name ? user.name.toUpperCase() : "GUEST"}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Wishlist with Count */}
          <Link href="/wishlist" data-testid="navbar-wishlist" className="relative hover:text-red-500">
            <Heart
              className={`w-6 h-6 cursor-pointer transition-colors ${
                wishlistCount > 0
                  ? "text-red-500 fill-red-500 hover:text-red-600"
                  : "text-gray-600 dark:text-gray-200 hover:text-red-500"
              }`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                {wishlistCount}
              </span>
            )}
          </Link>
          {/* Cart with Count */}
          <Link href="/cart" data-testid="navbar-cart" className="relative hover:text-indigo-600">
            <ShoppingCart className="w-6 h-6 text-gray-600 dark:text-gray-200 hover:text-indigo-600 cursor-pointer" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button
          data-testid="navbar-hamburger"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMenuOpen(!menuOpen)}

          >
            {menuOpen ? (
              <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            )}
          </button>
        </div>
      </div>
      {/* Hamburger menu overlay and sidebar */}
      {menuOpen && (
        <>
          {/* Floating glassmorphic menu - less transparent, icons visible */}
            <div data-testid="side-drawer" className="fixed top-24 right-8 z-[60] w-72 p-0">
            <div
              className="relative rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden"
              style={{
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <button
              data-testid="drawer-close"
                onClick={() => setMenuOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
              <ul className="flex flex-col gap-2 py-6 px-6">
                {/* HOME */}
                <li
                data-testid="drawer-home"
                  className="flex items-center gap-3 cursor-pointer group transform transition-transform duration-300 hover:scale-110 hover:rotate-[1deg]"
                  onClick={() => router.push("/")}
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 shadow-md group-hover:shadow-lg group-hover:scale-110 transition">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 bg-clip-text text-transparent group-hover:brightness-110">
                    HOME
                  </span>
                </li>

                {/* MY PROFILE or LOG IN */}
                {isAuthenticated ? (
                  <li className="flex flex-col">
                    <div
                    data-testid="drawer-profile-toggle"
                      className="flex items-center gap-3 cursor-pointer group transform transition-transform duration-300 hover:scale-110 hover:rotate-[1deg]"
                      onClick={() => setProfileDropdownOpen((v) => !v)}
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md group-hover:shadow-lg group-hover:scale-110 transition">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent group-hover:brightness-110">
                        MY PROFILE
                      </span>
                      <span className="ml-auto text-xs text-gray-400">▼</span>
                    </div>

                    {profileDropdownOpen && (
                      <ul className="ml-8 mt-2 flex flex-col gap-2">
                        <li
                        data-testid="drawer-view-profile"
                          className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() =>
                            router.push("/my-profile/view-profile")
                          }
                        >
                          <User className="w-5 h-5 text-indigo-500" />
                          <span className="text-gray-800 dark:text-gray-100">
                            View Profile
                          </span>
                        </li>
                        <li
                          data-testid="drawer-orders"
                          className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => router.push("/orders")}
                        >
                          <ClipboardList className="w-5 h-5 text-orange-500" />
                          <span className="text-gray-800 dark:text-gray-100">
                            Orders
                          </span>
                        </li>
                        <li
                        data-testid="drawer-notifications"
                          className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => router.push("/notifications")}
                        >
                          <Bell className="w-5 h-5 text-pink-500" />
                          <span className="text-gray-800 dark:text-gray-100">
                            Notifications
                          </span>
                        </li>
                        <li
                        data-testid="drawer-coupons"
                          className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => router.push("/coupons")}
                        >
                          <Gift className="w-5 h-5 text-green-500" />
                          <span className="text-gray-800 dark:text-gray-100">
                            Coupons
                          </span>
                        </li>
                        <li
                        data-testid="drawer-logout"
                          className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                          onClick={logout}
                        >
                          <LogOut className="w-5 h-5 text-red-500" />
                          <span className="text-gray-800 dark:text-gray-100">
                            Log Out
                          </span>
                        </li>
                      </ul>
                    )}
                  </li>
                ) : (
                  <li
                    className="flex items-center gap-3 cursor-pointer group transform transition-transform duration-300 hover:scale-110 hover:rotate-[1deg]"
                    onClick={() => router.push("/login")}
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 via-pink-500 to-orange-500 shadow-md group-hover:shadow-lg group-hover:scale-110 transition">
                      <LogIn className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-indigo-500 via-pink-500 to-orange-500 bg-clip-text text-transparent group-hover:brightness-110">
                      LOG IN
                    </span>
                  </li>
                )}

                {/* BECOME A SELLER */}
                <li className="flex items-center gap-3 cursor-pointer group transform transition-transform duration-300 hover:scale-110 hover:rotate-[1deg]">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-green-400 via-teal-400 to-emerald-500 shadow-md group-hover:shadow-lg group-hover:scale-110 transition">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg bg-gradient-to-r from-green-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent group-hover:brightness-110">
                    BECOME A SELLER
                  </span>
                </li>

                {/* DOWNLOAD APP */}
                <li className="flex items-center gap-3 cursor-pointer group transform transition-transform duration-300 hover:scale-110 hover:rotate-[1deg]">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 shadow-md group-hover:shadow-lg group-hover:scale-110 transition">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent group-hover:brightness-110">
                    DOWNLOAD APP
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}


// "use client";
// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// import {
//   Menu,
//   X,
//   Search,
//   ShoppingCart,
//   Heart,
//   User,
//   ClipboardList,
//   Gift,
//   Bell,
//   LogOut,
//   Store,
//   Smartphone,
//   LogIn,
//   Home,
// } from "lucide-react";

// import { useAuth } from "@/app/context/AuthContext";
// import { useCart } from "@/app/context/CartContext";
// import { useWishlist } from "@/app/context/WishlistContext";

// export default function Navbar() {
//   const { user, isAuthenticated, logout } = useAuth();
//   const { cart } = useCart();
//   const { wishlist } = useWishlist();

//   const cartCount = cart.reduce((c, i) => c + i.quantity, 0);
//   const wishlistCount = wishlist.length;

//   const [menuOpen, setMenuOpen] = useState(false);
//   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

//   // Search
//   const [searchQuery, setSearchQuery] = useState("");
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [allProducts, setAllProducts] = useState<any[]>([]);

//   const router = useRouter();
//   const searchRef = useRef<HTMLDivElement>(null);

//   /* ---------------- FETCH PRODUCTS FOR AUTOCOMPLETE ---------------- */
//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
//         const data = await res.json();
//         setAllProducts(Array.isArray(data) ? data : data.products || []);
//       } catch (e) {
//         console.error(e);
//       }
//     }
//     load();
//   }, []);

//   /* ---------------- AUTOCOMPLETE LOGIC ---------------- */
//   useEffect(() => {
//     if (!searchQuery.trim()) {
//       setSuggestions([]);
//       setShowSuggestions(false);
//       return;
//     }

//     const q = searchQuery.toLowerCase();
//     const s = new Set<string>();

//     allProducts.forEach((p) => {
//       if (p.name?.toLowerCase().includes(q)) s.add(p.name);
//       if (p.brand?.toLowerCase().includes(q)) s.add(p.brand);
//       if (typeof p.category === "string" && p.category.toLowerCase().includes(q))
//         s.add(p.category);
//       if (typeof p.subCategory === "string" && p.subCategory.toLowerCase().includes(q))
//         s.add(p.subCategory);
//     });

//     setSuggestions([...s].slice(0, 8));
//     setShowSuggestions(true);
//   }, [searchQuery, allProducts]);

//   const handleSearch = (e?: any) => {
//     e?.preventDefault();
//     if (!searchQuery.trim()) return router.push("/products");

//     router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
//     setShowSuggestions(false);
//   };

//   const handleSuggestionClick = (text: string) => {
//     setSearchQuery(text);
//     setShowSuggestions(false);
//     router.push(`/products?search=${encodeURIComponent(text)}`);
//   };

//   /* ---------------- AVATAR RESOLVER ---------------- */
//   const resolveAvatar = () => {
//     const a = user?.avatar;
//     if (!a) return "/images/default-avatar.png";
//     if (a.startsWith("/images")) return a;
//     if (a.startsWith("http")) return a;
//     return `${process.env.NEXT_PUBLIC_API_URL}${a}`;
//   };

//   return (
//     <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md">
//       <div className="max-w-7xl mx-auto flex items-center justify-between px-2 py-3">

//         {/* LEFT LOGO */}
//         <div className="flex items-center gap-2">
//           <ShoppingCart className="text-indigo-600 w-6 h-6" />
//           <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 bg-clip-text text-transparent">
//             SmartShop
//           </h1>
//         </div>

//         {/* CENTER SEARCH */}
//         <div className="flex-1 flex flex-col md:flex-row md:justify-center md:items-center">
//           <div ref={searchRef} className="relative w-full max-w-2xl">
//             <form
//               onSubmit={handleSearch}
//               className="flex items-center bg-gray-100 rounded-[4rem] px-4 py-2 w-full"
//             >
//               <Search className="text-gray-400 mr-2" />

//               <input
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
//                 placeholder="Search for products, brand, category..."
//                 className="bg-transparent w-full outline-none text-gray-800 dark:text-gray-100"
//               />

//               <button
//                 type="submit"
//                 className="ml-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1.5 rounded-full"
//               >
//                 Search
//               </button>
//             </form>

//             {/* DROPDOWN */}
//             {showSuggestions && suggestions.length > 0 && (
//               <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50">
//                 {suggestions.map((s, i) => (
//                   <div
//                     key={i}
//                     onClick={() => handleSuggestionClick(s)}
//                     className="px-4 py-3 hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
//                   >
//                     <Search className="w-4 h-4 text-gray-400" />
//                     <span className="text-gray-800 dark:text-gray-100">{s}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* PROFILE */}
//           {isAuthenticated && user && (
//             <div className="flex items-center mt-3 md:mt-0 md:ml-6">
//               <img
//                 src={resolveAvatar()}
//                 className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500"
//                 alt="Profile"
//               />
//               <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">
//                 {user?.name?.toUpperCase() || "GUEST"}
//               </span>
//             </div>
//           )}
//         </div>

//         {/* RIGHT SIDE ICONS */}
//         <div className="flex items-center gap-6">

//           {/* Wishlist */}
//           <Link href="/wishlist" className="relative">
//             <Heart
//               className={`w-6 h-6 ${
//                 wishlistCount > 0 ? "text-red-500 fill-red-500" : "text-gray-600"
//               }`}
//             />
//             {wishlistCount > 0 && (
//               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                 {wishlistCount}
//               </span>
//             )}
//           </Link>

//           {/* Cart */}
//           <Link href="/cart" className="relative">
//             <ShoppingCart className="w-6 h-6 text-gray-600" />
//             {cartCount > 0 && (
//               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                 {cartCount}
//               </span>
//             )}
//           </Link>

//           {/* Menu Button */}
//           <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
//             {menuOpen ? <X /> : <Menu />}
//           </button>
//         </div>
//       </div>

//       {/* ----------------- GLASSMORPHIC HAMBURGER MENU ----------------- */}
//       {menuOpen && (
//         <div className="fixed top-24 right-8 z-[60] w-72">
//           <div
//             className="relative rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 
//             border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden"
//             style={{
//               boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)",
//               border: "1px solid rgba(255,255,255,0.18)",
//             }}
//           >
//             <button
//               onClick={() => setMenuOpen(false)}
//               className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             <ul className="flex flex-col gap-3 py-6 px-6">

//               {/* HOME */}
//               <li
//                 className="flex items-center gap-3 cursor-pointer group transition-transform hover:scale-110 hover:rotate-[1deg]"
//                 onClick={() => router.push("/")}
//               >
//                 <div className="flex items-center justify-center w-9 h-9 rounded-full 
//                 bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 shadow-md group-hover:shadow-lg">
//                   <Home className="w-5 h-5 text-white" />
//                 </div>
//                 <span className="font-bold text-lg bg-gradient-to-r from-pink-500 via-orange-400 to-red-500 bg-clip-text text-transparent">
//                   HOME
//                 </span>
//               </li>

//               {/* AUTH MENU */}
//               {!isAuthenticated ? (
//                 <li
//                   className="flex items-center gap-3 cursor-pointer group hover:scale-110 hover:rotate-[1deg]"
//                   onClick={() => router.push("/login")}
//                 >
//                   <div className="flex items-center justify-center w-9 h-9 rounded-full 
//                   bg-gradient-to-r from-indigo-500 via-pink-500 to-orange-500 shadow-md">
//                     <LogIn className="w-5 h-5 text-white" />
//                   </div>
//                   <span className="font-bold text-lg bg-gradient-to-r from-indigo-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
//                     LOGIN
//                   </span>
//                 </li>
//               ) : (
//                 <>
//                   {/* MY PROFILE DROPDOWN */}
//                   <li className="flex flex-col">
//                     <div
//                       className="flex items-center gap-3 cursor-pointer group hover:scale-110 hover:rotate-[1deg]"
//                       onClick={() => setProfileDropdownOpen((v) => !v)}
//                     >
//                       <div className="flex items-center justify-center w-9 h-9 rounded-full 
//                       bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md">
//                         <User className="w-5 h-5 text-white" />
//                       </div>

//                       <span className="font-bold text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
//                         MY PROFILE
//                       </span>

//                       <span className="ml-auto text-xs text-gray-400">▼</span>
//                     </div>

//                     {profileDropdownOpen && (
//                       <ul className="ml-10 mt-3 flex flex-col gap-3">

//                         <li
//                           className="flex items-center gap-2 cursor-pointer hover:scale-105 transition"
//                           onClick={() => router.push("/my-profile/view-profile")}
//                         >
//                           <User className="w-5 h-5 text-indigo-500" />
//                           <span>View Profile</span>
//                         </li>

//                         <li
//                           className="flex items-center gap-2 cursor-pointer hover:scale-105 transition"
//                           onClick={() => router.push("/orders")}
//                         >
//                           <ClipboardList className="w-5 h-5 text-orange-500" />
//                           <span>Orders</span>
//                         </li>

//                         <li
//                           className="flex items-center gap-2 cursor-pointer hover:scale-105 transition"
//                           onClick={() => router.push("/notifications")}
//                         >
//                           <Bell className="w-5 h-5 text-pink-500" />
//                           <span>Notifications</span>
//                         </li>

//                         <li
//                           className="flex items-center gap-2 cursor-pointer hover:scale-105 transition"
//                           onClick={() => router.push("/coupons")}
//                         >
//                           <Gift className="w-5 h-5 text-green-500" />
//                           <span>Coupons</span>
//                         </li>

//                         <li
//                           className="flex items-center gap-2 cursor-pointer hover:scale-105 transition"
//                           onClick={logout}
//                         >
//                           <LogOut className="w-5 h-5 text-red-500" />
//                           <span>Logout</span>
//                         </li>
//                       </ul>
//                     )}
//                   </li>
//                 </>
//               )}

//               {/* SELLER */}
//               <li className="flex items-center gap-3 cursor-pointer group hover:scale-110 hover:rotate-[1deg]">
//                 <div className="w-9 h-9 flex items-center justify-center rounded-full 
//                 bg-gradient-to-r from-green-400 via-teal-400 to-emerald-500 shadow-md">
//                   <Store className="w-5 h-5 text-white" />
//                 </div>
//                 <span className="font-bold text-lg bg-gradient-to-r from-green-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
//                   BECOME A SELLER
//                 </span>
//               </li>

//               {/* DOWNLOAD */}
//               <li className="flex items-center gap-3 cursor-pointer group hover:scale-110 hover:rotate-[1deg]">
//                 <div className="w-9 h-9 flex items-center justify-center rounded-full 
//                 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 shadow-md">
//                   <Smartphone className="w-5 h-5 text-white" />
//                 </div>
//                 <span className="font-bold text-lg bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
//                   DOWNLOAD APP
//                 </span>
//               </li>

//             </ul>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }
