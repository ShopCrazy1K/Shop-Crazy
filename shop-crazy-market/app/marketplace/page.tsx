"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/lib/categories";
import SearchBar from "@/components/SearchBar";

interface Listing {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  images: string[];
  digitalFiles: string[];
  isActive: boolean;
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
  };
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    // Get search query from URL params
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchQuery(urlSearch);
    } else {
      setSearchQuery("");
    }
  }, [searchParams]);

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedType, searchQuery]);

  async function fetchListings() {
    try {
      // Build query string
      let url = "/api/listings?";
      if (selectedCategory !== "all") {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}&`;
      }
      // Ensure only active listings are fetched for guest users
      url += `isActive=true&`;

      // Fetch from listings API (guest users will only see active listings)
      const response = await fetch(url);
      if (response.ok) {
        const listings: Listing[] = await response.json();
        
        console.log("[MARKETPLACE] Fetched listings:", listings.length);
        console.log("[MARKETPLACE] Selected type:", selectedType);
        console.log("[MARKETPLACE] Sample listing:", listings[0] ? {
          id: listings[0].id,
          title: listings[0].title,
          digitalFiles: listings[0].digitalFiles,
          digitalFilesType: typeof listings[0].digitalFiles,
          digitalFilesIsArray: Array.isArray(listings[0].digitalFiles),
          digitalFilesLength: Array.isArray(listings[0].digitalFiles) ? listings[0].digitalFiles.length : "N/A"
        } : "No listings");
        
        // Filter by type (digital vs physical based on digitalFiles) - done client-side
        let filtered = listings;
        if (selectedType !== "all") {
          console.log("[MARKETPLACE] Filtering by type:", selectedType, "Total listings:", listings.length);
          filtered = filtered.filter(listing => {
            const digitalFilesValue = listing.digitalFiles as any;
            const hasDigitalFiles = digitalFilesValue && 
              ((Array.isArray(digitalFilesValue) && digitalFilesValue.length > 0) ||
               (typeof digitalFilesValue === 'string' && digitalFilesValue.trim().length > 0));
            
            if (selectedType === "DIGITAL") {
              const isDigital = hasDigitalFiles;
              if (isDigital) {
                console.log("[MARKETPLACE] Digital listing found:", listing.id, listing.title, "digitalFiles:", digitalFilesValue);
              }
              return isDigital;
            } else if (selectedType === "PHYSICAL") {
              return !hasDigitalFiles;
            }
            return true;
          });
          console.log("[MARKETPLACE] After filter:", filtered.length, selectedType, "listings");
        }
        
        // Transform Listing to Product format for ProductCard
        const transformed: Product[] = filtered.slice(0, 20).map(listing => {
          // Ensure images is always an array
          let images: string[] = [];
          if (listing.images) {
            if (Array.isArray(listing.images)) {
              images = listing.images.filter((img: any) => img && typeof img === 'string' && img.trim());
            } else {
              // Handle case where images might be stored as a single string
              const imagesValue = listing.images as any;
              if (typeof imagesValue === 'string' && imagesValue.trim()) {
                images = [imagesValue];
              }
            }
          }
          
          // If no images but has image-type digital files, use those
          if (images.length === 0 && listing.digitalFiles) {
            const imageDigitalFiles = listing.digitalFiles.filter((url: string) => {
              const ext = url.split('.').pop()?.toLowerCase();
              return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '');
            });
            images = imageDigitalFiles;
          }
          
          return {
            id: listing.id,
            title: listing.title,
            price: listing.priceCents,
            images: images,
            type: (() => {
              const digitalFilesValue = listing.digitalFiles as any;
              const hasDigitalFiles = digitalFilesValue && 
                ((Array.isArray(digitalFilesValue) && digitalFilesValue.length > 0) ||
                 (typeof digitalFilesValue === 'string' && digitalFilesValue.trim().length > 0));
              return hasDigitalFiles ? "DIGITAL" : "PHYSICAL";
            })(),
            shop: {
              name: listing.seller.username || listing.seller.email,
            },
          };
        });
        
        setProducts(transformed);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="marketplace-90s-bg">
        {/* Graffiti text elements */}
        <div className="graffiti-text" style={{ '--rotate': '-15deg' } as React.CSSProperties}>
          SHOP CRAZY
        </div>
        <div className="graffiti-text" style={{ '--rotate': '12deg' } as React.CSSProperties}>
          MARKET
        </div>
        <div className="graffiti-text" style={{ '--rotate': '-8deg' } as React.CSSProperties}>
          SHOP CRAZY MARKET
        </div>
        <div className="graffiti-text" style={{ '--rotate': '18deg' } as React.CSSProperties}>
          CRAZY
        </div>
        <div className="graffiti-text" style={{ '--rotate': '-5deg' } as React.CSSProperties}>
          SHOP
        </div>
        <div className="graffiti-text" style={{ '--rotate': '25deg' } as React.CSSProperties}>
          MARKET
        </div>
        <div className="graffiti-text" style={{ '--rotate': '-20deg' } as React.CSSProperties}>
          CRAZY MARKET
        </div>
      </div>

      <main className="p-4 max-w-7xl mx-auto marketplace-90s-content relative z-10">
        {/* Deals Link */}
        <div className="mb-4 text-right">
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-colors shadow-lg"
          >
            🔥 View All Deals
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
        <SearchBar />
        {searchQuery && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Searching for: <strong>{searchQuery}</strong>
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                window.history.pushState({}, "", "/marketplace");
              }}
              className="text-sm text-purple-600 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Category Filter */}
        <div>
          <h3 className="font-semibold mb-2">Categories</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                selectedCategory === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
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

        {/* Type Filter */}
        <div>
          <h3 className="font-semibold mb-2">Product Type</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedType === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType("PHYSICAL")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedType === "PHYSICAL"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📦 Physical
            </button>
            <button
              onClick={() => setSelectedType("DIGITAL")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedType === "DIGITAL"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              💾 Digital
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading...</div>
      ) : products.length === 0 ? (
        <div className="col-span-2 text-center text-gray-500 py-10">
          <p className="mb-4">No products found</p>
          <Link href="/sell" className="text-purple-600 underline font-semibold">
            Be the first to list something!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/listings/${product.id}`}>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                <div className="h-48 bg-gray-200 relative">
                  {(() => {
                    // Handle both array and string formats
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
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Hide broken image and show placeholder
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
                  {product.type === "DIGITAL" && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      💾 Digital
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold truncate text-sm">{product.title}</h3>
                  {product.shop && (
                    <p className="text-xs text-gray-500 truncate">{product.shop.name}</p>
                  )}
                  <p className="text-lg font-bold text-purple-600 mt-1">${(product.price / 100).toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      </main>
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

