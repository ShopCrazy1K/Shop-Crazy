"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  priceCents: number;
  isActive: boolean;
  createdAt: string;
  seller: {
    id: string;
    email: string;
    username: string | null;
  };
}

export default function AdminListingsPage() {
  const { user: currentUser } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/listings", {
        headers: {
          "x-user-id": currentUser?.id || "",
        },
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

  async function handleListingAction(listingId: string, action: "activate" | "deactivate" | "delete") {
    if (action === "delete" && !confirm("Are you sure you want to delete this listing? This cannot be undone.")) {
      return;
    }

    setActionLoading(listingId);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.id || "",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        alert(`Listing ${action}d successfully`);
        fetchListings();
      } else {
        const error = await response.json();
        alert(error.error || `Failed to ${action} listing`);
      }
    } catch (error) {
      console.error(`Error ${action}ing listing:`, error);
      alert(`Failed to ${action} listing`);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && listing.isActive) ||
      (filterActive === "inactive" && !listing.isActive);
    return matchesSearch && matchesActive;
  });

  if (loading) {
    return <div className="text-center py-10">Loading listings...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Listing Management</h1>
        <div className="text-sm text-gray-600">
          Total: {listings.length} listings
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="text-sm font-medium text-purple-600 hover:text-purple-800"
                    >
                      {listing.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(listing.priceCents / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/shop/${listing.seller.id}`}
                      className="text-sm text-gray-600 hover:text-purple-600"
                    >
                      {listing.seller.username || listing.seller.email}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        listing.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {listing.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {listing.isActive ? (
                        <button
                          onClick={() => handleListingAction(listing.id, "deactivate")}
                          disabled={actionLoading === listing.id}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleListingAction(listing.id, "activate")}
                          disabled={actionLoading === listing.id}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleListingAction(listing.id, "delete")}
                        disabled={actionLoading === listing.id}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredListings.length === 0 && (
          <div className="text-center py-10 text-gray-500">No listings found</div>
        )}
      </div>
    </div>
  );
}

