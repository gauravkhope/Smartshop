"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

// Cart Item Type
export interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  category?: string;
  mainCategory?: string;
}

// Saved for Later Item Type
export interface SavedItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  category?: string;
  mainCategory?: string;
}

// Cart Context Type
interface CartContextType {
  cart: CartItem[];
  savedForLater: SavedItem[];
  buyNowItem: CartItem | null;
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  moveToWishlist: (productId: number) => void;
  saveForLater: (productId: number) => void;
  moveToCart: (productId: number) => void;
  removeSavedItem: (productId: number) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isInCart: (productId: number) => boolean;
  setBuyNowItem: (product: CartItem | null) => void;
  clearBuyNowItem: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedForLater, setSavedForLater] = useState<SavedItem[]>([]);
  const [buyNowItem, setBuyNowItemState] = useState<CartItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      const savedItems = localStorage.getItem("savedForLater");

      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error("Error loading cart:", error);
        }
      }

      if (savedItems) {
        try {
          setSavedForLater(JSON.parse(savedItems));
        } catch (error) {
          console.error("Error loading saved items:", error);
        }
      }

      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Save "saved for later" to localStorage
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("savedForLater", JSON.stringify(savedForLater));
    }
  }, [savedForLater, isLoaded]);

  // Add product to cart
  const addToCart = useCallback((product: Omit<CartItem, "quantity">) => {
    // Validate product ID
    if (!product || !product.id || product.id === null || product.id === undefined) {
      console.warn("Cannot add product with invalid ID:", product);
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      // Increase quantity if already in cart
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      toast.success(`Increased quantity of ${product.name}`);
    } else {
      // Add new item
      setCart((prevCart) => [...prevCart, { ...product, quantity: 1 }]);
      toast.success(`${product.name} added to cart!`);
    }
  }, [cart]);

  // Remove product from cart
  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Update quantity
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    if (cart.length > 0) {
      setCart([]);
    }
  };

  // Move to wishlist (placeholder - will implement in Sprint 4)
  const moveToWishlist = (productId: number) => {
    const item = cart.find((item) => item.id === productId);
    if (item) {
      removeFromCart(productId);
      toast.success(`${item.name} moved to wishlist`);
      // TODO: Implement wishlist in Sprint 4
    }
  };

  // Save for later
  const saveForLater = (productId: number) => {
    const item = cart.find((item) => item.id === productId);
    if (item) {
      setSavedForLater((prev) => {
        if (prev.find((i) => i.id === item.id)) {
          return prev;
        }
        return [...prev, { ...item }];
      });
      removeFromCart(productId);
      toast.success(`${item.name} saved for later`);
    }
  };

  // Move saved item back to cart
  const moveToCart = (productId: number) => {
    const item = savedForLater.find((item) => item.id === productId);
    if (item) {
      addToCart(item);
      setSavedForLater((prev) => prev.filter((i) => i.id !== productId));
    }
  };

  // Remove saved item
  const removeSavedItem = (productId: number) => {
    const item = savedForLater.find((item) => item.id === productId);
    setSavedForLater((prev) => prev.filter((i) => i.id !== productId));
    if (item) {
      toast.success(`${item.name} removed`);
    }
  };

  // Calculate cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Get cart item count - memoized for better performance
  const cartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const getCartCount = useCallback(() => {
    return cartCount;
  }, [cartCount]);

  // Check if product is in cart - memoized
  const isInCart = useCallback((productId: number) => {
    return cart.some((item) => item.id === productId);
  }, [cart]);

  // Set buy now item (for direct checkout without adding to cart)
  const setBuyNowItem = useCallback((product: CartItem | null) => {
    setBuyNowItemState(product);
    if (product && typeof window !== "undefined") {
      localStorage.setItem("buyNowItem", JSON.stringify(product));
    }
  }, []);

  // Clear buy now item
  const clearBuyNowItem = useCallback(() => {
    setBuyNowItemState(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("buyNowItem");
    }
  }, []);

  // Load buy now item on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBuyNowItem = localStorage.getItem("buyNowItem");
      if (savedBuyNowItem) {
        try {
          setBuyNowItemState(JSON.parse(savedBuyNowItem));
        } catch (error) {
          console.error("Error loading buy now item:", error);
        }
      }
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        savedForLater,
        buyNowItem,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        moveToWishlist,
        saveForLater,
        moveToCart,
        removeSavedItem,
        getCartTotal,
        getCartCount,
        isInCart,
        setBuyNowItem,
        clearBuyNowItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
