"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { buildTrackingUrl, formatStatus, type Carrier } from "@/lib/tracking";

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
  const [editingTracking, setEditingTracking] = useState(false);
  const [trackingCarrier, setTrackingCarrier] = useState<Carrier | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingStatus, setShippingStatus] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundType, setRefundType] = useState<"CREDIT" | "CASH">("CREDIT");
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(0);
  const [requestingRefund, setRequestingRefund] = useState(false);
  const [partialRefundAmount, setPartialRefundAmount] = useState("");

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
      // Set tracking fields for editing
      if (data.trackingCarrier) setTrackingCarrier(data.trackingCarrier as Carrier);
      if (data.trackingNumber) setTrackingNumber(data.trackingNumber);
      if (data.shippingStatus) setShippingStatus(data.shippingStatus);
      // Calculate refundable amount
      if (data.orderTotalCents && data.storeCreditUsedCents !== undefined) {
        const refundable = data.orderTotalCents - (data.storeCreditUsedCents || 0);
        setRefundAmount(refundable);
        setPartialRefundAmount((refundable / 100).toFixed(2));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }

  async function requestRefund() {
    if (!user || !order) return;

    // Check refund eligibility (30 day window)
    const orderDate = new Date(order.createdAt);
    const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceOrder > 30) {
      alert("Refund requests must be made within 30 days of purchase.");
      return;
    }

    // Calculate refund amount (allow partial)
    const requestedAmount = partialRefundAmount 
      ? Math.round(parseFloat(partialRefundAmount) * 100)
      : refundAmount;

    if (requestedAmount <= 0 || requestedAmount > refundAmount) {
      alert("Invalid refund amount. Please enter a valid amount.");
      return;
    }

    setRequestingRefund(true);
    try {
      const response = await fetch("/api/refunds/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          userId: user.id,
          type: refundType,
          reason: refundReason,
          amount: requestedAmount, // For partial refunds
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to request refund");
      }

      alert(data.message || "Refund requested successfully!");
      setShowRefundModal(false);
      setRefundReason("");
      fetchOrder(); // Refresh order to show updated status
    } catch (err: any) {
      alert(`Error: ${err.message || "Failed to request refund"}`);
    } finally {
      setRequestingRefund(false);
    }
  }

  async function saveTracking() {
    if (!user || !orderId) return;

    setSavingTracking(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          carrier: trackingCarrier || null,
          trackingNumber: trackingNumber || null,
          shippingStatus: shippingStatus || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update tracking");
      }

      const data = await response.json();
      setOrder(data.order);
      setEditingTracking(false);
      alert("Tracking information updated successfully!");
    } catch (err: any) {
      alert(`Error: ${err.message || "Failed to update tracking"}`);
    } finally {
      setSavingTracking(false);
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
      if (data.deleted) {
        alert("Order cancelled and removed successfully!");
        router.push("/orders");
      } else {
        setOrder(data.order);
        alert("Order cancelled successfully!");
        router.push("/orders");
      }
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

            {order && order.paymentStatus === "canceled" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 text-center">
                <h2 className="text-2xl font-bold text-red-800 mb-2">❌ Order Canceled</h2>
                <p className="text-red-700">This order has been canceled.</p>
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

          {/* Refund Status Display */}
          {order.refundStatus && order.refundStatus !== "NONE" && (
            <div className={`mt-4 p-4 rounded-lg border-2 ${
              order.refundStatus === "COMPLETED" 
                ? "bg-green-50 border-green-300"
                : order.refundStatus === "REJECTED"
                ? "bg-red-50 border-red-300"
                : order.refundStatus === "REQUESTED"
                ? "bg-yellow-50 border-yellow-300"
                : "bg-blue-50 border-blue-300"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    Refund Status: {order.refundStatus}
                  </p>
                  {order.refundType && (
                    <p className="text-sm text-gray-600 mt-1">
                      Type: {order.refundType === "CREDIT" ? "Store Credit" : "Cash Refund"}
                    </p>
                  )}
                  {order.refundAmount > 0 && (
                    <p className="text-sm text-gray-600">
                      Amount: ${(order.refundAmount / 100).toFixed(2)}
                    </p>
                  )}
                  {order.refundReason && (
                    <p className="text-sm text-gray-600 mt-1">
                      Reason: {order.refundReason}
                    </p>
                  )}
                  {order.refundedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Processed: {new Date(order.refundedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className="text-2xl">
                  {order.refundStatus === "COMPLETED" ? "✅" : 
                   order.refundStatus === "REJECTED" ? "❌" : 
                   order.refundStatus === "REQUESTED" ? "⏳" : "🔄"}
                </span>
              </div>
            </div>
          )}

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

          {/* Shipping Address - Only visible to seller */}
          {order.paymentStatus === "paid" && user?.id === order.sellerId && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">📦 Shipping Address</h3>
              {order.shippingName || order.shippingAddressLine1 ? (
                <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                  {order.shippingName && (
                    <p className="font-semibold text-gray-900">{order.shippingName}</p>
                  )}
                  {order.shippingAddressLine1 && (
                    <p className="text-gray-700">{order.shippingAddressLine1}</p>
                  )}
                  {order.shippingAddressLine2 && (
                    <p className="text-gray-700">{order.shippingAddressLine2}</p>
                  )}
                  <p className="text-gray-700">
                    {[
                      order.shippingCity,
                      order.shippingState,
                      order.shippingPostalCode,
                    ].filter(Boolean).join(", ")}
                  </p>
                  {order.shippingCountry && (
                    <p className="text-gray-700 font-semibold mt-1">
                      {order.shippingCountry.toUpperCase()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Shipping address not provided. Please contact the buyer for shipping information.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tracking Information */}
          {order.paymentStatus === "paid" && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Shipping & Tracking</h3>
              
              {user?.id === order.sellerId ? (
                // Seller can edit tracking
                <div className="space-y-3">
                  {!editingTracking ? (
                    <>
                      {order.trackingNumber ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Carrier:</strong> {order.trackingCarrier || "Not specified"}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Tracking #:</strong> {order.trackingNumber}
                              </p>
                              {order.shippingStatus && (
                                <p className="text-sm text-gray-600">
                                  <strong>Status:</strong> {formatStatus(order.shippingStatus)}
                                </p>
                              )}
                              {order.trackingCarrier && order.trackingNumber && (
                                <a
                                  href={buildTrackingUrl(order.trackingCarrier as Carrier, order.trackingNumber)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                                >
                                  📦 Track Package
                                </a>
                              )}
                            </div>
                            <button
                              onClick={() => setEditingTracking(true)}
                              className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">No tracking information added yet.</p>
                          <button
                            onClick={() => setEditingTracking(true)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                          >
                            Add Tracking Information
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Shipping Status</label>
                        <select
                          value={shippingStatus}
                          onChange={(e) => setShippingStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Select status</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Carrier</label>
                        <select
                          value={trackingCarrier}
                          onChange={(e) => setTrackingCarrier(e.target.value as Carrier)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Select carrier</option>
                          <option value="USPS">USPS</option>
                          <option value="UPS">UPS</option>
                          <option value="FedEx">FedEx</option>
                          <option value="DHL">DHL</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tracking Number</label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Enter tracking number"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={saveTracking}
                          disabled={savingTracking}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50"
                        >
                          {savingTracking ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingTracking(false);
                            // Reset to original values
                            if (order.trackingCarrier) setTrackingCarrier(order.trackingCarrier as Carrier);
                            if (order.trackingNumber) setTrackingNumber(order.trackingNumber);
                            if (order.shippingStatus) setShippingStatus(order.shippingStatus);
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Buyer can view tracking
                order.trackingNumber ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Carrier:</strong> {order.trackingCarrier || "Not specified"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Tracking #:</strong> {order.trackingNumber}
                    </p>
                    {order.shippingStatus && (
                      <p className="text-sm text-gray-600">
                        <strong>Status:</strong> {formatStatus(order.shippingStatus)}
                      </p>
                    )}
                    {order.trackingCarrier && order.trackingNumber && (
                      <a
                        href={buildTrackingUrl(order.trackingCarrier as Carrier, order.trackingNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                      >
                        📦 Track Package
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Tracking information will be added by the seller once your order ships.</p>
                )
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

          {/* Refund Request Button (for buyers only, paid orders, within 30 days, no existing refund) */}
          {user?.id === order.userId && 
           order.paymentStatus === "paid" && 
           order.refundStatus === "NONE" &&
           (() => {
             const orderDate = new Date(order.createdAt);
             const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
             return daysSinceOrder <= 30;
           })() && (
            <div className="mt-6 border-t pt-4">
              <button
                onClick={() => setShowRefundModal(true)}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                💰 Request Refund
              </button>
            </div>
          )}

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

      {/* Refund Request Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Request Refund</h2>
            
            <div className="space-y-4">
              {/* Refund Type Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2">Refund Type</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="refundType"
                      value="CREDIT"
                      checked={refundType === "CREDIT"}
                      onChange={(e) => setRefundType(e.target.value as "CREDIT" | "CASH")}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">💳 Store Credit (Instant)</div>
                      <div className="text-xs text-gray-600">Get refunded immediately as store credit</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="refundType"
                      value="CASH"
                      checked={refundType === "CASH"}
                      onChange={(e) => setRefundType(e.target.value as "CREDIT" | "CASH")}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">💵 Cash Refund</div>
                      <div className="text-xs text-gray-600">Refund to original payment method (3-5 business days)</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Partial Refund Amount */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Refund Amount (Max: ${(refundAmount / 100).toFixed(2)})
                </label>
                <input
                  type="number"
                  min="0"
                  max={refundAmount / 100}
                  step="0.01"
                  value={partialRefundAmount}
                  onChange={(e) => setPartialRefundAmount(e.target.value)}
                  placeholder={`${(refundAmount / 100).toFixed(2)}`}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for full refund, or enter a partial amount
                </p>
              </div>

              {/* Refund Reason */}
              <div>
                <label className="block text-sm font-semibold mb-2">Reason for Refund</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Please explain why you're requesting a refund..."
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundReason("");
                    setPartialRefundAmount((refundAmount / 100).toFixed(2));
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={requestRefund}
                  disabled={requestingRefund || !refundReason.trim()}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requestingRefund ? "Requesting..." : "Request Refund"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

