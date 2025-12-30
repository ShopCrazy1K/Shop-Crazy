"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ReportButtonProps {
  productId?: string;
  listingId?: string;
}

export default function ReportButton({ productId, listingId }: ReportButtonProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  async function handleReport() {
    if (!email || !reason) {
      alert("Please fill in both email and reason.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId, 
          listingId,
          reporterEmail: email, 
          reason 
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitted(false);
          setEmail("");
          setReason("");
        }, 2000);
      } else {
        alert("Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-red-600 hover:text-red-700 underline transition-colors"
        title="Report this item for copyright violation or other issues"
      >
        🚩 Report This Item
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="font-bold text-xl">Report Copyright Violation</h2>

            {submitted ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-green-600 font-semibold">Report submitted successfully!</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full border rounded-lg px-4 py-2"
                    required
                    disabled={!!user?.email} // Disable if user is logged in
                  />
                  {user?.email && (
                    <p className="text-xs text-gray-500 mt-1">Using your account email</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Reason for Report *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe the copyright violation..."
                    className="w-full border rounded-lg px-4 py-2 h-24 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEmail("");
                      setReason("");
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={submitting || !email || !reason}
                    className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

