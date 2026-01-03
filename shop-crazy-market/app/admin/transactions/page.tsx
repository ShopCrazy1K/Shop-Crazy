"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Transaction {
  id: string;
  orderTotalCents: number;
  currency: string;
  paymentStatus: string;
  createdAt: string;
  buyerEmail: string | null;
  seller: {
    id: string;
    email: string;
    username: string | null;
  };
  listing: {
    id: string;
    title: string;
  } | null;
}

export default function AdminTransactionsPage() {
  const { user: currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/transactions", {
        headers: {
          "x-user-id": currentUser?.id || "",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.buyerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.listing?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || tx.paymentStatus === filterStatus;
    
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = matchesDate && new Date(tx.createdAt) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      matchesDate = matchesDate && new Date(tx.createdAt) <= new Date(dateRange.end);
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalRevenue = filteredTransactions
    .filter((tx) => tx.paymentStatus === "paid")
    .reduce((sum, tx) => sum + tx.orderTotalCents, 0);

  if (loading) {
    return <div className="text-center py-10">Loading transactions...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transaction Log</h1>
        <div className="text-sm text-gray-600">
          Total Revenue: ${(totalRevenue / 100).toFixed(2)}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
          <input
            type="date"
            placeholder="Start Date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="date"
            placeholder="End Date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/orders/${tx.id}`}
                      className="text-sm font-medium text-purple-600 hover:text-purple-800"
                    >
                      {tx.id.substring(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {tx.listing ? (
                      <Link
                        href={`/listings/${tx.listing.id}`}
                        className="text-sm text-gray-900 hover:text-purple-600"
                      >
                        {tx.listing.title}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.buyerEmail || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/shop/${tx.seller.id}`}
                      className="text-sm text-gray-600 hover:text-purple-600"
                    >
                      {tx.seller.username || tx.seller.email}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${(tx.orderTotalCents / 100).toFixed(2)} {tx.currency.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        tx.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : tx.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tx.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/orders/${tx.id}`}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-10 text-gray-500">No transactions found</div>
        )}
      </div>
    </div>
  );
}

