"use client";

import { useSearchParams } from "next/navigation";
import CounterNoticeForm from "@/components/CounterNoticeForm";

export const dynamic = 'force-dynamic';

export default function CounterNoticePage() {
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
