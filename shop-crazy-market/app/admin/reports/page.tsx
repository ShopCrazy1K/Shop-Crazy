"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CopyrightReport {
  id: string;
  productId: string;
  product?: {
    title: string;
  };
  reporterEmail: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function AdminReports() {
  const [reports, setReports] = useState<CopyrightReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [processingBulk, setProcessingBulk] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filter]);

  async function fetchReports() {
    try {
      const url = filter === "ALL" 
        ? "/api/admin/reports"
        : `/api/admin/reports?status=${filter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateReportStatus(reportId: string, status: string, action: string) {
    try {
      const response = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status, action }),
      });

      if (response.ok) {
        await fetchReports();
        setSelectedReports(new Set());
      } else {
        alert("Failed to update report");
      }
    } catch (error) {
      console.error("Error updating report:", error);
      alert("An error occurred");
    }
  }

  async function handleBulkAction() {
    if (selectedReports.size === 0 || !bulkAction) {
      alert("Please select reports and an action");
      return;
    }

    setProcessingBulk(true);
    try {
      const actionMap: Record<string, { status: string; action: string }> = {
        approve: { status: "APPROVED", action: "remove" },
        reject: { status: "REJECTED", action: "reject" },
        restore: { status: "RESOLVED", action: "restore" },
      };

      const { status, action } = actionMap[bulkAction] || {};
      if (!status || !action) {
        alert("Invalid action");
        return;
      }

      const response = await fetch("/api/admin/reports/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportIds: Array.from(selectedReports),
          status,
          action,
        }),
      });

      if (response.ok) {
        await fetchReports();
        setSelectedReports(new Set());
        setBulkAction("");
        alert(`Successfully ${bulkAction}ed ${selectedReports.size} report(s)`);
      } else {
        alert("Failed to process bulk action");
      }
    } catch (error) {
      console.error("Error processing bulk action:", error);
      alert("An error occurred");
    } finally {
      setProcessingBulk(false);
    }
  }

  function toggleReportSelection(reportId: string) {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId);
    } else {
      newSelected.add(reportId);
    }
    setSelectedReports(newSelected);
  }

  function toggleAllSelection() {
    if (selectedReports.size === filteredReports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(filteredReports.map((r) => r.id)));
    }
  }

  const filteredReports = filter === "ALL" 
    ? reports 
    : reports.filter((r) => r.status === filter);

  return (
    <div className="p-6">
      <h1 className="font-accent text-3xl mb-6">Copyright Reports</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {["ALL", "PENDING", "APPROVED", "REJECTED", "RESOLVED"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilter(status);
              setSelectedReports(new Set());
            }}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              filter === status
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {filteredReports.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-4 mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedReports.size === filteredReports.length && filteredReports.length > 0}
              onChange={toggleAllSelection}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold">
              {selectedReports.size > 0
                ? `${selectedReports.size} selected`
                : "Select all"}
            </span>
          </div>
          {selectedReports.size > 0 && (
            <>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select action...</option>
                <option value="approve">Approve & Remove</option>
                <option value="reject">Reject</option>
                <option value="restore">Restore</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={processingBulk || !bulkAction}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {processingBulk ? "Processing..." : "Apply"}
              </button>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading reports...</div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No reports found
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedReports.size === filteredReports.length && filteredReports.length > 0}
                    onChange={toggleAllSelection}
                    className="w-4 h-4"
                  />
                </th>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Reporter</th>
                <th className="p-4 text-left">Reason</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className={`border-t hover:bg-gray-50 ${
                    selectedReports.has(report.id) ? "bg-purple-50" : ""
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedReports.has(report.id)}
                      onChange={() => toggleReportSelection(report.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/product/${report.productId}`}
                      className="text-purple-600 hover:underline"
                    >
                      {report.product?.title || "Product"}
                    </Link>
                  </td>
                  <td className="p-4 text-sm">{report.reporterEmail}</td>
                  <td className="p-4 text-sm max-w-xs truncate">{report.reason}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        report.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : report.status === "APPROVED"
                          ? "bg-red-100 text-red-800"
                          : report.status === "REJECTED"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-center">
                      {report.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              updateReportStatus(report.id, "APPROVED", "remove")
                            }
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() =>
                              updateReportStatus(report.id, "REJECTED", "reject")
                            }
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {report.status === "APPROVED" && (
                        <button
                          onClick={() =>
                            updateReportStatus(report.id, "RESOLVED", "restore")
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

