"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function checkout() {
    if (!user) {
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            name: item.title,
            price: item.price,
            quantity: item.quantity,
            productId: item.id,
          })),
        }),
      });

      const data = await res.json();
      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        alert(data.error || "Error creating checkout session");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="p-6 max-w-4xl mx-auto pb-24">
        <h1 className="font-accent text-3xl mb-6">Your Cart</h1>
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-2xl mb-4">🛒 Your cart is empty</p>
          <Link
            href="/marketplace"
            className="text-purple-600 font-bold hover:underline"
          >
            Start Shopping →
          </Link>
        </div>
      </main>
    );
  }

  const total = getTotal();
  const totalDollars = (total / 100).toFixed(2);

  return (
    <main className="p-6 max-w-4xl mx-auto pb-24">
      <h1 className="font-accent text-3xl mb-6">Your Cart</h1>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {items.map((item) => {
            const itemTotal = (item.price * item.quantity) / 100;
            return (
              <div key={item.id} className="p-4 flex gap-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <Link
                    href={`/product/${item.id}`}
                    className="font-semibold text-lg hover:text-purple-600"
                  >
                    {item.title}
                  </Link>
                  <p className="text-gray-600">${(item.price / 100).toFixed(2)} each</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                        className="w-16 border-2 border-gray-300 rounded px-2 py-1"
                      />
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${itemTotal.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold">Total:</span>
            <span className="text-2xl font-bold text-purple-600">${totalDollars}</span>
          </div>
          <button
            onClick={checkout}
            disabled={loading || !user}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? "Processing..."
              : !user
              ? "Login to Checkout"
              : "Proceed to Checkout"}
          </button>
          {!user && (
            <p className="text-center text-sm text-gray-600 mt-2">
              <Link href="/login" className="text-purple-600 hover:underline">
                Login
              </Link>{" "}
              or{" "}
              <Link href="/signup" className="text-purple-600 hover:underline">
                Sign Up
              </Link>{" "}
              to checkout
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
