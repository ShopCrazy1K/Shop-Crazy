"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { categories } from "@/lib/categories";
import DealBadge from "@/components/DealBadge";

interface Deal {
  id: string;
  title: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  badgeText: string | null;
  badgeColor: string | null;
  endsAt: string;
  promoCode: string | null;
  listing: {
    id: string;
    title: string;
    priceCents: number;
    images: string[];
    category: string | null;
    seller: {
      username: string | null;
      email: string;
    };
  };
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchDeals();
  }, [selectedCategory]);

  async function fetchDeals() {
    try {
      setLoading(true);
      let url = "/api/deals?";
      if (selectedCategory !== "all") {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDeals(data);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-7xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🔥 Deals & Promotions</h1>
        <p className="text-gray-600">
          Discover amazing discounts and limited-time offers from sellers
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Filter by Category</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
              selectedCategory === "all"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Deals
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Grid */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading deals...</div>
      ) : deals.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No active deals found</p>
          <Link
            href="/marketplace"
            className="text-purple-600 hover:underline font-semibold"
          >
            Browse All Listings →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => {
            const imageUrl = Array.isArray(deal.listing.images) && deal.listing.images.length > 0
              ? deal.listing.images[0]
              : null;

            return (
              <Link
                key={deal.id}
                href={`/listings/${deal.listing.id}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {imageUrl && (
                  <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={deal.listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {/* Deal Badge Overlay */}
                    <div className="absolute top-2 right-2">
                      {deal.badgeText && (
                        <span
                          className={`${
                            deal.badgeColor === "red"
                              ? "bg-red-500"
                              : deal.badgeColor === "green"
                              ? "bg-green-500"
                              : "bg-purple-500"
                          } text-white text-xs font-bold px-2 py-1 rounded`}
                        >
                          {deal.badgeText}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{deal.listing.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    by {deal.listing.seller.username || deal.listing.seller.email}
                  </p>
                  
                  {/* Deal Info */}
                  <div className="mb-3">
                    <DealBadge deal={deal} priceCents={deal.listing.priceCents} className="mb-0" />
                  </div>

                  {deal.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{deal.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">View Details →</span>
                    {deal.promoCode && (
                      <span className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs font-mono">
                        {deal.promoCode}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

