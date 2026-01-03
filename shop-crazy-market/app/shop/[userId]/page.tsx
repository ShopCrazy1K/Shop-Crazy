"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/contexts/AuthContext";
import ReviewForm from "@/components/ReviewForm";

interface Listing {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  images: string[];
  digitalFiles: string[];
  thumbnailIndices?: number[];
  isActive: boolean;
  category: string | null;
  sellerId?: string;
  seller: {
    id: string;
    email: string;
    username: string | null;
    coverPhoto?: string | null;
    createdAt?: string;
  };
}

interface Product {
  id: string;
  title: string;
  price: number;
  images: string | string[];
  thumbnailIndices?: number[];
  category?: string;
  type?: string;
  shop?: {
    name: string;
    id?: string;
  };
}

interface ShopPolicies {
  shopAnnouncement?: string | null;
  shopAbout?: string | null;
  shippingPolicy?: string | null;
  returnsPolicy?: string | null;
  cancellationsPolicy?: string | null;
  faqs?: Array<{ question: string; answer: string }> | null;
  digitalDownloadsPolicy?: string | null;
  paymentMethods?: string | null;
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
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [sellerStats, setSellerStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"items" | "reviews" | "about" | "myshop">("items");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [shopPolicies, setShopPolicies] = useState<ShopPolicies | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [memberSince, setMemberSince] = useState<string>("");

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
        if (userData.createdAt) {
          const date = new Date(userData.createdAt);
          const years = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365));
          const months = Math.floor(((Date.now() - date.getTime()) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
          if (years > 0) {
            setMemberSince(`${years} ${years === 1 ? 'year' : 'years'}`);
          } else if (months > 0) {
            setMemberSince(`${months} ${months === 1 ? 'month' : 'months'}`);
          } else {
            setMemberSince("Less than a month");
          }
        }
      }

      // Fetch seller stats
      const statsResponse = await fetch(`/api/users/${userId}/stats`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setSellerStats(stats);
      }

      // Fetch shop policies
      const policiesResponse = await fetch(`/api/users/${userId}/policies`);
      if (policiesResponse.ok) {
        const policies = await policiesResponse.json();
        setShopPolicies(policies);
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
          thumbnailIndices: listing.thumbnailIndices,
          category: listing.category || "",
          type: hasDigitalFiles ? "DIGITAL" : "PHYSICAL",
          shop: {
            name: listing.seller.username || listing.seller.email || "Unknown Seller",
            id: listing.seller.id,
          },
        };
      });

      setProducts(transformed);

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
      {/* Cover Photo Section */}
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
              {memberSince && (
                <span className="text-white text-sm">
                  Member since {memberSince} ago
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-2">
            {user && user.id !== userId && (
              <Link
                href={`/messages/${userId}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                💬 Message Seller
              </Link>
            )}
            {isOwner && (
              <>
                <Link
                  href="/profile"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                >
                  ⚙️ Manage Shop
                </Link>
                <button
                  onClick={() => setActiveTab("myshop")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                >
                  👁️ My Shop
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 border-b border-gray-200">
          <div className="flex gap-1 px-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("items")}
              className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "items"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Items ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "reviews"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "about"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              About
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab("myshop")}
                className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "myshop"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                My Shop
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Items Section */}
          {activeTab === "items" && (
            <div>
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{products.length}</p>
                  <p className="text-sm text-gray-600">Listings</p>
                </div>
                {sellerStats && (
                  <>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{sellerStats.salesCount || 0}</p>
                      <p className="text-sm text-gray-600">Sales</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">Shop Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{memberSince || "New"}</p>
                      <p className="text-sm text-gray-600">Member Since</p>
                    </div>
                  </>
                )}
              </div>

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
              {user && user.id !== userId && !showReviewForm && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Write a Review
                  </button>
                </div>
              )}

              {showReviewForm && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <ReviewForm
                    sellerId={userId}
                    onSuccess={() => {
                      setShowReviewForm(false);
                      fetchReviews();
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              )}

              {reviewsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-2">No reviews yet.</p>
                  {user && user.id !== userId && !showReviewForm && (
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
                          {/* Review Photos */}
                          {review.photos && review.photos.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-3">
                              {review.photos.map((photo: string, index: number) => (
                                <img
                                  key={index}
                                  src={photo}
                                  alt={`Review photo ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => {
                                    // Open in modal or new tab
                                    window.open(photo, '_blank');
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          {review.order?.listing && (
                            <p className="text-xs text-gray-500 mt-2">
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

          {/* About Section with Shop Policies */}
          {activeTab === "about" && (
            <div className="space-y-6">
              {!shopPolicies || (!shopPolicies.shopAnnouncement && !shopPolicies.shopAbout && !shopPolicies.shippingPolicy && !shopPolicies.returnsPolicy && !shopPolicies.cancellationsPolicy && !shopPolicies.faqs && !shopPolicies.digitalDownloadsPolicy && !shopPolicies.paymentMethods) ? (
                <div className="text-center py-12">
                  {isOwner ? (
                    <>
                      <p className="text-gray-500 text-lg mb-4">You haven't added shop policies yet.</p>
                      <Link
                        href="/profile"
                        className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                      >
                        Add Shop Policies
                      </Link>
                    </>
                  ) : (
                    <p className="text-gray-500">This seller hasn't added shop policies yet.</p>
                  )}
                </div>
              ) : (
                <>
                  {shopPolicies.shopAnnouncement && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Shop Announcements</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{shopPolicies.shopAnnouncement}</p>
                    </div>
                  )}

                  {shopPolicies.shopAbout && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">About Your Shop</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{shopPolicies.shopAbout}</p>
                    </div>
                  )}

                  {shopPolicies.shippingPolicy && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Shipping</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{shopPolicies.shippingPolicy}</p>
                    </div>
                  )}

                  {shopPolicies.returnsPolicy && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Returns and Exchanges</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{shopPolicies.returnsPolicy}</p>
                    </div>
                  )}

                  {shopPolicies.cancellationsPolicy && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Cancellations</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{shopPolicies.cancellationsPolicy}</p>
                    </div>
                  )}

                  {shopPolicies.digitalDownloadsPolicy && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Digital Downloads</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{shopPolicies.digitalDownloadsPolicy}</p>
                    </div>
                  )}

                  {shopPolicies.paymentMethods && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Methods</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{shopPolicies.paymentMethods}</p>
                    </div>
                  )}

                  {shopPolicies.faqs && shopPolicies.faqs.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">FAQs</h3>
                      <div className="space-y-4">
                        {shopPolicies.faqs.map((faq: any, index: number) => (
                          <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                            <h4 className="font-semibold text-gray-900 mb-2">{faq.question || faq.q}</h4>
                            <p className="text-gray-700">{faq.answer || faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* My Shop Tab - Customer View */}
          {activeTab === "myshop" && isOwner && (
            <div>
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-gray-600 mb-4">This is how your shop appears to customers:</p>
                <Link
                  href={`/shop/${userId}`}
                  target="_blank"
                  className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  👁️ View My Shop (Opens in New Tab)
                </Link>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Shop Preview</h3>
                <p className="text-gray-600 mb-2">
                  <strong>Shop Name:</strong> {shopName}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Listings:</strong> {products.length}
                </p>
                {sellerStats && (
                  <>
                    <p className="text-gray-600 mb-2">
                      <strong>Sales:</strong> {sellerStats.salesCount || 0}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>Rating:</strong> {averageRating > 0 ? `${averageRating.toFixed(1)}/5.0` : "No ratings yet"}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>Reviews:</strong> {reviews.length}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>Followers:</strong> {sellerStats.followersCount || 0}
                    </p>
                  </>
                )}
                {memberSince && (
                  <p className="text-gray-600">
                    <strong>Member Since:</strong> {memberSince} ago
                  </p>
                )}
              </div>
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
