"use client";

import { useState, useEffect } from "react";

export default function TestDBLivePage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runTests() {
      const testResults: any = {
        timestamp: new Date().toISOString(),
        tests: {},
      };

      // Test 1: Database connection
      try {
        const start = Date.now();
        const res = await fetch("/api/listings/test-connection");
        const data = await res.json();
        testResults.tests.databaseConnection = {
          status: res.status,
          ok: res.ok,
          time: `${Date.now() - start}ms`,
          data: data,
        };
      } catch (error: any) {
        testResults.tests.databaseConnection = {
          error: error.message,
        };
      }

      // Test 2: Get a listing ID from the database
      try {
        const res = await fetch("/api/listings?isActive=true&limit=1");
        const listings = await res.json();
        if (Array.isArray(listings) && listings.length > 0) {
          testResults.tests.getListingId = {
            success: true,
            listingId: listings[0].id,
            title: listings[0].title,
          };

          // Test 3: Try to fetch that specific listing
          try {
            const start = Date.now();
            const listingRes = await fetch(`/api/listings/${listings[0].id}`);
            const listingData = await listingRes.json();
            testResults.tests.fetchSingleListing = {
              status: listingRes.status,
              ok: listingRes.ok,
              time: `${Date.now() - start}ms`,
              data: listingData,
            };
          } catch (error: any) {
            testResults.tests.fetchSingleListing = {
              error: error.message,
            };
          }
        } else {
          testResults.tests.getListingId = {
            success: false,
            message: "No listings found",
            listings: listings,
          };
        }
      } catch (error: any) {
        testResults.tests.getListingId = {
          error: error.message,
        };
      }

      // Test 4: Check listing error endpoint
      if (testResults.tests.getListingId?.listingId) {
        try {
          const res = await fetch(
            `/api/check-listing-error?id=${testResults.tests.getListingId.listingId}`
          );
          const data = await res.json();
          testResults.tests.listingErrorCheck = {
            status: res.status,
            ok: res.ok,
            data: data,
          };
        } catch (error: any) {
          testResults.tests.listingErrorCheck = {
            error: error.message,
          };
        }
      }

      setResults(testResults);
      setLoading(false);
    }

    runTests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Testing Database Connection...</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Running comprehensive tests...</p>
          </div>
        </div>
      </div>
    );
  }

  const allPassed = 
    results.tests.databaseConnection?.ok &&
    results.tests.fetchSingleListing?.ok;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Live Database Test Results</h1>

        {/* Summary */}
        <div className={`mb-6 p-6 rounded-lg shadow-lg ${
          allPassed ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
        }`}>
          <h2 className="text-2xl font-bold mb-2">
            {allPassed ? '✅ All Tests Passed!' : '❌ Tests Failed'}
          </h2>
          <p className="text-sm text-gray-600">
            Timestamp: {new Date(results.timestamp).toLocaleString()}
          </p>
        </div>

        {/* Database Connection Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">1. Database Connection Test</h2>
          {results.tests.databaseConnection?.ok ? (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-800 font-semibold">✅ Database connection successful</p>
              <p className="text-sm text-green-700 mt-2">Time: {results.tests.databaseConnection.time}</p>
              <details className="mt-2">
                <summary className="text-xs text-green-600 cursor-pointer">View details</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-60">
                  {JSON.stringify(results.tests.databaseConnection.data, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-800 font-semibold">❌ Database connection failed</p>
              {results.tests.databaseConnection?.error && (
                <p className="text-sm text-red-700 mt-2">Error: {results.tests.databaseConnection.error}</p>
              )}
              {results.tests.databaseConnection?.data && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer">View error details</summary>
                  <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(results.tests.databaseConnection.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Get Listing ID Test */}
        {results.tests.getListingId && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">2. Get Listing ID Test</h2>
            {results.tests.getListingId.success ? (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-800 font-semibold">✅ Found listing</p>
                <p className="text-sm text-green-700 mt-2">
                  ID: <code className="bg-white px-2 py-1 rounded">{results.tests.getListingId.listingId}</code>
                </p>
                <p className="text-sm text-green-700">
                  Title: {results.tests.getListingId.title}
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-yellow-800 font-semibold">⚠️ {results.tests.getListingId.message || "No listings found"}</p>
              </div>
            )}
          </div>
        )}

        {/* Fetch Single Listing Test */}
        {results.tests.fetchSingleListing && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">3. Fetch Single Listing Test</h2>
            {results.tests.fetchSingleListing.ok ? (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-800 font-semibold">✅ Listing fetched successfully</p>
                <p className="text-sm text-green-700 mt-2">Time: {results.tests.fetchSingleListing.time}</p>
                <p className="text-sm text-green-700">Status: {results.tests.fetchSingleListing.status}</p>
                <details className="mt-2">
                  <summary className="text-xs text-green-600 cursor-pointer">View listing data</summary>
                  <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(results.tests.fetchSingleListing.data, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-800 font-semibold">❌ Failed to fetch listing</p>
                <p className="text-sm text-red-700 mt-2">Status: {results.tests.fetchSingleListing.status}</p>
                {results.tests.fetchSingleListing.error && (
                  <p className="text-sm text-red-700">Error: {results.tests.fetchSingleListing.error}</p>
                )}
                {results.tests.fetchSingleListing.data && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer">View error details</summary>
                    <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-60">
                      {JSON.stringify(results.tests.fetchSingleListing.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">Recommendations:</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            {!results.tests.databaseConnection?.ok && (
              <li>Database connection failed - Check DATABASE_URL in Vercel and redeploy</li>
            )}
            {results.tests.databaseConnection?.ok && !results.tests.getListingId?.success && (
              <li>Database works but no listings found - This might be normal if you haven't created listings yet</li>
            )}
            {results.tests.getListingId?.success && !results.tests.fetchSingleListing?.ok && (
              <li>Listings exist but single listing fetch fails - Check the API route for errors</li>
            )}
            {allPassed && (
              <li>All tests passed! If listings still don't load, check browser console for client-side errors</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
