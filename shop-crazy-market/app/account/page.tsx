"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [storeCredit, setStoreCredit] = useState<number>(0);
  const [loadingCredit, setLoadingCredit] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState<string>("");
  const [referralStats, setReferralStats] = useState({ referralCount: 0, totalEarned: 0 });
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchStoreCredit();
      fetchReferralInfo();
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

  async function fetchReferralInfo() {
    if (!user?.id) return;
    setLoadingReferral(true);
    try {
      const response = await fetch(`/api/referrals/code?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setReferralCode(data.referralCode || "");
        setReferralLink(data.referralLink || "");
        setReferralStats(data.stats || { referralCount: 0, totalEarned: 0 });
      }
    } catch (error) {
      console.error("Error fetching referral info:", error);
    } finally {
      setLoadingReferral(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      {/* Referral Program Section */}
      <section className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl mx-1 sm:mx-0 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">💰 Referral Program</h2>
          <Link
            href="/referrals"
            className="text-sm sm:text-base text-purple-600 hover:underline font-semibold"
          >
            View Full Page →
          </Link>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-purple-200">
            <p className="text-sm sm:text-base text-gray-700 mb-4">
              💰 <strong>Earn $5</strong> in store credit for every friend you refer! Share your unique referral link and get rewarded when they sign up.
            </p>
            <Link
              href="/referrals"
              className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
            >
              Get Your Referral Link →
            </Link>
          </div>

          {loadingReferral ? (
            <div className="text-center py-4 text-gray-500">Loading referral info...</div>
          ) : referralCode ? (
            <>
              {/* Referral Code */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Your Referral Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 px-4 py-2 border-2 border-purple-300 rounded-lg font-mono font-bold text-lg bg-white"
                  />
                  <button
                    onClick={() => copyToClipboard(referralCode)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Referral Link */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Your Referral Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-4 py-2 border-2 border-purple-300 rounded-lg text-sm bg-white truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(referralLink)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors whitespace-nowrap"
                  >
                    {copied ? "✓ Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Share Your Link</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const text = `Join Shop Crazy Market and get great deals! Use my referral link: ${referralLink}`;
                      if (navigator.share) {
                        navigator.share({
                          title: "Join Shop Crazy Market",
                          text: text,
                          url: referralLink,
                        }).catch(() => copyToClipboard(referralLink));
                      } else {
                        copyToClipboard(referralLink);
                      }
                    }}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📱</span> Share
                  </button>
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent("Join Shop Crazy Market!");
                      const body = encodeURIComponent(`Hi! I wanted to share Shop Crazy Market with you. It's a great marketplace with amazing deals!\n\nSign up using my referral link and we both benefit:\n${referralLink}\n\nWhen you sign up, I'll get $5 in store credit!`);
                      window.location.href = `mailto:?subject=${subject}&body=${body}`;
                    }}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📧</span> Email
                  </button>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Join Shop Crazy Market! Use my referral link: ${referralLink}`);
                      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                    }}
                    className="px-4 py-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🐦</span> Twitter
                  </button>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Join Shop Crazy Market! Use my referral link: ${referralLink}`);
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${text}`, '_blank');
                    }}
                    className="px-4 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📘</span> Facebook
                  </button>
                </div>
              </div>

              {/* Share Message Template */}
              {referralLink && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Copy & Paste Message</label>
                  <textarea
                    readOnly
                    value={`Hey! I wanted to share Shop Crazy Market with you. It's an amazing marketplace with great deals!\n\nSign up using my referral link and we both benefit:\n${referralLink}\n\nWhen you sign up, I'll get $5 in store credit! 🎉`}
                    rows={5}
                    className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg text-sm bg-white resize-none"
                    onClick={(e) => {
                      (e.target as HTMLTextAreaElement).select();
                      copyToClipboard((e.target as HTMLTextAreaElement).value);
                    }}
                  />
                  <p className="text-xs text-gray-500">Click the message above to copy it</p>
                </div>
              )}

              {/* Referral Stats */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <p className="text-sm text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold text-green-600">{referralStats.referralCount}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-yellow-200">
                  <p className="text-sm text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ${(referralStats.totalEarned / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">Unable to load referral code. Please try refreshing the page.</p>
              <button
                onClick={fetchReferralInfo}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

