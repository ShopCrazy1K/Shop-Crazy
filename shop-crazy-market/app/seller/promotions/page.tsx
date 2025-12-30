"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  promoCode: string | null;
  promotionType: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  maxUses: number | null;
  currentUses: number;
  minPurchaseCents: number | null;
  badgeText: string | null;
  badgeColor: string | null;
  abandonedCartDelayHours: number | null;
  listing: {
    id: string;
    title: string;
  } | null;
}

export default function PromotionsPage() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("SHOP_WIDE");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 20,
    promoCode: "",
    promotionType: "SHOP_WIDE",
    startsAt: new Date().toISOString().slice(0, 16),
    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    maxUses: "",
    minPurchaseCents: "",
    badgeText: "Limited Time",
    badgeColor: "red",
    abandonedCartDelayHours: "24",
    listingId: "",
  });

  useEffect(() => {
    if (user) {
      fetchShop();
    }
  }, [user]);

  useEffect(() => {
    if (shopId) {
      fetchPromotions();
    }
  }, [shopId, selectedType]);

  async function fetchShop() {
    if (!user) return;
    try {
      // Use query param as fallback for compatibility
      const response = await fetch(`/api/shops/my-shop?userId=${user.id}`, {
        headers: {
          "x-user-id": user.id,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.shop?.id) {
          setShopId(data.shop.id);
        }
      } else {
        const errorData = await response.json();
        console.error("Error fetching shop:", errorData);
      }
    } catch (error) {
      console.error("Error fetching shop:", error);
    }
  }

  async function fetchPromotions() {
    if (!shopId) return;
    try {
      setLoading(true);
      const url = selectedType === "all" 
        ? `/api/shops/${shopId}/promotions`
        : `/api/shops/${shopId}/promotions?type=${selectedType}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPromotions(data);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shopId || !user) return;

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
        abandonedCartDelayHours: formData.abandonedCartDelayHours
          ? parseInt(formData.abandonedCartDelayHours)
          : null,
        listingId: formData.listingId || null,
      };

      const response = await fetch(`/api/shops/${shopId}/promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowCreateForm(false);
        resetForm();
        fetchPromotions();
        alert("Promotion created successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create promotion");
      }
    } catch (error) {
      console.error("Error creating promotion:", error);
      alert("Failed to create promotion");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 20,
      promoCode: "",
      promotionType: "SHOP_WIDE",
      startsAt: new Date().toISOString().slice(0, 16),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      maxUses: "",
      minPurchaseCents: "",
      badgeText: "Limited Time",
      badgeColor: "red",
      abandonedCartDelayHours: "24",
      listingId: "",
    });
  }

  async function handleDelete(promotionId: string) {
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    try {
      const response = await fetch(`/api/deals/${promotionId}?userId=${user?.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPromotions();
        alert("Promotion deleted successfully");
      } else {
        alert("Failed to delete promotion");
      }
    } catch (error) {
      console.error("Error deleting promotion:", error);
      alert("Failed to delete promotion");
    }
  }

  async function handleToggleActive(promotionId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/deals/${promotionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchPromotions();
      } else {
        alert("Failed to update promotion");
      }
    } catch (error) {
      console.error("Error updating promotion:", error);
      alert("Failed to update promotion");
    }
  }

  if (!user) {
    return (
      <main className="p-6 max-w-6xl mx-auto pb-24">
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">Please log in to manage promotions</p>
          <Link href="/login" className="text-purple-600 hover:underline">
            Login
          </Link>
        </div>
      </main>
    );
  }

  if (!shopId) {
    return (
      <main className="p-6 max-w-6xl mx-auto pb-24">
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">You need to create a shop first</p>
          <Link href="/seller/dashboard" className="text-purple-600 hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 max-w-6xl mx-auto pb-24">
      <div className="mb-6">
        <Link
          href="/seller/dashboard"
          className="text-purple-600 hover:underline mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Promotions & Discount Codes</h1>
        <p className="text-gray-600">
          Create shop-wide promotions, discount codes, and abandoned cart offers
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {["all", "SHOP_WIDE", "CUSTOM_CODE", "ABANDONED_CART"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
              selectedType === type
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {type === "all" ? "All" : type === "SHOP_WIDE" ? "Shop-Wide" : type === "CUSTOM_CODE" ? "Discount Codes" : "Abandoned Cart"}
          </button>
        ))}
      </div>

      {!showCreateForm ? (
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            + Create New Promotion
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Create New Promotion</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Promotion Type */}
            <div>
              <label className="block text-sm font-semibold mb-2">Promotion Type *</label>
              <select
                value={formData.promotionType}
                onChange={(e) => setFormData({ ...formData, promotionType: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="SHOP_WIDE">Shop-Wide Promotion (applies to all listings)</option>
                <option value="CUSTOM_CODE">Custom Discount Code (customer enters code)</option>
                <option value="ABANDONED_CART">Abandoned Cart Offer (sent via email)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Promotion Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g., Summer Sale, Flash Sale, Welcome Discount"
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
                placeholder="Optional description of the promotion"
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
                  step={formData.discountType === "FIXED_AMOUNT" ? "0.01" : "1"}
                  required
                />
              </div>
            </div>

            {/* Promo Code - Required for CUSTOM_CODE, optional for others */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Promo Code {formData.promotionType === "CUSTOM_CODE" ? "*" : "(Optional)"}
              </label>
              <input
                type="text"
                value={formData.promoCode}
                onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase().replace(/\s/g, '') })}
                className="w-full px-4 py-2 border rounded-lg font-mono"
                placeholder="e.g., SAVE20, SUMMER2024"
                required={formData.promotionType === "CUSTOM_CODE"}
              />
              {formData.promotionType === "CUSTOM_CODE" && (
                <p className="text-xs text-gray-500 mt-1">
                  Customers will enter this code at checkout to apply the discount
                </p>
              )}
            </div>

            {/* Abandoned Cart Delay */}
            {formData.promotionType === "ABANDONED_CART" && (
              <div>
                <label className="block text-sm font-semibold mb-1">Send Offer After (Hours) *</label>
                <input
                  type="number"
                  value={formData.abandonedCartDelayHours}
                  onChange={(e) => setFormData({ ...formData, abandonedCartDelayHours: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="1"
                  placeholder="e.g., 24 (send 24 hours after cart is abandoned)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  How many hours to wait before sending the abandoned cart offer email
                </p>
              </div>
            )}

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
                {saving ? "Creating..." : "Create Promotion"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promotions List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {selectedType === "all" ? "All Promotions" : 
           selectedType === "SHOP_WIDE" ? "Shop-Wide Promotions" :
           selectedType === "CUSTOM_CODE" ? "Discount Codes" : "Abandoned Cart Offers"}
        </h2>
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : promotions.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
            <p>No promotions created yet. Create your first promotion to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((promo) => (
              <div key={promo.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{promo.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        promo.promotionType === "SHOP_WIDE" ? "bg-blue-100 text-blue-700" :
                        promo.promotionType === "CUSTOM_CODE" ? "bg-green-100 text-green-700" :
                        "bg-orange-100 text-orange-700"
                      }`}>
                        {promo.promotionType === "SHOP_WIDE" ? "Shop-Wide" :
                         promo.promotionType === "CUSTOM_CODE" ? "Discount Code" : "Abandoned Cart"}
                      </span>
                      <button
                        onClick={() => handleToggleActive(promo.id, promo.isActive)}
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          promo.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {promo.isActive ? "Active" : "Inactive"}
                      </button>
                    </div>
                    {promo.description && (
                      <p className="text-gray-600 mb-2">{promo.description}</p>
                    )}
                    {promo.listing && (
                      <p className="text-sm text-gray-500">
                        Applies to: {promo.listing.title}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold ml-4"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Discount:</span>
                    <p className="font-semibold">
                      {promo.discountType === "PERCENTAGE"
                        ? `${promo.discountValue}% OFF`
                        : `$${(promo.discountValue / 100).toFixed(2)} OFF`}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Starts:</span>
                    <p className="font-semibold">
                      {new Date(promo.startsAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ends:</span>
                    <p className="font-semibold">
                      {new Date(promo.endsAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Uses:</span>
                    <p className="font-semibold">
                      {promo.currentUses}
                      {promo.maxUses ? ` / ${promo.maxUses}` : " / ∞"}
                    </p>
                  </div>
                </div>

                {promo.promoCode && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 text-sm">Promo Code: </span>
                    <span className="font-mono bg-white px-3 py-1 rounded border-2 border-purple-500 text-purple-700 font-bold">
                      {promo.promoCode}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">
                      Share this code with customers to use at checkout
                    </p>
                  </div>
                )}

                {promo.promotionType === "ABANDONED_CART" && promo.abandonedCartDelayHours && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-700">
                      📧 Will be sent {promo.abandonedCartDelayHours} hours after cart is abandoned
                    </p>
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

