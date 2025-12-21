"use client";

import { useState, useEffect } from "react";

interface Refund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
}

interface Dispute {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
}

export default function RefundsDashboard() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch("/api/refunds");
        if (response.ok) {
          const data = await response.json();
          setRefunds(data.refunds || []);
          setDisputes(data.disputes || []);
        } else {
          console.error("Failed to fetch refunds");
        }
      } catch (error) {
        console.error("Error fetching refunds:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleRefund = async (refundId: string) => {
    const refund = refunds.find((r) => r.id === refundId);
    if (!refund) return;

    try {
      const response = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: refund.orderId,
          amount: refund.amount,
          reason: refund.reason,
        }),
      });

      if (response.ok) {
        alert("Refund processed successfully");
        // Refresh data
        const data = await fetch("/api/refunds").then((r) => r.json());
        setRefunds(data.refunds || []);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to process refund");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      alert("An error occurred while processing the refund");
    }
  };

  const handleDispute = async (disputeId: string, action: string) => {
    try {
      const response = await fetch(`/api/disputes/${disputeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        alert(`Dispute ${action}ed successfully`);
        // Refresh data
        const data = await fetch("/api/refunds").then((r) => r.json());
        setDisputes(data.disputes || []);
      } else {
        const error = await response.json();
        alert(error.error || `Failed to ${action} dispute`);
      }
    } catch (error) {
      console.error("Error handling dispute:", error);
      alert("An error occurred while handling the dispute");
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-accent text-4xl">Refunds & Disputes</h1>

      {/* REFUNDS SECTION */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-accent text-2xl mb-4">Refunds</h2>
        {refunds.length === 0 ? (
          <p className="text-gray-500">No refunds</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Order ID</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Reason</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((refund) => (
                <tr key={refund.id} className="border-b">
                  <td className="p-2">{refund.orderId}</td>
                  <td className="p-2 text-center">
                    ${(refund.amount / 100).toFixed(2)}
                  </td>
                  <td className="p-2">{refund.reason}</td>
                  <td className="p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        refund.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {refund.status}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    {refund.status === "pending" && (
                      <button
                        onClick={() => handleRefund(refund.id)}
                        className="text-blue-600 hover:underline"
                      >
                        Process
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DISPUTES SECTION */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-accent text-2xl mb-4">Disputes</h2>
        {disputes.length === 0 ? (
          <p className="text-gray-500">No disputes</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Order ID</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Reason</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((dispute) => (
                <tr key={dispute.id} className="border-b">
                  <td className="p-2">{dispute.orderId}</td>
                  <td className="p-2 text-center">
                    ${(dispute.amount / 100).toFixed(2)}
                  </td>
                  <td className="p-2">{dispute.reason}</td>
                  <td className="p-2 text-center">
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                      {dispute.status}
                    </span>
                  </td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      onClick={() => handleDispute(dispute.id, "accept")}
                      className="text-green-600 hover:underline text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDispute(dispute.id, "contest")}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Contest
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

