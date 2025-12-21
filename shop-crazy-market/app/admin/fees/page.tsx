"use client";

import { useState, useEffect } from "react";

interface FeeSummary {
  totalListingFees: number;
  totalTransactionFees: number;
  totalPaymentProcessingFees: number;
  totalAdvertisingFees: number;
  totalRevenue: number;
  period: string;
}

interface ShopFeeBreakdown {
  shopId: string;
  shopName: string;
  listingFees: number;
  transactionFees: number;
  paymentProcessingFees: number;
  advertisingFees: number;
  totalFees: number;
  productCount: number;
  hasAdvertising: boolean;
}

export default function FeesDashboard() {
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [shopBreakdown, setShopBreakdown] = useState<ShopFeeBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");

  useEffect(() => {
    async function fetchFees() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/fees?period=${selectedPeriod}`);
        if (response.ok) {
          const data = await response.json();
          setSummary(data.summary);
          setShopBreakdown(data.shopBreakdown);
        } else {
          console.error("Failed to fetch fees");
        }
      } catch (error) {
        console.error("Error fetching fees:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFees();
  }, [selectedPeriod]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-accent text-4xl">Fee Management</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border rounded-xl px-4 py-2"
        >
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="thisYear">This Year</option>
        </select>
      </div>

      {/* FEE SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Listing Fees</p>
          <p className="text-2xl font-bold">
            {summary ? formatCurrency(summary.totalListingFees) : "$0.00"}
          </p>
          <p className="text-xs text-gray-400 mt-1">$0.20 per product/month</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Transaction Fees</p>
          <p className="text-2xl font-bold">
            {summary ? formatCurrency(summary.totalTransactionFees) : "$0.00"}
          </p>
          <p className="text-xs text-gray-400 mt-1">5% of sale</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Payment Processing</p>
          <p className="text-2xl font-bold">
            {summary ? formatCurrency(summary.totalPaymentProcessingFees) : "$0.00"}
          </p>
          <p className="text-xs text-gray-400 mt-1">2% + $0.20</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Advertising Fees</p>
          <p className="text-2xl font-bold">
            {summary ? formatCurrency(summary.totalAdvertisingFees) : "$0.00"}
          </p>
          <p className="text-xs text-gray-400 mt-1">15% (optional)</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-2 border-purple-500">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-purple-600">
            {summary ? formatCurrency(summary.totalRevenue) : "$0.00"}
          </p>
          <p className="text-xs text-gray-400 mt-1">All fees combined</p>
        </div>
      </div>

      {/* SHOP BREAKDOWN */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-accent text-2xl mb-4">Fee Breakdown by Shop</h2>
        {shopBreakdown.length === 0 ? (
          <p className="text-gray-500">No fee data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left">Shop</th>
                  <th className="p-3 text-center">Products</th>
                  <th className="p-3 text-center">Listing</th>
                  <th className="p-3 text-center">Transaction</th>
                  <th className="p-3 text-center">Payment Proc.</th>
                  <th className="p-3 text-center">Advertising</th>
                  <th className="p-3 text-center font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {shopBreakdown.map((shop) => (
                  <tr key={shop.shopId} className="border-b">
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{shop.shopName}</p>
                        {shop.hasAdvertising && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            Advertising Enabled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">{shop.productCount}</td>
                    <td className="p-3 text-center">
                      {formatCurrency(shop.listingFees)}
                    </td>
                    <td className="p-3 text-center">
                      {formatCurrency(shop.transactionFees)}
                    </td>
                    <td className="p-3 text-center">
                      {formatCurrency(shop.paymentProcessingFees)}
                    </td>
                    <td className="p-3 text-center">
                      {shop.hasAdvertising ? (
                        formatCurrency(shop.advertisingFees)
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-bold">
                      {formatCurrency(shop.totalFees)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FEE STRUCTURE INFO */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-accent text-2xl mb-4">Fee Structure</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Listing Fees</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• $0.20 per product per month</li>
              <li>• Charged monthly on the 1st</li>
              <li>• Only for active products (quantity &gt; 0)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Transaction Fees</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 5% of total sale (item + shipping + gift wrap)</li>
              <li>• Charged per transaction</li>
              <li>• Deducted from seller payout</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Payment Processing</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• US: 2% + $0.20 per transaction</li>
              <li>• Varies by country</li>
              <li>• Covers Stripe processing costs</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Advertising Fees</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 15% of sale (optional)</li>
              <li>• Only for sellers who opt-in</li>
              <li>• Provides enhanced visibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

