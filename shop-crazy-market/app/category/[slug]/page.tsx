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
      const response = await fetch(`/api/products?category=${slug}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

