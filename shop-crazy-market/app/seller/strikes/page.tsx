"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface SellerStrike {
  id: string;
  reason: string;
  status: string;
  appealReason: string | null;
  appealSubmittedAt: string | null;
  createdAt: string;
}

export default function SellerStrikesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [strikes, setStrikes] = useState<SellerStrike[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [selectedStrike, setSelectedStrike] = useState<string | null>(null);
  const [appealReason, setAppealReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchShop();
  }, [user, router]);

  useEffect(() => {
    if (shopId) {
      fetchStrikes();
    }
  }, [shopId]);

  async function fetchShop() {
    try {
      const response = await fetch(`/api/seller/shop?userId=${user?.id}`);
      if (response.ok) {
        const shop = await response.json();
        setShopId(shop.id);
      }
    } catch (error) {
      console.error("Error fetching shop:", error);
      setLoading(false);
    }
  }

  async function fetchStrikes() {
    if (!shopId) return;
    
    try {
      const response = await fetch(`/api/seller/strikes?shopId=${shopId}`);
      if (response.ok) {
        const data = await response.json();
        setStrikes(data);
      }
    } catch (error) {
      console.error("Error fetching strikes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function submitAppeal() {
    if (!selectedStrike || !appealReason.trim()) {
      alert("Please provide a reason for your appeal");
      return;
    }

    if (!shopId) {
      alert("Shop not found");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/seller/strikes/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strikeId: selectedStrike,
          appealReason,
          shopId,
        }),
      });

      if (response.ok) {
        await fetchStrikes();
        setShowAppealModal(false);
        setSelectedStrike(null);
        setAppealReason("");
        alert("Appeal submitted successfully. We will review your appeal.");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit appeal");
      }
    } catch (error) {
      console.error("Error submitting appeal:", error);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-10 text-gray-500">Loading strikes...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="font-accent text-3xl mb-6">Seller Strikes</h1>

      {strikes.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-green-800 font-semibold">No strikes on your account</p>
          <p className="text-green-600 text-sm mt-2">Keep up the good work!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {strikes.map((strike) => (
            <div
              key={strike.id}
              className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-red-600">Strike Issued</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(strike.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    strike.status === "ACTIVE"
                      ? "bg-red-100 text-red-800"
                      : strike.status === "APPEALED"
                      ? "bg-yellow-100 text-yellow-800"
                      : strike.status === "OVERTURNED"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {strike.status}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{strike.reason}</p>

              {strike.appealReason && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Your Appeal:</p>
                  <p className="text-sm text-gray-600">{strike.appealReason}</p>
                  {strike.appealSubmittedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Submitted: {new Date(strike.appealSubmittedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {strike.status === "ACTIVE" && (
                <button
                  onClick={() => {
                    setSelectedStrike(strike.id);
                    setShowAppealModal(true);
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-semibold"
                >
                  Appeal Strike
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Appeal Modal */}
      {showAppealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="font-bold text-xl">Appeal Strike</h2>
            <p className="text-gray-600 text-sm">
              Please explain why you believe this strike was issued in error.
            </p>
            <textarea
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              placeholder="Explain your appeal..."
              className="w-full border rounded-lg px-4 py-2 h-32 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAppealModal(false);
                  setSelectedStrike(null);
                  setAppealReason("");
                }}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={submitAppeal}
                disabled={submitting || !appealReason.trim()}
                className="flex-1 bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Appeal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

