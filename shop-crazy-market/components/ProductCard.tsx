import Link from "next/link";
import { getCategoryBySlug } from "@/lib/categories";

interface Product {
  id: string;
  title: string;
  price: number;
  images?: string | string[];
  category?: string;
  type?: string;
  shop?: {
    name: string;
  };
}

// Helper function to safely parse images
function parseImages(images: string | string[] | null | undefined): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    // Check if it's a JSON string
    if (images.trim().startsWith('[') || images.trim().startsWith('{')) {
      try {
        return JSON.parse(images);
      } catch {
        // If parsing fails, treat as single image path
        return [images];
      }
    }
    // If it's a plain string path, return as array
    return [images];
  }
  return [];
}

export default function ProductCard({ product }: { product: Product }) {
  const category = product.category ? getCategoryBySlug(product.category) : null;
  const images = parseImages(product.images);
  const imageUrl = images[0] || null;
  const price = `$${(product.price / 100).toFixed(2)}`;

  // Determine the correct link based on whether it's a listing or product
  // Listings use /listings/, products use /product/
  const linkHref = product.id.startsWith('cm') || product.id.length > 20 
    ? `/listings/${product.id}` 
    : `/product/${product.id}`;
  
  return (
    <Link href={linkHref}>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        <div className="h-32 bg-gray-200 relative">
          {imageUrl ? (
            <img
              src={imageUrl}
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
          <div className="flex items-center gap-1 mb-1">
            {category && (
              <span className="text-xs">{category.emoji}</span>
            )}
            {product.type && (
              <span className="text-xs text-gray-500">
                {product.type === "DIGITAL" ? "💾" : "📦"}
              </span>
            )}
          </div>
          <h3 className="font-bold truncate text-sm">{product.title}</h3>
          {product.shop && (
            <p className="text-xs text-gray-500 truncate">{product.shop.name}</p>
          )}
          <p className="text-lg font-bold text-purple-600 mt-1">{price}</p>
        </div>
      </div>
    </Link>
  );
}
