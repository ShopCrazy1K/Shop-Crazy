"use client";

import { useEffect, useState, Suspense } from "react";
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
  sellerId?: string; // Optional: may exist in API response
  seller?: {
    id: string;
    email: string;
    username: string | null;
  };
}

function ListingPageContent() {
  // Wrap everything in try-catch to prevent crashes
  let params: any = {};
  let searchParams: any = null;
  let router: any = null;
  let listingId = '';
  
  try {
    params = useParams();
  } catch (e: any) {
    console.error("[LISTING PAGE] Error with useParams:", e);
  }
  
  try {
    searchParams = useSearchParams();
  } catch (e: any) {
    console.error("[LISTING PAGE] Error with useSearchParams:", e);
    // Create a mock searchParams object
    searchParams = {
      get: () => null,
    };
  }
  
  try {
    router = useRouter();
  } catch (e: any) {
    console.error("[LISTING PAGE] Error with useRouter:", e);
    router = {
      push: () => {},
      replace: () => {},
      back: () => {},
    };
  }
  
  listingId = (params?.id as string) || '';
  
  // Safely get context values with error handling
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
  
  // All state hooks must be declared before any conditional returns
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0); // For main image display
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
  const [settingPrimary, setSettingPrimary] = useState(false);
  const [editingThumbnails, setEditingThumbnails] = useState(false);
  const [savingThumbnails, setSavingThumbnails] = useState(false);
  const [selectedThumbnailIndices, setSelectedThumbnailIndices] = useState<number[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const feeStatus = searchParams?.get("fee") || null;

  // Handle "new" route - redirect to create page
  useEffect(() => {
    if (listingId === "new") {
      router.replace("/listings/new");
      return;
    }
  }, [listingId, router]);

  // Early return after all hooks are declared
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
    
    // Validate listingId format (should be at least 10 characters for CUID)
    if (listingId && listingId.length > 0 && listingId.length < 10 && !listingId.startsWith('cm')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Listing ID</h1>
          <p className="text-gray-600 mb-6">The listing ID is invalid. Please check the URL.</p>
          <Link href="/marketplace" className="text-purple-600 hover:text-purple-700 font-semibold">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Reset main image index and initialize thumbnails when listing changes
  useEffect(() => {
    if (listing) {
      setMainImageIndex(0);
      // Initialize thumbnail indices from listing or default to first 4
      let normalizedImages: string[] = [];
      const imagesValue = listing.images as any;
      if (imagesValue) {
        if (Array.isArray(imagesValue)) {
          normalizedImages = imagesValue.filter((img: any) => img && typeof img === 'string' && img.trim());
        } else if (typeof imagesValue === 'string' && imagesValue.trim()) {
          normalizedImages = [imagesValue];
        }
      }
      
      if (listing.thumbnailIndices && Array.isArray(listing.thumbnailIndices) && listing.thumbnailIndices.length > 0) {
        // Filter to valid indices based on actual images
        const validIndices = listing.thumbnailIndices.slice(0, 4).filter((idx: number) => {
          return idx >= 0 && idx < normalizedImages.length;
        });
        if (validIndices.length > 0) {
          setSelectedThumbnailIndices(validIndices);
        } else if (normalizedImages.length > 0) {
          const firstFour = Math.min(4, normalizedImages.length);
          setSelectedThumbnailIndices(Array.from({ length: firstFour }, (_, i) => i));
        }
      } else if (normalizedImages.length > 0) {
        const firstFour = Math.min(4, normalizedImages.length);
        setSelectedThumbnailIndices(Array.from({ length: firstFour }, (_, i) => i));
      }
    }
  }, [listing?.id, listing?.thumbnailIndices, listing?.images]);

  useEffect(() => {
    let isMounted = true;
    let fetchTimeout: NodeJS.Timeout | undefined;
    
    async function fetchListing() {
      if (!listingId) {
        console.error("[LISTING PAGE] No listing ID provided");
        setError("No listing ID provided");
        setLoading(false);
        return;
      }

      console.log("[LISTING PAGE] ===== FETCHING LISTING =====");
      console.log("[LISTING PAGE] Listing ID:", listingId);
      console.log("[LISTING PAGE] Component mounted:", isMounted);
      
      try {
        // Add AbortController for timeout
        const controller = new AbortController();
        fetchTimeout = setTimeout(() => {
          console.error("[LISTING PAGE] Fetch timeout after 15 seconds");
          controller.abort();
          if (isMounted) {
            setError("Request timed out after 15 seconds. The server may be experiencing issues. Please try refreshing the page.");
            setLoading(false);
          }
        }, 15000); // 15 second timeout for fetch
        
        console.log("[LISTING PAGE] Starting fetch to:", `/api/listings/${listingId}`);
        const startTime = Date.now();
        
        // Use absolute URL to avoid any routing issues
        const apiUrl = `/api/listings/${listingId}`;
        console.log("[LISTING PAGE] Fetch URL:", apiUrl);
        console.log("[LISTING PAGE] Full URL would be:", typeof window !== 'undefined' ? `${window.location.origin}${apiUrl}` : apiUrl);
        
        const response = await fetch(apiUrl, {
          signal: controller.signal,
          cache: 'no-store',
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }).catch((fetchError: any) => {
          console.error("[LISTING PAGE] Fetch failed completely:", fetchError);
          console.error("[LISTING PAGE] Fetch error name:", fetchError?.name);
          console.error("[LISTING PAGE] Fetch error message:", fetchError?.message);
          if (isMounted) {
            setError(`Network error: ${fetchError.message || 'Failed to fetch listing. Check your connection and try again.'}`);
            setLoading(false);
          }
          return null;
        });
        
        if (!response) {
          console.error("[LISTING PAGE] No response received from fetch");
          if (isMounted) {
            setError("No response from server. Please check your connection.");
            setLoading(false);
          }
          return;
        }
        
        const fetchTime = Date.now() - startTime;
        console.log("[LISTING PAGE] Fetch completed in", fetchTime, "ms");
        console.log("[LISTING PAGE] Response status:", response.status);
        console.log("[LISTING PAGE] Response ok:", response.ok);
        console.log("[LISTING PAGE] Response headers:", Object.fromEntries(response.headers.entries()));
        
        clearTimeout(fetchTimeout);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error("[LISTING PAGE] Error response:", errorText);
          let errorData: any = {};
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText || `HTTP ${response.status}` };
          }
          
          // If listing not found and we just paid, wait a bit for webhook to process
          if (feeStatus === "success" && response.status === 404) {
            console.log("[LISTING PAGE] Listing not found yet, waiting for webhook...");
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
          
          // Create a more descriptive error message
          let errorMsg = errorData.error || errorData.message || "Listing not found";
          if (response.status === 500 || response.status === 503) {
            errorMsg = `Server error: ${errorMsg}. This is likely a database connection issue.`;
          } else if (response.status === 504) {
            errorMsg = `Timeout: ${errorMsg}. The server took too long to respond.`;
          }
          
          throw new Error(errorMsg);
        }
        
        let data: any;
        try {
          const text = await response.text();
          console.log("[LISTING PAGE] Response text length:", text.length);
          console.log("[LISTING PAGE] Response text preview:", text.substring(0, 200));
          
          if (!text || text.trim().length === 0) {
            throw new Error("Empty response from server");
          }
          
          data = JSON.parse(text);
          console.log("[LISTING PAGE] JSON parsed successfully");
        } catch (jsonError: any) {
          console.error("[LISTING PAGE] JSON parse error:", jsonError);
          console.error("[LISTING PAGE] JSON error message:", jsonError.message);
          if (isMounted) {
            setError(`Failed to parse listing data: ${jsonError.message}. The server may have returned invalid JSON.`);
            setLoading(false);
          }
          return;
        }
        
        console.log("[LISTING PAGE] ===== LISTING DATA RECEIVED =====");
        console.log("[LISTING PAGE] Listing ID:", data?.id);
        console.log("[LISTING PAGE] Listing title:", data?.title);
        console.log("[LISTING PAGE] Is active:", data?.isActive);
        console.log("[LISTING PAGE] Has seller:", !!data?.seller);
        console.log("[LISTING PAGE] Seller ID:", data?.seller?.id);
        console.log("[LISTING PAGE] Images count:", Array.isArray(data?.images) ? data.images.length : 'N/A');
        console.log("[LISTING PAGE] Full data structure:", JSON.stringify(data, null, 2));
        
        if (!data || !data.id) {
          console.error("[LISTING PAGE] ===== INVALID DATA =====");
          console.error("[LISTING PAGE] Data received:", data);
          console.error("[LISTING PAGE] Data type:", typeof data);
          if (isMounted) {
            setError("Invalid listing data received: missing ID. The listing might not exist or the server returned an error.");
            setLoading(false);
          }
          return;
        }
        
        // Ensure arrays are arrays first (before validating seller)
        if (data.images && !Array.isArray(data.images)) {
          console.warn("[LISTING PAGE] Images is not an array, converting:", data.images);
          data.images = typeof data.images === 'string' ? [data.images] : [];
        }
        if (!data.images) {
          data.images = [];
        }
        if (data.digitalFiles && !Array.isArray(data.digitalFiles)) {
          console.warn("[LISTING PAGE] DigitalFiles is not an array, converting:", data.digitalFiles);
          data.digitalFiles = typeof data.digitalFiles === 'string' ? [data.digitalFiles] : [];
        }
        if (!data.digitalFiles) {
          data.digitalFiles = [];
        }
        
        // Validate and fix seller data - make it more resilient
        if (!data.seller || !data.seller.id) {
          console.warn("[LISTING PAGE] Missing seller data, trying to fetch separately");
          // If seller is missing but sellerId exists, try to get seller info
          if (data.sellerId) {
            try {
              const sellerRes = await fetch(`/api/users/${data.sellerId}`);
              if (sellerRes.ok) {
                const sellerData = await sellerRes.json();
                data.seller = {
                  id: sellerData.id || data.sellerId,
                  email: sellerData.email || 'Unknown',
                  username: sellerData.username || null,
                };
                console.log("[LISTING PAGE] Seller data fetched separately:", data.seller);
              } else {
                // Create fallback seller
                data.seller = {
                  id: data.sellerId,
                  email: 'Unknown',
                  username: null,
                };
                console.warn("[LISTING PAGE] Using fallback seller data");
              }
            } catch (sellerErr) {
              console.error("[LISTING PAGE] Error fetching seller:", sellerErr);
              // Create fallback seller
              data.seller = {
                id: data.sellerId || 'unknown',
                email: 'Unknown',
                username: null,
              };
            }
          } else {
            console.error("[LISTING PAGE] Missing seller data and sellerId:", data);
            // Don't throw - use fallback instead
            data.seller = {
              id: 'unknown',
              email: 'Unknown',
              username: null,
            };
          }
        }
        
        // Ensure seller has required fields
        if (!data.seller.email) {
          data.seller.email = 'Unknown';
        }
        if (!data.seller.username && !data.seller.email) {
          data.seller.username = null;
        }
        
        // Update state - ensure we set all state synchronously
        if (isMounted) {
          console.log("[LISTING PAGE] ===== UPDATING STATE =====");
          console.log("[LISTING PAGE] Setting listing state...");
          
          // Use setTimeout to ensure state updates happen in next tick (avoids race conditions)
          setTimeout(() => {
            if (isMounted) {
              try {
                console.log("[LISTING PAGE] Setting listing data:", data.id);
                setListing(data);
                setLoading(false);
                setError("");
                console.log("[LISTING PAGE] ===== STATE UPDATED SUCCESSFULLY =====");
              } catch (stateError: any) {
                console.error("[LISTING PAGE] ===== STATE UPDATE ERROR =====");
                console.error("[LISTING PAGE] Error setting state:", stateError);
                if (isMounted) {
                  setError(`Failed to update state: ${stateError.message}`);
                  setLoading(false);
                }
              }
            }
          }, 0);
        } else {
          console.log("[LISTING PAGE] Component unmounted, not updating state");
        }
      } catch (err: any) {
        clearTimeout(fetchTimeout);
        console.error("[LISTING PAGE] Fetch error:", err);
        console.error("[LISTING PAGE] Error name:", err.name);
        console.error("[LISTING PAGE] Error message:", err.message);
        console.error("[LISTING PAGE] Error stack:", err.stack);
        if (!isMounted) return;
        
        let errorMessage = "Failed to load listing. Please try refreshing the page.";
        
        if (err.name === 'AbortError') {
          errorMessage = "Request timed out after 8 seconds. The server may be experiencing issues. Please try refreshing the page.";
        } else if (err.message?.includes("prepared statement")) {
          errorMessage = "Database connection issue. Please try refreshing the page.";
        } else if (err.message?.includes("DATABASE_URL") || err.message?.includes("Database configuration")) {
          errorMessage = "Database configuration error. The server needs to be reconfigured. Please contact support.";
        } else if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
          errorMessage = "Network error. The server may be unreachable or the database connection failed. Please check your connection and try again.";
        } else if (err.message) {
          errorMessage = err.message;
        } else if (err.toString) {
          errorMessage = err.toString();
        }
        
        // Add diagnostic info
        errorMessage += ` (Error: ${err.name || 'Unknown'})`;
        
        setError(errorMessage);
        setLoading(false);
      }
    }

    fetchListing();
    
    return () => {
      isMounted = false;
      if (fetchTimeout) {
        clearTimeout(fetchTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, feeStatus]);

  // Keyboard navigation for image modal
  useEffect(() => {
    if (selectedImageIndex === null || !listing) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // Normalize images for modal
      let normalizedImages: string[] = [];
      if (listing.images) {
        if (Array.isArray(listing.images)) {
          normalizedImages = listing.images.filter((img: any) => img && typeof img === 'string' && img.trim());
        } else {
          const imagesValue = listing.images as any;
          if (typeof imagesValue === 'string' && imagesValue.trim()) {
            normalizedImages = [imagesValue];
          }
        }
      }
      const imageDigitalFiles = listing.digitalFiles?.filter((url: string) => {
        const ext = url.split('.').pop()?.toLowerCase();
        return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '');
      }) || [];
      const uniqueNormalizedImages = Array.from(new Set(normalizedImages));
      const allImagesSet = new Set([...uniqueNormalizedImages, ...imageDigitalFiles]);
      const allImages = Array.from(allImagesSet);
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : allImages.length - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedImageIndex((prev) => (prev !== null && prev < allImages.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedImageIndex(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImageIndex, listing]);

  // Auto-activate on payment success (only after listing is loaded and not already active)
  useEffect(() => {
    if (!listing || loading) return; // Wait for listing to load first
    if (listing?.isActive) {
      console.log("[LISTING PAGE] Listing already active, skipping activation");
      return; // Don't activate if already active
    }
    
    // Use searchParams from Next.js hook instead of window.location for SSR safety
    const paymentParam = searchParams?.get("payment") || null;
    const feeParam = searchParams?.get("fee") || null;
    // Handle both "payment=success" and "fee=success" query parameters
    const hasSuccessParam = paymentParam === "success" || feeParam === "success";
    
    if (hasSuccessParam) {
      console.log("[LISTING PAGE] Payment success detected, activating listing...");
      fetch(`/api/listings/${listingId}/activate-from-stripe`, { method: "POST" })
        .then((res) => {
          console.log("[LISTING PAGE] Activation response:", res.status);
          if (res.ok) {
            // Refresh the listing data instead of reloading the whole page
            console.log("[LISTING PAGE] Activation successful, refreshing listing data...");
            fetch(`/api/listings/${listingId}`)
              .then((refreshRes) => {
                if (refreshRes.ok) {
                  return refreshRes.json();
                }
                throw new Error(`Failed to refresh: ${refreshRes.status}`);
              })
              .then((refreshData) => {
                console.log("[LISTING PAGE] Listing refreshed, isActive:", refreshData.isActive);
                setListing(refreshData);
                // Remove the query parameter to prevent re-activation
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
              })
              .catch((err) => {
                console.error("[LISTING PAGE] Error refreshing listing:", err);
                // Fallback to page reload only if refresh fails
                window.location.reload();
              });
          }
        })
        .catch((err) => {
          console.error("[LISTING PAGE] Activation error:", err);
        });
    }
  }, [listingId, listing, loading, searchParams]);

  // Fetch deals, stats, reviews, and follow status when listing loads
  // Deals should be fetched for everyone (guests, customers, sellers)
  useEffect(() => {
    if (listingId && listing) {
      fetchDeals(); // Always fetch deals - visible to everyone
      if (user) {
        checkPurchaseStatus();
        fetchSellerStats();
        fetchReviews();
        checkFollowStatus();
      } else {
        // For guests, still fetch seller stats and reviews (public info)
        fetchSellerStats();
        fetchReviews();
      }
    }
  }, [listingId, listing, user]);

  async function checkPurchaseStatus() {
    if (!user || !listing) return;

    // Check if user is the seller
    const sellerId = listing?.seller?.id || (listing as any)?.sellerId;
    if (sellerId && sellerId === user.id) {
      setIsSeller(true);
      setHasPaidOrder(true); // Sellers can always access their own files
      return;
    }

    // Check if user has a paid order
    try {
      const response = await fetch(`/api/orders?userId=${user.id}`);
      if (response.ok) {
        const orders = await response.json();
        const paidOrder = orders.find(
          (order: any) =>
            order.listingId === listingId && order.paymentStatus === "paid"
        );
        setHasPaidOrder(!!paidOrder);
      }
    } catch (error) {
      console.error("Error checking purchase status:", error);
    }
  }

  async function fetchDeals() {
    try {
      console.log("[LISTING PAGE] Fetching deals for listing:", listingId);
      const response = await fetch(`/api/listings/${listingId}/deals`, {
        cache: 'no-store', // Always fetch fresh data
      });
      if (response.ok) {
        const dealsData = await response.json();
        console.log("[LISTING PAGE] Fetched deals response:", {
          status: response.status,
          dealsCount: Array.isArray(dealsData) ? dealsData.length : 0,
          deals: dealsData,
        });
        
        // Ensure dealsData is an array
        const dealsArray = Array.isArray(dealsData) ? dealsData : [];
        setDeals(dealsArray);
        
        // Set the best deal as active (first one, already sorted by discount value)
        if (dealsArray.length > 0) {
          const bestDeal = dealsArray[0];
          const now = new Date();
          const startsAt = new Date(bestDeal.startsAt);
          const endsAt = new Date(bestDeal.endsAt);
          
          console.log("[LISTING PAGE] Best deal details:", {
            title: bestDeal.title,
            discountType: bestDeal.discountType,
            discountValue: bestDeal.discountValue,
            isActive: bestDeal.isActive,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
            now: now.toISOString(),
            isDateValid: startsAt <= now && endsAt >= now,
            listingIsActive: listing?.isActive,
          });
          
          // Only set as active if dates are valid
          if (bestDeal.isActive && startsAt <= now && endsAt >= now) {
            console.log("[LISTING PAGE] ✅ Setting active deal:", bestDeal.title);
            setActiveDeal(bestDeal);
          } else {
            console.log("[LISTING PAGE] ❌ Deal not valid:", {
              isActive: bestDeal.isActive,
              dateValid: startsAt <= now && endsAt >= now,
            });
            setActiveDeal(null);
          }
        } else {
          console.log("[LISTING PAGE] No deals found in response");
          setActiveDeal(null);
        }
      } else {
        const errorText = await response.text();
        console.error("[LISTING PAGE] Failed to fetch deals:", response.status, errorText);
      }
    } catch (error) {
      console.error("[LISTING PAGE] Error fetching deals:", error);
    }
  }

  async function fetchSellerStats() {
    if (!listing?.seller?.id) return;
    try {
      const sellerId = listing?.seller?.id || (listing as any)?.sellerId;
      if (!sellerId) return;
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
        // Calculate average rating
        if (reviewsData.length > 0) {
          const avg = reviewsData.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsData.length;
          setAverageRating(Math.round(avg * 10) / 10);
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
    if (!user || !listing?.seller?.id) {
      if (router?.push) {
        router.push("/login");
      } else {
        window.location.href = "/login";
      }
      return;
    }

    const sellerId = listing?.seller?.id || (listing as any)?.sellerId;
    if (!sellerId || user.id === sellerId) {
      setFollowLoading(false);
      return;
    }

    setFollowLoading(true);
    try {
      if (!sellerId) {
        console.error("[LISTING PAGE] Cannot follow: no seller ID");
        setFollowLoading(false);
        return;
      }
      
      if (isFollowing) {
        // Unfollow
        const response = await fetch(`/api/users/${sellerId}/follow`, {
          method: "DELETE",
          headers: {
            "x-user-id": user.id,
          },
        });
        if (response.ok) {
          setIsFollowing(false);
          if (sellerStats) {
            setSellerStats({ ...sellerStats, followersCount: Math.max(0, sellerStats.followersCount - 1) });
          }
        }
      } else {
        // Follow
        const response = await fetch(`/api/users/${sellerId}/follow`, {
          method: "POST",
          headers: {
            "x-user-id": user.id,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          setIsFollowing(true);
          if (sellerStats) {
            setSellerStats({ ...sellerStats, followersCount: (sellerStats.followersCount || 0) + 1 });
          }
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  }

  // Check favorite status when listing loads
  useEffect(() => {
    if (listing && user) {
      checkFavoriteStatus();
    }
  }, [listing, user]);

  // Check favorite status
  async function checkFavoriteStatus() {
    if (!user || !listingId) return;
    try {
      const response = await fetch(`/api/listings/${listingId}/favorite?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited || false);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  }

  // Toggle favorite
  async function toggleFavorite() {
    if (!user) {
      if (router?.push) {
        router.push("/login");
      } else {
        window.location.href = "/login";
      }
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/listings/${listingId}/favorite?userId=${user.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsFavorited(false);
        }
      } else {
        // Add to favorites
        const response = await fetch(`/api/listings/${listingId}/favorite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        });
        if (response.ok) {
          setIsFavorited(true);
        }
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
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Loading listing...</p>
          <p className="text-gray-500 text-sm mb-4">This may take a few seconds.</p>
          <p className="text-gray-400 text-xs mb-4">Listing ID: {listingId}</p>
          <p className="text-gray-400 text-xs mb-4">Check browser console (F12) for logs</p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-red-600 text-sm font-semibold mb-2">⚠️ Error Loading:</p>
              <p className="text-red-500 text-sm break-words mb-2">{error}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    // Test the API endpoint directly
                    window.open(`/api/listings/${listingId}`, '_blank');
                  }}
                  className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                >
                  Test API in New Tab
                </button>
                <button
                  onClick={() => {
                    window.open(`/api/db-diagnose`, '_blank');
                  }}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                >
                  Test Database
                </button>
              </div>
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
          <div className="mt-4">
            <button
              onClick={() => {
                window.open(`/api/check-runtime-env`, '_blank');
              }}
              className="text-xs text-gray-500 underline"
            >
              Check Runtime Environment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Only show error if we have an error AND we're not still loading
  if (!loading && (error || !listing)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "The listing you're looking for doesn't exist."}</p>
          {error && error.includes("timeout") && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-yellow-800 text-sm">
                ⚠️ The server took too long to respond. This might be a database connection issue.
              </p>
            </div>
          )}
          {error && (error.includes("Database") || error.includes("DATABASE_URL")) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-red-800 text-sm">
                ❌ Database connection error. Please check server configuration.
              </p>
              <p className="text-red-700 text-xs mt-2">
                This usually means the DATABASE_URL environment variable is not set correctly in Vercel.
              </p>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
            <p className="text-blue-800 text-sm font-semibold mb-2">Debug Information:</p>
            <p className="text-blue-700 text-xs mb-2">Listing ID: {listingId}</p>
            <p className="text-blue-700 text-xs mb-2">Error: {error || "No error message"}</p>
            <Link
              href="/api/test-all"
              target="_blank"
              className="text-blue-600 text-xs underline hover:text-blue-800"
            >
              Check API Status →
            </Link>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/marketplace"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Marketplace
            </Link>
            <Link
              href="/sell"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create New Listing
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

  // Ensure listing exists and has required data before rendering
  if (!listing && !loading && error) {
    // Error state already handled above, but if we get here, show generic error
    return null;
  }

  if (!listing) {
    // Still loading or no listing - handled by loading state above
    return null;
  }

  // Ensure listing has required fields before rendering
  if (!listing.id || !listing.title) {
    console.error("[LISTING PAGE] Listing missing required fields:", listing);
    // Don't set state in render - let error state handle it
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Listing Data</h1>
          <p className="text-gray-600 mb-4">The listing data is incomplete. Please try refreshing.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Success/Cancel Messages */}
        {feeStatus === "success" && listing && (
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
        {feeStatus === "cancel" && listing && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <p className="text-yellow-700">
              ⚠️ Payment was cancelled. Your listing is inactive until payment is completed.
            </p>
          </div>
        )}

        {/* Listing Status */}
        {listing && !listing.isActive && feeStatus !== "success" && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700">
              ⚠️ This listing is inactive. Please complete payment to activate it.
            </p>
          </div>
        )}
        
        {listing && !listing.isActive && feeStatus === "success" && (
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
              {/* Combine images and image-type digital files */}
              {(() => {
                // Normalize images to always be an array
                let normalizedImages: string[] = [];
                if (listing.images) {
                  if (Array.isArray(listing.images)) {
                    normalizedImages = listing.images.filter((img: any) => img && typeof img === 'string' && img.trim());
                  } else {
                    // Handle case where images might be stored as a single string
                    const imagesValue = listing.images as any;
                    if (typeof imagesValue === 'string' && imagesValue.trim()) {
                      normalizedImages = [imagesValue];
                    }
                  }
                }
                
                // Check if digital files are images - with error handling
                let imageDigitalFiles: string[] = [];
                try {
                  if (listing.digitalFiles && Array.isArray(listing.digitalFiles)) {
                    imageDigitalFiles = listing.digitalFiles.filter((url: any) => {
                      if (!url || typeof url !== 'string') return false;
                      const ext = url.split('.').pop()?.toLowerCase();
                      return ext && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
                    });
                  }
                } catch (err) {
                  console.error("Error processing digital files:", err);
                  imageDigitalFiles = [];
                }
                
                // Remove duplicates from normalizedImages first
                const uniqueNormalizedImages = Array.from(new Set(normalizedImages));
                
                // Combine regular images with image-type digital files, removing duplicates
                // Note: Only normalizedImages (not digital files) can be set as primary
                let allImages: string[] = [];
                try {
                  const allImagesSet = new Set([...uniqueNormalizedImages, ...imageDigitalFiles]);
                  allImages = Array.from(allImagesSet).filter((img): img is string => typeof img === 'string' && img.trim().length > 0);
                } catch (err) {
                  console.error("Error combining images:", err);
                  allImages = uniqueNormalizedImages.length > 0 ? uniqueNormalizedImages : imageDigitalFiles;
                }
                const primaryImageIndex = 0; // First image in normalizedImages is primary
                
                // Get thumbnail indices (use selectedThumbnailIndices state if editing, otherwise from listing)
                // Use uniqueNormalizedImages for thumbnail indices to avoid index mismatches
                let thumbnailIndices: number[] = [];
                if (editingThumbnails) {
                  thumbnailIndices = selectedThumbnailIndices.filter((idx: number) => idx >= 0 && idx < uniqueNormalizedImages.length).slice(0, 4);
                } else if (listing.thumbnailIndices && Array.isArray(listing.thumbnailIndices) && listing.thumbnailIndices.length > 0) {
                  // Use saved thumbnail indices, filter to valid indices
                  thumbnailIndices = listing.thumbnailIndices.slice(0, 4).filter((idx: number) => idx >= 0 && idx < uniqueNormalizedImages.length);
                  // If filtered list is empty, fall back to first 4
                  if (thumbnailIndices.length === 0 && uniqueNormalizedImages.length > 0) {
                    thumbnailIndices = Array.from({ length: Math.min(4, uniqueNormalizedImages.length) }, (_, i) => i);
                  }
                } else if (selectedThumbnailIndices.length > 0) {
                  // Use state if available
                  thumbnailIndices = selectedThumbnailIndices.filter((idx: number) => idx >= 0 && idx < uniqueNormalizedImages.length).slice(0, 4);
                } else {
                  // Default to first 4 images
                  if (uniqueNormalizedImages.length > 0) {
                    thumbnailIndices = Array.from({ length: Math.min(4, uniqueNormalizedImages.length) }, (_, i) => i);
                  }
                }
                
                // Ensure we always have at least one thumbnail if images exist
                if (thumbnailIndices.length === 0 && uniqueNormalizedImages.length > 0) {
                  thumbnailIndices = [0];
                }
                
                if (allImages.length > 0) {
                  // Ensure mainImageIndex is within bounds
                  const safeMainIndex = Math.max(0, Math.min(mainImageIndex, allImages.length - 1));
                  const currentImage = allImages[safeMainIndex];
                  
                  if (!currentImage || typeof currentImage !== 'string') {
                    console.error("Current image is invalid:", safeMainIndex, allImages);
                    return (
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">Image not available</span>
                      </div>
                    );
                  }
                  
                  // Function to save thumbnail selection
                  async function saveThumbnailSelection(selectedIndices: number[]) {
                    if (!user || !isSeller || savingThumbnails) return;
                    
                    if (selectedIndices.length > 4) {
                      alert("You can only select up to 4 thumbnail images");
                      return;
                    }
                    
                    setSavingThumbnails(true);
                    try {
                      const response = await fetch(`/api/listings/${listingId}/images`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "x-user-id": user.id,
                        },
                        body: JSON.stringify({ thumbnailIndices: selectedIndices }),
                      });
                      
                      const data = await response.json();
                      if (response.ok && data.ok) {
                        // Also refresh from API to ensure we have the latest data
                        const listingResponse = await fetch(`/api/listings/${listingId}`);
                        if (listingResponse.ok) {
                          const listingData = await listingResponse.json();
                          setListing(listingData);
                          if (listingData.thumbnailIndices && Array.isArray(listingData.thumbnailIndices)) {
                            setSelectedThumbnailIndices(listingData.thumbnailIndices.slice(0, 4));
                          }
                        }
                        setEditingThumbnails(false);
                        alert("✅ Thumbnail selection saved!");
                      } else {
                        alert(data.message || "Failed to save thumbnail selection");
                      }
                    } catch (error) {
                      console.error("Error saving thumbnail selection:", error);
                      alert("Error saving thumbnail selection");
                    } finally {
                      setSavingThumbnails(false);
                    }
                  }
                  
                  // Function to set primary image
                  async function setPrimaryImage(imageIndex: number) {
                    if (!user || !isSeller || settingPrimary) return;
                    
                    // Only allow setting primary for images in uniqueNormalizedImages (not digital files)
                    if (imageIndex >= uniqueNormalizedImages.length) {
                      alert("Only uploaded images can be set as the primary image");
                      return;
                    }
                    
                    setSettingPrimary(true);
                    try {
                      const response = await fetch(`/api/listings/${listingId}/images`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "x-user-id": user.id,
                        },
                        body: JSON.stringify({ setPrimaryIndex: imageIndex }),
                      });
                      
                      const data = await response.json();
                      if (response.ok && data.ok) {
                        // Refresh listing to get updated image order
                        const listingResponse = await fetch(`/api/listings/${listingId}`);
                        if (listingResponse.ok) {
                          const listingData = await listingResponse.json();
                          setListing(listingData);
                          setMainImageIndex(0); // Reset to show new primary image
                          alert("✅ Primary image updated! This will be shown as the profile image.");
                        }
                      } else {
                        alert(data.message || "Failed to set primary image");
                      }
                    } catch (error) {
                      console.error("Error setting primary image:", error);
                      alert("Error setting primary image");
                    } finally {
                      setSettingPrimary(false);
                    }
                  }
                  
                  // Navigation functions
                  const goToPrevious = () => {
                    setMainImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                  };
                  
                  const goToNext = () => {
                    setMainImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                  };

                  // Swipe gesture handlers
                  const minSwipeDistance = 50;
                  
                  const onTouchStart = (e: React.TouchEvent) => {
                    setTouchEnd(null);
                    setTouchStart(e.targetTouches[0].clientX);
                  };
                  
                  const onTouchMove = (e: React.TouchEvent) => {
                    setTouchEnd(e.targetTouches[0].clientX);
                  };
                  
                  const onTouchEnd = () => {
                    if (touchStart === null || touchEnd === null) return;
                    const distance = touchStart - touchEnd;
                    const isLeftSwipe = distance > minSwipeDistance;
                    const isRightSwipe = distance < -minSwipeDistance;
                    
                    if (isLeftSwipe) {
                      goToNext();
                    } else if (isRightSwipe) {
                      goToPrevious();
                    }
                    // Reset touch state
                    setTouchStart(null);
                    setTouchEnd(null);
                  };

                  // Keyboard navigation - only for main view, not modal
                  useEffect(() => {
                    if (selectedImageIndex !== null) return; // Don't navigate if modal is open
                    
                    const handleKeyPress = (e: KeyboardEvent) => {
                      if (selectedImageIndex !== null) return; // Don't navigate if modal is open
                      if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        goToPrevious();
                      } else if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        goToNext();
                      }
                    };
                    
                    window.addEventListener('keydown', handleKeyPress);
                    return () => window.removeEventListener('keydown', handleKeyPress);
                  }, [allImages.length, selectedImageIndex, mainImageIndex]);
                  
                  return (
                    <div className="space-y-4">
                      {/* Main Image with Navigation */}
                      <div className="relative">
                        <div 
                          className="aspect-square bg-gray-100 cursor-pointer rounded-lg overflow-hidden relative select-none touch-pan-y"
                          onClick={() => {
                            if (allImages.length > 0 && safeMainIndex >= 0 && safeMainIndex < allImages.length) {
                              setSelectedImageIndex(safeMainIndex);
                            }
                          }}
                          onTouchStart={onTouchStart}
                          onTouchMove={onTouchMove}
                          onTouchEnd={onTouchEnd}
                          style={{ touchAction: 'pan-y' }}
                        >
                          {isSeller || hasPaidOrder ? (
                            <img
                              src={currentImage}
                              alt={listing.title}
                              className="w-full h-full object-contain hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.image-error-placeholder')) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'w-full h-full flex items-center justify-center text-gray-400 image-error-placeholder';
                                  placeholder.textContent = '📦 Image not available';
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          ) : (
                            <ProtectedImage
                              src={currentImage}
                              alt={listing.title}
                              className="w-full h-full object-contain hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.image-error-placeholder')) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'w-full h-full flex items-center justify-center text-gray-400 image-error-placeholder';
                                  placeholder.textContent = '📦 Image not available';
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                          )}
                          {/* Primary Image Badge */}
                          {safeMainIndex === primaryImageIndex && uniqueNormalizedImages.length > 0 && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <span>✓</span> Primary
                            </div>
                          )}
                          {/* Image Counter */}
                          {allImages.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs font-semibold px-2 py-1 rounded-full">
                              {safeMainIndex + 1} / {allImages.length}
                            </div>
                          )}
                        </div>
                        
                        {/* Navigation Arrows */}
                        {allImages.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToPrevious();
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
                              aria-label="Previous image"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
                              aria-label="Next image"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                      
                      {/* 4-Image Thumbnail Grid (Etsy-style) */}
                      {allImages.length > 1 && (
                        <div className="space-y-2">
                          {editingThumbnails && isSeller ? (
                            // Edit mode: Select which images to show as thumbnails
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-700">Select 4 thumbnail images:</p>
                                <button
                                  onClick={() => setEditingThumbnails(false)}
                                  className="text-sm text-gray-600 hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                              </div>
                              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                                {uniqueNormalizedImages.map((image: string, index: number) => {
                                  const isSelected = thumbnailIndices.includes(index);
                                  return (
                                    <div
                                      key={index}
                                      className={`aspect-square bg-gray-100 cursor-pointer border-2 rounded-lg overflow-hidden transition-all relative ${
                                        isSelected
                                          ? 'border-purple-600 ring-2 ring-purple-300'
                                          : 'border-transparent hover:border-gray-300 opacity-60'
                                      }`}
                                      onClick={() => {
                                        const newIndices = isSelected
                                          ? selectedThumbnailIndices.filter((idx: number) => idx !== index)
                                          : selectedThumbnailIndices.length < 4
                                            ? [...selectedThumbnailIndices, index]
                                            : selectedThumbnailIndices;
                                        setSelectedThumbnailIndices(newIndices);
                                      }}
                                    >
                                      <img
                                        src={image}
                                        alt={`${listing.title} - Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      {isSelected && (
                                        <div className="absolute top-1 right-1 bg-purple-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                          {thumbnailIndices.indexOf(index) + 1}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveThumbnailSelection(selectedThumbnailIndices)}
                                  disabled={savingThumbnails || selectedThumbnailIndices.length === 0}
                                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                  {savingThumbnails ? "Saving..." : `Save ${selectedThumbnailIndices.length} Thumbnail${selectedThumbnailIndices.length !== 1 ? 's' : ''}`}
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Display mode: Show selected thumbnails
                            <>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">Thumbnail images</p>
                                {isSeller && uniqueNormalizedImages.length > 4 && (
                                  <button
                                    onClick={() => {
                                      // Initialize with current thumbnail indices when entering edit mode
                                      const currentIndices = (listing.thumbnailIndices && Array.isArray(listing.thumbnailIndices) && listing.thumbnailIndices.length > 0)
                                        ? listing.thumbnailIndices.slice(0, 4).filter((idx: number) => idx >= 0 && idx < uniqueNormalizedImages.length)
                                        : uniqueNormalizedImages.slice(0, 4).map((_: string, idx: number) => idx);
                                      setSelectedThumbnailIndices(currentIndices);
                                      setEditingThumbnails(true);
                                    }}
                                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                                  >
                                    Edit Thumbnails
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full">
                                {thumbnailIndices.slice(0, 4).map((thumbIndex: number) => {
                                  if (thumbIndex >= uniqueNormalizedImages.length || thumbIndex < 0) return null;
                                  const image = uniqueNormalizedImages[thumbIndex];
                                  if (!image) return null;
                                  const isPrimary = thumbIndex === primaryImageIndex;
                                  const isActive = safeMainIndex === thumbIndex;
                                  
                                  return (
                                    <div
                                      key={`thumb-${thumbIndex}`}
                                      className={`aspect-square bg-gray-100 cursor-pointer border-2 rounded-lg overflow-hidden transition-all relative group touch-manipulation flex-shrink-0 ${
                                        isActive
                                          ? 'border-purple-600 ring-2 ring-purple-300'
                                          : 'border-transparent hover:border-purple-400 active:border-purple-500'
                                      }`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setMainImageIndex(thumbIndex);
                                      }}
                                      onTouchStart={(e) => {
                                        e.stopPropagation();
                                      }}
                                      onTouchEnd={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setMainImageIndex(thumbIndex);
                                      }}
                                      onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        if (isSeller) {
                                          setPrimaryImage(thumbIndex);
                                        }
                                      }}
                                    >
                                      {isSeller || hasPaidOrder ? (
                                        <img
                                          src={image}
                                          alt={`${listing.title} - Image ${thumbIndex + 1}`}
                                          className="w-full h-full object-cover block"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent && !parent.querySelector('.image-error-placeholder')) {
                                              const placeholder = document.createElement('div');
                                              placeholder.className = 'w-full h-full flex items-center justify-center text-gray-400 text-xs image-error-placeholder';
                                              placeholder.textContent = '📦';
                                              parent.appendChild(placeholder);
                                            }
                                          }}
                                        />
                                      ) : (
                                        <ProtectedImage
                                          src={image}
                                          alt={`${listing.title} - Image ${thumbIndex + 1}`}
                                          className="object-cover"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent && !parent.querySelector('.image-error-placeholder')) {
                                              const placeholder = document.createElement('div');
                                              placeholder.className = 'w-full h-full flex items-center justify-center text-gray-400 text-xs image-error-placeholder';
                                              placeholder.textContent = '📦';
                                              parent.appendChild(placeholder);
                                            }
                                          }}
                                        />
                                      )}
                                      {/* Primary Badge */}
                                      {isPrimary && (
                                        <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                          ✓
                                        </div>
                                      )}
                                      {/* Set as Primary Button (for sellers) */}
                                      {isSeller && !isPrimary && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPrimaryImage(thumbIndex);
                                          }}
                                          disabled={settingPrimary}
                                          className="absolute bottom-1 right-1 bg-purple-600 text-white text-[10px] font-semibold px-2 py-1 rounded hover:bg-purple-700 transition-colors disabled:opacity-50 z-10 shadow-lg"
                                          title="Set as primary image (profile image)"
                                          onMouseEnter={(e) => e.stopPropagation()}
                                        >
                                          {settingPrimary ? "..." : "Set Primary"}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                          
                          {/* Show more images indicator */}
                          {allImages.length > 4 && (
                            <div className="text-center">
                              <button
                                onClick={() => setSelectedImageIndex(safeMainIndex)}
                                className="text-sm text-purple-600 hover:text-purple-700 font-semibold underline"
                              >
                                View all {allImages.length} images →
                              </button>
                            </div>
                          )}
                          
                          {/* Instructions for sellers */}
                          {isSeller && uniqueNormalizedImages.length > 1 && (
                            <p className="text-xs text-gray-500 text-center">
                              💡 Double-click a thumbnail or use "Set Primary" to make it the profile image
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Details */}
            <div className="md:w-1/2 p-4 sm:p-8">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-1 pr-2">{listing?.title || "Untitled Listing"}</h1>
                {/* Favorite Button */}
                {user && (
                  <button
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className={`ml-4 p-2 rounded-full transition-colors ${
                      isFavorited
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    } disabled:opacity-50`}
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorited ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              
              {/* Active Deal Badge - Always show if deal exists, even if listing is inactive for debugging */}
              {activeDeal && listing && (
                <div className="mb-6">
                  <DealBadge deal={activeDeal} priceCents={listing.priceCents || 0} />
                  {listing && !listing.isActive && (
                    <p className="text-xs text-yellow-600 mt-2">
                      ⚠️ Deal is active but listing is inactive
                    </p>
                  )}
                </div>
              )}
              
              {/* Debug: Show if deals exist but not displayed */}
              {deals.length > 0 && !activeDeal && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <p className="font-semibold text-yellow-800">Debug Info:</p>
                  <p className="text-yellow-700">Found {deals.length} deal(s) but none are active/valid</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-yellow-600">View deal details</summary>
                    <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded">
                      {JSON.stringify(deals, null, 2)}
                    </pre>
                  </details>
                </div>
              )}

              <div className="mb-4 sm:mb-6">
                {activeDeal && listing ? (
                  <>
                    <div className="flex items-baseline gap-2 sm:gap-3">
                      <p className="text-3xl sm:text-4xl font-bold text-red-600">
                        ${(() => {
                          const priceCents = listing.priceCents || 0;
                          const discountCents = activeDeal.discountType === "PERCENTAGE"
                            ? Math.round((priceCents * activeDeal.discountValue) / 100)
                            : activeDeal.discountValue;
                          const discountedPrice = priceCents - discountCents;
                          return (discountedPrice / 100).toFixed(2);
                        })()}
                      </p>
                      <p className="text-2xl text-gray-400 line-through">
                        ${((listing.priceCents || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {(listing.currency || "USD").toUpperCase()} • Save ${(() => {
                        const priceCents = listing.priceCents || 0;
                        const discountCents = activeDeal.discountType === "PERCENTAGE"
                          ? Math.round((priceCents * activeDeal.discountValue) / 100)
                          : activeDeal.discountValue;
                        return (discountCents / 100).toFixed(2);
                      })()}
                    </p>
                  </>
                ) : listing ? (
                  <>
                    <p className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
                      ${((listing.priceCents || 0) / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(listing.currency || "USD").toUpperCase()}
                    </p>
                  </>
                ) : null}
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{listing?.description || "No description available."}</p>
              </div>

              {/* Seller Info Box - Etsy Style */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {listing.seller && listing.seller.id ? (
                      <Link
                        href={`/shop/${listing.seller?.id || (listing as any)?.sellerId || ''}`}
                        className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        {listing.seller?.username || listing.seller?.email || 'Unknown Seller'}
                      </Link>
                    ) : (
                      <span className="text-lg font-semibold text-gray-900">
                        Unknown Seller
                      </span>
                    )}
                    {sellerStats && (
                      <div className="mt-2 space-y-1">
                        {/* Rating */}
                        {averageRating > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                            </span>
                          </div>
                        )}
                        {/* Sales Count */}
                        <p className="text-sm text-gray-600">
                          {sellerStats.salesCount || 0} {sellerStats.salesCount === 1 ? 'sale' : 'sales'}
                        </p>
                        {/* Followers */}
                        <p className="text-sm text-gray-600">
                          {sellerStats.followersCount || 0} {sellerStats.followersCount === 1 ? 'follower' : 'followers'}
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Follow Button */}
                  {user && listing?.seller?.id && user.id !== listing?.seller?.id && (
                    <button
                      onClick={toggleFollow}
                      disabled={followLoading}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        isFollowing
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-purple-600 text-white hover:bg-purple-700"
                      } disabled:opacity-50`}
                    >
                      {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
                {/* Message Seller Button */}
                {user && listing?.seller?.id && user.id !== listing?.seller?.id && (
                  <Link
                    href={`/messages/${listing?.seller?.id || (listing as any)?.sellerId || ''}`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                  >
                    💬 Message Seller
                  </Link>
                )}
                
                {/* Report Button - Show for all users except the seller */}
                {user && listing?.seller?.id && user.id !== listing?.seller?.id && (
                  <div className="mt-2">
                    <ReportButton listingId={listingId} />
                  </div>
                )}
                
                {/* Report Button for non-logged-in users */}
                {!user && (
                  <div className="mt-2">
                    <ReportButton listingId={listingId} />
                  </div>
                )}
              </div>

              {/* Digital Files Section - Only show to buyers who have paid or sellers */}
              {listing.digitalFiles && listing.digitalFiles.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Digital Files</h2>
                  {hasPaidOrder || isSeller ? (
                    <div className="space-y-2">
                      {listing.digitalFiles.map((fileUrl: string, index: number) => {
                        const fileName = fileUrl.split('/').pop() || `File ${index + 1}`;
                        const downloadUrl = `/api/download?url=${encodeURIComponent(fileUrl)}&listingId=${listingId}${user ? `&userId=${user.id}` : ''}`;
                        const ext = fileName.split('.').pop()?.toLowerCase();
                        const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '');
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {isImage ? (
                                <img
                                  src={fileUrl}
                                  alt={fileName}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center">
                                  <span className="text-2xl">📄</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                                <p className="text-xs text-gray-500 truncate">{fileUrl}</p>
                              </div>
                            </div>
                            <a
                              href={downloadUrl}
                              download={fileName}
                              className="ml-3 px-3 py-1 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
                            >
                              Download
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        🔒 Digital files are available after purchase. Buy this listing to access downloads.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Purchase Section - Etsy Style */}
              {listing && listing.isActive && (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (!user) {
                        if (router?.push) {
                          router.push("/login");
                        } else {
                          window.location.href = "/login";
                        }
                        return;
                      }
                      if (!listing || !listing.isActive) {
                        alert("This listing is not active. Please contact the seller.");
                        return;
                      }
                      // Add to cart
                      const imageUrl = Array.isArray(listing.images) && listing.images.length > 0
                        ? listing.images[0]
                        : typeof (listing.images as any) === 'string' && (listing.images as any).trim()
                          ? (listing.images as any)
                          : null;
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
                    className="block w-full bg-purple-600 text-white text-center py-3 sm:py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-base sm:text-lg cursor-pointer"
                  >
                    🛒 Add to Cart
                  </button>
                  <Link
                    href={`/cart/checkout?listingId=${listing.id}`}
                    className="block w-full bg-green-600 text-white text-center py-3 sm:py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold text-base sm:text-lg"
                    onClick={(e) => {
                      if (!user) {
                        e.preventDefault();
                        router.push("/login");
                        return;
                      }
                      // Add to cart first, then redirect
                      const imageUrl = Array.isArray(listing.images) && listing.images.length > 0
                        ? listing.images[0]
                        : typeof (listing.images as any) === 'string' && (listing.images as any).trim()
                          ? (listing.images as any)
                          : null;
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
                    💳 Buy Now (Apple Pay, Google Pay, Cards)
                  </Link>
                </div>
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

        {/* Reviews Section - Etsy Style */}
        {reviews.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Reviews ({reviews.length})</h2>
            <div className="space-y-6">
              {reviews.slice(0, 10).map((review: any) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.user?.username || review.user?.email || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
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
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                  {review.listing && (
                    <p className="text-sm text-gray-500 mt-2">
                      Purchased: {review.listing.title}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {reviews.length > 10 && (
              <div className="mt-6 text-center">
                <Link
                        href={`/shop/${listing.seller?.id || (listing as any)?.sellerId || ''}#reviews`}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  View All Reviews →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {/* Image Modal */}
      {selectedImageIndex !== null && listing && (() => {
        // Normalize images for modal
        let normalizedImages: string[] = [];
        if (listing.images) {
          if (Array.isArray(listing.images)) {
            normalizedImages = listing.images.filter((img: any) => img && typeof img === 'string' && img.trim());
          } else {
            const imagesValue = listing.images as any;
            if (typeof imagesValue === 'string' && imagesValue.trim()) {
              normalizedImages = [imagesValue];
            }
          }
        }
        
        const imageDigitalFiles = listing.digitalFiles?.filter((url: string) => {
          const ext = url.split('.').pop()?.toLowerCase();
          return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '');
        }) || [];
        // Remove duplicates from normalizedImages first
        const uniqueNormalizedImages = Array.from(new Set(normalizedImages));
        // Combine and remove duplicates
        const allImagesSet = new Set([...uniqueNormalizedImages, ...imageDigitalFiles]);
        const allImages = Array.from(allImagesSet);
        
        if (allImages.length > 0 && selectedImageIndex >= 0 && selectedImageIndex < allImages.length) {
          const goToPreviousModal = () => {
            setSelectedImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : allImages.length - 1));
          };
          
          const goToNextModal = () => {
            setSelectedImageIndex((prev) => (prev !== null && prev < allImages.length - 1 ? prev + 1 : 0));
          };

          // Swipe gesture handlers for modal
          const minSwipeDistanceModal = 50;
          const onTouchStartModal = (e: React.TouchEvent) => {
            e.stopPropagation();
            setTouchEnd(null);
            setTouchStart(e.targetTouches[0].clientX);
          };
          
          const onTouchMoveModal = (e: React.TouchEvent) => {
            e.stopPropagation();
            if (touchStart !== null) {
              setTouchEnd(e.targetTouches[0].clientX);
            }
          };
          
          const onTouchEndModal = () => {
            if (touchStart === null || touchEnd === null) return;
            const distance = touchStart - touchEnd;
            const isLeftSwipe = distance > minSwipeDistanceModal;
            const isRightSwipe = distance < -minSwipeDistanceModal;
            
            if (isLeftSwipe) {
              goToNextModal();
            } else if (isRightSwipe) {
              goToPreviousModal();
            }
            // Reset touch state
            setTouchStart(null);
            setTouchEnd(null);
          };

          // Keyboard navigation for modal - handled inline in the component

          return (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                // Close modal when clicking backdrop
                if (e.target === e.currentTarget) {
                  setSelectedImageIndex(null);
                }
              }}
              onTouchStart={onTouchStartModal}
              onTouchMove={onTouchMoveModal}
              onTouchEnd={onTouchEndModal}
            >
              <div className="relative max-w-7xl max-h-full">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedImageIndex(null);
                  }}
                  className="absolute top-4 right-4 text-white bg-black bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition-colors z-20 cursor-pointer"
                  aria-label="Close"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {isSeller || hasPaidOrder ? (
                  <img
                    src={allImages[selectedImageIndex]}
                    alt={listing.title}
                    className="max-w-full max-h-[90vh] object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <ProtectedImage
                    src={allImages[selectedImageIndex]}
                    alt={listing.title}
                    className="max-w-full max-h-[90vh] object-contain"
                    onClick={() => {}}
                    style={{ maxWidth: "100%", maxHeight: "90vh" }}
                  />
                )}
                
                {/* Navigation Arrows - Always show, wrap around */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1;
                        setSelectedImageIndex(newIndex);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-70 rounded-full p-3 hover:bg-opacity-100 transition-colors z-10 cursor-pointer"
                      aria-label="Previous image"
                      type="button"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newIndex = selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0;
                        setSelectedImageIndex(newIndex);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-70 rounded-full p-3 hover:bg-opacity-100 transition-colors z-10 cursor-pointer"
                      aria-label="Next image"
                      type="button"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-70 rounded-full px-4 py-2 z-10">
                      {selectedImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}

function ListingPageWrapper() {
  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-6xl mb-4">😅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Listing</h1>
          <p className="text-gray-600 mb-4">
            There was an error loading the listing page. This might be a database connection issue.
          </p>
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-left text-sm">
            <p className="font-semibold text-red-800 mb-2">⚠️ IMPORTANT: Check Browser Console!</p>
            <p className="text-red-700 text-xs mb-2">Press F12 → Console tab → Look for RED errors</p>
            <p className="text-red-700 text-xs">The actual error details are in the console, not on this page.</p>
          </div>
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-left text-sm">
            <p className="font-semibold text-yellow-800 mb-1">Quick Diagnostic:</p>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1 text-xs">
              <li>Check browser console (F12) for detailed errors</li>
              <li>Visit <code className="bg-yellow-100 px-1 rounded">/api/listings/test-connection</code> to test database</li>
              <li>Verify DATABASE_URL is set in Vercel environment variables</li>
              <li>Redeploy after adding environment variables</li>
            </ol>
          </div>
          <div className="mb-6 space-y-2">
            <button
              onClick={() => {
                console.log('[LISTING PAGE] Manual refresh triggered');
                window.location.reload();
              }}
              className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Refresh Page
            </button>
            <Link
              href="/marketplace"
              className="block w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Back to Marketplace
            </Link>
            <a
              href="/api/listings/test-connection"
              target="_blank"
              className="block w-full px-6 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors text-sm"
              onClick={() => console.log('[LISTING PAGE] Testing database connection...')}
            >
              Test Database Connection
            </a>
            <a
              href="/api/test-all"
              target="_blank"
              className="block w-full px-6 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors text-sm"
              onClick={() => console.log('[LISTING PAGE] Testing all APIs...')}
            >
              Test All APIs
            </a>
          </div>
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

