"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

interface AddToCartProps {
  productId: string;
  title: string;
  price: number;
  quantity?: number;
  image?: string;
}

export default function AddToCart({
  productId,
  title,
  price,
  quantity = 1,
  image,
}: AddToCartProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addItem({
      id: productId,
      title,
      price,
      quantity,
      image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleAddToCart}
      className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
    >
      {added ? "✓ Added!" : "Add to Cart"}
    </button>
  );
}

