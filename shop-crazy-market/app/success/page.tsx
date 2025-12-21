"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  items: OrderItem[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  async function fetchOrderDetails() {
    try {
      // Get order from session ID
      const response = await fetch(`/api/orders/by-session?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="p-6 text-center space-y-4 pb-24">
        <div className="text-gray-500">Loading order details...</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto text-center space-y-6 pb-24">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="font-accent text-4xl">Payment Successful!</h1>
      <p className="text-lg text-gray-600">Your order is being processed.</p>

      {order && (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6 text-left">
          <h2 className="font-semibold text-xl mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-3">
                <div className="flex-1">
                  <p className="font-semibold">{item.product.title}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  {item.product.type === "DIGITAL" && (
                    <a
                      href={`/download/${item.product.id}?orderId=${order.id}`}
                      className="text-sm text-purple-600 hover:underline mt-1 inline-block font-semibold"
                    >
                      📥 Download Files →
                    </a>
                  )}
                </div>
                <p className="font-semibold">
                  ${((item.price * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-bold text-lg">Total:</span>
            <span className="font-bold text-xl text-purple-600">
              ${(order.total / 100).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/orders"
          className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
        >
          View Order History
        </Link>
        <Link
          href="/marketplace"
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="p-6 text-center space-y-4 pb-24">
        <div className="text-gray-500">Loading...</div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
