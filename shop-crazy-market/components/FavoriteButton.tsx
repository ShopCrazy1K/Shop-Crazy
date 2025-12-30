"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface FavoriteButtonProps {
  productId?: string;
  listingId?: string;
  className?: string;
}

export default function FavoriteButton({ productId, listingId, className = "" }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use listingId if provided, otherwise use productId
  const itemId = listingId || productId;

  useEffect(() => {
    if (user && itemId) {
      checkFavorite();
    }
  }, [user, itemId]);

  async function checkFavorite() {
    if (!itemId || !user) return;
    
    try {
      // Use listing-specific endpoint if listingId is provided
      if (listingId) {
        const response = await fetch(`/api/listings/${listingId}/favorite?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.isFavorited);
        }
      } else if (productId) {
        // Use product favorites endpoint
        const response = await fetch(`/api/favorites?userId=${user.id}&productId=${productId}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorited(data.isFavorited);
        }
      }
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  }

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("Please log in to add favorites");
      return;
    }

    if (!itemId) return;

    setLoading(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        if (listingId) {
          const response = await fetch(
            `/api/listings/${listingId}/favorite?userId=${user.id}`,
            { method: "DELETE" }
          );
          if (response.ok) {
            setIsFavorited(false);
          }
        } else if (productId) {
          const response = await fetch(
            `/api/favorites?userId=${user.id}&productId=${productId}`,
            { method: "DELETE" }
          );
          if (response.ok) {
            setIsFavorited(false);
          }
        }
      } else {
        // Add to favorites
        if (listingId) {
          const response = await fetch(`/api/listings/${listingId}/favorite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
            }),
          });
          if (response.ok) {
            setIsFavorited(true);
          }
        } else if (productId) {
          const response = await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId,
              userId: user.id,
            }),
          });
          if (response.ok) {
            setIsFavorited(true);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`${className} transition-transform hover:scale-110 disabled:opacity-50 z-10`}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorited ? (
        <span className="text-2xl">❤️</span>
      ) : (
        <span className="text-2xl">🤍</span>
      )}
    </button>
  );
}

