"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    images: string[];
    type: string;
    shop: {
      name: string;
    };
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
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
          {orders.map((order) => (
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
                    <p className="font-bold text-xl">${(order.total / 100).toFixed(2)}</p>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        order.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <Link
                          href={`/product/${item.product.id}`}
                          className="font-semibold hover:text-purple-600"
                        >
                          {item.product.title}
                        </Link>
                        <p className="text-sm text-gray-600">
                          {item.product.shop.name} • Qty: {item.quantity}
                        </p>
                        {item.product.type === "DIGITAL" && (
                          <div className="mt-2">
                            <a
                              href={`/download/${item.product.id}?orderId=${order.id}`}
                              className="text-sm text-purple-600 hover:underline inline-block font-semibold"
                            >
                              📥 Download Files →
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${((item.price * item.quantity) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

