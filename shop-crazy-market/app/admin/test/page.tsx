"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function AdminTestPage() {
  const { user } = useAuth();
  const [checkResult, setCheckResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testAdmin() {
      if (!user) {
        setCheckResult({ error: "No user logged in" });
        setLoading(false);
        return;
      }

      try {
        // Test 1: Check localStorage
        const storedUser = localStorage.getItem("user");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        // Test 2: Check API
        const response = await fetch(`/api/admin/check?userId=${user.id}`);
        const apiData = await response.json();

        setCheckResult({
          userFromContext: user,
          userFromLocalStorage: parsedUser,
          apiCheck: apiData,
          apiStatus: response.status,
        });
      } catch (error: any) {
        setCheckResult({ error: error.message });
      } finally {
        setLoading(false);
      }
    }

    testAdmin();
  }, [user]);

  if (loading) {
    return <div className="p-8">Loading test...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Access Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(checkResult, null, 2)}
      </pre>
      <div className="mt-4">
        <button
          onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear Cache & Go to Login
        </button>
      </div>
    </div>
  );
}

