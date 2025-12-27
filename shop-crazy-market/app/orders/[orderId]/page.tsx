"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export const dynamic = 'force-dynamic';

function OrderContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const orderId = params.orderId as string;
  const paid = searchParams.get("paid");
  const canceled = searchParams.get("canceled");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (orderId && user) {
      fetchOrder();
    }
  }, [orderId, user, authLoading, router]);

  async function fetchOrder() {
    try {
      const response = await fetch(`/api/orders/${orderId}?userId=${user?.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }
      const data = await response.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="p-6 max-w-2xl mx-auto pb-24">
        <div className="text-center py-10 text-gray-500">Loading order...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !order) {
    return (
      <main className="p-6 max-w-2xl mx-auto pb-24">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error || "Order not found"}</p>
          <Link href="/orders" className="text-purple-600 hover:underline">
            View All Orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-2xl mx-auto pb-24">
      {paid === "1" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-2">✅ Payment Successful!</h2>
          <p className="text-green-700">Your order has been confirmed and payment has been processed.</p>
        </div>
      )}

      {canceled === "1" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 text-center">
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">⚠️ Payment Canceled</h2>
          <p className="text-yellow-700">Your payment was canceled. You can try again or continue shopping.</p>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Order Details</h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
              <p className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-2xl text-purple-600">
                ${(order.orderTotalCents / 100).toFixed(2)}
              </p>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  order.paymentStatus === "paid"
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

          {order.listing && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Listing:</h3>
              <Link
                href={`/listings/${order.listing.id}`}
                className="text-purple-600 hover:underline"
              >
                {order.listing.title}
              </Link>
              {order.listing.digitalFiles && order.listing.digitalFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Digital Files:</h4>
                  <div className="space-y-2">
                    {order.listing.digitalFiles.map((fileUrl: string, index: number) => (
                      <a
                        key={index}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-purple-600 hover:underline"
                      >
                        📄 File {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Subtotal:</span>
              <span>${(order.itemsSubtotalCents / 100).toFixed(2)}</span>
            </div>
            {order.shippingCents > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span>Shipping:</span>
                <span>${(order.shippingCents / 100).toFixed(2)}</span>
              </div>
            )}
            {order.taxCents > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span>Tax:</span>
                <span>${(order.taxCents / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
              <span>Total:</span>
              <span>${(order.orderTotalCents / 100).toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href="/orders"
              className="flex-1 text-center bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              View All Orders
            </Link>
            <Link
              href="/marketplace"
              className="flex-1 text-center bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <main className="p-6 max-w-2xl mx-auto pb-24">
        <div className="text-center py-10 text-gray-500">Loading order...</div>
      </main>
    }>
      <OrderContent />
    </Suspense>
  );
}

