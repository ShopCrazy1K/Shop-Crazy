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
          router.push("/login");
          return;
        }

        try {
          const response = await fetch(`/api/admin/check?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.isAdmin) {
              setIsAdmin(true);
            } else {
              router.push("/");
            }
          } else {
            router.push("/");
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          router.push("/");
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
    return null;
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


