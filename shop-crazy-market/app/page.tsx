"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { categories } from "@/lib/categories";
import SearchBar from "@/components/SearchBar";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <Image
          src="/logo.png"
          alt="Shop Crazy Market"
          width={520}
          height={520}
          priority
          style={styles.logo}
        />

        <h1 style={styles.title}>Welcome to Shop Crazy Market</h1>
        <p style={styles.subtitle}>
          Buy & sell products, digital downloads, and more.
        </p>

        <div style={styles.actions}>
          <Link href="/marketplace">
            <button style={styles.primaryBtn}>Shop Now</button>
          </Link>
          <Link href="/sell">
            <button style={styles.secondaryBtn}>Sell Something</button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <section className="max-w-2xl mx-auto mt-8">
        <SearchBar />
      </section>

      {/* Categories Grid */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center text-white">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`}>
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-purple-300">
                <div className="text-4xl mb-2 text-center">{category.emoji}</div>
                <div className="font-bold text-sm text-center mb-1">{category.name}</div>
                <div className="text-xs text-gray-600 text-center">{category.description}</div>
              </div>
            </Link>
          ))}
          <Link href="/marketplace">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer text-white">
              <div className="text-4xl mb-2 text-center">🔥</div>
              <div className="font-bold text-sm text-center mb-1">View All</div>
              <div className="text-xs opacity-90 text-center">Browse everything</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      {user && (
        <section className="grid grid-cols-2 gap-3 mt-8">
          <QuickLinkCard 
            title="💬 Messages" 
            description="Chat with sellers"
            href="/messages"
            color="bg-blue-500"
          />
          <QuickLinkCard 
            title="⭐ Favorites" 
            description="Saved items"
            href="/profile"
            color="bg-pink-500"
          />
          <QuickLinkCard 
            title="📦 Orders" 
            description="Track purchases"
            href="/profile"
            color="bg-green-500"
          />
          <QuickLinkCard 
            title="🏪 My Shop" 
            description="Seller dashboard"
            href="/seller/dashboard"
            color="bg-purple-500"
          />
        </section>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 24,
    paddingBottom: 100, // Space for bottom nav
    background:
      "radial-gradient(circle at top, rgba(255,255,255,0.18), rgba(0,0,0,0.85))",
  },
  card: {
    width: "min(920px, 100%)",
    borderRadius: 24,
    padding: 28,
    background: "rgba(15, 15, 20, 0.72)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 20px 80px rgba(0,0,0,0.45)",
    textAlign: "center",
    backdropFilter: "blur(10px)",
    marginBottom: 24,
  },
  logo: {
    width: "min(520px, 90vw)",
    height: "auto",
    margin: "0 auto 18px",
    display: "block",
    filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.55))",
  },
  title: {
    margin: "8px 0 6px",
    fontSize: 34,
    color: "#fff",
    letterSpacing: 0.2,
  },
  subtitle: {
    margin: "0 0 18px",
    fontSize: 16,
    color: "rgba(255,255,255,0.78)",
  },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 10,
  },
  primaryBtn: {
    padding: "12px 18px",
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    color: "#111",
    background:
      "linear-gradient(90deg, #ffdc5d, #ff6ad5, #63f7ff, #7CFF6B)",
  },
  secondaryBtn: {
    padding: "12px 18px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.25)",
    cursor: "pointer",
    fontWeight: 700,
    color: "#fff",
    background: "rgba(255,255,255,0.06)",
  },
};

function QuickLinkCard({ 
  title, 
  description, 
  href, 
  color 
}: { 
  title: string; 
  description: string;
  href: string; 
  color: string;
}) {
  return (
    <Link href={href}>
      <div className={`${color} rounded-xl p-4 text-white shadow-lg hover:scale-105 transition-transform cursor-pointer`}>
        <div className="text-2xl mb-1">{title.split(' ')[0]}</div>
        <div className="font-bold text-sm mb-1">{title.split(' ').slice(1).join(' ')}</div>
        <div className="text-xs opacity-90">{description}</div>
      </div>
    </Link>
  );
}
