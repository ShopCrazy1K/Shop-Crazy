"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/lib/categories";
import SearchBar from "@/components/SearchBar";

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
    fetchProducts();
  }, [selectedCategory, selectedType, searchQuery]);

  async function fetchProducts() {
    try {
      let url = "/api/products?";
      if (selectedCategory !== "all") {
        url += `category=${selectedCategory}&`;
      }
      if (selectedType !== "all") {
        url += `type=${selectedType}&`;
      }
      if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}&`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.slice(0, 20)); // Limit to 20 for mobile
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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
            <ProductCard key={product.id} product={product} />
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

