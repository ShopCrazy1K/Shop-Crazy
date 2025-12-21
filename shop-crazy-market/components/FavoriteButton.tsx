"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
}

export default function FavoriteButton({ productId, className = "" }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavorite();
    }
  }, [user, productId]);

  async function checkFavorite() {
    try {
      const response = await fetch(`/api/favorites?userId=${user?.id}&productId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  }

  async function toggleFavorite() {
    if (!user) {
      alert("Please log in to add favorites");
      return;
    }

    setLoading(true);
    try {
      if (isFavorited) {
        const response = await fetch(
          `/api/favorites?userId=${user.id}&productId=${productId}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          setIsFavorited(false);
        }
      } else {
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
      className={`${className} transition-transform hover:scale-110 disabled:opacity-50`}
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

