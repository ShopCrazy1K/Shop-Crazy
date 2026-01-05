"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import DealBadge from "@/components/DealBadge";
import ReportButton from "@/components/ReportButton";
import ProtectedImage from "@/components/ProtectedImage";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface Listing {
  id: string;
  title: string;
  description: string;
  slug: string;
  priceCents: number;
  currency: string;
  images: string[];
  digitalFiles: string[];
  thumbnailIndices?: number[];
  isActive: boolean;
  feeSubscriptionStatus: string | null;
  createdAt: string;
  sellerId?: string;
  seller?: {
    id: string;
    email: string;
    username: string | null;
  };
}

function ListingPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const listingId = (params?.id as string) || '';
  
  let user: any = null;
  let addItem: (item: any) => void = () => {};
  
  try {
    const authContext = useAuth();
    user = authContext?.user || null;
  } catch (authError: any) {
    console.error("[LISTING PAGE] Error accessing AuthContext:", authError);
    user = null;
  }
  
  try {
    const cartContext = useCart();
    addItem = cartContext?.addItem || (() => {});
  } catch (cartError: any) {
    console.error("[LISTING PAGE] Error accessing CartContext:", cartError);
    addItem = () => {};
  }
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  
  // Compute allImages using useMemo so it's available for hooks
  const allImagesMemo = useMemo(() => {
    if (!listing) return [];
    const normalizedImages = listing.images.filter((img: any) => img && typeof img === 'string' && img.trim());
    const imageDigitalFiles = listing.digitalFiles.filter((url: string) => {
      const ext = url.split('.').pop()?.toLowerCase();
      return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '');
    });
    return Array.from(new Set([...normalizedImages, ...imageDigitalFiles]));
  }, [listing?.images, listing?.digitalFiles]);
  
  // Keyboard navigation for image modal
  useEffect(() => {
    if (selectedImageIndex === null || allImagesMemo.length === 0) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null || allImagesMemo.length === 0) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedImageIndex((prev) => prev !== null && prev > 0 ? prev - 1 : allImagesMemo.length - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedImageIndex((prev) => prev !== null && prev < allImagesMemo.length - 1 ? (prev + 1) : 0);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, allImagesMemo.length]);
  
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [deals, setDeals] = useState<any[]>([]);
  const [activeDeal, setActiveDeal] = useState<any | null>(null);
  const [hasPaidOrder, setHasPaidOrder] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [sellerStats, setSellerStats] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const feeStatus = searchParams?.get("fee") || null;

  useEffect(() => {
    if (listingId === "new") {
      router.replace("/listings/new");
      return;
    }
  }, [listingId, router]);

  if (listingId === "new" || !listingId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Create New Listing</h1>
          <p className="text-gray-600 mb-6">Redirecting...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    let isMounted = true;
    let fetchTimeout: NodeJS.Timeout | undefined;
    
    async function fetchListing() {
      if (!listingId) {
        setError("No listing ID provided");
        setLoading(false);
        return;
      }

      try {
        const controller = new AbortController();
        fetchTimeout = setTimeout(() => {
          controller.abort();
          if (isMounted) {
            setError("Request timed out. Please try again.");
            setLoading(false);
          }
        }, 15000);
        
        const response = await fetch(`/api/listings/${listingId}`, {
          signal: controller.signal,
          cache: 'no-store',
        }).catch((fetchError: any) => {
          if (isMounted) {
            setError(`Network error: ${fetchError.message || 'Failed to fetch listing.'}`);
            setLoading(false);
          }
          return null;
        });
        
        if (!response) return;
        
        clearTimeout(fetchTimeout);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          let errorData: any = {};
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText || `HTTP ${response.status}` };
          }
          
          if (feeStatus === "success" && response.status === 404) {
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
            }
          }
          
          if (!isMounted) return;
          setError(errorData.error || errorData.message || "Listing not found");
          setLoading(false);
          return;
        }
        
        let data: any;
        try {
          const text = await response.text();
          if (!text || text.trim().length === 0) {
            throw new Error("Empty response from server");
          }
          data = JSON.parse(text);
        } catch (jsonError: any) {
          if (isMounted) {
            setError(`Failed to parse listing data: ${jsonError.message}`);
            setLoading(false);
          }
          return;
        }
        
        if (!data || !data.id) {
          if (listingId) {
            data = { ...data, id: listingId };
          } else {
            if (isMounted) {
              setError("Invalid listing data received.");
              setLoading(false);
            }
            return;
          }
        }
        
        // Normalize arrays
        if (data.images && !Array.isArray(data.images)) {
          data.images = typeof data.images === 'string' ? [data.images] : [];
        }
        if (!data.images) data.images = [];
        if (data.digitalFiles && !Array.isArray(data.digitalFiles)) {
          data.digitalFiles = typeof data.digitalFiles === 'string' ? [data.digitalFiles] : [];
        }
        if (!data.digitalFiles) data.digitalFiles = [];
        
        // Ensure seller exists
        if (!data.seller || !data.seller.id) {
          const sellerId = data.sellerId || 'unknown';
          data.seller = {
            id: sellerId,
            email: data.seller?.email || 'Unknown',
            username: data.seller?.username || null,
          };
        }
        
        if (!data.seller.email) data.seller.email = 'Unknown';
        if (data.seller.username === undefined) data.seller.username = null;
        
        if (isMounted) {
          setListing(data);
          setLoading(false);
          setError("");
        }
      } catch (err: any) {
        clearTimeout(fetchTimeout);
        if (!isMounted) return;
        setError(err.message || "Failed to load listing. Please try again.");
        setLoading(false);
      }
    }

    fetchListing();
    
    return () => {
      isMounted = false;
      if (fetchTimeout) clearTimeout(fetchTimeout);
    };
  }, [listingId, feeStatus]);

  // Fetch deals and seller info
  useEffect(() => {
    if (listingId && listing) {
      fetchDeals();
      if (user) {
        checkPurchaseStatus();
        fetchSellerStats();
        fetchReviews();
        checkFollowStatus();
        checkFavoriteStatus();
      } else {
        fetchSellerStats();
        fetchReviews();
      }
    }
  }, [listingId, listing, user]);

  async function checkPurchaseStatus() {
    if (!user || !listing) return;
    const sellerId = listing?.seller?.id || (listing as any)?.sellerId;
    if (sellerId && sellerId === user.id) {
      setIsSeller(true);
      setHasPaidOrder(true);
      return;
    }
    // Check if user has paid order for this listing
    try {
      const response = await fetch(`/api/orders?userId=${user.id}&listingId=${listingId}`);
      if (response.ok) {
        const orders = await response.json();
        setHasPaidOrder(orders.some((order: any) => order.status === 'completed'));
      }
    } catch (error) {
      console.error("Error checking purchase status:", error);
    }
  }

  async function fetchDeals() {
    try {
      const response = await fetch(`/api/listings/${listingId}/deals`);
      if (response.ok) {
        const dealsData = await response.json();
        setDeals(dealsData);
        const now = new Date();
        const active = dealsData.find((deal: any) => {
          const start = new Date(deal.startDate);
          const end = new Date(deal.endDate);
          return now >= start && now <= end && deal.isActive;
        });
        setActiveDeal(active || null);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
    }
  }

  async function fetchSellerStats() {
    if (!listing) return;
    const sellerId = listing?.seller?.id || (listing as any)?.sellerId;
    if (!sellerId) return;
    try {
      const response = await fetch(`/api/users/${sellerId}/stats`);
      if (response.ok) {
        const stats = await response.json();
        setSellerStats(stats);
      }
    } catch (error) {
      console.error("Error fetching seller stats:", error);
    }
  }

  async function fetchReviews() {
    if (!listing) return;
    const sellerId = listing?.seller?.id || (listing as any)?.sellerId;
    if (!sellerId) return;
    try {
      const response = await fetch(`/api/users/${sellerId}/reviews`);
      if (response.ok) {
        const reviewsData = await response.json();
        setReviews(reviewsData);
        if (reviewsData.length > 0) {
          const sum = reviewsData.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
          setAverageRating(sum / reviewsData.length);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }

  async function checkFollowStatus() {
    if (!user || !listing) return;
    const sellerId = listing?.seller?.id || (listing as any)?.sellerId;
    if (!sellerId || user.id === sellerId) return;
    try {
      const response = await fetch(`/api/users/${sellerId}/follow?followerId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing || false);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  }

  async function toggleFollow() {
    if (!user || !listing) {
      router.push("/login");
      return;
    }

    const sellerId = listing?.seller?.id || (listing as any)?.sellerId;
    if (!sellerId || user.id === sellerId) {
      setFollowLoading(false);
      return;
    }

    setFollowLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/users/${sellerId}/follow`, {
        method,
        headers: {
          "x-user-id": user.id,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        setIsFollowing(!isFollowing);
        if (sellerStats) {
          setSellerStats({ 
            ...sellerStats, 
            followersCount: Math.max(0, sellerStats.followersCount + (isFollowing ? -1 : 1)) 
          });
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  }

  async function checkFavoriteStatus() {
    if (!user || !listing) return;
    try {
      const response = await fetch(`/api/favorites?userId=${user.id}&listingId=${listingId}`);
      if (response.ok) {
        const favorites = await response.json();
        setIsFavorited(favorites.some((f: any) => f.listingId === listingId));
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  }

  async function toggleFavorite() {
    if (!user) {
      router.push("/login");
      return;
    }
    setFavoriteLoading(true);
    try {
      const method = isFavorited ? "DELETE" : "POST";
      const response = await fetch(`/api/favorites`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ listingId }),
      });
      if (response.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "The listing you're looking for doesn't exist."}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/marketplace"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Marketplace
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Listing Data</h1>
          <p className="text-gray-600 mb-4">Unable to load listing. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Ensure all required fields
  if (!listing.id) listing.id = listingId;
  if (!listing.title || typeof listing.title !== 'string') listing.title = 'Untitled Listing';
  if (!listing.seller || !listing.seller.id) {
    const sellerId = (listing as any)?.sellerId || 'unknown';
    listing.seller = { id: sellerId, email: 'Unknown', username: null };
  }
  if (!Array.isArray(listing.images)) listing.images = [];
  if (!Array.isArray(listing.digitalFiles)) listing.digitalFiles = [];
  if (typeof listing.priceCents !== 'number' || isNaN(listing.priceCents)) listing.priceCents = 0;
  if (!listing.currency || typeof listing.currency !== 'string') listing.currency = 'usd';

  // Prepare images - use the memoized value
  const allImages = allImagesMemo;
  const safeMainIndex = Math.max(0, Math.min(mainImageIndex, allImages.length - 1));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Success Messages */}
          {feeStatus === "success" && listing && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
                ✅ Payment successful! {listing.isActive ? "Your listing is now active." : "Processing activation..."}
              </p>
            </div>
          )}

          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-500">
            <Link href="/marketplace" className="hover:text-purple-600">Marketplace</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{listing.title}</span>
          </nav>

          {/* Main Content - Modern Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Left: Image Gallery - Takes 3 columns on large screens */}
            <div className="lg:col-span-3">
              {allImages.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div 
                      className="w-full h-full cursor-zoom-in"
                      onClick={() => allImages.length > 0 && setSelectedImageIndex(mainImageIndex)}
                    >
                      {isSeller || hasPaidOrder ? (
                        <img
                          src={allImages[safeMainIndex]}
                          alt={listing.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ProtectedImage
                          src={allImages[safeMainIndex]}
                          alt={listing.title}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    
                    {/* Navigation Arrows */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMainImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg border border-gray-200 transition-all hover:scale-110"
                          aria-label="Previous image"
                        >
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMainImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg border border-gray-200 transition-all hover:scale-110"
                          aria-label="Next image"
                        >
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {allImages.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {safeMainIndex + 1} of {allImages.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails - Scrollable */}
                  {allImages.length > 1 && (
                    <div className="relative">
                      <div 
                        className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                        style={{ 
                          scrollbarWidth: 'thin',
                          WebkitOverflowScrolling: 'touch',
                          touchAction: 'pan-x pinch-zoom',
                          overscrollBehaviorX: 'contain',
                          msOverflowStyle: '-ms-autohiding-scrollbar'
                        }}
                      >
                        {allImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setMainImageIndex(index)}
                            onTouchStart={(e) => {
                              // Allow scrolling but still enable tap
                              const touch = e.touches[0];
                              const button = e.currentTarget;
                              const startX = touch.clientX;
                              const startY = touch.clientY;
                              
                              const handleTouchMove = (moveEvent: TouchEvent) => {
                                const moveTouch = moveEvent.touches[0];
                                const deltaX = Math.abs(moveTouch.clientX - startX);
                                const deltaY = Math.abs(moveTouch.clientY - startY);
                                
                                // If horizontal movement is greater, allow scrolling
                                if (deltaX > deltaY && deltaX > 5) {
                                  moveEvent.preventDefault();
                                }
                              };
                              
                              const handleTouchEnd = () => {
                                document.removeEventListener('touchmove', handleTouchMove);
                                document.removeEventListener('touchend', handleTouchEnd);
                              };
                              
                              document.addEventListener('touchmove', handleTouchMove, { passive: false });
                              document.addEventListener('touchend', handleTouchEnd, { once: true });
                            }}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:shadow-md ${
                              safeMainIndex === index
                                ? 'border-purple-600 ring-2 ring-purple-200 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {isSeller || hasPaidOrder ? (
                              <img src={image} alt={`${listing.title} ${index + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <ProtectedImage src={image} alt={`${listing.title} ${index + 1}`} className="w-full h-full object-cover" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Right: Product Details - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <div className="sticky top-6">
                {/* Title and Favorite */}
                <div className="flex items-start justify-between mb-4 gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-1 leading-tight">{listing.title}</h1>
                  {user && (
                    <button
                      onClick={toggleFavorite}
                      disabled={favoriteLoading}
                      className={`flex-shrink-0 p-2 rounded-full transition-all ${
                        isFavorited 
                          ? "text-red-600 bg-red-50 hover:bg-red-100" 
                          : "text-gray-400 hover:text-red-500 hover:bg-gray-100"
                      }`}
                      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg className="w-6 h-6" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Deal Badge */}
                {activeDeal && (
                  <div className="mb-4">
                    <DealBadge deal={activeDeal} priceCents={listing.priceCents || 0} />
                  </div>
                )}

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  {activeDeal && listing ? (
                    <div>
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-3xl sm:text-4xl font-bold text-red-600">
                          ${((listing.priceCents - (activeDeal.discountType === "PERCENTAGE" 
                            ? Math.round((listing.priceCents * activeDeal.discountValue) / 100)
                            : activeDeal.discountValue)) / 100).toFixed(2)}
                        </span>
                        <span className="text-xl sm:text-2xl text-gray-400 line-through">
                          ${((listing.priceCents || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-green-600">
                        You save ${((activeDeal.discountType === "PERCENTAGE" 
                          ? Math.round((listing.priceCents * activeDeal.discountValue) / 100)
                          : activeDeal.discountValue) / 100).toFixed(2)}!
                      </p>
                    </div>
                  ) : (
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                      ${((listing.priceCents || 0) / 100).toFixed(2)}
                    </span>
                  )}
                  <p className="text-sm text-gray-500 mt-1">{(listing.currency || "USD").toUpperCase()}</p>
                </div>

              {/* Add to Cart / Buy Now - Etsy Style */}
              {listing.isActive && (
                <div className="mb-8 space-y-3">
                  <button
                    onClick={() => {
                      if (!user) {
                        router.push("/login");
                        return;
                      }
                      if (!listing.isActive) {
                        alert("This listing is not active.");
                        return;
                      }
                      const imageUrl = listing.images[0] || null;
                      addItem({
                        id: listing.id,
                        listingId: listing.id,
                        title: listing.title,
                        price: listing.priceCents,
                        quantity: 1,
                        image: imageUrl || undefined,
                        sellerId: listing?.seller?.id || (listing as any)?.sellerId || '',
                      });
                      alert("✅ Added to cart!");
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
                  >
                    Add to cart
                  </button>
                  <Link
                    href={`/cart/checkout?listingId=${listing.id}`}
                    className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg text-center"
                    onClick={(e) => {
                      if (!user) {
                        e.preventDefault();
                        router.push("/login");
                        return;
                      }
                      const imageUrl = listing.images[0] || null;
                      addItem({
                        id: listing.id,
                        listingId: listing.id,
                        title: listing.title,
                        price: listing.priceCents,
                        quantity: 1,
                        image: imageUrl || undefined,
                        sellerId: listing?.seller?.id || (listing as any)?.sellerId || '',
                      });
                    }}
                  >
                    Buy it now
                  </Link>
                </div>
                )}

                {/* Seller Info Card */}
                <div className="mb-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {listing.seller && listing.seller.id ? (
                        <Link
                          href={`/shop/${listing.seller.id}`}
                          className="text-base font-semibold text-gray-900 hover:text-purple-600 transition-colors block mb-2"
                        >
                          {listing.seller.username || listing.seller.email || 'Unknown Seller'}
                        </Link>
                      ) : (
                        <span className="text-base font-semibold text-gray-900 block mb-2">Unknown Seller</span>
                      )}
                      {sellerStats && (
                        <div className="space-y-1.5">
                          {averageRating > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"} style={{ fontSize: '14px' }}>
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-gray-600">
                            {sellerStats.salesCount || 0} {sellerStats.salesCount === 1 ? 'sale' : 'sales'}
                          </p>
                        </div>
                      )}
                    </div>
                    {user && listing?.seller?.id && user.id !== listing.seller.id && (
                      <button
                        onClick={toggleFollow}
                        disabled={followLoading}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          isFollowing
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                        }`}
                      >
                        {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                  {user && listing?.seller?.id && user.id !== listing.seller.id && (
                    <Link
                      href={`/messages/${listing.seller.id}`}
                      className="block w-full text-center px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors text-sm"
                    >
                      Message seller
                    </Link>
                  )}
                </div>

                {/* Report Button */}
                <div className="mb-6">
                  {user && listing?.seller?.id && user.id !== listing.seller.id && (
                    <ReportButton listingId={listingId} />
                  )}
                  {!user && (
                    <ReportButton listingId={listingId} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description and Additional Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Description - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                  {listing.description || "No description available."}
                </p>
              </div>
            </div>

            {/* Digital Files Section */}
            {listing.digitalFiles && listing.digitalFiles.length > 0 && (
              <div className="mt-8 bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Digital Files</h2>
                {hasPaidOrder || isSeller ? (
                  <div className="space-y-3">
                    {listing.digitalFiles.map((fileUrl: string, index: number) => {
                      const fileName = fileUrl.split('/').pop() || `File ${index + 1}`;
                      const downloadUrl = `/api/download?url=${encodeURIComponent(fileUrl)}&listingId=${listingId}${user ? `&userId=${user.id}` : ''}`;
                      return (
                        <a
                          key={index}
                          href={downloadUrl}
                          download={fileName}
                          className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all group"
                        >
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                            <span className="text-2xl">📄</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                            <p className="text-xs text-gray-500 truncate">{fileUrl}</p>
                          </div>
                          <span className="text-sm font-medium text-purple-600 group-hover:text-purple-700">Download →</span>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      🔒 Digital files are available after purchase.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Seller Stats and Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About the seller</h3>
              {listing.seller && listing.seller.id ? (
                <Link
                  href={`/shop/${listing.seller.id}`}
                  className="block text-base font-semibold text-gray-900 hover:text-purple-600 transition-colors mb-4"
                >
                  {listing.seller.username || listing.seller.email || 'Unknown Seller'}
                </Link>
              ) : (
                <span className="block text-base font-semibold text-gray-900 mb-4">Unknown Seller</span>
              )}
              
              {sellerStats && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  {averageRating > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"} style={{ fontSize: '16px' }}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-base font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{sellerStats.salesCount || 0}</p>
                    <p className="text-sm text-gray-600">{sellerStats.salesCount === 1 ? 'sale' : 'sales'}</p>
                  </div>
                  {sellerStats.followersCount !== undefined && (
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{sellerStats.followersCount || 0}</p>
                      <p className="text-sm text-gray-600">{sellerStats.followersCount === 1 ? 'follower' : 'followers'}</p>
                    </div>
                  )}
                </div>
              )}
              
              {user && listing?.seller?.id && user.id !== listing.seller.id && (
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <button
                    onClick={toggleFollow}
                    disabled={followLoading}
                    className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      isFollowing
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {followLoading ? "..." : isFollowing ? "Following" : "Follow Shop"}
                  </button>
                  <Link
                    href={`/messages/${listing.seller.id}`}
                    className="block w-full text-center px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors text-sm"
                  >
                    Message seller
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-12 pt-12 border-t border-gray-200 w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
              <div className="flex items-center gap-4">
                {averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"} style={{ fontSize: '20px' }}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-600">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.slice(0, 10).map((review: any) => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        {review.user?.username || review.user?.email || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} style={{ fontSize: '14px' }}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
            {reviews.length > 10 && (
              <div className="mt-8 text-center">
                <Link
                  href={`/shop/${listing.seller?.id || (listing as any)?.sellerId || ''}#reviews`}
                  className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  View all {reviews.length} reviews →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImageIndex !== null && allImages.length > 0 && selectedImageIndex >= 0 && selectedImageIndex < allImages.length && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex(null);
            }}
            className="absolute top-4 right-4 text-white bg-black/70 rounded-full p-2 hover:bg-black z-20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {isSeller || hasPaidOrder ? (
              <img
                src={allImages[selectedImageIndex]}
                alt={listing.title}
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <ProtectedImage
                src={allImages[selectedImageIndex]}
                alt={listing.title}
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/70 rounded-full p-3 hover:bg-black"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/70 rounded-full p-3 hover:bg-black"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/70 rounded-full px-4 py-2">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ListingPageWrapper() {
  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Listing</h1>
          <p className="text-gray-600 mb-4">
            There was an error loading the listing page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
          >
            Refresh Page
          </button>
          <Link
            href="/marketplace"
            className="block w-full mt-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    }>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading listing...</p>
          </div>
        </div>
      }>
        <ListingPageContent />
      </Suspense>
    </ErrorBoundary>
  );
}

export default ListingPageWrapper;
