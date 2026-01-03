"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const listingId = searchParams.get("listingId");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listing, setListing] = useState<any>(null);
  const [activeDeal, setActiveDeal] = useState<any | null>(null);
  const [discountCents, setDiscountCents] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [storeCredit, setStoreCredit] = useState(0);
  const [useStoreCredit, setUseStoreCredit] = useState(false);
  const [storeCreditToUse, setStoreCreditToUse] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (listingId && user) {
      fetchListing();
      fetchStoreCredit();
    }
  }, [listingId, user, authLoading, router]);

  async function fetchStoreCredit() {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/users/${user.id}/store-credit`);
      if (response.ok) {
        const data = await response.json();
        setStoreCredit(data.storeCredit || 0); // Use available (non-expired) credit
      }
    } catch (error) {
      console.error("Error fetching store credit:", error);
    }
  }

  async function fetchListing() {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listing");
      }
      const data = await response.json();
      setListing(data);
      
      // Fetch active deals for this listing
      const dealsResponse = await fetch(`/api/listings/${listingId}/deals`);
      if (dealsResponse.ok) {
        const deals = await dealsResponse.json();
        if (deals.length > 0) {
          setActiveDeal(deals[0]);
          // Apply the deal automatically
          applyDeal(deals[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load listing");
    }
  }

  async function applyDeal(dealId?: string, code?: string) {
    if (!listing) return;
    
    try {
      const response = await fetch("/api/deals/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          dealId,
          promoCode: code,
          itemsSubtotalCents: listing.priceCents,
          shopId: listing.seller?.shop?.id || null, // Include shopId for shop-wide promotions
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDiscountCents(data.discountCents || 0);
        if (data.deal) {
          setActiveDeal(data.deal);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to apply promo code");
        setPromoCode("");
      }
    } catch (err) {
      console.error("Error applying deal:", err);
      alert("Failed to apply promo code. Please try again.");
    }
  }

  async function handlePromoCode() {
    if (!promoCode.trim()) return;
    await applyDeal(undefined, promoCode.trim().toUpperCase());
  }

  async function handleCheckout() {
    if (!listing || !user) return;

    setLoading(true);
    setError("");

    try {
      // Calculate order breakdown with discount
      const itemsSubtotalCents = listing.priceCents - discountCents;
      const shippingCents = 0; // Add shipping calculation if needed
      const giftWrapCents = 0;
      const taxCents = 0; // Add tax calculation if needed

      const response = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id, // Pass user ID for order creation
        },
        body: JSON.stringify({
          listingId: listing.id,
          buyerEmail: user.email,
          itemsSubtotalCents: listing.priceCents, // Use original price
          shippingCents,
          giftWrapCents,
          taxCents,
          country: "DEFAULT",
          promoCode: activeDeal?.promoCode || promoCode || null,
          discountCents,
          storeCreditUsedCents: useStoreCredit ? storeCreditToUse : 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to create checkout session");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      setError(err.message || "Failed to proceed to checkout");
      setLoading(false);
    }
  }

  if (authLoading || !listing) {
    return (
      <main className="p-6 max-w-2xl mx-auto pb-24">
        <div className="text-center py-10 text-gray-500">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (error && !listing) {
    return (
      <main className="p-6 max-w-2xl mx-auto pb-24">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/marketplace" className="text-purple-600 hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 max-w-2xl mx-auto pb-24">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Checkout</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{listing.title}</h2>
          
          {listing.images && Array.isArray(listing.images) && listing.images.length > 0 && (
            <div className="w-full h-48 sm:h-64 bg-gray-100 rounded-lg overflow-hidden mb-3 sm:mb-4">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 line-clamp-3">{listing.description}</p>

          {/* Promo Code Input */}
          {!activeDeal && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <label className="block text-xs sm:text-sm font-semibold mb-2">Have a promo code?</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg"
                />
                <button
                  type="button"
                  onClick={handlePromoCode}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm sm:text-base whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Active Deal Display */}
          {activeDeal && discountCents > 0 && (
            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-red-600">
                  {activeDeal.title} Applied!
                </span>
                <span className="text-sm text-gray-600">
                  Save ${(discountCents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Store Credit Option */}
          {storeCredit > 0 && (
            <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useStoreCredit}
                      onChange={(e) => {
                        setUseStoreCredit(e.target.checked);
                        if (e.target.checked) {
                          // Auto-set to use all available store credit (up to order total)
                          const orderTotal = listing.priceCents - discountCents;
                          setStoreCreditToUse(Math.min(storeCredit, orderTotal));
                        } else {
                          setStoreCreditToUse(0);
                        }
                      }}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="font-semibold text-gray-900">
                      Use Store Credit
                    </span>
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Available: ${(storeCredit / 100).toFixed(2)}
                  </p>
                </div>
              </div>
              
              {useStoreCredit && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold mb-2">
                    Amount to use (max ${(storeCredit / 100).toFixed(2)}):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={Math.min(storeCredit, listing.priceCents - discountCents)}
                    step="0.01"
                    value={(storeCreditToUse / 100).toFixed(2)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      const maxCents = Math.min(storeCredit, listing.priceCents - discountCents);
                      setStoreCreditToUse(Math.min(Math.max(0, Math.round(value * 100)), maxCents));
                    }}
                    className="w-full px-3 py-2 text-sm border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: ${(Math.min(storeCredit, listing.priceCents - discountCents) / 100).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Original Price:</span>
                <span className="text-lg font-semibold text-gray-700">
                  ${(listing.priceCents / 100).toFixed(2)}
                </span>
              </div>
              {discountCents > 0 && (
                <div className="flex justify-between items-center text-red-600">
                  <span>Discount:</span>
                  <span className="font-semibold">
                    -${(discountCents / 100).toFixed(2)}
                  </span>
                </div>
              )}
              {useStoreCredit && storeCreditToUse > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Store Credit:</span>
                  <span className="font-semibold">
                    -${(storeCreditToUse / 100).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-900 font-semibold">Total:</span>
                <span className="text-2xl font-bold text-purple-600">
                  ${((listing.priceCents - discountCents - (useStoreCredit ? storeCreditToUse : 0)) / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !listing.isActive}
              className="w-full bg-purple-600 text-white py-3 sm:py-4 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
            >
              {loading ? "Processing..." : listing.isActive ? "💳 Proceed to Payment (Apple Pay, Google Pay)" : "Listing Not Active"}
            </button>

            <Link
              href={`/listings/${listing.id}`}
              className="block text-center text-purple-600 hover:text-purple-700 text-sm mt-4"
            >
              ← Back to Listing
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="p-6 max-w-2xl mx-auto pb-24">
        <div className="text-center py-10 text-gray-500">Loading...</div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

