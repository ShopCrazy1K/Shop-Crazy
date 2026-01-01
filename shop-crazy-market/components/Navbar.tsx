"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const { user } = useAuth();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  return (
    <nav className="hidden md:flex justify-between items-center p-4 sm:p-5 border-b bg-white sticky top-0 z-40">
      <Link href="/" className="font-accent text-xl sm:text-2xl text-purple-600 hover:text-purple-700 transition-colors">
        Shop Crazy Market
      </Link>
      <div className="flex items-center gap-3 sm:gap-5 font-semibold">
        <Link href="/marketplace" className="hover:text-purple-600 transition-colors">Marketplace</Link>
        <Link href="/category/shop-4-us" className="hover:text-purple-600 transition-colors">🧸 Shop 4 Us</Link>
        <Link href="/category/game-zone" className="hover:text-purple-600 transition-colors">🎮 Game Zone</Link>
        <Link href="/category/fresh-out-world" className="hover:text-purple-600 transition-colors">👕 Fresh Out World</Link>
        <Link href="/messages" className="hover:text-purple-600 transition-colors">Messages</Link>
        <Link href="/cart" className="relative hover:text-purple-600 transition-colors">
          🛒 Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </Link>
        {user && (
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        )}
        <Link href="/sell" className="text-pink-600 hover:text-pink-700 transition-colors">Sell</Link>
        {user && (
          <Link href="/referrals" className="hover:text-purple-600 transition-colors">💰 Referrals</Link>
        )}
        {user ? (
          <Link href="/profile" className="hover:text-purple-600 transition-colors">Profile</Link>
        ) : (
          <Link href="/login" className="hover:text-purple-600 transition-colors">Login</Link>
        )}
      </div>
    </nav>
  );
}

