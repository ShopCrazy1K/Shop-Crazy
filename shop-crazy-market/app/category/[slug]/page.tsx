"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, categories } from "@/lib/categories";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string;
  category: string;
  type: string;
  shop: {
    name: string;
  };
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = getCategoryBySlug(slug);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchProducts();
    }
  }, [slug]);

  async function fetchProducts() {
    try {
      // Fetch all listings (category filtering not yet implemented in Listing model)
      const response = await fetch(`/api/listings`);
      if (response.ok) {
        const listings = await response.json();
        // Transform listings to product format
        const transformed: Product[] = listings.map((listing: any) => ({
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.priceCents,
          images: listing.images,
          type: listing.digitalFiles && listing.digitalFiles.length > 0 ? "DIGITAL" : "PHYSICAL",
          shop: {
            name: listing.seller?.username || listing.seller?.email || "Unknown",
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

  if (!category) {
    return (
      <main className="p-6">
        <h1 className="font-accent text-4xl mb-4">Category Not Found</h1>
        <Link href="/marketplace" className="text-purple-600 underline">
          Back to Marketplace
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{category.emoji}</span>
          <div>
            <h1 className="font-accent text-4xl">{category.name}</h1>
            <p className="text-gray-600 mt-1">{category.description}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                cat.slug === slug
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.emoji} {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No products found in this category</p>
          <Link
            href="/marketplace"
            className="text-purple-600 underline font-semibold"
          >
            Browse All Products
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

