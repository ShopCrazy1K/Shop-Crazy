import Link from "next/link";
import { getCategoryBySlug } from "@/lib/categories";

interface Product {
  id: string;
  title: string;
  price: number;
  images?: string | string[];
  thumbnailIndices?: number[];
  category?: string;
  type?: string;
  shop?: {
    name: string;
    id?: string; // Add seller ID for shop page link
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
  
  // Get thumbnail images
  let thumbnailImages: string[] = [];
  if (images.length > 0) {
    let thumbnailIndices: number[] = [];
    if (product.thumbnailIndices && Array.isArray(product.thumbnailIndices) && product.thumbnailIndices.length > 0) {
      thumbnailIndices = product.thumbnailIndices.slice(0, 4).filter((idx: number) => idx >= 0 && idx < images.length);
    }
    if (thumbnailIndices.length === 0) {
      thumbnailIndices = Array.from({ length: Math.min(4, images.length) }, (_, i) => i);
    }
    thumbnailImages = thumbnailIndices.map((idx: number) => images[idx]).filter(Boolean);
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <Link href={linkHref} className="block">
        <div className="h-32 bg-gray-200 relative cursor-pointer">
          {thumbnailImages.length > 1 ? (
            <div className="grid grid-cols-2 h-full">
              {thumbnailImages.slice(0, 4).map((img: string, idx: number) => (
                <div key={idx} className="relative overflow-hidden">
                  <img
                    src={img}
                    alt={`${product.title} - Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : imageUrl ? (
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
      </Link>
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
        <Link href={linkHref} className="block">
          <h3 className="font-bold truncate text-sm hover:text-purple-600 transition-colors cursor-pointer">{product.title}</h3>
        </Link>
        {product.shop && product.shop.id ? (
          <Link 
            href={`/shop/${product.shop.id}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="text-xs text-gray-500 truncate hover:text-purple-600 hover:underline transition-colors inline-block mt-1 cursor-pointer relative z-10"
            title={`View ${product.shop.name}'s shop`}
          >
            {product.shop.name}
          </Link>
        ) : product.shop ? (
          <p className="text-xs text-gray-500 truncate mt-1">{product.shop.name}</p>
        ) : null}
        <p className="text-lg font-bold text-purple-600 mt-1">{price}</p>
      </div>
    </div>
  );
}
