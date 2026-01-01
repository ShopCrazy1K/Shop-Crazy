"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ReferralsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState<string>("");
  const [referralStats, setReferralStats] = useState({ referralCount: 0, totalEarned: 0 });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchReferralInfo();
    }
  }, [user, authLoading, router]);

  async function fetchReferralInfo() {
    if (!user?.id) return;
    setLoading(true);
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
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (authLoading || loading) {
    return (
      <main className="p-6">
        <div className="text-center text-gray-500 py-10">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const shareMessage = `Hey! I wanted to share Shop Crazy Market with you. It's an amazing marketplace with great deals!\n\nSign up using my referral link and we both benefit:\n${referralLink}\n\nWhen you sign up, I'll get $5 in store credit! 🎉`;

  return (
    <main className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto pb-20 sm:pb-24">
      <div className="mb-4 sm:mb-6">
        <Link href="/account" className="text-sm sm:text-base text-purple-600 hover:underline font-semibold flex items-center gap-1">
          <span>←</span> <span>Back to Account</span>
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Referral Program</h1>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        Earn $5 in store credit for every friend you refer! Share your unique link and start earning.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-green-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Total Referrals</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">{referralStats.referralCount}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-yellow-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Total Earned</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-600">
            ${(referralStats.totalEarned / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Your Referral Code</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            value={referralCode}
            readOnly
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-300 rounded-lg font-mono font-bold text-lg sm:text-xl md:text-2xl bg-gray-50 text-center"
          />
          <button
            onClick={() => copyToClipboard(referralCode)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            {copied ? "✓ Copied!" : "Copy Code"}
          </button>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Your Referral Link</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-300 rounded-lg text-xs sm:text-sm bg-gray-50 break-all"
          />
          <button
            onClick={() => copyToClipboard(referralLink)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Share Options */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Share Your Link</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "Join Shop Crazy Market",
                  text: shareMessage,
                  url: referralLink,
                }).catch(() => copyToClipboard(referralLink));
              } else {
                copyToClipboard(referralLink);
              }
            }}
            className="px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <span className="text-base sm:text-lg">📱</span> <span>Share</span>
          </button>
          <button
            onClick={() => {
              const subject = encodeURIComponent("Join Shop Crazy Market!");
              const body = encodeURIComponent(shareMessage);
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
            }}
            className="px-3 sm:px-4 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <span className="text-base sm:text-lg">📧</span> <span>Email</span>
          </button>
          <button
            onClick={() => {
              const text = encodeURIComponent(`Join Shop Crazy Market! Use my referral link: ${referralLink}`);
              window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
            }}
            className="px-3 sm:px-4 py-2.5 sm:py-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <span className="text-base sm:text-lg">🐦</span> <span>Twitter</span>
          </button>
          <button
            onClick={() => {
              const text = encodeURIComponent(`Join Shop Crazy Market! Use my referral link: ${referralLink}`);
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${text}`, '_blank');
            }}
            className="px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <span className="text-base sm:text-lg">📘</span> <span>Facebook</span>
          </button>
        </div>

        {/* Copy & Paste Message */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700">Copy & Paste Message</label>
          <textarea
            readOnly
            value={shareMessage}
            rows={5}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-300 rounded-lg text-xs sm:text-sm bg-gray-50 resize-none"
            onClick={(e) => {
              (e.target as HTMLTextAreaElement).select();
              copyToClipboard((e.target as HTMLTextAreaElement).value);
            }}
          />
          <p className="text-xs text-gray-500">Tap the message above to copy it, then paste it anywhere!</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-purple-200">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">How It Works</h2>
        <ol className="space-y-2 sm:space-y-3 list-decimal list-inside text-sm sm:text-base">
          <li className="text-gray-700">Share your unique referral link with friends, family, or on social media</li>
          <li className="text-gray-700">When someone signs up using your link, they get access to Shop Crazy Market</li>
          <li className="text-gray-700">You automatically receive $5 in store credit for each successful referral</li>
          <li className="text-gray-700">Use your store credit on any purchase in the marketplace</li>
          <li className="text-gray-700">Track your referrals and earnings on this page</li>
        </ol>
      </div>
    </main>
  );
}

