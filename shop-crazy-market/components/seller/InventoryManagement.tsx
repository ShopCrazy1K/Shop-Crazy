"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  priceCents: number;
  isActive: boolean;
  createdAt: string;
  views?: number;
  sales?: number;
}

interface Props {
  userId: string;
}

export default function InventoryManagement({ userId }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [userId]);

  async function fetchListings() {
    try {
      setLoading(true);
      const response = await fetch(`/api/listings/my-listings`, {
        headers: { "x-user-id": userId },
      });
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkAction() {
    if (selected.size === 0 || !bulkAction) return;

    setProcessing(true);
    try {
      const response = await fetch("/api/seller/listings/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          listingIds: Array.from(selected),
          action: bulkAction,
        }),
      });

      if (response.ok) {
        alert(`Successfully ${bulkAction}d ${selected.size} listing(s)`);
        setSelected(new Set());
        setBulkAction("");
        fetchListings();
      } else {
        alert("Failed to perform bulk action");
      }
    } catch (error) {
      console.error("Error performing bulk action:", error);
      alert("Error performing bulk action");
    } finally {
      setProcessing(false);
    }
  }

  function toggleSelection(id: string) {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  }

  function selectAll() {
    if (selected.size === listings.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(listings.map((l) => l.id)));
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="text-center py-8 text-gray-500">Loading listings...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-accent text-2xl">Inventory Management</h2>
        <Link
          href="/listings/new"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          + Create New Listing
        </Link>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
          <span className="font-semibold text-purple-800">
            {selected.size} listing(s) selected
          </span>
          <div className="flex gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-4 py-2 border border-purple-300 rounded-lg font-semibold"
            >
              <option value="">Select action...</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || processing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : "Apply"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2">
                <input
                  type="checkbox"
                  checked={selected.size === listings.length && listings.length > 0}
                  onChange={selectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="text-left py-3 px-2 font-semibold">Title</th>
              <th className="text-left py-3 px-2 font-semibold">Price</th>
              <th className="text-left py-3 px-2 font-semibold">Status</th>
              <th className="text-left py-3 px-2 font-semibold">Views</th>
              <th className="text-left py-3 px-2 font-semibold">Sales</th>
              <th className="text-left py-3 px-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2">
                  <input
                    type="checkbox"
                    checked={selected.has(listing.id)}
                    onChange={() => toggleSelection(listing.id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="py-3 px-2">
                  <Link
                    href={`/listings/${listing.id}`}
                    className="font-semibold text-purple-600 hover:underline"
                  >
                    {listing.title}
                  </Link>
                </td>
                <td className="py-3 px-2">{formatCurrency(listing.priceCents)}</td>
                <td className="py-3 px-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      listing.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {listing.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-2">{listing.views || 0}</td>
                <td className="py-3 px-2">{listing.sales || 0}</td>
                <td className="py-3 px-2">
                  <Link
                    href={`/listings/${listing.id}/edit`}
                    className="text-purple-600 hover:underline text-sm font-semibold"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {listings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No listings yet.</p>
            <Link
              href="/listings/new"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Create Your First Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
