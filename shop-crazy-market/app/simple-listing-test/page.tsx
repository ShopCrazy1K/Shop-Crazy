"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SimpleListingTestPage() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get("id");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function test() {
      if (!listingId) {
        setResult({ error: "No listing ID provided. Add ?id=LISTING_ID to the URL" });
        setLoading(false);
        return;
      }

      try {
        console.log("[SIMPLE TEST] Testing listing ID:", listingId);
        
        // Test 1: Just fetch the API
        const response = await fetch(`/api/listings/${listingId}`);
        const text = await response.text();
        
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }

        setResult({
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
          data: data,
        });
      } catch (error: any) {
        setResult({
          error: error.message,
          name: error.name,
          stack: error.stack,
        });
      } finally {
        setLoading(false);
      }
    }

    test();
  }, [listingId]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Simple Listing API Test</h1>
        
        {!listingId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
            <p className="text-yellow-800">
              Add a listing ID to the URL: <code>?id=YOUR_LISTING_ID</code>
            </p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
