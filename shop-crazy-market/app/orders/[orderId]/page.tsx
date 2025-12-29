"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

export const dynamic = 'force-dynamic';

function OrderContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { removeItem } = useCart();
  const orderId = params.orderId as string;
  const paid = searchParams.get("paid");
  const canceled = searchParams.get("canceled");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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

  async function checkPaymentStatus() {
    if (!user || !orderId) return;
    
    setCheckingPayment(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/check-payment?userId=${user.id}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to check payment status");
      }
      
      const data = await response.json();
      
      if (data.status === "paid" && data.order) {
        setOrder(data.order);
        alert("✅ Payment confirmed! Your download links are now available.");
      } else {
        alert(`Payment status: ${data.status}. ${data.message || "Please wait a moment and try again."}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message || "Failed to check payment status"}`);
    } finally {
      setCheckingPayment(false);
    }
  }

  async function cancelOrder() {
    if (!user || !orderId) return;
    
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "x-user-id": user.id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel order");
      }

      const data = await response.json();
      setOrder(data.order);
      alert("Order cancelled successfully!");
      router.push("/orders");
    } catch (err: any) {
      alert(`Error: ${err.message || "Failed to cancel order"}`);
    } finally {
      setCancelling(false);
    }
  }

  // Auto-check payment status if order is pending and we just came from checkout
  useEffect(() => {
    if (order && order.paymentStatus === "pending" && paid === "1" && user) {
      // Wait 3 seconds then check payment status automatically (give webhook time to process)
      const timer = setTimeout(() => {
        checkPaymentStatus();
      }, 3000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, paid, user]);

  // Remove items from cart when payment is confirmed
  useEffect(() => {
    if (order && order.paymentStatus === "paid" && user && order.listing) {
      // Remove the specific listing that was purchased from the cart
      // Items stay in cart until payment is confirmed
      const listingId = order.listing.id;
      removeItem(listingId);
      
      // Also check sessionStorage for pending items and clean up
      const pendingItems = sessionStorage.getItem("pendingCheckoutItems");
      const pendingOrderIds = sessionStorage.getItem("pendingOrderIds");
      
      if (pendingItems && pendingOrderIds) {
        try {
          const itemIds: string[] = JSON.parse(pendingItems);
          const orderIds: string[] = JSON.parse(pendingOrderIds);
          
          // Remove this order from pending list
          const updatedOrderIds = orderIds.filter(id => id !== order.id);
          const updatedItemIds = itemIds.filter(id => id !== listingId);
          
          if (updatedOrderIds.length === 0) {
            // All orders are paid, clear sessionStorage
            sessionStorage.removeItem("pendingCheckoutItems");
            sessionStorage.removeItem("pendingOrderIds");
          } else {
            // Update sessionStorage with remaining items
            sessionStorage.setItem("pendingOrderIds", JSON.stringify(updatedOrderIds));
            sessionStorage.setItem("pendingCheckoutItems", JSON.stringify(updatedItemIds));
          }
        } catch (e) {
          console.error("Error processing cart cleanup:", e);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.paymentStatus, order?.id, order?.listing?.id, user]);

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
      {paid === "1" && order?.paymentStatus === "paid" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-2">✅ Payment Successful!</h2>
          <p className="text-green-700">Your order has been confirmed and payment has been processed.</p>
        </div>
      )}

      {paid === "1" && order?.paymentStatus === "pending" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-800 mb-2">⏳ Verifying Payment...</h2>
          <p className="text-blue-700 mb-4">
            Your payment was successful! We're verifying it with our payment processor. 
            This usually takes just a few seconds.
          </p>
          <button
            onClick={checkPaymentStatus}
            disabled={checkingPayment}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkingPayment ? "Checking..." : "Check Payment Status Now"}
          </button>
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
                          : order.paymentStatus === "canceled"
                          ? "bg-red-100 text-red-800"
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
                className="text-purple-600 hover:underline font-semibold"
              >
                {order.listing.title}
              </Link>
              
              {/* Prominent Download Section for Digital Products */}
              {order.listing.digitalFiles && 
               Array.isArray(order.listing.digitalFiles) && 
               order.listing.digitalFiles.length > 0 && 
               order.paymentStatus === "paid" && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">💾</span>
                    <h4 className="font-bold text-lg text-purple-800">Your Digital Files</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Download your purchased files below. You can access these anytime from your order history.
                  </p>
                  <div className="space-y-2">
                    {order.listing.digitalFiles.map((fileUrl: string, index: number) => {
                      const fileName = fileUrl.split('/').pop() || `File ${index + 1}`;
                      const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(fileName);
                      const downloadUrl = `/api/download?url=${encodeURIComponent(fileUrl)}&listingId=${order.listing.id}${user ? `&userId=${user.id}` : ''}`;
                      return (
                        <a
                          key={index}
                          href={downloadUrl}
                          download={fileName}
                          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group cursor-pointer"
                        >
                          <span className="text-2xl">{isImage ? '🖼️' : '📄'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-purple-700 group-hover:text-purple-900 truncate">
                              {fileName}
                            </p>
                            <p className="text-xs text-gray-500">Click to download to your device</p>
                          </div>
                          <span className="text-purple-600 group-hover:translate-x-1 transition-transform">
                            ⬇️
                          </span>
                        </a>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-purple-200">
                    💡 Tip: Save these files to your device. You can always access them from your order history.
                  </p>
                </div>
              )}
              
              {/* Show message if order is not paid yet but has digital files */}
              {order.listing.digitalFiles && 
               Array.isArray(order.listing.digitalFiles) && 
               order.listing.digitalFiles.length > 0 && 
               order.paymentStatus !== "paid" && (
                <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  <p className="text-sm text-yellow-800 font-semibold mb-3">
                    ⏳ Download links will be available after payment is confirmed.
                  </p>
                  {order.paymentStatus === "pending" && (
                    <button
                      onClick={checkPaymentStatus}
                      disabled={checkingPayment}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {checkingPayment ? "Checking Payment..." : "Check Payment Status"}
                    </button>
                  )}
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

