"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (!loading) {
        if (!user) {
          console.log("[ADMIN] No user, redirecting to login");
          router.push("/login");
          return;
        }

        console.log("[ADMIN] Checking admin status for user:", user.id, "Role in localStorage:", user.role);

        // First check: If role in localStorage is already ADMIN, trust it initially
        if (user.role === "ADMIN") {
          console.log("[ADMIN] Role is ADMIN in localStorage, showing admin panel immediately");
          setIsAdmin(true);
          setChecking(false);
          
          // Verify with API in background (non-blocking)
          fetch(`/api/admin/check?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
              if (!data.isAdmin) {
                console.warn("[ADMIN] Warning: Role in localStorage is ADMIN but API says not admin. Updating...");
                // Don't remove access, but log the warning
              }
            })
            .catch(err => console.error("[ADMIN] Background API check failed:", err));
          return;
        }

        // Second check: If role is not ADMIN, verify with API
        try {
          const response = await fetch(`/api/admin/check?userId=${user.id}`);
          console.log("[ADMIN] API response status:", response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log("[ADMIN] API response data:", data);
            
            if (data.isAdmin) {
              console.log("[ADMIN] User is admin (verified by API), showing admin panel");
              setIsAdmin(true);
              // Update localStorage with admin role
              const updatedUser = { ...user, role: "ADMIN" };
              localStorage.setItem("user", JSON.stringify(updatedUser));
              console.log("[ADMIN] Updated localStorage with ADMIN role");
            } else {
              console.log("[ADMIN] User is NOT admin. Role in localStorage:", user.role);
              // Don't redirect, just show access denied
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.log("[ADMIN] Admin check failed:", response.status, errorData);
          }
        } catch (error) {
          console.error("[ADMIN] Error checking admin status:", error);
        } finally {
          setChecking(false);
        }
      }
    }

    checkAdmin();
  }, [user, loading, router]);

  if (checking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have admin access. Your current role is: <strong>{user?.role || "Unknown"}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            User ID: {user?.id}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Clear Cache & Re-login
            </button>
            <br />
            <a
              href="/admin/test"
              className="text-blue-600 hover:underline"
            >
              Run Admin Test
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-black text-white p-6 space-y-6">
        <h1 className="font-accent text-2xl">Admin Panel</h1>

        <nav className="space-y-3">
          <Link href="/admin" className="block hover:text-green-400 transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/users" className="block hover:text-green-400 transition-colors">
            Users
          </Link>
          <Link href="/admin/listings" className="block hover:text-green-400 transition-colors">
            Listings
          </Link>
          <Link href="/admin/transactions" className="block hover:text-green-400 transition-colors">
            Transactions
          </Link>
          <Link href="/admin/products" className="block hover:text-green-400 transition-colors">
            Products
          </Link>
          <Link href="/admin/shops" className="block hover:text-green-400 transition-colors">
            Shops
          </Link>
          <Link href="/admin/orders" className="block hover:text-green-400 transition-colors">
            Orders
          </Link>
          <Link href="/admin/revenue" className="block hover:text-green-400 transition-colors">
            Revenue
          </Link>
          <Link href="/admin/refunds" className="block hover:text-green-400 transition-colors">
            Refunds & Disputes
          </Link>
          <Link href="/admin/fees" className="block hover:text-green-400 transition-colors">
            Fees
          </Link>
          <Link href="/admin/reports" className="block hover:text-green-400 transition-colors">
            Copyright Reports
          </Link>
          <Link href="/admin/settings" className="block hover:text-green-400 transition-colors">
            Settings
          </Link>
          <Link href="/" className="block text-red-400 hover:text-red-300 transition-colors">
            Exit Admin
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}


