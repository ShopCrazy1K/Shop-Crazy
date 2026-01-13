"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import CounterNoticeForm from "@/components/CounterNoticeForm";

function CounterNoticePageContent() {
  const searchParams = useSearchParams();
  const complaintId = searchParams.get("complaintId") || "";
  const listingId = searchParams.get("listingId") || "";

  if (!complaintId || !listingId) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: Missing required parameters.</p>
        </div>
      </div>
    );
  }

  return <CounterNoticeForm complaintId={complaintId} listingId={listingId} />;
}

export default function CounterNoticePage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <CounterNoticePageContent />
    </Suspense>
  );
}
