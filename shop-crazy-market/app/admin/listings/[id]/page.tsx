"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  description: string;
  copyrightStatus: string;
  flaggedWords: string[];
  flaggedReason: string | null;
  isActive: boolean;
  seller: {
    id: string;
    email: string;
    username: string | null;
    role: string;
  };
  dmcaComplaints: Array<{
    id: string;
    status: string;
    complainantName: string;
    createdAt: string;
    counterNotice: {
      id: string;
      status: string;
    } | null;
  }>;
}

interface Strike {
  id: string;
  reason: string;
  strikeType: string;
  status: string;
  createdAt: string;
}

export default function AdminListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [strikes, setStrikes] = useState<Strike[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`);
      if (response.ok) {
        const data = await response.json();
        setListing(data.listing);
        setStrikes(data.strikes || []);
      }
    } catch (error) {
      console.error("Failed to fetch listing:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!reason && (action === "DISABLE" || action === "FLAG" || action === "HIDE" || action === "SUSPEND_SELLER")) {
      alert("Please provide a reason for this action");
      return;
    }

    setActionLoading(action);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason,
          adminNotes,
        }),
      });

      if (response.ok) {
        await fetchListing();
        setReason("");
        setAdminNotes("");
        alert(`Action "${action}" completed successfully`);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to perform action");
      }
    } catch (error) {
      console.error("Failed to perform action:", error);
      alert("Failed to perform action");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CLEAR":
        return "bg-green-100 text-green-800";
      case "FLAGGED":
        return "bg-yellow-100 text-yellow-800";
      case "HIDDEN":
        return "bg-orange-100 text-orange-800";
      case "DISABLED":
        return "bg-red-100 text-red-800";
      case "DMCA_COMPLAINT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!listing) {
    return <div className="p-6">Listing not found</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/listings" className="text-blue-600 hover:underline">
          ← Back to Listings
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Listing Management: {listing.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Listing Information</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded ${getStatusColor(listing.copyrightStatus)}`}>{listing.copyrightStatus}</span></p>
            <p><strong>Active:</strong> {listing.isActive ? "Yes" : "No"}</p>
            <p><strong>Seller:</strong> {listing.seller.username || listing.seller.email}</p>
            {listing.flaggedWords.length > 0 && (
              <p><strong>Flagged Words:</strong> {listing.flaggedWords.join(", ")}</p>
            )}
            {listing.flaggedReason && (
              <p><strong>Flagged Reason:</strong> {listing.flaggedReason}</p>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Seller Strikes</h2>
          <div className="space-y-2">
            <p><strong>Active Strikes:</strong> {strikes.length} of 3</p>
            {strikes.length > 0 && (
              <div className="mt-4 space-y-2">
                {strikes.map((strike) => (
                  <div key={strike.id} className="bg-red-50 p-3 rounded">
                    <p className="text-sm"><strong>{strike.strikeType}</strong> - {strike.reason}</p>
                    <p className="text-xs text-gray-600">{new Date(strike.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {listing.dmcaComplaints.length > 0 && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">DMCA Complaints</h2>
          <div className="space-y-4">
            {listing.dmcaComplaints.map((complaint) => (
              <div key={complaint.id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p><strong>Complainant:</strong> {complaint.complainantName}</p>
                    <p><strong>Status:</strong> {complaint.status}</p>
                    <p className="text-sm text-gray-600">{new Date(complaint.createdAt).toLocaleString()}</p>
                    {complaint.counterNotice && (
                      <p className="text-sm text-purple-600">Counter-Notice: {complaint.counterNotice.status}</p>
                    )}
                  </div>
                  <Link
                    href={`/admin/copyright`}
                    className="text-blue-600 hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Reason (Required for disable/flag/hide/suspend)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter reason for action..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Admin Notes (Optional)</label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Add notes about this action..."
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleAction("DISABLE")}
            disabled={actionLoading !== null}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading === "DISABLE" ? "Processing..." : "🔴 Disable Listing"}
          </button>
          
          <button
            onClick={() => handleAction("RESTORE")}
            disabled={actionLoading !== null}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {actionLoading === "RESTORE" ? "Processing..." : "🟢 Restore Listing"}
          </button>
          
          <button
            onClick={() => handleAction("FLAG")}
            disabled={actionLoading !== null}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            {actionLoading === "FLAG" ? "Processing..." : "🟡 Flag Listing"}
          </button>
          
          <button
            onClick={() => handleAction("HIDE")}
            disabled={actionLoading !== null}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
          >
            {actionLoading === "HIDE" ? "Processing..." : "👁️ Hide Listing"}
          </button>
          
          <button
            onClick={() => handleAction("SUSPEND_SELLER")}
            disabled={actionLoading !== null}
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 disabled:opacity-50"
          >
            {actionLoading === "SUSPEND_SELLER" ? "Processing..." : "🟡 Suspend Seller"}
          </button>
          
          <button
            onClick={() => handleAction("UNSUSPEND_SELLER")}
            disabled={actionLoading !== null}
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50"
          >
            {actionLoading === "UNSUSPEND_SELLER" ? "Processing..." : "✅ Unsuspend Seller"}
          </button>
        </div>
      </div>
    </div>
  );
}
