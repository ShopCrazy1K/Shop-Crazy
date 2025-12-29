"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface FeeSummary {
  totalListingFees: number;
  totalTransactionFees: number;
  totalPaymentProcessingFees: number;
  totalAdvertisingFees: number;
  totalFees: number;
  totalRevenue: number;
  netPayout: number;
}

interface RecentFee {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

function SellerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [recentFees, setRecentFees] = useState<RecentFee[]>([]);
  const [hasAdvertising, setHasAdvertising] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingAdvertising, setUpdatingAdvertising] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any>(null);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any>(null);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchShop();
  }, [user, router]);

  useEffect(() => {
    if (shopId) {
      fetchDashboardData();
      fetchPaymentMethods();
    }
  }, [shopId]);

  // Handle Stripe Connect redirects
  useEffect(() => {
    const success = searchParams?.get("success");
    const refresh = searchParams?.get("refresh");
    
    if (success === "true") {
      alert("✅ Payment method setup successful! Your bank account has been added.");
      fetchPaymentMethods(); // Refresh payment methods
      // Remove query param from URL
      router.replace("/seller/dashboard");
    } else if (refresh === "true") {
      fetchPaymentMethods(); // Refresh payment methods
      // Remove query param from URL
      router.replace("/seller/dashboard");
    }
  }, [searchParams, router]);

  async function fetchShop() {
    try {
      const response = await fetch(`/api/seller/shop?userId=${user?.id}`);
      if (response.ok) {
        const shop = await response.json();
        setShopId(shop.id);
      } else {
        const errorData = await response.json();
        console.error("Error fetching shop:", errorData);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching shop:", error);
      setLoading(false);
    }
  }

  async function fetchDashboardData() {
    if (!shopId) {
      setLoading(false);
      return;
    }
    
    try {
      // Fetch fee summary
      const summaryRes = await fetch(`/api/seller/fees?shopId=${shopId}`);
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setFeeSummary(summaryData);
      } else {
        const errorData = await summaryRes.json();
        console.error("Error fetching fee summary:", errorData);
      }

      // Fetch recent fees
      const feesRes = await fetch(`/api/seller/fees/recent?shopId=${shopId}`);
      if (feesRes.ok) {
        const feesData = await feesRes.json();
        setRecentFees(feesData.fees || []);
      } else {
        const errorData = await feesRes.json();
        console.error("Error fetching recent fees:", errorData);
      }

      // Fetch advertising status
      const advRes = await fetch(`/api/shops/${shopId}/advertising`);
      if (advRes.ok) {
        const advData = await advRes.json();
        setHasAdvertising(advData.hasAdvertising || false);
      } else {
        const errorData = await advRes.json();
        console.error("Error fetching advertising status:", errorData);
        setHasAdvertising(false);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPaymentMethods() {
    if (!user?.id) return;
    setLoadingPaymentMethods(true);
    try {
      const res = await fetch("/api/seller/payment-methods", {
        headers: { "x-user-id": user.id },
      });
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  }

  async function setupPaymentMethod() {
    if (!user?.id) return;
    try {
      const res = await fetch("/api/seller/payment-methods", {
        method: "POST",
        headers: { "x-user-id": user.id },
      });
      if (res.ok) {
        const data = await res.json();
        // Redirect to Stripe Connect onboarding
        window.location.href = data.url;
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to setup payment method");
      }
    } catch (error) {
      console.error("Error setting up payment method:", error);
      alert("Error setting up payment method");
    }
  }

  async function toggleAdvertising(enabled: boolean) {
    setUpdatingAdvertising(true);
    try {
      const res = await fetch(`/api/shops/${shopId}/advertising`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (res.ok) {
        setHasAdvertising(enabled);
        alert(
          enabled
            ? "Advertising enabled! Your products will have enhanced visibility."
            : "Advertising disabled."
        );
      } else {
        alert("Failed to update advertising setting");
      }
    } catch (error) {
      console.error("Error updating advertising:", error);
      alert("Error updating advertising setting");
    } finally {
      setUpdatingAdvertising(false);
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
      <main className="p-6">
        <div className="text-center text-gray-500 py-10">Loading...</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-accent text-4xl">Seller Dashboard</h1>
        <Link
          href="/seller/platforms"
          className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold"
        >
          Platform Integrations
        </Link>
      </div>

      {/* ADVERTISING TOGGLE */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-accent text-2xl mb-2">Advertising</h2>
            <p className="text-gray-600">
              Enable enhanced visibility for your products. A 15% advertising fee
              will be applied to sales.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hasAdvertising}
              onChange={(e) => toggleAdvertising(e.target.checked)}
              disabled={updatingAdvertising}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {hasAdvertising ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>
      </div>

      {/* FEE SUMMARY */}
      {feeSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(feeSummary.totalRevenue)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">Total Fees</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(feeSummary.totalFees)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">Net Payout</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(feeSummary.netPayout)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">This Month</p>
            <p className="text-2xl font-bold">
              {formatCurrency(feeSummary.totalFees)}
            </p>
          </div>
        </div>
      )}

      {/* FEE BREAKDOWN */}
      {feeSummary && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-accent text-2xl mb-4">Fee Breakdown</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Listing Fees</span>
              <span className="font-semibold">
                {formatCurrency(feeSummary.totalListingFees)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Transaction Fees (5%)</span>
              <span className="font-semibold">
                {formatCurrency(feeSummary.totalTransactionFees)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Processing</span>
              <span className="font-semibold">
                {formatCurrency(feeSummary.totalPaymentProcessingFees)}
              </span>
            </div>
            {feeSummary.totalAdvertisingFees > 0 && (
              <div className="flex justify-between">
                <span>Advertising Fees (15%)</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(feeSummary.totalAdvertisingFees)}
                </span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total Fees</span>
              <span>{formatCurrency(feeSummary.totalFees)}</span>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT METHODS FOR WITHDRAWALS */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-accent text-2xl mb-4">Payment Methods for Withdrawals</h2>
        {loadingPaymentMethods ? (
          <div className="text-center py-4 text-gray-500">Loading payment methods...</div>
        ) : paymentMethods?.hasStripeAccount ? (
          <div className="space-y-4">
            {paymentMethods.bankAccounts && paymentMethods.bankAccounts.length > 0 ? (
              <div>
                <h3 className="font-semibold text-lg mb-3">Bank Accounts</h3>
                <div className="space-y-2">
                  {paymentMethods.bankAccounts.map((account: any) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{account.bankName}</p>
                        <p className="text-sm text-gray-600">
                          •••• {account.last4} • {account.currency.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Status: {account.status === "verified" ? "✅ Verified" : "⏳ Pending"}
                        </p>
                      </div>
                      {account.defaultForCurrency && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={setupPaymentMethod}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Add Another Bank Account
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">No bank accounts added yet.</p>
                <button
                  onClick={setupPaymentMethod}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Add Bank Account for Withdrawals
                </button>
              </div>
            )}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Note:</strong> Your payouts will be sent to your default bank account. 
                You can add multiple accounts and set one as default in your Stripe dashboard.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Set up your payment method to receive payouts from your sales.
            </p>
            <button
              onClick={setupPaymentMethod}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Set Up Payment Method
            </button>
            <p className="text-xs text-gray-500 mt-3">
              You'll be redirected to Stripe to securely add your bank account information.
            </p>
          </div>
        )}
      </div>

      {/* QUICK LINKS */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-accent text-2xl mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/seller/platforms"
            className="bg-purple-100 hover:bg-purple-200 rounded-lg p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-1">🔗</div>
            <div className="font-semibold text-sm">Platforms</div>
          </Link>
          <Link
            href="/seller/strikes"
            className="bg-red-100 hover:bg-red-200 rounded-lg p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-1">⚠️</div>
            <div className="font-semibold text-sm">Strikes</div>
          </Link>
        </div>
      </div>

      {/* RECENT FEES */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-accent text-2xl mb-4">Recent Fees</h2>
        {recentFees.length === 0 ? (
          <p className="text-gray-500">No recent fees</p>
        ) : (
          <div className="space-y-2">
            {recentFees.map((fee) => (
              <div
                key={fee.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-semibold">{fee.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(fee.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-bold text-red-600">
                  -{formatCurrency(fee.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// Wrap in Suspense for useSearchParams
export default function SellerDashboardPage() {
  return (
    <Suspense fallback={
      <main className="p-6">
        <div className="text-center text-gray-500 py-10">Loading...</div>
      </main>
    }>
      <SellerDashboard />
    </Suspense>
  );
}

