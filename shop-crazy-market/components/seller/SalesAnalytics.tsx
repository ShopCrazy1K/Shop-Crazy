"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  period: number;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalFees: number;
    activeListings: number;
    totalListings: number;
  };
  trends: {
    dailyRevenue: { date: string; revenue: number; orders: number }[];
  };
  topListings: { id: string; title: string; revenue: number; orders: number }[];
  categorySales: { category: string; revenue: number; orders: number }[];
  listingsWithViews: {
    id: string;
    title: string;
    views: number;
    sales: number;
    revenue: number;
  }[];
  conversionData: {
    listingId: string;
    title: string;
    views: number;
    sales: number;
    conversionRate: number;
  }[];
  customerMetrics: {
    uniqueCustomers: number;
    repeatCustomers: number;
    repeatCustomerRate: number;
    recentCustomers: any[];
  };
}

interface Props {
  shopId: string;
  userId: string;
}

export default function SalesAnalytics({ shopId, userId }: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [shopId, period]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/seller/analytics?shopId=${shopId}&period=${period}`,
        {
          headers: { "x-user-id": userId },
        }
      );
      if (response.ok) {
        const analytics = await response.json();
        setData(analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
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
        <div className="text-center py-8 text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-accent text-2xl">Sales Analytics</h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-semibold"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(data.summary.totalRevenue)}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-blue-600">{data.summary.totalOrders}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(data.summary.averageOrderValue)}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Active Listings</p>
            <p className="text-2xl font-bold text-orange-600">
              {data.summary.activeListings}
            </p>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Revenue Trend</h3>
          <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-end justify-between gap-1">
            {data.trends.dailyRevenue.map((day, idx) => {
              const maxRevenue = Math.max(
                ...data.trends.dailyRevenue.map((d) => d.revenue)
              );
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-purple-600 rounded-t hover:bg-purple-700 transition-colors relative group"
                    style={{ height: `${height}%`, minHeight: height > 0 ? "4px" : "0" }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {formatCurrency(day.revenue)}
                      <br />
                      {day.orders} orders
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Listings */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Top Performing Listings</h3>
          <div className="space-y-2">
            {data.topListings.slice(0, 5).map((listing) => (
              <div
                key={listing.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm">{listing.title}</p>
                  <p className="text-xs text-gray-500">
                    {listing.orders} orders
                  </p>
                </div>
                <p className="font-bold text-green-600">
                  {formatCurrency(listing.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Sales */}
        {data.categorySales.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">Sales by Category</h3>
            <div className="space-y-2">
              {data.categorySales.map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-semibold">{cat.category || "Uncategorized"}</span>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(cat.revenue)}</p>
                    <p className="text-xs text-gray-500">{cat.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversion Rates */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Conversion Rates</h3>
          <div className="space-y-2">
            {data.conversionData.slice(0, 5).map((item) => (
              <div
                key={item.listingId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    {item.views} views, {item.sales} sales
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      item.conversionRate >= 5
                        ? "text-green-600"
                        : item.conversionRate >= 2
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.conversionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-accent text-2xl mb-4">Customer Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Unique Customers</p>
            <p className="text-2xl font-bold text-blue-600">
              {data.customerMetrics.uniqueCustomers}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Repeat Customers</p>
            <p className="text-2xl font-bold text-green-600">
              {data.customerMetrics.repeatCustomers}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Repeat Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {data.customerMetrics.repeatCustomerRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
