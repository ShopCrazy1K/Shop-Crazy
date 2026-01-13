"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import DMCAComplaintForm from "@/components/DMCAComplaintForm";

function DMCAComplaintPageContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listingId") || "";
  const listingTitle = searchParams.get("listingTitle") || "Unknown Listing";

  if (!listingId) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: No listing ID provided.</p>
        </div>
      </div>
    );
  }

  return <DMCAComplaintForm listingId={listingId} listingTitle={decodeURIComponent(listingTitle)} />;
}

export default function DMCAComplaintPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <DMCAComplaintPageContent />
    </Suspense>
  );
}
