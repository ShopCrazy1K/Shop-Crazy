"use client";

import { useState, useEffect } from "react";

export default function TestListingFlowPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listingId, setListingId] = useState("");

  useEffect(() => {
    async function getListingId() {
      try {
        // Get a listing ID from the database
        const res = await fetch("/api/listings?isActive=true");
        const listings = await res.json();
        
        if (Array.isArray(listings) && listings.length > 0) {
          const firstListing = listings[0];
          setListingId(firstListing.id);
          
          // Test fetching that listing
          await testListingFetch(firstListing.id);
        } else {
          setResults({
            error: "No listings found in database",
            listings: listings,
          });
          setLoading(false);
        }
      } catch (error: any) {
        setResults({
          error: error.message,
        });
        setLoading(false);
      }
    }

    async function testListingFetch(id: string) {
      const testResults: any = {
        timestamp: new Date().toISOString(),
        listingId: id,
        tests: {},
      };

      // Test 1: Fetch listing via API
      try {
        console.log("[TEST] Fetching listing:", id);
        const start = Date.now();
        const res = await fetch(`/api/listings/${id}`);
        const time = Date.now() - start;
        
        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }

        testResults.tests.apiFetch = {
          status: res.status,
          ok: res.ok,
          time: `${time}ms`,
          data: data,
          rawText: text.substring(0, 500),
        };

        // If successful, test rendering
        if (res.ok && data?.id) {
          testResults.tests.rendering = {
            hasId: !!data.id,
            hasTitle: !!data.title,
            hasSeller: !!data.seller,
            hasImages: Array.isArray(data.images),
            imagesCount: Array.isArray(data.images) ? data.images.length : 0,
            isActive: data.isActive,
          };
        }
      } catch (error: any) {
        testResults.tests.apiFetch = {
          error: error.message,
          name: error.name,
        };
      }

      setResults(testResults);
      setLoading(false);
    }

    getListingId();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Testing Listing Flow...</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Listing Flow Test Results</h1>

        {listingId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              <strong>Testing with Listing ID:</strong> {listingId}
            </p>
            <a
              href={`/listings/${listingId}`}
              target="_blank"
              className="text-blue-600 underline text-sm mt-2 inline-block"
            >
              Try viewing this listing →
            </a>
          </div>
        )}

        {results?.error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{results.error}</p>
          </div>
        ) : results?.tests?.apiFetch ? (
          <div className="space-y-6">
            {/* API Fetch Test */}
            <div className={`bg-white rounded-lg shadow-lg p-6 ${
              results.tests.apiFetch.ok ? 'border-green-500 border-2' : 'border-red-500 border-2'
            }`}>
              <h2 className="text-xl font-bold mb-4">
                {results.tests.apiFetch.ok ? '✅ API Fetch: SUCCESS' : '❌ API Fetch: FAILED'}
              </h2>
              <div className="space-y-2 text-sm">
                <p><strong>Status:</strong> {results.tests.apiFetch.status}</p>
                <p><strong>Time:</strong> {results.tests.apiFetch.time}</p>
                {results.tests.apiFetch.error && (
                  <p className="text-red-700"><strong>Error:</strong> {results.tests.apiFetch.error}</p>
                )}
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600 font-semibold">View API Response</summary>
                  <pre className="mt-2 bg-gray-100 p-4 rounded overflow-auto text-xs max-h-96">
                    {JSON.stringify(results.tests.apiFetch.data, null, 2)}
                  </pre>
                </details>
              </div>
            </div>

            {/* Rendering Test */}
            {results.tests.rendering && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Data Structure Check</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className={results.tests.rendering.hasId ? 'text-green-700' : 'text-red-700'}>
                    Has ID: {results.tests.rendering.hasId ? '✅' : '❌'}
                  </div>
                  <div className={results.tests.rendering.hasTitle ? 'text-green-700' : 'text-red-700'}>
                    Has Title: {results.tests.rendering.hasTitle ? '✅' : '❌'}
                  </div>
                  <div className={results.tests.rendering.hasSeller ? 'text-green-700' : 'text-red-700'}>
                    Has Seller: {results.tests.rendering.hasSeller ? '✅' : '❌'}
                  </div>
                  <div>
                    Images: {results.tests.rendering.imagesCount} {results.tests.rendering.hasImages ? '✅' : '❌'}
                  </div>
                  <div>
                    Is Active: {results.tests.rendering.isActive ? '✅ Yes' : '❌ No'}
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-bold text-yellow-800 mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                {!results.tests.apiFetch.ok && (
                  <li>API fetch failed - Check server logs and database connection</li>
                )}
                {results.tests.apiFetch.ok && !results.tests.rendering?.hasId && (
                  <li>API returned data but missing required fields - Check API response structure</li>
                )}
                {results.tests.apiFetch.ok && results.tests.rendering?.hasId && (
                  <>
                    <li>API is working - The issue is likely in the React component</li>
                    <li>Check browser console when viewing listing page</li>
                    <li>Look for errors or logs starting with [LISTING PAGE]</li>
                  </>
                )}
              </ol>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">No test results available</p>
          </div>
        )}
      </div>
    </div>
  );
}
