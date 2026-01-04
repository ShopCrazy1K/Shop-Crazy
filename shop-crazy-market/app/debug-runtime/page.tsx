"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function DebugRuntimePage() {
  const { user } = useAuth();
  const [results, setResults] = useState<any>({});

  async function testEndpoint(name: string, url: string) {
    try {
      const start = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
      });
      const time = Date.now() - start;
      const data = await response.json().catch(() => ({ error: 'Failed to parse JSON' }));
      
      return {
        name,
        status: response.status,
        ok: response.ok,
        time,
        data: response.ok ? data : { error: data.error || data.message || 'Unknown error' },
      };
    } catch (error: any) {
      return {
        name,
        status: 0,
        ok: false,
        time: 0,
        error: error.message || 'Network error',
      };
    }
  }

  async function runTests() {
    const tests: any = {};
    
    // Test 1: Notifications API
    if (user?.id) {
      tests.notifications = await testEndpoint(
        'Notifications API',
        `/api/notifications?userId=${user.id}`
      );
    }

    // Test 2: Listings API (get first listing)
    tests.listings = await testEndpoint('Listings API', '/api/listings');
    
    // Test 3: Database connection
    tests.database = await testEndpoint('Database Test', '/api/test-database');

    // Test 4: Runtime environment
    tests.runtime = await testEndpoint('Runtime Env', '/api/check-runtime-env');

    // Test 5: Health check
    tests.health = await testEndpoint('Health Check', '/api/health-check');

    // Test 6: Comprehensive test
    tests.all = await testEndpoint('Comprehensive Test', '/api/test-all');

    setResults(tests);
  }

  useEffect(() => {
    runTests();
  }, [user]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Runtime Diagnostic</h1>
      
      <div className="mb-4">
        <button
          onClick={runTests}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Run Tests Again
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([key, result]: [string, any]) => (
          <div
            key={key}
            className={`p-4 rounded-lg border-2 ${
              result.ok
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}
          >
            <h2 className="font-bold text-lg mb-2">{result.name || key}</h2>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Status:</strong>{' '}
                <span className={result.ok ? 'text-green-700' : 'text-red-700'}>
                  {result.status} {result.ok ? '✅' : '❌'}
                </span>
              </p>
              <p>
                <strong>Response Time:</strong> {result.time}ms
              </p>
              {result.error && (
                <p className="text-red-700">
                  <strong>Error:</strong> {result.error}
                </p>
              )}
              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600">View Response Data</summary>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-bold mb-2">User Info</h2>
        <p>Logged in: {user ? 'Yes ✅' : 'No ❌'}</p>
        {user && (
          <p>User ID: {user.id.substring(0, 8)}...</p>
        )}
      </div>

      <div className="mt-4">
        <a href="/" className="text-purple-600 hover:underline">← Back to Home</a>
      </div>
    </div>
  );
}
