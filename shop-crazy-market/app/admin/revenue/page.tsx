"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface RevenueData {
  totalRevenue: number;
  thisMonthRevenue: number;
  avgOrderValue: number;
  platformFees: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  zoneRevenue: Array<{ zone: string; amount: number }>;
  recentTransactions: Array<{
    id: string;
    user: string;
    total: number;
    zone: string;
  }>;
}

export default function RevenueDashboard() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        const response = await fetch("/api/admin/revenue");
        if (response.ok) {
          const revenueData = await response.json();
          setData(revenueData);
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-10">
        <h1 className="font-accent text-4xl">Revenue Dashboard</h1>
        <div className="text-center text-gray-500 py-10">Loading revenue data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-10">
        <h1 className="font-accent text-4xl">Revenue Dashboard</h1>
        <div className="text-center text-gray-500 py-10">Failed to load revenue data</div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-10">
      <h1 className="font-accent text-4xl">Revenue Dashboard</h1>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Stat label="Total Revenue" value={formatCurrency(data.totalRevenue)} />
        <Stat label="This Month" value={formatCurrency(data.thisMonthRevenue)} />
        <Stat label="Avg Order Value" value={formatCurrency(data.avgOrderValue)} />
        <Stat label="Platform Fees" value={formatCurrency(data.platformFees)} />
      </div>

      {/* REVENUE CHART */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-accent text-2xl mb-4">Monthly Revenue</h2>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: "#000" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{ fill: "#7c3aed", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* REVENUE BY ZONE */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-accent text-2xl mb-4">Revenue by Zone</h2>

        <div className="space-y-3">
          {data.zoneRevenue.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No revenue data by zone</p>
          ) : (
            data.zoneRevenue.map((z) => (
              <div
                key={z.zone}
                className="flex justify-between border-b pb-2"
              >
                <span>{z.zone}</span>
                <strong>{formatCurrency(z.amount)}</strong>
              </div>
            ))
          )}
        </div>
      </div>

      {/* TRANSACTIONS */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-accent text-2xl mb-4">Recent Transactions</h2>

        {data.recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent transactions</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Transaction</th>
                <th className="p-2">User</th>
                <th className="p-2">Zone</th>
                <th className="p-2">Amount</th>
              </tr>
            </thead>

            <tbody>
              {data.recentTransactions.map((t) => (
                <tr key={t.id} className="border-b text-center">
                  <td className="p-2 text-left font-mono text-sm">{t.id}...</td>
                  <td className="p-2">{t.user}</td>
                  <td className="p-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {t.zone.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-2 font-bold">{formatCurrency(t.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <p className="text-gray-500">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

