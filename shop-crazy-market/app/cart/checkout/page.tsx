"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

interface CheckoutItem {
  id: string;
  listingId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

function CheckoutContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { removeItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [shippingCents, setShippingCents] = useState(0);
  const [giftWrapCents, setGiftWrapCents] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    // Load checkout items from sessionStorage
    const stored = sessionStorage.getItem("checkoutItems");
    if (stored) {
      try {
        const items = JSON.parse(stored);
        setCheckoutItems(items);
      } catch (e) {
        console.error("Error parsing checkout items:", e);
        router.push("/cart");
      }
    } else {
      router.push("/cart");
    }
  }, [user, authLoading, router]);

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxCents = Math.round(subtotal * 0.08); // 8% tax (adjust as needed)
  const total = subtotal + shippingCents + giftWrapCents + taxCents;

  async function proceedToPayment() {
    if (!user || checkoutItems.length === 0) return;

    setLoading(true);
    setError("");

    try {
      // Create checkout sessions for each item
      const checkoutPromises = checkoutItems.map(async (item) => {
        const response = await fetch("/api/orders/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.id,
          },
          body: JSON.stringify({
            listingId: item.listingId,
            buyerEmail: user.email,
            itemsSubtotalCents: item.price * item.quantity,
            shippingCents: shippingCents,
            giftWrapCents: giftWrapCents,
            taxCents: taxCents,
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
      checkoutItems.forEach(item => {
        removeItem(item.id);
      });

      // Clear sessionStorage
      sessionStorage.removeItem("checkoutItems");

      // Redirect to first checkout session
      if (results.length > 0 && results[0].checkoutUrl) {
        window.location.href = results[0].checkoutUrl;
      } else {
        alert("Checkout sessions created. Please check your orders.");
        router.push("/orders");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      setError(error.message || "An error occurred during checkout");
      setLoading(false);
    }
  }

  if (authLoading || checkoutItems.length === 0) {
    return (
      <main className="p-4 sm:p-6 max-w-4xl mx-auto pb-24">
        <div className="text-center py-10 text-gray-500">Loading checkout...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="p-4 sm:p-6 max-w-4xl mx-auto pb-24">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Review Your Order</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold">Order Items ({checkoutItems.length})</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {checkoutItems.map((item) => {
            const itemTotal = (item.price * item.quantity) / 100;
            return (
              <div key={item.id} className="p-4 sm:p-6 flex gap-4">
                {item.image && (
                  <Link href={`/listings/${item.listingId}`}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer"
                    />
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/listings/${item.listingId}`}
                    className="font-semibold text-base sm:text-lg hover:text-purple-600 block mb-1"
                  >
                    {item.title}
                  </Link>
                  <p className="text-gray-600 text-sm sm:text-base">
                    ${(item.price / 100).toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-base sm:text-lg">${itemTotal.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping & Options */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Shipping & Options</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipping Method
            </label>
            <select
              value={shippingCents}
              onChange={(e) => setShippingCents(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="0">Standard Shipping - Free</option>
              <option value="500">Express Shipping - $5.00</option>
              <option value="1000">Overnight Shipping - $10.00</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={giftWrapCents > 0}
                onChange={(e) => setGiftWrapCents(e.target.checked ? 300 : 0)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Gift Wrap (+$3.00)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Summary</h2>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold">${(subtotal / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-gray-600">Shipping:</span>
            <span className="font-semibold">${(shippingCents / 100).toFixed(2)}</span>
          </div>
          {giftWrapCents > 0 && (
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-gray-600">Gift Wrap:</span>
              <span className="font-semibold">${(giftWrapCents / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-gray-600">Tax:</span>
            <span className="font-semibold">${(taxCents / 100).toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-lg sm:text-xl font-semibold">Total:</span>
              <span className="text-2xl sm:text-3xl font-bold text-purple-600">
                ${(total / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={proceedToPayment}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 sm:py-4 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base sm:text-lg"
          >
            {loading ? "Processing..." : "💳 Proceed to Payment (Apple Pay, Google Pay)"}
          </button>
          
          <Link
            href="/cart"
            className="block text-center text-purple-600 hover:text-purple-700 text-sm sm:text-base"
          >
            ← Back to Cart
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="p-4 sm:p-6 max-w-4xl mx-auto pb-24">
        <div className="text-center py-10 text-gray-500">Loading checkout...</div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

