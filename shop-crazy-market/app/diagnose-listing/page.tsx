"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function DiagnoseListingContent() {
  const searchParams = useSearchParams();
  const [listingId, setListingId] = useState("");
  
  useEffect(() => {
    setListingId(searchParams.get("id") || "");
  }, [searchParams]);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function runDiagnostics() {
    setLoading(true);
    setResults(null);

    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      listingId: listingId || "NOT PROVIDED",
      tests: {},
    };

    // Test 1: Database connection
    try {
      const response = await fetch("/api/listings/test-connection");
      const data = await response.json();
      diagnostics.tests.databaseConnection = {
        status: response.status,
        ok: response.ok,
        data: data,
      };
    } catch (error: any) {
      diagnostics.tests.databaseConnection = {
        error: error.message,
      };
    }

    // Test 2: Test all APIs
    try {
      const response = await fetch("/api/test-all");
      const data = await response.json();
      diagnostics.tests.allApis = {
        status: response.status,
        ok: response.ok,
        data: data,
      };
    } catch (error: any) {
      diagnostics.tests.allApis = {
        error: error.message,
      };
    }

    // Test 3: If listing ID provided, test that specific listing
    if (listingId) {
      try {
        const response = await fetch(`/api/listings/test-single?id=${listingId}`);
        const data = await response.json();
        diagnostics.tests.singleListing = {
          status: response.status,
          ok: response.ok,
          data: data,
        };
      } catch (error: any) {
        diagnostics.tests.singleListing = {
          error: error.message,
        };
      }

      // Test 4: Try actual listing API
      try {
        const response = await fetch(`/api/listings/${listingId}`);
        const text = await response.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }
        diagnostics.tests.actualListingApi = {
          status: response.status,
          ok: response.ok,
          data: data,
        };
      } catch (error: any) {
        diagnostics.tests.actualListingApi = {
          error: error.message,
        };
      }
    }

    setResults(diagnostics);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Listing Diagnostic Tool</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Listing ID (optional):
            </label>
            <input
              type="text"
              value={listingId}
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set("id", e.target.value);
                window.history.pushState({}, "", url);
              }}
              placeholder="Enter listing ID to test"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Running Diagnostics..." : "Run Diagnostics"}
          </button>
        </div>

        {results && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Diagnostic Results</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">Quick Links:</h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>
              <a href="/api/listings/test-connection" target="_blank" className="underline">
                Test Database Connection
              </a>
            </li>
            <li>
              <a href="/api/test-all" target="_blank" className="underline">
                Test All APIs
              </a>
            </li>
            {listingId && (
              <li>
                <a href={`/api/listings/test-single?id=${listingId}`} target="_blank" className="underline">
                  Test Single Listing (ID: {listingId})
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function DiagnoseListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Listing Diagnostic Tool</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <DiagnoseListingContent />
    </Suspense>
  );
}
