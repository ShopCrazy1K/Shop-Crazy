"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
  id: string;
  title: string;
  price: number;
  category?: string;
  shop?: {
    name: string;
  };
}

export default function SearchBar({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      searchProducts();
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  async function searchProducts() {
    setLoading(true);
    setIsOpen(true);
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.slice(0, 8)); // Limit to 8 results
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  }

  function handleResultClick() {
    setIsOpen(false);
    setQuery("");
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, categories..."
          className="w-full bg-white/90 backdrop-blur-sm border-2 border-purple-300 rounded-xl px-4 py-3 pr-12 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
          aria-label="Search"
        >
          🔍
        </button>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-purple-200 max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin text-2xl mb-2">⏳</div>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-2 border-b border-gray-200">
                <p className="text-xs text-gray-600 font-semibold">
                  {results.length} result{results.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={handleResultClick}
                    className="block p-4 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.title}</h3>
                        {product.shop && (
                          <p className="text-sm text-gray-500">{product.shop.name}</p>
                        )}
                        {product.category && (
                          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded mt-1 inline-block">
                            {product.category}
                          </span>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-bold text-purple-600">
                          ${(product.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <Link
                  href={`/marketplace?search=${encodeURIComponent(query)}`}
                  onClick={handleResultClick}
                  className="text-center block text-purple-600 font-semibold hover:underline"
                >
                  View all results →
                </Link>
              </div>
            </>
          ) : query.length >= 2 ? (
            <div className="p-6 text-center text-gray-500">
              <p className="mb-2">No products found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

