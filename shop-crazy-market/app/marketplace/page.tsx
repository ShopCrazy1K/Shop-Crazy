"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { categories } from "@/lib/categories";
import SearchBar from "@/components/SearchBar";
import FavoriteButton from "@/components/FavoriteButton";
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
  sellerId?: string;
  sellerStats?: {
    salesCount: number;
    averageRating: number;
    reviewsCount: number;
  };
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchQuery(urlSearch);
    } else {
      setSearchQuery("");
    }
  }, [searchParams]);

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedType, searchQuery, user, sortBy, priceMin, priceMax]);

  async function fetchListings() {
    try {
      setLoading(true);
      let url = "/api/listings?";
      if (selectedCategory !== "all") {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}&`;
      }
      url += `isActive=true&`;
      if (user?.id) {
        url += `excludeUserId=${encodeURIComponent(user.id)}&`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const listings: Listing[] = await response.json();
        
        // Filter by type
        let filtered = listings.filter(listing => {
          if (user?.id) {
            const listingSellerId = listing.sellerId || listing.seller?.id;
            if (listingSellerId === user.id) return false;
          }
          return true;
        });

        if (selectedType !== "all") {
          filtered = filtered.filter(listing => {
            const digitalFilesValue = listing.digitalFiles as any;
            const hasDigitalFiles = digitalFilesValue && 
              ((Array.isArray(digitalFilesValue) && digitalFilesValue.length > 0) ||
               (typeof digitalFilesValue === 'string' && digitalFilesValue.trim().length > 0));
            return selectedType === "DIGITAL" ? hasDigitalFiles : !hasDigitalFiles;
          });
        }

        // Price filter
        if (priceMin) {
          const minCents = parseFloat(priceMin) * 100;
          filtered = filtered.filter(listing => listing.priceCents >= minCents);
        }
        if (priceMax) {
          const maxCents = parseFloat(priceMax) * 100;
          filtered = filtered.filter(listing => listing.priceCents <= maxCents);
        }

        // Sort
        if (sortBy === "price_low") {
          filtered.sort((a, b) => a.priceCents - b.priceCents);
        } else if (sortBy === "price_high") {
          filtered.sort((a, b) => b.priceCents - a.priceCents);
        } else if (sortBy === "newest") {
          // Sort by listing ID (newer listings have higher IDs) or keep original order
          filtered.reverse();
        }

        // Fetch seller stats for each listing
        const productsWithStats = await Promise.all(
          filtered.slice(0, 40).map(async (listing) => {
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

            // Fetch seller stats
            let sellerStats = null;
            try {
              const statsResponse = await fetch(`/api/users/${listing.seller.id}/stats`);
              if (statsResponse.ok) {
                sellerStats = await statsResponse.json();
              }
            } catch (error) {
              console.error("Error fetching seller stats:", error);
            }

            return {
              id: listing.id,
              title: listing.title,
              price: listing.priceCents,
              images: images,
              category: listing.category || undefined,
              type: (() => {
                const digitalFilesValue = listing.digitalFiles as any;
                const hasDigitalFiles = digitalFilesValue && 
                  ((Array.isArray(digitalFilesValue) && digitalFilesValue.length > 0) ||
                   (typeof digitalFilesValue === 'string' && digitalFilesValue.trim().length > 0));
                return hasDigitalFiles ? "DIGITAL" : "PHYSICAL";
              })(),
              shop: {
                name: listing.seller.username || listing.seller.email || "Unknown Seller",
                id: listing.seller.id,
              },
              sellerId: listing.seller.id,
              sellerStats: sellerStats,
            };
          })
        );
        
        setProducts(productsWithStats);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <SearchBar />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden px-4 py-2 bg-gray-100 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                {showFilters ? "Hide" : "Show"} Filters
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Etsy Style */}
          <aside className={`hidden md:block w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Filters</h2>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-3 text-gray-700">Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === "all"
                        ? "bg-purple-100 text-purple-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.slug
                          ? "bg-purple-100 text-purple-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {cat.emoji} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Type Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-3 text-gray-700">Product Type</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedType("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedType === "all"
                        ? "bg-purple-100 text-purple-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    All Items
                  </button>
                  <button
                    onClick={() => setSelectedType("PHYSICAL")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedType === "PHYSICAL"
                        ? "bg-purple-100 text-purple-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    📦 Physical Products
                  </button>
                  <button
                    onClick={() => setSelectedType("DIGITAL")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedType === "DIGITAL"
                        ? "bg-purple-100 text-purple-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    💾 Digital Products
                  </button>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-sm mb-3 text-gray-700">Price</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  {(priceMin || priceMax) && (
                    <button
                      onClick={() => {
                        setPriceMin("");
                        setPriceMax("");
                      }}
                      className="w-full text-sm text-purple-600 hover:text-purple-700 font-semibold"
                    >
                      Clear Price Filter
                    </button>
                  )}
                </div>
              </div>

              {/* Deals Link */}
              <div className="pt-4 border-t border-gray-200">
                <Link
                  href="/deals"
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-colors text-sm"
                >
                  🔥 View All Deals
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {loading ? "Loading..." : `${products.length} ${products.length === 1 ? 'item' : 'items'}`}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    window.history.pushState({}, "", "/marketplace");
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Clear Search
                </button>
              )}
            </div>

            {/* Products Grid - Etsy Style */}
            {loading ? (
              <div className="text-center text-gray-500 py-20">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                <p className="text-xl font-semibold text-gray-700 mb-2">No products found</p>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                <Link
                  href="/sell"
                  className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Be the first to list something!
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <Link key={product.id} href={`/listings/${product.id}`}>
                    <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
                      {/* Image */}
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        {(() => {
                          let imageUrl: string | null = null;
                          if (product.images) {
                            if (Array.isArray(product.images) && product.images.length > 0) {
                              imageUrl = product.images[0];
                            } else if (typeof product.images === 'string' && product.images.trim()) {
                              imageUrl = product.images;
                            }
                          }
                          
                          if (imageUrl) {
                            return (
                              <img
                                src={imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent && !parent.querySelector('.image-placeholder')) {
                                    const placeholder = document.createElement('div');
                                    placeholder.className = 'w-full h-full flex items-center justify-center text-gray-400 image-placeholder';
                                    placeholder.textContent = '📦';
                                    parent.appendChild(placeholder);
                                  }
                                }}
                              />
                            );
                          }
                          return (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              📦
                            </div>
                          );
                        })()}
                        
                        {/* Favorite Button - Top Right */}
                        <div 
                          className="absolute top-2 right-2 z-20" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <FavoriteButton 
                            listingId={product.id} 
                            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
                          />
                        </div>
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.type === "DIGITAL" && (
                            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded font-semibold">
                              💾 Digital
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-3">
                        {/* Title */}
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-purple-600 transition-colors">
                          {product.title}
                        </h3>

                        {/* Seller Info */}
                        {product.shop && (
                          <Link
                            href={`/shop/${product.shop.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-gray-500 hover:text-purple-600 transition-colors block mb-1"
                          >
                            {product.shop.name}
                          </Link>
                        )}

                        {/* Rating & Sales */}
                        {product.sellerStats && (
                          <div className="flex items-center gap-2 mb-2">
                            {product.sellerStats.averageRating > 0 && (
                              <>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-xs ${
                                        i < Math.round(product.sellerStats!.averageRating)
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">
                                  ({product.sellerStats.reviewsCount})
                                </span>
                              </>
                            )}
                            {product.sellerStats.salesCount > 0 && (
                              <span className="text-xs text-gray-500">
                                • {product.sellerStats.salesCount} {product.sellerStats.salesCount === 1 ? 'sale' : 'sales'}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <p className="text-lg font-bold text-gray-900">
                          ${(product.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function Marketplace() {
  return (
    <Suspense fallback={
      <main className="p-4 max-w-7xl mx-auto">
        <div className="text-center text-gray-500 py-10">Loading...</div>
      </main>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
