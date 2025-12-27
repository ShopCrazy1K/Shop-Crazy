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
  images: string;
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
      // Fetch from listings API (guest users will only see active listings)
      const response = await fetch("/api/listings");
      if (response.ok) {
        const listings: Listing[] = await response.json();
        
        // Filter by search query if provided
        let filtered = listings;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = listings.filter(listing => 
            listing.title.toLowerCase().includes(query) ||
            listing.description.toLowerCase().includes(query)
          );
        }
        
        // Filter by category (if we add category to Listing model later)
        // For now, we'll skip category filtering as Listing doesn't have category field
        
        // Filter by type (digital vs physical based on digitalFiles)
        if (selectedType !== "all") {
          filtered = filtered.filter(listing => {
            if (selectedType === "DIGITAL") {
              return listing.digitalFiles && listing.digitalFiles.length > 0;
            } else if (selectedType === "PHYSICAL") {
              return !listing.digitalFiles || listing.digitalFiles.length === 0;
            }
            return true;
          });
        }
        
        // Transform Listing to Product format for ProductCard
        const transformed: Product[] = filtered.slice(0, 20).map(listing => ({
          id: listing.id,
          title: listing.title,
          price: listing.priceCents,
          images: listing.images,
          type: listing.digitalFiles && listing.digitalFiles.length > 0 ? "DIGITAL" : "PHYSICAL",
          shop: {
            name: listing.seller.username || listing.seller.email,
          },
        }));
        
        setProducts(transformed);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4 max-w-7xl mx-auto">
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
                <div className="h-32 bg-gray-200 relative">
                  {product.images && Array.isArray(product.images) && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📦
                    </div>
                  )}
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

