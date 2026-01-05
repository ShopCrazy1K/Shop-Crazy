"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestListingPage() {
  const router = useRouter();
  const [listingId, setListingId] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function testListing() {
    if (!listingId.trim()) {
      alert("Please enter a listing ID");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      // Test 1: Direct API call
      const apiUrl = `/api/listings/${listingId}`;
      console.log("[TEST] Fetching from:", apiUrl);
      
      const startTime = Date.now();
      const response = await fetch(apiUrl, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
      });
      const fetchTime = Date.now() - startTime;

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: "Invalid JSON", raw: text.substring(0, 500) };
      }

      setResults({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        fetchTime: `${fetchTime}ms`,
        data: data,
        hasId: !!data?.id,
        hasTitle: !!data?.title,
        hasSeller: !!data?.seller,
        sellerId: data?.seller?.id || data?.sellerId || 'none',
        imagesCount: Array.isArray(data?.images) ? data.images.length : 0,
        url: apiUrl,
      });

      console.log("[TEST] Results:", results);
    } catch (error: any) {
      setResults({
        success: false,
        error: error.message,
        stack: error.stack,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Listing Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block mb-2 font-semibold">Listing ID:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={listingId}
              onChange={(e) => setListingId(e.target.value)}
              placeholder="Enter listing ID"
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={testListing}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {loading ? "Testing..." : "Test API"}
            </button>
            <button
              onClick={() => router.push(`/listings/${listingId}`)}
              disabled={!listingId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Open Page
            </button>
          </div>
        </div>

        {results && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Results:</h2>
            
            <div className={`p-4 rounded-lg mb-4 ${results.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`font-semibold ${results.success ? 'text-green-800' : 'text-red-800'}`}>
                Status: {results.status} {results.statusText}
              </p>
              <p className="text-sm text-gray-600">Fetch Time: {results.fetchTime}</p>
            </div>

            {results.success ? (
              <div className="space-y-2">
                <p><strong>Has ID:</strong> {results.hasId ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Has Title:</strong> {results.hasTitle ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Has Seller:</strong> {results.hasSeller ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Seller ID:</strong> {results.sellerId}</p>
                <p><strong>Images Count:</strong> {results.imagesCount}</p>
                
                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold">Full Response Data</summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(results.data, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-600"><strong>Error:</strong> {results.error}</p>
                {results.data && (
                  <details>
                    <summary className="cursor-pointer font-semibold">Error Details</summary>
                    <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                      {JSON.stringify(results.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Quick Links:</h3>
          <div className="flex flex-wrap gap-2">
            <a href="/api/test-all" target="_blank" className="text-blue-600 underline">
              Test All APIs
            </a>
            <a href="/api/test-db" target="_blank" className="text-blue-600 underline">
              Test Database
            </a>
            <a href="/marketplace" className="text-blue-600 underline">
              Marketplace
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
