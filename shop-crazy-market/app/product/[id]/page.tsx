"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import ZoneBadge from "@/components/ZoneBadge";
import MessageButton from "@/components/MessageButton";
import ReportButton from "@/components/ReportButton";
import ReviewForm from "@/components/ReviewForm";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  zone: string;
  category?: string;
  type: string;
  condition: string;
  shop: {
    id: string;
    name: string;
    owner: {
      id: string;
      username?: string;
      email: string;
    };
  };
  reviews: any[];
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [productId]);

  async function fetchReviews() {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }

  async function fetchProduct() {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        setError("Product not found");
        return;
      }
      const data = await response.json();
      setProduct(data);
      // Initialize reviews from product data
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart() {
    if (!product) return;
    
    if (product.type === "DIGITAL") {
      // For digital products, redirect to checkout directly
      // Or show a message that they need to purchase
      alert("Digital products must be purchased directly. Click 'Purchase to Download' to proceed.");
      return;
    }
    
    addItem({
      id: product.id,
      listingId: product.id, // Use product.id as listingId for legacy products
      title: product.title,
      price: product.price,
      quantity: quantity,
      image: product.images[0] || "",
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <div className="text-center py-10 text-gray-500">Loading product...</div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <div className="text-center py-10">
          <p className="text-red-600 mb-4">{error || "Product not found"}</p>
          <Link href="/marketplace" className="text-purple-600 underline">
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const priceDollars = (product.price / 100).toFixed(2);
  const sellerId = product.shop.owner.id;
  const mainImage = product.images[0] || "";

  return (
    <main className="max-w-5xl mx-auto p-4 pb-24">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Product Images */}
        {product.images.length > 0 && (
          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Zone Badge */}
          <ZoneBadge zone={product.zone} />

          {/* Product Title & Price */}
          <div>
            <h1 className="font-accent text-4xl mb-2">{product.title}</h1>
            <p className="text-3xl font-bold text-purple-600">${priceDollars}</p>
          </div>

          {/* Product Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            {product.category && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {product.category}
              </span>
            )}
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              {product.type === "DIGITAL" ? "💾 Digital" : "📦 Physical"}
            </span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              {product.condition === "NEW" ? "✨ New" : "🔄 Used"}
            </span>
            {product.quantity > 0 && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {product.quantity} in stock
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="font-semibold text-lg mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Seller Info */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Sold by</h3>
            <Link
              href={`/shop/${product.shop.id}`}
              className="text-purple-600 hover:underline"
            >
              {product.shop.name}
            </Link>
            <p className="text-sm text-gray-600">
              {product.shop.owner.username || product.shop.owner.email}
            </p>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="border-t pt-4 space-y-4">
            {product.type === "PHYSICAL" && product.quantity > 0 && (
              <div>
                <label className="block text-sm font-semibold mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="border-2 border-gray-300 rounded-lg px-4 py-2 w-24"
                />
              </div>
            )}

            <div className="flex gap-4 items-center">
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {product.quantity === 0
                  ? "Out of Stock"
                  : addedToCart
                  ? "✓ Added to Cart!"
                  : product.type === "DIGITAL"
                  ? "Purchase to Download"
                  : "Add to Cart"}
              </button>
              {user && (
                <>
                  <FavoriteButton productId={productId} />
                  <MessageButton userId={sellerId} />
                </>
              )}
            </div>
          </div>

          {/* Additional Images */}
          {product.images.length > 1 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">More Images</h3>
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`${product.title} ${idx + 2}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Reviews ({reviews.length})</h3>
              {user && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700"
                >
                  {showReviewForm ? "Cancel" : "Write a Review"}
                </button>
              )}
            </div>

            {showReviewForm && product && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <ReviewForm
                  productId={productId}
                  sellerId={product.shop.owner.id}
                  onReviewSubmitted={() => {
                    setShowReviewForm(false);
                    fetchReviews();
                    fetchProduct(); // Refresh product to update review count
                  }}
                />
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">
                        {review.user?.username || review.user?.email || "Anonymous"}
                      </span>
                      <span className="text-yellow-500">
                        {"⭐".repeat(review.rating)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report Button */}
          <div className="border-t pt-4">
            <ReportButton productId={productId} />
          </div>
        </div>
      </div>
    </main>
  );
}
