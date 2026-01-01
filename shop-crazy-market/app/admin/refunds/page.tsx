"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  seller: {
    id: string;
    email: string;
    username: string | null;
  };
}

export default function RefundsDashboard() {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [counts, setCounts] = useState({
    total: 0,
    requested: 0,
    approved: 0,
    processing: 0,
    completed: 0,
    rejected: 0,
  });
  const [typeCounts, setTypeCounts] = useState({
    credit: 0,
    cash: 0,
  });

  useEffect(() => {
    if (user) {
      fetchRefunds();
    }
  }, [user, statusFilter, typeFilter]);

  async function fetchRefunds() {
    setLoading(true);
    try {
      let url = "/api/admin/refunds?";
      if (statusFilter) url += `status=${statusFilter}&`;
      if (typeFilter) url += `type=${typeFilter}&`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRefunds(data.refunds || []);
        setCounts(data.counts || counts);
        setTypeCounts(data.typeCounts || typeCounts);
      } else {
        console.error("Failed to fetch refunds");
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
    } finally {
      setLoading(false);
    }
  }

  async function approveRefund(orderId: string) {
    if (!user?.id) return;
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
      } else {
        alert(data.error || "Failed to approve refund");
      }
    } catch (error) {
      console.error("Error approving refund:", error);
      alert("An error occurred while approving refund");
    }
  }

  async function rejectRefund(orderId: string) {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason || !user?.id) return;

    try {
      const response = await fetch("/api/refunds/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          userId: user.id,
          reason,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Refund request rejected");
        fetchRefunds();
      } else {
        alert(data.error || "Failed to reject refund");
      }
    } catch (error) {
      console.error("Error rejecting refund:", error);
      alert("An error occurred while rejecting refund");
    }
  }

  if (loading) {
    return (
      <main className="p-6">
        <div className="text-center text-gray-500 py-10">Loading...</div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 max-w-7xl mx-auto pb-24">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Refunds Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <div className="bg-white rounded-lg p-4 shadow border-2 border-gray-300">
          <div className="text-2xl font-bold">{counts.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
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

      {/* Filters */}
      <div className="mb-4 flex gap-3">
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
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Types</option>
          <option value="CREDIT">Store Credit</option>
          <option value="CASH">Cash</option>
        </select>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {refunds.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No refunds found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold">Order ID</th>
                  <th className="p-3 text-left text-sm font-semibold">Customer</th>
                  <th className="p-3 text-left text-sm font-semibold">Seller</th>
                  <th className="p-3 text-left text-sm font-semibold">Listing</th>
                  <th className="p-3 text-center text-sm font-semibold">Amount</th>
                  <th className="p-3 text-center text-sm font-semibold">Type</th>
                  <th className="p-3 text-center text-sm font-semibold">Status</th>
                  <th className="p-3 text-center text-sm font-semibold">Reason</th>
                  <th className="p-3 text-center text-sm font-semibold">Date</th>
                  <th className="p-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {refunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      <Link href={`/orders/${refund.id}`} className="text-purple-600 hover:underline">
                        {refund.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="p-3 text-sm">
                      {refund.user?.username || refund.user?.email || "N/A"}
                    </td>
                    <td className="p-3 text-sm">
                      {refund.seller?.username || refund.seller?.email || "N/A"}
                    </td>
                    <td className="p-3 text-sm">
                      <Link href={`/listings/${refund.listing.id}`} className="text-purple-600 hover:underline truncate block max-w-xs">
                        {refund.listing.title}
                      </Link>
                    </td>
                    <td className="p-3 text-sm text-center font-semibold">
                      ${(refund.refundAmount / 100).toFixed(2)}
                    </td>
                    <td className="p-3 text-sm text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        refund.refundType === "CREDIT" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {refund.refundType === "CREDIT" ? "Credit" : "Cash"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        refund.refundStatus === "COMPLETED" ? "bg-green-100 text-green-800" :
                        refund.refundStatus === "REJECTED" ? "bg-red-100 text-red-800" :
                        refund.refundStatus === "REQUESTED" ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {refund.refundStatus}
                      </span>
                    </td>
                    <td className="p-3 text-sm max-w-xs truncate">
                      {refund.refundReason || "-"}
                    </td>
                    <td className="p-3 text-sm text-center">
                      {new Date(refund.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm text-center">
                      {refund.refundStatus === "REQUESTED" && (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => approveRefund(refund.id)}
                            className="text-green-600 hover:underline text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectRefund(refund.id)}
                            className="text-red-600 hover:underline text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {refund.refundStatus === "COMPLETED" && refund.refundedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(refund.refundedAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

