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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(items.map(item => item.id)) // Select all by default
  );

  // Update selected items when cart items change
  useState(() => {
    if (items.length > 0) {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  });

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedItems(new Set(items.map(item => item.id)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const selectedItemsList = items.filter(item => selectedItems.has(item.id));
  const selectedTotal = selectedItemsList.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function checkout(selectedOnly: boolean = false) {
    if (!user) {
      router.push("/login");
      return;
    }

    const itemsToCheckout = selectedOnly 
      ? items.filter(item => selectedItems.has(item.id))
      : items;

    if (itemsToCheckout.length === 0) {
      alert(selectedOnly ? "Please select at least one item" : "Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      // For now, checkout items one by one (we'll create separate orders)
      // In the future, we could create a single order with multiple line items
      const checkoutPromises = itemsToCheckout.map(async (item) => {
        const response = await fetch("/api/orders/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.id,
          },
          body: JSON.stringify({
            listingId: item.listingId || item.id,
            buyerEmail: user.email,
            itemsSubtotalCents: item.price,
            shippingCents: 0,
            giftWrapCents: 0,
            taxCents: 0,
            country: "DEFAULT",
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || `Failed to checkout ${item.title}`);
        }

        return response.json();
      });

      const results = await Promise.all(checkoutPromises);
      
      // Remove checked out items from cart
      itemsToCheckout.forEach(item => {
        removeItem(item.id);
      });

      // Redirect to first checkout session
      if (results.length > 0 && results[0].checkoutUrl) {
        window.location.href = results[0].checkoutUrl;
      } else {
        alert("Checkout sessions created. Please check your orders.");
        router.push("/orders");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "An error occurred during checkout");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="p-4 sm:p-6 max-w-4xl mx-auto pb-24">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Your Cart</h1>
        <div className="bg-white rounded-xl shadow p-8 sm:p-12 text-center">
          <p className="text-xl sm:text-2xl mb-4">🛒 Your cart is empty</p>
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
  const selectedTotalDollars = (selectedTotal / 100).toFixed(2);

  return (
    <main className="p-4 sm:p-6 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Your Cart</h1>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-sm text-purple-600 hover:underline"
          >
            Select All
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={deselectAll}
            className="text-sm text-purple-600 hover:underline"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
        <div className="divide-y divide-gray-200">
          {items.map((item) => {
            const itemTotal = (item.price * item.quantity) / 100;
            const isSelected = selectedItems.has(item.id);
            return (
              <div key={item.id} className="p-4 sm:p-6 flex gap-4 items-start">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleItem(item.id)}
                  className="mt-2 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                {item.image && (
                  <Link href={`/listings/${item.id}`}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer"
                    />
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/listings/${item.id}`}
                    className="font-semibold text-base sm:text-lg hover:text-purple-600 block mb-1"
                  >
                    {item.title}
                  </Link>
                  <p className="text-gray-600 text-sm sm:text-base">${(item.price / 100).toFixed(2)} each</p>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                        className="w-16 border-2 border-gray-300 rounded px-2 py-1 text-sm"
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
                  <p className="font-bold text-base sm:text-lg">${itemTotal.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkout Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="space-y-4">
          {selectedItems.size > 0 && selectedItems.size < items.length && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-purple-800">
                  Selected Items ({selectedItems.size}):
                </span>
                <span className="text-lg font-bold text-purple-600">
                  ${selectedTotalDollars}
                </span>
              </div>
              <button
                onClick={() => checkout(true)}
                disabled={loading || !user}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Processing..." : `💳 Checkout Selected (${selectedItems.size} items)`}
              </button>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg sm:text-xl font-semibold">Total ({items.length} items):</span>
              <span className="text-2xl sm:text-3xl font-bold text-purple-600">${totalDollars}</span>
            </div>
            <button
              onClick={() => checkout(false)}
              disabled={loading || !user}
              className="w-full bg-purple-600 text-white py-3 sm:py-4 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base sm:text-lg"
            >
              {loading
                ? "Processing..."
                : !user
                ? "Login to Checkout"
                : `💳 Checkout All (${items.length} items)`}
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
      </div>
    </main>
  );
}
