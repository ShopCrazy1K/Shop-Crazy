"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface PlatformConnection {
  id: string;
  platform: string;
  storeName: string | null;
  storeUrl: string | null;
  syncEnabled: boolean;
  createdAt: string;
  _count: {
    products: number;
  };
}

export default function PlatformsPage() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<"SHOPIFY" | "PRINTIFY" | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchShop();
  }, [user, router]);

  useEffect(() => {
    if (shopId) {
      fetchConnections();
    }
  }, [shopId]);

  async function fetchShop() {
    try {
      const response = await fetch(`/api/seller/shop?userId=${user?.id}`);
      if (response.ok) {
        const shop = await response.json();
        setShopId(shop.id);
      }
    } catch (error) {
      console.error("Error fetching shop:", error);
      setLoading(false);
    }
  }

  async function fetchConnections() {
    if (!shopId) return;
    
    try {
      const res = await fetch(`/api/platforms/connect?shopId=${shopId}`);
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  }

  async function syncProducts(platformId: string) {
    setSyncing(platformId);
    try {
      const res = await fetch(`/api/platforms/${platformId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zone: "SHOP_4_US" }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Sync complete! ${data.message}`);
        fetchConnections();
      } else {
        alert("Sync failed. Please try again.");
      }
    } catch (error) {
      console.error("Error syncing products:", error);
      alert("Error syncing products");
    } finally {
      setSyncing(null);
    }
  }

  async function disconnectPlatform(platformId: string) {
    if (!confirm("Are you sure you want to disconnect this platform?")) return;

    try {
      const res = await fetch(`/api/platforms/${platformId}/disconnect`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Platform disconnected successfully");
        fetchConnections();
      } else {
        alert("Failed to disconnect platform");
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
      alert("Error disconnecting platform");
    }
  }

  async function connectPlatform(platform: "SHOPIFY" | "PRINTIFY", accessToken: string, storeName: string) {
    if (!shopId) {
      alert("Shop not found");
      return;
    }
    
    try {
      const res = await fetch("/api/platforms/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId,
          platform,
          accessToken,
          storeName,
        }),
      });

      if (res.ok) {
        alert("Platform connected successfully!");
        setShowConnectModal(false);
        fetchConnections();
      } else {
        alert("Failed to connect platform");
      }
    } catch (error) {
      console.error("Error connecting platform:", error);
      alert("Error connecting platform");
    }
  }

  if (loading) {
    return (
      <main className="p-6">
        <div className="text-center text-gray-500 py-10">Loading...</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-accent text-4xl">Platform Integrations</h1>
        <button
          onClick={() => setShowConnectModal(true)}
          className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold"
        >
          + Connect Platform
        </button>
      </div>

      <p className="text-gray-600">
        Connect your Shopify or Printify store to sync products automatically.
      </p>

      {/* CONNECTED PLATFORMS */}
      <div className="space-y-4">
        {connections.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            <p className="text-lg mb-2">No platforms connected</p>
            <p className="text-sm">Connect Shopify or Printify to get started</p>
          </div>
        ) : (
          connections.map((conn) => (
            <div key={conn.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {conn.platform === "SHOPIFY" ? "🛍️" : "🖨️"}
                    </span>
                    <h2 className="font-accent text-2xl">
                      {conn.platform === "SHOPIFY" ? "Shopify" : "Printify"}
                    </h2>
                    {conn.syncEnabled && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Syncing
                      </span>
                    )}
                  </div>
                  {conn.storeName && (
                    <p className="text-gray-600">{conn.storeName}</p>
                  )}
                  {conn.storeUrl && (
                    <a
                      href={conn.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:underline"
                    >
                      {conn.storeUrl}
                    </a>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {conn._count.products} products synced
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => syncProducts(conn.id)}
                    disabled={syncing === conn.id}
                    className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    {syncing === conn.id ? "Syncing..." : "Sync Now"}
                  </button>
                  <button
                    onClick={() => disconnectPlatform(conn.id)}
                    className="border border-red-600 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CONNECT MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="font-accent text-2xl mb-4">Connect Platform</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Platform
                </label>
                <select
                  value={selectedPlatform || ""}
                  onChange={(e) =>
                    setSelectedPlatform(e.target.value as "SHOPIFY" | "PRINTIFY")
                  }
                  className="w-full border rounded-xl px-4 py-2"
                >
                  <option value="">Select platform</option>
                  <option value="SHOPIFY">Shopify</option>
                  <option value="PRINTIFY">Printify</option>
                </select>
              </div>
              {selectedPlatform && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {selectedPlatform === "SHOPIFY"
                        ? "Store Name"
                        : "Shop ID"}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        selectedPlatform === "SHOPIFY"
                          ? "your-store"
                          : "Shop ID"
                      }
                      className="w-full border rounded-xl px-4 py-2"
                      id="storeName"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Access Token
                    </label>
                    <input
                      type="password"
                      placeholder="Enter access token"
                      className="w-full border rounded-xl px-4 py-2"
                      id="accessToken"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        const storeName = (
                          document.getElementById("storeName") as HTMLInputElement
                        ).value;
                        const accessToken = (
                          document.getElementById("accessToken") as HTMLInputElement
                        ).value;
                        if (storeName && accessToken && selectedPlatform) {
                          connectPlatform(selectedPlatform, accessToken, storeName);
                        }
                      }}
                      className="flex-1 bg-purple-600 text-white py-2 rounded-xl font-bold"
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => setShowConnectModal(false)}
                      className="flex-1 border border-gray-300 py-2 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PLATFORM INFO */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-accent text-2xl mb-4">Supported Platforms</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">🛍️ Shopify</h3>
            <p className="text-sm text-gray-600 mb-2">
              Sync products from your Shopify store automatically.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Automatic inventory sync</li>
              <li>• Price updates</li>
              <li>• Product images</li>
            </ul>
            <a
              href="https://shopify.dev/docs/apps/auth/oauth/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:underline mt-2 inline-block"
            >
              Get Shopify API token →
            </a>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">🖨️ Printify</h3>
            <p className="text-sm text-gray-600 mb-2">
              Connect your Printify print-on-demand products.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Print-on-demand products</li>
              <li>• Automatic fulfillment</li>
              <li>• Product catalog sync</li>
            </ul>
            <a
              href="https://developers.printify.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:underline mt-2 inline-block"
            >
              Get Printify API token →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

