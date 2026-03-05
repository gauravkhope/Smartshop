"use client";

import { useCart, CartItem } from "@/app/context/CartContext";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
  product: Omit<CartItem, "quantity">;
  variant?: "default" | "large" | "icon";
  className?: string;
}

export default function AddToCartButton({
  product,
  variant = "default",
  className = "",
}: AddToCartButtonProps) {
  const { addToCart, isInCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  // Prevent crash if product is partially missing
  const safeProduct = {
    id: product?.id ?? 0,
    name: product?.name ?? "Unknown Product",
    brand: product?.brand ?? "Unknown Brand",
    price: product?.price ?? 0,
    image: product?.image ?? "/placeholder.png",
  };

  const inCart = isInCart(safeProduct.id);

  const handleAddToCart = () => {
    if (inCart && !justAdded) return; // avoid duplicate
    addToCart(safeProduct);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  // ICON VARIANT
  if (variant === "icon") {
    return (
      <button
        onClick={handleAddToCart}
        className={`p-2 rounded-full shadow-lg transition-all ${
          inCart || justAdded
            ? "bg-green-500 text-white"
            : "bg-white text-gray-700 hover:text-orange-600"
        } ${className}`}
        title={inCart ? "In Cart" : "Add to Cart"}
      >
        {inCart || justAdded ? (
          <Check className="w-5 h-5" />
        ) : (
          <ShoppingCart className="w-5 h-5" />
        )}
      </button>
    );
  }

  // LARGE VARIANT
  if (variant === "large") {
    return (
      <button
        onClick={handleAddToCart}
        disabled={inCart && !justAdded}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
          inCart && !justAdded
            ? "bg-green-500 text-white cursor-not-allowed"
            : justAdded
            ? "bg-green-500 text-white"
            : "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white hover:shadow-xl"
        } ${className}`}
      >
        {inCart && !justAdded ? (
          <>
            <Check className="w-6 h-6" />
            Already in Cart
          </>
        ) : justAdded ? (
          <>
            <Check className="w-6 h-6" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="w-6 h-6" />
            Add to Cart
          </>
        )}
      </button>
    );
  }

  // DEFAULT VARIANT
  return (
    <button
      onClick={handleAddToCart}
      className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
        inCart || justAdded
          ? "bg-green-500 text-white"
          : "bg-orange-600 text-white hover:bg-orange-700"
      } ${className}`}
    >
      {inCart || justAdded ? (
        <>
          <Check className="w-4 h-4" />
          In Cart
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </>
      )}
    </button>
  );
}
