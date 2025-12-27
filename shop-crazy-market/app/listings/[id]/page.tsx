"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const listingId = params.id as string;
  const feeStatus = searchParams.get("fee");

  // Handle "new" route - redirect to create page
  useEffect(() => {
    if (listingId === "new") {
      router.replace("/listings/new");
      return;
    }
  }, [listingId, router]);

  if (listingId === "new" || !listingId || listingId.length < 10) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Create New Listing</h1>
          <p className="text-gray-600 mb-6">Redirecting...</p>
        </div>
      </div>
    );
  }
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let fetchTimeout: NodeJS.Timeout | undefined = undefined;
    
    async function fetchListing() {
      if (!listingId) {
        setError("No listing ID provided");
        setLoading(false);
        return;
      }

      console.log("[LISTING PAGE] Fetching listing:", listingId);
      
      try {
        // Add AbortController for timeout
        const controller = new AbortController();
        fetchTimeout = setTimeout(() => {
          controller.abort();
          if (isMounted) {
            setError("Request timed out. The server may be experiencing issues. Please try refreshing the page.");
            setLoading(false);
          }
        }, 8000); // 8 second timeout for fetch
        
        const response = await fetch(`/api/listings/${listingId}`, {
          signal: controller.signal,
        });
        
        clearTimeout(fetchTimeout);
        
        console.log("[LISTING PAGE] Response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("[LISTING PAGE] Error response:", errorData);
          
          if (!isMounted) return;
          
          // If listing not found and we just paid, wait a bit for webhook to process
          if (feeStatus === "success") {
            console.log("[LISTING PAGE] Listing not found yet, waiting for webhook...");
            // Wait 2 seconds and retry once
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (!isMounted) return;
            
            const retryController = new AbortController();
            const retryTimeout = setTimeout(() => retryController.abort(), 8000);
            try {
              const retryResponse = await fetch(`/api/listings/${listingId}`, {
                signal: retryController.signal,
              });
              clearTimeout(retryTimeout);
              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                if (isMounted) {
                  setListing(retryData);
                  setLoading(false);
                }
                return;
              }
            } catch (retryErr: any) {
              clearTimeout(retryTimeout);
              if (!isMounted) return;
              console.error("[LISTING PAGE] Retry failed:", retryErr);
            }
          }
          
          if (!isMounted) return;
          throw new Error(errorData.error || errorData.message || "Listing not found");
        }
        
        const data = await response.json();
        console.log("[LISTING PAGE] Listing fetched:", data.id, "isActive:", data.isActive);
        if (isMounted) {
          setListing(data);
          setLoading(false);
        }
      } catch (err: any) {
        clearTimeout(fetchTimeout);
        console.error("[LISTING PAGE] Fetch error:", err);
        if (!isMounted) return;
        
        if (err.name === 'AbortError') {
          setError("Request timed out. The server may be experiencing issues. Please try refreshing the page.");
        } else if (err.message?.includes("prepared statement")) {
          setError("Database connection issue. Please try refreshing the page.");
        } else {
          setError(err.message || "Failed to load listing. Please try refreshing the page.");
        }
        setLoading(false);
      }
    }

    fetchListing();
    
    return () => {
      isMounted = false;
      if (fetchTimeout !== undefined) {
        clearTimeout(fetchTimeout);
      }
    };
  }, [listingId, feeStatus]);

  // Auto-activate on payment success
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    // Handle both "payment=success" and "fee=success" query parameters
    if (p.get("payment") === "success" || p.get("fee") === "success") {
      fetch(`/api/listings/${listingId}/activate-from-stripe`, { method: "POST" })
        .then(() => window.location.reload());
    }
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Loading listing...</p>
          <p className="text-gray-500 text-sm mb-4">This may take a few seconds.</p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm font-semibold mb-2">Error:</p>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setLoading(true);
                setError("");
                window.location.reload();
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={() => router.push("/sell")}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Back to Create
            </button>
          </div>
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
              ✅ Payment successful! {listing.isActive ? "Your listing is now active." : "Processing activation..."}
            </p>
            {!listing.isActive && (
              <p className="text-sm text-green-600 mt-2">
                If your listing doesn't activate within a few seconds, please refresh the page.
              </p>
            )}
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
        {!listing.isActive && feeStatus !== "success" && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700">
              ⚠️ This listing is inactive. Please complete payment to activate it.
            </p>
          </div>
        )}
        
        {!listing.isActive && feeStatus === "success" && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <p className="text-yellow-700">
              ⚠️ Payment received but listing activation is pending. This usually takes a few seconds.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/listings/${listingId}/activate`, {
                      method: "POST",
                    });
                    const data = await response.json();
                    if (response.ok && data.isActive) {
                      // Refresh the listing
                      const listingResponse = await fetch(`/api/listings/${listingId}`);
                      if (listingResponse.ok) {
                        const listingData = await listingResponse.json();
                        setListing(listingData);
                        alert("✅ Listing is now active!");
                      }
                    } else {
                      alert(data.message || "Listing activation is still processing. Please wait a moment.");
                    }
                  } catch (err) {
                    alert("Error activating listing. Please try refreshing the page.");
                  }
                }}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Activate Now
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/listings/${listingId}`);
                    if (response.ok) {
                      const data = await response.json();
                      setListing(data);
                      if (data.isActive) {
                        alert("✅ Listing is now active!");
                      } else {
                        alert("Listing is still processing. Please wait a moment and try again.");
                      }
                    }
                  } catch (err) {
                    alert("Error refreshing listing status");
                  }
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh Status
              </button>
            </div>
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

