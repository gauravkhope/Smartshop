"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import toast from "react-hot-toast";

export interface WishlistItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  category?: string;
  mainCategory?: string;
  discount?: number;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  clearWishlist: () => void;
  isInWishlist: (id: number) => boolean;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const toastShownRef = useRef<Set<string>>(new Set());

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (error) {
        console.error("Error loading wishlist:", error);
        localStorage.removeItem("wishlist");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  // Add item to wishlist
  const addToWishlist = useCallback((item: WishlistItem) => {
    if (!item || !item.id) {
      console.error("Invalid item:", item);
      return;
    }

    const toastKey = `add-${item.id}-${Date.now()}`;
    
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((wishItem) => wishItem.id === item.id);
      
      if (exists) {
        // Only show toast if not already shown recently
        if (!toastShownRef.current.has(`exists-${item.id}`)) {
          toastShownRef.current.add(`exists-${item.id}`);
          setTimeout(() => {
            toast.error(`${item.name} is already in wishlist`);
            // Clear the ref after a short delay
            setTimeout(() => toastShownRef.current.delete(`exists-${item.id}`), 1000);
          }, 0);
        }
        return prevWishlist;
      }

      // Only show toast if not already shown recently
      if (!toastShownRef.current.has(toastKey)) {
        toastShownRef.current.add(toastKey);
        setTimeout(() => {
          toast.success(`${item.name} added to wishlist! 💖`, {
            icon: "💖",
          });
          // Clear the ref after a short delay
          setTimeout(() => toastShownRef.current.delete(toastKey), 1000);
        }, 0);
      }
      return [...prevWishlist, item];
    });
  }, []);

  // Remove item from wishlist
  const removeFromWishlist = useCallback((id: number) => {
    const toastKey = `remove-${id}-${Date.now()}`;
    
    setWishlist((prevWishlist) => {
      const item = prevWishlist.find((wishItem) => wishItem.id === id);
      if (item && !toastShownRef.current.has(toastKey)) {
        toastShownRef.current.add(toastKey);
        // Schedule toast for next tick to avoid setState during render
        setTimeout(() => {
          toast.success(`${item.name} removed from wishlist`, {
            icon: "💔",
          });
          // Clear the ref after a short delay
          setTimeout(() => toastShownRef.current.delete(toastKey), 1000);
        }, 0);
      }
      return prevWishlist.filter((wishItem) => wishItem.id !== id);
    });
  }, []);

  // Clear entire wishlist
  const clearWishlist = useCallback(() => {
    const toastKey = `clear-${Date.now()}`;
    
    setWishlist([]);
    
    if (!toastShownRef.current.has(toastKey)) {
      toastShownRef.current.add(toastKey);
      // Schedule toast for next tick to avoid setState during render
      setTimeout(() => {
        toast.success("Wishlist cleared");
        // Clear the ref after a short delay
        setTimeout(() => toastShownRef.current.delete(toastKey), 1000);
      }, 0);
    }
  }, []);

  // Check if item is in wishlist
  const isInWishlist = useCallback((id: number) => {
    return wishlist.some((item) => item.id === id);
  }, [wishlist]);

  // Get total count of wishlist items
  const getWishlistCount = useCallback(() => {
    return wishlist.length;
  }, [wishlist]);

  const value = useMemo(
    () => ({
      wishlist,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
      getWishlistCount,
    }),
    [wishlist, addToWishlist, removeFromWishlist, clearWishlist, isInWishlist, getWishlistCount]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
