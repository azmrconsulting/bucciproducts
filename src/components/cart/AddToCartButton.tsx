"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Check } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    category: string | null;
  };
  disabled?: boolean;
  className?: string;
}

export default function AddToCartButton({
  product,
  disabled = false,
  className = "",
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || isAdding) return;

    setIsAdding(true);
    try {
      await addToCart({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.priceCents / 100,
        category: product.category,
      });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className={`btn btn-primary btn-large w-full ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <span>
        {isAdding ? "Adding..." : isAdded ? "Added to Cart!" : disabled ? "Sold Out" : "Add to Cart"}
      </span>
      {isAdded && <Check className="w-5 h-5" />}
    </button>
  );
}
