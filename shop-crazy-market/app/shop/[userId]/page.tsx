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
  sellerId?: string;
  seller: {
    id: string;
    email: string;
    username: string | null;
    coverPhoto?: string | null;
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
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [sellerStats, setSellerStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"items" | "reviews" | "about">("items");
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchShopData();
    }
  }, [userId]);

  async function fetchShopData() {
    try {
      setLoading(true);
      setError("");

      // Fetch user info
      const userResponse = await fetch(`/api/users/${userId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setShopUser(userData);
        setCoverPhoto(userData.coverPhoto || null);
      }

      // Fetch seller stats
      const statsResponse = await fetch(`/api/users/${userId}/stats`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setSellerStats(stats);
      }

      // Fetch listings
      const response = await fetch(`/api/listings?isActive=true`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch shop data");
      }

      const listings: Listing[] = await response.json();
      
      const userListings = listings.filter(listing => {
        const listingSellerId = listing.sellerId || listing.seller?.id;
        return listingSellerId === userId && listing.isActive;
      });

      if (userListings.length > 0 && !shopUser) {
        setShopUser(userListings[0].seller);
      }

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

      // Fetch reviews
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
        
        if (reviewsData.length > 0) {
          const total = reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0);
          setAverageRating(Math.round((total / reviewsData.length) * 10) / 10);
        }
      }
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  }

  async function handleCoverPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || user.id !== userId) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Cover photo must be less than 5MB");
      return;
    }

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload cover photo");
      }

      const uploadData = await uploadResponse.json();
      
      // Update user's cover photo
      const updateResponse = await fetch(`/api/users/${userId}/cover-photo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ coverPhoto: uploadData.url }),
      });

      if (updateResponse.ok) {
        setCoverPhoto(uploadData.url);
        alert("Cover photo updated successfully!");
      } else {
        throw new Error("Failed to update cover photo");
      }
    } catch (err: any) {
      console.error("Error uploading cover photo:", err);
      alert("Failed to upload cover photo: " + err.message);
    } finally {
      setUploadingCover(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="text-center py-20 text-gray-500">Loading shop...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/marketplace" className="text-purple-600 hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const shopName = shopUser?.username || shopUser?.email?.split('@')[0] || "Shop";
  const isOwner = user?.id === userId;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Cover Photo Section - Etsy Style */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={`${shopName}'s cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600" />
        )}
        
        {/* Cover Photo Upload Button (Owner Only) */}
        {isOwner && (
          <div className="absolute bottom-4 right-4">
            <label className="cursor-pointer bg-white bg-opacity-90 hover:bg-opacity-100 px-4 py-2 rounded-lg font-semibold text-sm text-gray-700 transition-all shadow-lg">
              {uploadingCover ? "Uploading..." : "📷 Change Cover Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverPhotoUpload}
                disabled={uploadingCover}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {shopName}'s Shop
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              {sellerStats && (
                <>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-white text-sm">
                        {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}
                  {sellerStats.salesCount > 0 && (
                    <span className="text-white text-sm">
                      {sellerStats.salesCount} {sellerStats.salesCount === 1 ? 'sale' : 'sales'}
                    </span>
                  )}
                  {sellerStats.followersCount > 0 && (
                    <span className="text-white text-sm">
                      {sellerStats.followersCount} {sellerStats.followersCount === 1 ? 'follower' : 'followers'}
                    </span>
                  )}
                </>
              )}
              <span className="text-white text-sm">
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-2">
            {user && user.id !== userId && (
              <>
                <Link
                  href={`/messages/${userId}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  💬 Message Seller
                </Link>
              </>
            )}
            {isOwner && (
              <Link
                href="/profile"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
              >
                ⚙️ Manage Shop
              </Link>
            )}
          </div>
        </div>

        {/* Tabs - Etsy Style */}
        <div className="bg-white rounded-lg shadow-sm mb-6 border-b border-gray-200">
          <div className="flex gap-1 px-4">
            <button
              onClick={() => setActiveTab("items")}
              className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === "items"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Items ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === "reviews"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === "about"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              About
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Items Section */}
          {activeTab === "items" && (
            <div>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">This shop has no active listings yet.</p>
                  {isOwner && (
                    <Link
                      href="/sell"
                      className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                    >
                      Create Your First Listing
                    </Link>
                  )}
                  {!isOwner && (
                    <Link
                      href="/marketplace"
                      className="text-purple-600 hover:underline font-semibold"
                    >
                      Browse other shops →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Section */}
          {activeTab === "reviews" && (
            <div>
              {reviewsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-2">No reviews yet.</p>
                  {user && user.id !== userId && (
                    <p className="text-sm text-gray-400">Be the first to leave a review after making a purchase!</p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="font-semibold text-gray-900">
                              {review.user?.username || review.user?.email?.split('@')[0] || "Anonymous"}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 mb-2">{review.comment}</p>
                          )}
                          {review.order?.listing && (
                            <p className="text-xs text-gray-500">
                              Purchased: {review.order.listing.title}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* About Section */}
          {activeTab === "about" && (
            <div>
              {!userAbout ? (
                <div className="text-center py-12">
                  {isOwner ? (
                    <>
                      <p className="text-gray-500 text-lg mb-4">You haven't added an About section yet.</p>
                      <Link
                        href="/profile"
                        className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                      >
                        Add About Section
                      </Link>
                    </>
                  ) : (
                    <p className="text-gray-500">This seller hasn't added an About section yet.</p>
                  )}
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{userAbout}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50">
        <div className="text-center py-20 text-gray-500">Loading shop...</div>
      </main>
    }>
      <ShopContent />
    </Suspense>
  );
}
