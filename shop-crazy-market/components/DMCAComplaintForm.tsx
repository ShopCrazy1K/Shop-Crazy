"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DMCAComplaintFormProps {
  listingId: string;
  listingTitle: string;
}

export default function DMCAComplaintForm({ listingId, listingTitle }: DMCAComplaintFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    complainantName: "",
    complainantEmail: "",
    complainantPhone: "",
    complainantAddress: "",
    copyrightOwnerName: "",
    copyrightOwnerEmail: "",
    copyrightedWork: "",
    infringingWork: "",
    locationOfInfringement: "",
    goodFaithStatement: "",
    electronicSignature: "",
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/dmca/complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          ...formData,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit DMCA complaint");
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/listings/${listingId}`);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit DMCA complaint");
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-2xl font-bold text-green-800 mb-4">Complaint Submitted</h2>
        <p className="text-green-700">
          Your DMCA complaint has been submitted successfully. The listing has been flagged for review.
          You will be redirected shortly...
        </p>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">DMCA Takedown Notice</h1>
      <p className="text-gray-600 mb-6">
        Filing a DMCA complaint for: <strong>{listingTitle}</strong>
      </p>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> Filing a false DMCA complaint may result in legal consequences.
          Please ensure you are the copyright owner or authorized to act on their behalf.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Complainant Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.complainantName}
                onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
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
                value={formData.complainantEmail}
                onChange={(e) => setFormData({ ...formData, complainantEmail: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.complainantPhone}
                onChange={(e) => setFormData({ ...formData, complainantPhone: e.target.value })}
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
                value={formData.complainantAddress}
                onChange={(e) => setFormData({ ...formData, complainantAddress: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Street address, city, state, zip code"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Copyright Owner Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Copyright Owner Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.copyrightOwnerName}
                onChange={(e) => setFormData({ ...formData, copyrightOwnerName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Copyright Owner Email</label>
              <input
                type="email"
                value={formData.copyrightOwnerEmail}
                onChange={(e) => setFormData({ ...formData, copyrightOwnerEmail: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Infringement Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Description of Copyrighted Work <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.copyrightedWork}
                onChange={(e) => setFormData({ ...formData, copyrightedWork: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Describe the copyrighted work that you believe has been infringed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Description of Infringing Material <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.infringingWork}
                onChange={(e) => setFormData({ ...formData, infringingWork: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Describe the material that you believe infringes your copyright"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Location of Infringement <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={formData.locationOfInfringement}
                onChange={(e) => setFormData({ ...formData, locationOfInfringement: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="URL or description of where the infringement appears"
              />
            </div>
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
              placeholder="I have a good faith belief that use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law."
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
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit DMCA Complaint"}
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
