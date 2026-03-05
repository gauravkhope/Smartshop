"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface Product {
  id: number;
  name: string;
  image: string;
  price: number | string;
}

interface ShopContextType {
  cart: Product[];
  wishlist: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (id: number) => boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev; // avoid duplicates
      return [...prev, product];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isWishlisted = (id: number) => wishlist.some((item) => item.id === id);

  return (
    <ShopContext.Provider
      value={{ cart, wishlist, addToCart, removeFromCart, toggleWishlist, isWishlisted }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within a ShopProvider");
  return context;
};
