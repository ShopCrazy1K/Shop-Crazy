"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DMCAComplaint {
  id: string;
  status: string;
  complainantName: string;
  complainantEmail: string;
  copyrightOwnerName: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    seller: {
      id: string;
      email: string;
      username: string | null;
    };
  };
  counterNotice: {
    id: string;
    status: string;
  } | null;
}

export default function AdminCopyrightPage() {
  const [complaints, setComplaints] = useState<DMCAComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<DMCAComplaint | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      const status = filter === "all" ? "" : filter;
      const response = await fetch(`/api/admin/dmca?status=${status}`);
      const data = await response.json();
      if (response.ok) {
        setComplaints(data.complaints || []);
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId: string, status: string, addStrike: boolean = false) => {
    setActionLoading(complaintId);
    try {
      const response = await fetch("/api/admin/dmca", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId,
          status,
          adminNotes,
          addStrike,
        }),
      });

      if (response.ok) {
        await fetchComplaints();
        setSelectedComplaint(null);
        setAdminNotes("");
      } else {
        alert("Failed to update complaint");
      }
    } catch (error) {
      console.error("Failed to update complaint:", error);
      alert("Failed to update complaint");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "VALID":
        return "bg-red-100 text-red-800";
      case "INVALID":
        return "bg-green-100 text-green-800";
      case "RESOLVED":
        return "bg-blue-100 text-blue-800";
      case "COUNTER_NOTICED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Copyright & IP Management</h1>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("PENDING")}
          className={`px-4 py-2 rounded ${filter === "PENDING" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("VALID")}
          className={`px-4 py-2 rounded ${filter === "VALID" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Valid
        </button>
        <button
          onClick={() => setFilter("COUNTER_NOTICED")}
          className={`px-4 py-2 rounded ${filter === "COUNTER_NOTICED" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Counter-Noticed
        </button>
      </div>

      <div className="grid gap-4">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="border rounded-lg p-4 hover:shadow-md cursor-pointer"
            onClick={() => setSelectedComplaint(complaint)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                  {complaint.counterNotice && (
                    <span className="px-2 py-1 rounded text-sm bg-purple-100 text-purple-800">
                      Counter-Notice: {complaint.counterNotice.status}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg">{complaint.listing.title}</h3>
                <p className="text-sm text-gray-600">
                  Complainant: {complaint.complainantName} ({complaint.complainantEmail})
                </p>
                <p className="text-sm text-gray-600">
                  Copyright Owner: {complaint.copyrightOwnerName}
                </p>
                <p className="text-sm text-gray-600">
                  Seller: {complaint.listing.seller.username || complaint.listing.seller.email}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Filed: {new Date(complaint.createdAt).toLocaleString()}
                </p>
              </div>
              <Link
                href={`/admin/listings/${complaint.listing.id}`}
                className="text-blue-600 hover:underline ml-4"
                onClick={(e) => e.stopPropagation()}
              >
                View Listing
              </Link>
            </div>
          </div>
        ))}
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">DMCA Complaint Details</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <strong>Status:</strong>{" "}
                <span className={`px-2 py-1 rounded ${getStatusColor(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
              </div>
              <div>
                <strong>Listing:</strong> {selectedComplaint.listing.title}
              </div>
              <div>
                <strong>Complainant:</strong> {selectedComplaint.complainantName} ({selectedComplaint.complainantEmail})
              </div>
              <div>
                <strong>Copyright Owner:</strong> {selectedComplaint.copyrightOwnerName}
              </div>
              <div>
                <strong>Seller:</strong> {selectedComplaint.listing.seller.username || selectedComplaint.listing.seller.email}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Add notes about this complaint..."
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {selectedComplaint.status === "PENDING" && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, "VALID", true)}
                    disabled={actionLoading === selectedComplaint.id}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading === selectedComplaint.id ? "Processing..." : "Validate & Add Strike"}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, "INVALID", false)}
                    disabled={actionLoading === selectedComplaint.id}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === selectedComplaint.id ? "Processing..." : "Mark Invalid"}
                  </button>
                </>
              )}
              {selectedComplaint.status === "COUNTER_NOTICED" && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, "RESOLVED", false)}
                    disabled={actionLoading === selectedComplaint.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading === selectedComplaint.id ? "Processing..." : "Approve Counter-Notice"}
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setSelectedComplaint(null);
                  setAdminNotes("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
