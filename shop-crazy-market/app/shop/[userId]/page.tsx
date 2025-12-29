"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/contexts/AuthContext";

interface Listing {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  images: string[];
  digitalFiles: string[];
  isActive: boolean;
  category: string | null;
  sellerId?: string; // Add sellerId to interface
  seller: {
    id: string;
    email: string;
    username: string | null;
  };
}

interface Product {
  id: string;
  title: string;
  price: number;
  images: string | string[];
  category?: string;
  type?: string;
  shop?: {
    name: string;
    id?: string;
  };
}

function ShopContent() {
  const params = useParams();
  const { user } = useAuth();
  const userId = params.userId as string;
  const [shopUser, setShopUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [userAbout, setUserAbout] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchShopData();
    }
  }, [userId]);

  async function fetchShopData() {
    try {
      setLoading(true);
      setError("");

      // Fetch all active listings, then filter to this user's listings
      const response = await fetch(`/api/listings?isActive=true`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch shop data");
      }

      const listings: Listing[] = await response.json();
      
      // Filter to only show active listings from this specific user
      const userListings = listings.filter(listing => {
        const listingSellerId = listing.sellerId || listing.seller?.id;
        return listingSellerId === userId && listing.isActive;
      });

      // Get shop user info from first listing (if available)
      if (userListings.length > 0) {
        setShopUser(userListings[0].seller);
      } else {
        // If no listings, try to fetch user info another way
        // For now, we'll just show "Shop" as the name
        setShopUser({ id: userId, username: "Shop", email: "" });
      }

      // Transform listings to products
      const transformed: Product[] = userListings.map(listing => {
        let images: string[] = [];
        if (listing.images) {
          if (Array.isArray(listing.images)) {
            images = listing.images.filter((img: any) => img && typeof img === 'string' && img.trim());
          } else {
            const imagesValue = listing.images as any;
            if (typeof imagesValue === 'string' && imagesValue.trim()) {
              images = [imagesValue];
            }
          }
        }

        // Use image-type digital files as fallback
        if (images.length === 0 && listing.digitalFiles) {
          const imageDigitalFiles = listing.digitalFiles.filter((url: string) => {
            const ext = url.split('.').pop()?.toLowerCase();
            return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '');
          });
          images = imageDigitalFiles;
        }

        const digitalFilesValue = listing.digitalFiles as any;
        const hasDigitalFiles = digitalFilesValue &&
          ((Array.isArray(digitalFilesValue) && digitalFilesValue.length > 0) ||
           (typeof digitalFilesValue === 'string' && digitalFilesValue.trim().length > 0));

        return {
          id: listing.id,
          title: listing.title,
          price: listing.priceCents,
          images: images,
          category: listing.category || "",
          type: hasDigitalFiles ? "DIGITAL" : "PHYSICAL",
          shop: {
            name: listing.seller.username || listing.seller.email || "Unknown Seller",
            id: listing.seller.id,
          },
        };
      });

      setProducts(transformed);

      // Fetch user's about section
      const aboutResponse = await fetch(`/api/users/${userId}/about`);
      if (aboutResponse.ok) {
        const aboutData = await aboutResponse.json();
        setUserAbout(aboutData.about);
      }

      // Fetch reviews for this seller
      fetchReviews();
    } catch (err: any) {
      console.error("Error fetching shop data:", err);
      setError(err.message || "Failed to load shop");
    } finally {
      setLoading(false);
    }
  }

  async function fetchReviews() {
    try {
      setReviewsLoading(true);
      const response = await fetch(`/api/users/${userId}/reviews`);
      if (response.ok) {
        const reviewsData = await response.json();
        setReviews(reviewsData);
        
        // Calculate average rating
        if (reviewsData.length > 0) {
          const total = reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0);
          setAverageRating(total / reviewsData.length);
        }
      }
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="p-4 sm:p-6 max-w-7xl mx-auto pb-24">
        <div className="text-center py-10 text-gray-500">Loading shop...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-4 sm:p-6 max-w-7xl mx-auto pb-24">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/marketplace" className="text-purple-600 hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const shopName = shopUser?.username || shopUser?.email || "Shop";

  return (
    <main className="p-4 sm:p-6 max-w-7xl mx-auto pb-24">
      {/* Shop Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {shopName}'s Shop
            </h1>
            {shopUser?.email && (
              <p className="text-gray-600 text-sm">{shopUser.email}</p>
            )}
            {/* Average Rating Display */}
            {averageRating > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">
                      {star <= Math.round(averageRating) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {user && user.id !== userId && (
              <Link
                href={`/messages?userId=${userId}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                💬 Message Seller
              </Link>
            )}
            {user?.id === userId && (
              <Link
                href="/profile"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
              >
                Manage Shop
              </Link>
            )}
          </div>
        </div>
        <div className="border-t pt-4">
          <p className="text-gray-600">
            {products.length} {products.length === 1 ? 'listing' : 'listings'} available
          </p>
        </div>
      </div>

      {/* About Section */}
      {userAbout && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{userAbout}</p>
        </div>
      )}

      {/* Reviews Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Reviews ({reviews.length})
        </h2>
        
        {reviewsLoading ? (
          <div className="text-center py-4 text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No reviews yet.</p>
            {user && user.id !== userId && (
              <p className="text-sm mt-2">Be the first to leave a review after making a purchase!</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-400 text-sm">
                          {star <= review.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">
                      {review.user.username || review.user.email.split('@')[0]}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                )}
                {review.order?.listing && (
                  <p className="text-xs text-gray-500 mt-2">
                    Purchased: {review.order.listing.title}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listings Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">This shop has no active listings yet.</p>
          <Link
            href="/marketplace"
            className="text-purple-600 hover:underline font-semibold"
          >
            Browse other shops →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <main className="p-4 sm:p-6 max-w-7xl mx-auto pb-24">
        <div className="text-center py-10 text-gray-500">Loading shop...</div>
      </main>
    }>
      <ShopContent />
    </Suspense>
  );
}

