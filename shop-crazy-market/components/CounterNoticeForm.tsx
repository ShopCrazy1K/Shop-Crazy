"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CounterNoticeFormProps {
  complaintId: string;
  listingId: string;
}

export default function CounterNoticeForm({ complaintId, listingId }: CounterNoticeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    respondentName: "",
    respondentEmail: "",
    respondentPhone: "",
    respondentAddress: "",
    statement: "",
    goodFaithStatement: "",
    consentToJurisdiction: "",
    electronicSignature: "",
  });
  
  useEffect(() => {
    // Pre-fill email if available from session
    // You can fetch user data here if needed
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/dmca/counter-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId,
          listingId,
          ...formData,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit counter-notice");
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/listings/${listingId}`);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit counter-notice");
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-2xl font-bold text-green-800 mb-4">Counter-Notice Submitted</h2>
        <p className="text-green-700">
          Your counter-notice has been submitted successfully. Your listing will be reviewed by an administrator.
          You will be redirected shortly...
        </p>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">DMCA Counter-Notice</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> Filing a false counter-notice may result in legal consequences.
          By submitting this counter-notice, you consent to the jurisdiction of a federal court.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Respondent Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.respondentName}
                onChange={(e) => setFormData({ ...formData, respondentName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.respondentEmail}
                onChange={(e) => setFormData({ ...formData, respondentEmail: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.respondentPhone}
                onChange={(e) => setFormData({ ...formData, respondentPhone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Physical Address <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={formData.respondentAddress}
                onChange={(e) => setFormData({ ...formData, respondentAddress: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Street address, city, state, zip code"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Statement</h2>
          <div>
            <label className="block text-sm font-medium mb-1">
              Statement <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={formData.statement}
              onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="I swear, under penalty of perjury, that I have a good faith belief that the material was removed or disabled as a result of mistake or misidentification of the material to be removed or disabled."
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Good Faith Statement</h2>
          <div>
            <label className="block text-sm font-medium mb-1">
              Statement <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.goodFaithStatement}
              onChange={(e) => setFormData({ ...formData, goodFaithStatement: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="I have a good faith belief that the material was removed or disabled as a result of mistake or misidentification."
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Consent to Jurisdiction</h2>
          <div>
            <label className="block text-sm font-medium mb-1">
              Statement <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.consentToJurisdiction}
              onChange={(e) => setFormData({ ...formData, consentToJurisdiction: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="I consent to the jurisdiction of Federal District Court for the judicial district in which my address is located, or if my address is outside of the United States, the judicial district in which the service provider is located."
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Electronic Signature</h2>
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.electronicSignature}
              onChange={(e) => setFormData({ ...formData, electronicSignature: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Type your full name as your electronic signature"
            />
            <p className="text-sm text-gray-500 mt-1">
              By typing your name, you are signing this document electronically
            </p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Counter-Notice"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
