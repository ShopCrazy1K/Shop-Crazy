"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Refund {
  id: string;
  refundType: string | null;
  refundStatus: string;
  refundAmount: number;
  refundReason: string | null;
  refundedAt: string | null;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    images: string[];
  };
  user: {
    id: string;
    email: string;
    username: string | null;
  };
}

export default function SellerRefundsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [sellerNote, setSellerNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [counts, setCounts] = useState({
    total: 0,
    requested: 0,
    approved: 0,
    processing: 0,
    completed: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchRefunds();
    }
  }, [user, authLoading, router, statusFilter]);

  async function fetchRefunds() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const url = statusFilter
        ? `/api/seller/refunds?sellerId=${user.id}&status=${statusFilter}`
        : `/api/seller/refunds?sellerId=${user.id}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRefunds(data.refunds || []);
        setCounts(data.counts || counts);
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
    } finally {
      setLoading(false);
    }
  }

  async function approveRefund(orderId: string) {
    if (!user?.id) return;
    setProcessing(true);
    try {
      const response = await fetch("/api/refunds/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          userId: user.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Refund approved and processed successfully!");
        fetchRefunds();
        setSelectedRefund(null);
      } else {
        alert(data.error || "Failed to approve refund");
      }
    } catch (error) {
      console.error("Error approving refund:", error);
      alert("An error occurred while approving refund");
    } finally {
      setProcessing(false);
    }
  }

  async function rejectRefund(orderId: string, reason: string) {
    if (!user?.id || !reason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/refunds/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          userId: user.id,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Refund request rejected");
        fetchRefunds();
        setSelectedRefund(null);
        setSellerNote("");
      } else {
        alert(data.error || "Failed to reject refund");
      }
    } catch (error) {
      console.error("Error rejecting refund:", error);
      alert("An error occurred while rejecting refund");
    } finally {
      setProcessing(false);
    }
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

  const filteredRefunds = statusFilter
    ? refunds.filter((r) => r.refundStatus === statusFilter)
    : refunds;

  return (
    <main className="p-4 sm:p-6 max-w-6xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Refund Management</h1>
        <Link
          href="/seller/dashboard"
          className="text-purple-600 hover:underline font-semibold"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-lg p-4 shadow border-2 border-yellow-300">
          <div className="text-2xl font-bold text-yellow-600">{counts.requested}</div>
          <div className="text-sm text-gray-600">Requested</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-2 border-blue-300">
          <div className="text-2xl font-bold text-blue-600">{counts.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-2 border-purple-300">
          <div className="text-2xl font-bold text-purple-600">{counts.processing}</div>
          <div className="text-sm text-gray-600">Processing</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-2 border-green-300">
          <div className="text-2xl font-bold text-green-600">{counts.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow border-2 border-red-300">
          <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="REQUESTED">Requested</option>
          <option value="APPROVED">Approved</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Refunds List */}
      <div className="space-y-4">
        {filteredRefunds.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow">
            <p className="text-gray-500">No refund requests found</p>
          </div>
        ) : (
          filteredRefunds.map((refund) => (
            <div
              key={refund.id}
              className="bg-white rounded-lg shadow p-4 sm:p-6 border-2 border-gray-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {refund.listing.images && refund.listing.images.length > 0 && (
                      <img
                        src={refund.listing.images[0]}
                        alt={refund.listing.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/listings/${refund.listing.id}`}
                        className="font-semibold text-purple-600 hover:underline"
                      >
                        {refund.listing.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Customer: {refund.user.username || refund.user.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        Order Date: {new Date(refund.createdAt).toLocaleDateString()}
                      </p>
                      {refund.refundReason && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Reason:</strong> {refund.refundReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    ${(refund.refundAmount / 100).toFixed(2)}
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-semibold mt-1 inline-block ${
                      refund.refundStatus === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : refund.refundStatus === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : refund.refundStatus === "REQUESTED"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {refund.refundStatus}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {refund.refundType === "CREDIT" ? "Store Credit" : "Cash"}
                  </div>
                </div>
              </div>

              {/* Actions for REQUESTED refunds */}
              {refund.refundStatus === "REQUESTED" && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Seller Note (required for rejection)
                    </label>
                    <textarea
                      value={sellerNote}
                      onChange={(e) => setSellerNote(e.target.value)}
                      placeholder="Add a note about this refund request..."
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => approveRefund(refund.id)}
                      disabled={processing}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => rejectRefund(refund.id, sellerNote)}
                      disabled={processing || !sellerNote.trim()}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}

