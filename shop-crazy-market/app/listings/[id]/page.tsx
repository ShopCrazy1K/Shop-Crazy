"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  description: string;
  slug: string;
  priceCents: number;
  currency: string;
  images: string[];
  digitalFiles: string[];
  isActive: boolean;
  feeSubscriptionStatus: string | null;
  createdAt: string;
  seller: {
    id: string;
    email: string;
    username: string | null;
  };
}

export default function ListingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const listingId = params.id as string;
  const feeStatus = searchParams.get("fee");
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchListing() {
      try {
        const response = await fetch(`/api/listings/${listingId}`);
        if (!response.ok) {
          throw new Error("Listing not found");
        }
        const data = await response.json();
        setListing(data);
      } catch (err: any) {
        setError(err.message || "Failed to load listing");
      } finally {
        setLoading(false);
      }
    }

    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The listing you're looking for doesn't exist."}</p>
          <Link
            href="/sell"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create New Listing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Success/Cancel Messages */}
        {feeStatus === "success" && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-green-700">
              ✅ Payment successful! Your listing is now active.
            </p>
          </div>
        )}
        {feeStatus === "cancel" && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <p className="text-yellow-700">
              ⚠️ Payment was cancelled. Your listing is inactive until payment is completed.
            </p>
          </div>
        )}

        {/* Listing Status */}
        {!listing.isActive && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700">
              ⚠️ This listing is inactive. Please complete payment to activate it.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Images */}
            <div className="md:w-1/2">
              {listing.images.length > 0 ? (
                <div className="aspect-square bg-gray-100">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>
              
              <div className="mb-6">
                <p className="text-4xl font-bold text-purple-600 mb-2">
                  ${(listing.priceCents / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {listing.currency.toUpperCase()}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500">
                  Listed by: {listing.seller.username || listing.seller.email}
                </p>
                <p className="text-sm text-gray-500">
                  Status: {listing.isActive ? (
                    <span className="text-green-600 font-semibold">Active</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Inactive</span>
                  )}
                </p>
              </div>

              {listing.isActive && (
                <Link
                  href={`/orders/checkout?listingId=${listing.id}`}
                  className="block w-full bg-purple-600 text-white text-center py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Buy Now
                </Link>
              )}

              <div className="mt-6 pt-6 border-t">
                <Link
                  href="/sell"
                  className="text-purple-600 hover:text-purple-700 text-sm"
                >
                  ← Create Another Listing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

