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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (listingId && user) {
      fetchListing();
    }
  }, [listingId, user, authLoading, router]);

  async function fetchListing() {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listing");
      }
      const data = await response.json();
      setListing(data);
    } catch (err: any) {
      setError(err.message || "Failed to load listing");
    }
  }

  async function handleCheckout() {
    if (!listing || !user) return;

    setLoading(true);
    setError("");

    try {
      // Calculate order breakdown (simplified - you may want to add shipping, tax, etc.)
      const itemsSubtotalCents = listing.priceCents;
      const shippingCents = 0; // Add shipping calculation if needed
      const giftWrapCents = 0;
      const taxCents = 0; // Add tax calculation if needed

      const response = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: listing.id,
          buyerEmail: user.email,
          itemsSubtotalCents,
          shippingCents,
          giftWrapCents,
          taxCents,
          country: "DEFAULT",
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
    <main className="p-6 max-w-2xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{listing.title}</h2>
          
          {listing.images && Array.isArray(listing.images) && listing.images.length > 0 && (
            <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <p className="text-gray-700 mb-4">{listing.description}</p>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Price:</span>
              <span className="text-2xl font-bold text-purple-600">
                ${(listing.priceCents / 100).toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !listing.isActive}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : listing.isActive ? "Proceed to Payment" : "Listing Not Active"}
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

