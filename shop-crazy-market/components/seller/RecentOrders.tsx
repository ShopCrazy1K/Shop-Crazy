"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Order {
  id: string;
  orderTotalCents: number;
  sellerPayoutCents: number;
  paymentStatus: string;
  shippingStatus: string | null;
  trackingNumber: string | null;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    images: string[];
  };
  user: {
    id: string;
    username: string | null;
    email: string;
  } | null;
}

interface Props {
  userId: string;
}

export default function RecentOrders({ userId }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const response = await fetch("/api/seller/orders", {
        headers: { "x-user-id": userId },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="text-center py-8 text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-accent text-2xl">Recent Orders</h2>
        <Link
          href="/orders"
          className="text-purple-600 hover:underline font-semibold"
        >
          View All Orders →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-semibold text-purple-600 hover:underline"
                  >
                    Order #{order.id.slice(0, 8)}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.listing.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Customer: {order.user?.username || order.user?.email || "Guest"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {formatCurrency(order.sellerPayoutCents)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(order.orderTotalCents)} total
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.paymentStatus}
                </span>
                {order.shippingStatus && (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                    {order.shippingStatus}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
