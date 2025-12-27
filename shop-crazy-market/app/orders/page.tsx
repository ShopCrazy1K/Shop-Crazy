"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  paymentStatus: string;
  orderTotalCents: number;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    images: string[];
    digitalFiles: string[];
    seller: {
      username: string | null;
      email: string;
    };
  } | null;
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  async function fetchOrders() {
    try {
      const response = await fetch(`/api/orders?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="p-6 max-w-4xl mx-auto pb-24">
        <div className="text-center py-10 text-gray-500">Loading orders...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="p-6 max-w-4xl mx-auto pb-24">
      <h1 className="font-accent text-3xl mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-2xl mb-4">📦 No orders yet</p>
          <Link
            href="/marketplace"
            className="text-purple-600 font-bold hover:underline"
          >
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            if (!order.listing) return null;
            
            const hasDigitalFiles = order.listing.digitalFiles && 
              Array.isArray(order.listing.digitalFiles) && 
              order.listing.digitalFiles.length > 0;
            const isPaid = order.paymentStatus === "paid";
            const imagesValue = order.listing.images as any;
            const imageUrl = Array.isArray(imagesValue) && imagesValue.length > 0
              ? imagesValue[0]
              : typeof imagesValue === 'string' && imagesValue.trim()
                ? imagesValue
                : null;
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-purple-600">
                        ${(order.orderTotalCents / 100).toFixed(2)}
                      </p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          isPaid
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.paymentStatus?.toUpperCase() || "PENDING"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex gap-4">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={order.listing.title}
                          className="w-20 h-20 object-contain rounded-lg bg-gray-100"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          📦
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/listings/${order.listing.id}`}
                          className="font-semibold hover:text-purple-600 block truncate"
                        >
                          {order.listing.title}
                        </Link>
                        <p className="text-sm text-gray-600">
                          {order.listing.seller.username || order.listing.seller.email}
                        </p>
                        
                        {/* Prominent Download Link for Digital Products */}
                        {hasDigitalFiles && isPaid && (
                          <div className="mt-3">
                            <Link
                              href={`/orders/${order.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                            >
                              <span className="text-lg">💾</span>
                              <span>Download Files ({order.listing.digitalFiles.length})</span>
                              <span>→</span>
                            </Link>
                          </div>
                        )}
                        
                        {hasDigitalFiles && !isPaid && (
                          <div className="mt-3">
                            <p className="text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                              ⏳ Payment pending - download links will be available after payment confirmation
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* View Order Details Link */}
                    <div className="mt-4 pt-4 border-t">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                      >
                        View Order Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

