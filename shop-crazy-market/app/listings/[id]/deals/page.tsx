"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Deal {
  id: string;
  title: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  promoCode: string | null;
  startsAt: string;
  endsAt: string;
  maxUses: number | null;
  currentUses: number;
  minPurchaseCents: number | null;
  badgeText: string | null;
  badgeColor: string | null;
  isActive: boolean;
}

export default function ManageDealsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const listingId = params.id as string;
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 20,
    promoCode: "",
    startsAt: new Date().toISOString().slice(0, 16),
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    maxUses: "",
    minPurchaseCents: "",
    badgeText: "Limited Time",
    badgeColor: "red",
  });

  useEffect(() => {
    if (listingId && user) {
      fetchDeals();
    }
  }, [listingId, user]);

  async function fetchDeals() {
    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${listingId}/deals`);
      if (response.ok) {
        const data = await response.json();
        setDeals(data);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        discountValue: parseInt(formData.discountValue.toString()),
        promoCode: formData.promoCode || null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        minPurchaseCents: formData.minPurchaseCents
          ? Math.round(parseFloat(formData.minPurchaseCents) * 100)
          : null,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString(),
        badgeText: formData.badgeText || null,
        badgeColor: formData.badgeColor || null,
      };

      const response = await fetch(`/api/listings/${listingId}/deals?userId=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          title: "",
          description: "",
          discountType: "PERCENTAGE",
          discountValue: 20,
          promoCode: "",
          startsAt: new Date().toISOString().slice(0, 16),
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          maxUses: "",
          minPurchaseCents: "",
          badgeText: "Limited Time",
          badgeColor: "red",
        });
        fetchDeals();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create deal");
      }
    } catch (error) {
      console.error("Error creating deal:", error);
      alert("Failed to create deal");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(dealId: string) {
    if (!user || !confirm("Are you sure you want to delete this deal?")) return;

    try {
      const response = await fetch(`/api/deals/${dealId}?userId=${user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchDeals();
      } else {
        alert("Failed to delete deal");
      }
    } catch (error) {
      console.error("Error deleting deal:", error);
      alert("Failed to delete deal");
    }
  }

  if (loading) {
    return (
      <main className="p-6 max-w-4xl mx-auto pb-24">
        <div className="text-center py-10 text-gray-500">Loading...</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto pb-24">
      <div className="mb-6">
        <Link
          href={`/listings/${listingId}`}
          className="text-purple-600 hover:underline mb-4 inline-block"
        >
          ← Back to Listing
        </Link>
        <h1 className="text-3xl font-bold mb-2">Manage Deals & Promotions</h1>
        <p className="text-gray-600">
          Create discounts and promotions to attract more customers
        </p>
      </div>

      {!showCreateForm ? (
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            + Create New Deal
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Create New Deal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Deal Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g., Flash Sale, 20% Off"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                placeholder="Optional description of the deal"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Discount Type *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountType: e.target.value as "PERCENTAGE" | "FIXED_AMOUNT",
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="PERCENTAGE">Percentage Off</option>
                  <option value="FIXED_AMOUNT">Fixed Amount Off</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Discount Value * ({formData.discountType === "PERCENTAGE" ? "%" : "$"})
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  min="1"
                  max={formData.discountType === "PERCENTAGE" ? "100" : undefined}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Promo Code (Optional)</label>
              <input
                type="text"
                value={formData.promoCode}
                onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border rounded-lg font-mono"
                placeholder="e.g., SAVE20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Starts At *</label>
                <input
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Ends At *</label>
                <input
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Max Uses (Optional)</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Unlimited if empty"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Min Purchase (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minPurchaseCents}
                  onChange={(e) => setFormData({ ...formData, minPurchaseCents: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., 50.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Badge Text</label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., Limited Time"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Badge Color</label>
                <select
                  value={formData.badgeColor}
                  onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="red">Red</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Deal"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Deals */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Active Deals</h2>
        {deals.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            <p>No deals created yet. Create your first deal to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => (
              <div key={deal.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{deal.title}</h3>
                    {deal.description && (
                      <p className="text-gray-600 mt-1">{deal.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(deal.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Discount:</span>
                    <p className="font-semibold">
                      {deal.discountType === "PERCENTAGE"
                        ? `${deal.discountValue}% OFF`
                        : `$${(deal.discountValue / 100).toFixed(2)} OFF`}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Starts:</span>
                    <p className="font-semibold">
                      {new Date(deal.startsAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ends:</span>
                    <p className="font-semibold">
                      {new Date(deal.endsAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Uses:</span>
                    <p className="font-semibold">
                      {deal.currentUses}
                      {deal.maxUses ? ` / ${deal.maxUses}` : " / ∞"}
                    </p>
                  </div>
                </div>

                {deal.promoCode && (
                  <div className="mt-4">
                    <span className="text-gray-500">Promo Code: </span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {deal.promoCode}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

