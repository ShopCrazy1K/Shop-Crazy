"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { categories } from "@/lib/categories";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";
import { useEffect, useState } from "react";

interface FeaturedListing {
  id: string;
  title: string;
  priceCents: number;
  images: string[];
  slug: string;
  activeDeal?: {
    id: string;
    title: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    badgeText?: string | null;
    badgeColor?: string | null;
    endsAt: string;
  } | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    async function fetchFeaturedListings() {
      try {
        const response = await fetch("/api/listings/featured");
        if (response.ok) {
          const data = await response.json();
          setFeaturedListings(data.listings || []);
        }
      } catch (error) {
        console.error("Error fetching featured listings:", error);
      } finally {
        setLoadingFeatured(false);
      }
    }
    fetchFeaturedListings();
  }, []);

  return (
    <main className="p-4 space-y-8 pb-24">
      {/* Logo Section */}
      <section className="flex justify-center mb-4">
        <Logo className="w-full max-w-3xl" />
      </section>

      {/* Search Bar */}
      <section className="max-w-2xl mx-auto">
        <SearchBar />
      </section>

      {/* Hero Section */}
      <section className="nick-hero relative overflow-hidden">
        <div className="relative z-10 text-center">
          <p className="text-lg md:text-xl font-semibold mb-4">Buy • Sell • Collect • Flex</p>
          {user ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">👋</span>
              <p className="text-base opacity-95">
                Welcome back, <span className="font-bold">{user.username || user.email}</span>!
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Link
                href="/signup"
                className="bg-white text-purple-600 px-8 py-3 rounded-xl font-bold text-center hover:scale-105 transition-transform shadow-lg"
              >
                Get Started 🚀
              </Link>
              <Link
                href="/marketplace"
                className="bg-purple-600/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold text-center hover:scale-105 transition-transform border-2 border-white/30"
              >
                Browse Now 🛒
              </Link>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -z-0"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-300/30 rounded-full blur-2xl -z-0"></div>
      </section>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard number="1K+" label="Products" emoji="📦" />
        <StatCard number="500+" label="Sellers" emoji="👥" />
        <StatCard number="10K+" label="Deals" emoji="💎" />
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">Shop by Category</h2>
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

      {/* Featured Section */}
      <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-center">✨ Featured This Week</h2>
        {loadingFeatured ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl p-4 animate-pulse h-32"></div>
            ))}
          </div>
        ) : featuredListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredListings.slice(0, 4).map((listing) => {
              const discountCents = listing.activeDeal
                ? listing.activeDeal.discountType === "PERCENTAGE"
                  ? Math.round((listing.priceCents * listing.activeDeal.discountValue) / 100)
                  : listing.activeDeal.discountValue
                : 0;
              const discountedPrice = listing.priceCents - discountCents;

              return (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center hover:scale-105 transition-transform shadow-md cursor-pointer border-2 border-transparent hover:border-purple-300 relative overflow-hidden">
                    {/* Image Container with Badge */}
                    <div className="relative mb-2">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                          📦
                        </div>
                      )}
                      
                      {/* Discount Badge - Positioned on image */}
                      {listing.activeDeal && (
                        <div className="absolute top-1 left-1 z-10">
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold shadow-md whitespace-nowrap">
                            🔥 {listing.activeDeal.discountType === "PERCENTAGE" 
                              ? `${listing.activeDeal.discountValue}%`
                              : `$${(listing.activeDeal.discountValue / 100).toFixed(0)}`}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Title */}
                    <div className="font-bold text-sm mb-1 line-clamp-2 min-h-[2.5rem]">{listing.title}</div>
                    
                    {/* Price Display */}
                    {listing.activeDeal ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-red-600 font-bold text-base">
                            ${(discountedPrice / 100).toFixed(2)}
                          </span>
                          <span className="text-gray-400 line-through text-xs">
                            ${(listing.priceCents / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-red-600 font-semibold">
                          Save ${(discountCents / 100).toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-purple-600 font-semibold text-base">
                        ${(listing.priceCents / 100).toFixed(2)}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FeatureCard emoji="🎮" title="Retro Consoles" price="$129" />
            <FeatureCard emoji="👟" title="Sneaker Drops" price="$89" />
            <FeatureCard emoji="🎨" title="Art Prints" price="$45" />
            <FeatureCard emoji="📱" title="Tech Gear" price="$199" />
          </div>
        )}
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-2">Ready to Start Selling?</h2>
          <p className="mb-6 opacity-90">Join thousands of sellers making money on Shop Crazy Market</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-purple-600 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
            >
              Create Account
            </Link>
            <Link
              href="/sell"
              className="bg-purple-800/50 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform border-2 border-white/30"
            >
              Learn More
            </Link>
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="grid grid-cols-2 gap-3">
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
    </main>
  );
}

function StatCard({ number, label, emoji }: { number: string; label: string; emoji: string }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform">
      <div className="text-3xl mb-1">{emoji}</div>
      <div className="text-2xl font-bold text-purple-600">{number}</div>
      <div className="text-xs text-gray-600 font-semibold">{label}</div>
    </div>
  );
}

function FeatureCard({ emoji, title, price }: { emoji: string; title: string; price: string }) {
  return (
    <Link href="/marketplace">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center hover:scale-105 transition-transform shadow-md cursor-pointer border-2 border-transparent hover:border-purple-300">
        <div className="text-4xl mb-2">{emoji}</div>
        <div className="font-bold text-sm mb-1">{title}</div>
        <div className="text-purple-600 font-semibold">{price}</div>
      </div>
    </Link>
  );
}

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
