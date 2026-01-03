"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import NotificationBell from "@/components/NotificationBell";

export default function BottomNav() {
  const { user } = useAuth();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black text-white flex justify-around py-3 z-50">
      <Link href="/" className="text-2xl hover:scale-110 transition-transform">
        🏠
      </Link>
      <Link href="/marketplace" className="text-2xl hover:scale-110 transition-transform">
        🏪
      </Link>
      <Link href="/cart" className="text-2xl hover:scale-110 transition-transform relative">
        🛒
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </Link>
      <Link href="/sell" className="text-2xl hover:scale-110 transition-transform">
        ➕
      </Link>
      {user && (
        <Link href="/referrals" className="text-2xl hover:scale-110 transition-transform relative" title="Referrals">
          💰
        </Link>
      )}
      {user && user.role === "ADMIN" && (
        <Link href="/admin" className="text-2xl hover:scale-110 transition-transform relative" title="Admin Panel">
          ⚙️
        </Link>
      )}
      {user ? (
        <Link href="/profile" className="text-2xl hover:scale-110 transition-transform">
          👤
        </Link>
      ) : (
        <Link href="/login" className="text-2xl hover:scale-110 transition-transform">
          🔐
        </Link>
      )}
    </nav>
  );
}

