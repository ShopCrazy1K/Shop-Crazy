"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [storeCredit, setStoreCredit] = useState<number>(0);
  const [loadingCredit, setLoadingCredit] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchStoreCredit();
    }
  }, [user, authLoading, router]);

  async function fetchStoreCredit() {
    if (!user?.id) return;
    setLoadingCredit(true);
    try {
      const response = await fetch(`/api/users/${user.id}/store-credit`);
      if (response.ok) {
        const data = await response.json();
        setStoreCredit(data.storeCredit || 0);
      }
    } catch (error) {
      console.error("Error fetching store credit:", error);
    } finally {
      setLoadingCredit(false);
    }
  }

  if (authLoading) {
    return (
      <main className="p-6">
        <div className="text-center text-gray-500 py-10">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="p-3 sm:p-4 space-y-4 sm:space-y-6 md:space-y-8 pb-24">
      {/* Logo Section */}
      <section className="flex justify-center mb-2 sm:mb-4">
        <Logo className="w-full max-w-2xl sm:max-w-3xl" />
      </section>

      {/* Search Bar */}
      <section className="max-w-2xl mx-auto px-2 sm:px-0">
        <SearchBar />
      </section>

      {/* Account Section */}
      <section className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl mx-1 sm:mx-0 max-w-2xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">My Account</h2>
        
        <div className="space-y-4">
          {/* Store Credit Display */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm sm:text-base mb-1">Store Credit Balance</p>
                {loadingCredit ? (
                  <p className="text-2xl sm:text-3xl font-bold text-gray-400">Loading...</p>
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    ${((storeCredit || 0) / 100).toFixed(2)}
                  </p>
                )}
              </div>
              <span className="text-4xl sm:text-5xl">💳</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Use your store credit during checkout to save on purchases
            </p>
          </div>

          {/* User Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-gray-500 text-xs sm:text-sm">Email</p>
                <p className="font-semibold text-sm sm:text-lg truncate">{user.email}</p>
              </div>
              <span className="text-xl sm:text-2xl flex-shrink-0">📧</span>
            </div>

            {user.username && (
              <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-gray-500 text-xs sm:text-sm">Username</p>
                  <p className="font-semibold text-sm sm:text-lg truncate">{user.username}</p>
                </div>
                <span className="text-xl sm:text-2xl flex-shrink-0">👤</span>
              </div>
            )}

            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-gray-500 text-xs sm:text-sm">Account Type</p>
                <p className="font-semibold text-sm sm:text-lg capitalize">{user.role?.toLowerCase() || "user"}</p>
              </div>
              <span className="text-xl sm:text-2xl flex-shrink-0">
                {user.role === "ADMIN" ? "👑" : "⭐"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

