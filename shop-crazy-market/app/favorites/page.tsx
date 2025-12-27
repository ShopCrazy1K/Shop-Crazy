"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

interface Favorite {
  id: string;
  type: "listing" | "product";
  listing?: {
    id: string;
    title: string;
    price: number;
    images: string[];
    category?: string;
    type?: string;
    shop: {
      name: string;
    };
  };
  product?: {
    id: string;
    title: string;
    price: number;
    images: string[];
    category?: string;
    type?: string;
    shop: {
      name: string;
    };
  };
  createdAt: string;
}

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchFavorites();
    }
  }, [user, authLoading, router]);

  async function fetchFavorites() {
    try {
      const response = await fetch(`/api/favorites?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(itemId: string, isListing: boolean) {
    try {
      if (isListing) {
        // Remove listing favorite
        const response = await fetch(
          `/api/listings/${itemId}/favorite?userId=${user?.id}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          setFavorites(favorites.filter((fav) => 
            !(fav.type === "listing" && fav.listing?.id === itemId)
          ));
        }
      } else {
        // Remove product favorite
        const response = await fetch(
          `/api/favorites?userId=${user?.id}&productId=${itemId}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          setFavorites(favorites.filter((fav) => 
            !(fav.type === "product" && fav.product?.id !== itemId)
          ));
        }
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="p-6 max-w-6xl mx-auto pb-24">
        <div className="text-center py-10 text-gray-500">Loading favorites...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="p-6 max-w-6xl mx-auto pb-24">
      <h1 className="font-accent text-3xl mb-6">My Favorites</h1>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-2xl mb-4">💔 No favorites yet</p>
          <p className="text-gray-600 mb-4">Start adding products to your favorites!</p>
          <Link
            href="/marketplace"
            className="text-purple-600 font-bold hover:underline"
          >
            Browse Marketplace →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((favorite) => {
            const item = favorite.type === "listing" ? favorite.listing : favorite.product;
            if (!item) return null;
            
            return (
              <div key={favorite.id} className="relative">
                <Link href={favorite.type === "listing" ? `/listings/${item.id}` : `/product/${item.id}`}>
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="h-48 bg-gray-200 relative">
                      {item.images && Array.isArray(item.images) && item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          📦
                        </div>
                      )}
                      {item.type === "DIGITAL" && (
                        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                          💾 Digital
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold truncate text-sm">{item.title}</h3>
                      {item.shop && (
                        <p className="text-xs text-gray-500 truncate">{item.shop.name}</p>
                      )}
                      <p className="text-lg font-bold text-purple-600 mt-1">${(item.price / 100).toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => removeFavorite(item.id, favorite.type === "listing")}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition-colors"
                  aria-label="Remove from favorites"
                >
                  ❤️
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

