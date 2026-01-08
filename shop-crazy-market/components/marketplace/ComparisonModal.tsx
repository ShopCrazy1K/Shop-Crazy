"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedImage from "@/components/ProtectedImage";

interface Listing {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  images: string[];
  category: string | null;
  seller: {
    id: string;
    username: string | null;
    email: string;
  };
  deals?: any[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function ComparisonModal({ isOpen, onClose, userId }: Props) {
  const [comparisons, setComparisons] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchComparisons();
    }
  }, [isOpen, userId]);

  async function fetchComparisons() {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await fetch("/api/listings/compare", {
        headers: { "x-user-id": userId },
      });
      if (response.ok) {
        const data = await response.json();
        setComparisons(data.comparisons?.map((c: any) => c.listing) || []);
      }
    } catch (error) {
      console.error("Error fetching comparisons:", error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromComparison(listingId: string) {
    if (!userId) return;
    try {
      const response = await fetch(`/api/listings/compare?listingId=${listingId}`, {
        method: "DELETE",
        headers: { "x-user-id": userId },
      });
      if (response.ok) {
        fetchComparisons();
      }
    } catch (error) {
      console.error("Error removing from comparison:", error);
    }
  }

  if (!isOpen) return null;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Compare Products</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : comparisons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No products in comparison</p>
              <p className="text-sm">Add products to compare by clicking the compare button</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Product</th>
                    {comparisons.map((listing) => (
                      <th key={listing.id} className="text-left p-4 min-w-[250px]">
                        <button
                          onClick={() => removeFromComparison(listing.id)}
                          className="float-right text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Images */}
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Image</td>
                    {comparisons.map((listing) => (
                      <td key={listing.id} className="p-4">
                        <Link href={`/listings/${listing.id}`}>
                          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            {listing.images?.[0] ? (
                              <ProtectedImage
                                src={listing.images[0]}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                📦
                              </div>
                            )}
                          </div>
                        </Link>
                      </td>
                    ))}
                  </tr>

                  {/* Title */}
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Title</td>
                    {comparisons.map((listing) => (
                      <td key={listing.id} className="p-4">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="font-semibold text-purple-600 hover:underline"
                        >
                          {listing.title}
                        </Link>
                      </td>
                    ))}
                  </tr>

                  {/* Price */}
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Price</td>
                    {comparisons.map((listing) => (
                      <td key={listing.id} className="p-4">
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(listing.priceCents)}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* Seller */}
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Seller</td>
                    {comparisons.map((listing) => (
                      <td key={listing.id} className="p-4">
                        <Link
                          href={`/shop/${listing.seller.id}`}
                          className="text-purple-600 hover:underline"
                        >
                          {listing.seller.username || listing.seller.email}
                        </Link>
                      </td>
                    ))}
                  </tr>

                  {/* Category */}
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Category</td>
                    {comparisons.map((listing) => (
                      <td key={listing.id} className="p-4">
                        {listing.category || "Uncategorized"}
                      </td>
                    ))}
                  </tr>

                  {/* Description */}
                  <tr className="border-b">
                    <td className="p-4 font-semibold">Description</td>
                    {comparisons.map((listing) => (
                      <td key={listing.id} className="p-4">
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {listing.description}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* Actions */}
                  <tr>
                    <td className="p-4"></td>
                    {comparisons.map((listing) => (
                      <td key={listing.id} className="p-4">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
