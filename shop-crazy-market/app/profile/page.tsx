"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";

// Helper function to safely parse images
function parseImages(images: string | string[] | null | undefined): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    // Check if it's a JSON string
    if (images.trim().startsWith('[') || images.trim().startsWith('{')) {
      try {
        return JSON.parse(images);
      } catch {
        // If parsing fails, treat as single image path
        return [images];
      }
    }
    // If it's a plain string path, return as array
    return [images];
  }
  return [];
}

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    orders: 0,
    favorites: 0,
    listings: 0,
    messages: 0,
  });
  const [myListings, setMyListings] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [about, setAbout] = useState<string>("");
  const [editingAbout, setEditingAbout] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const [shopPolicies, setShopPolicies] = useState<any>(null);
  const [editingPolicies, setEditingPolicies] = useState(false);
  const [savingPolicies, setSavingPolicies] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchStats();
      fetchMyListings();
      fetchAbout();
      fetchShopPolicies();
    }
  }, [user, loading, router]);

  async function fetchAbout() {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/users/${user.id}/about`);
      if (response.ok) {
        const data = await response.json();
        setAbout(data.about || "");
      }
    } catch (error) {
      console.error("Error fetching about:", error);
    }
  }

  async function fetchShopPolicies() {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/users/${user.id}/policies`);
      if (response.ok) {
        const data = await response.json();
        setShopPolicies(data);
      }
    } catch (error) {
      console.error("Error fetching shop policies:", error);
    }
  }

  async function saveShopPolicies() {
    if (!user?.id) return;
    setSavingPolicies(true);
    try {
      const response = await fetch(`/api/users/${user.id}/policies`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify(shopPolicies),
      });
      if (response.ok) {
        setEditingPolicies(false);
        alert("Shop policies updated successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update shop policies");
      }
    } catch (error) {
      console.error("Error saving shop policies:", error);
      alert("Failed to save shop policies");
    } finally {
      setSavingPolicies(false);
    }
  }

  async function saveAbout() {
    if (!user?.id) return;
    setSavingAbout(true);
    try {
      const response = await fetch(`/api/users/${user.id}/about`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ about }),
      });
      if (response.ok) {
        setEditingAbout(false);
        alert("About section updated successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update about section");
      }
    } catch (error) {
      console.error("Error saving about:", error);
      alert("Failed to save about section");
    } finally {
      setSavingAbout(false);
    }
  }

  async function fetchStats() {
    try {
      // Fetch orders count
      const ordersRes = await fetch(`/api/orders?userId=${user?.id}`);
      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        setStats((prev) => ({ ...prev, orders: orders.length }));
      }

      // Fetch favorites count
      const favsRes = await fetch(`/api/favorites?userId=${user?.id}`);
      if (favsRes.ok) {
        const favorites = await favsRes.json();
        setStats((prev) => ({ ...prev, favorites: favorites.length }));
      }

      // Fetch listings count (both Listing and Product models)
      const [listingsRes, productsRes] = await Promise.all([
        fetch(`/api/listings/my-listings?userId=${user?.id}`),
        fetch(`/api/products/my-listings?userId=${user?.id}`),
      ]);
      
      let totalListings = 0;
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        totalListings += listingsData.count || 0;
      }
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        totalListings += productsData.count || 0;
      }
      setStats((prev) => ({ ...prev, listings: totalListings }));
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  async function fetchMyListings() {
    if (!user) return;
    setLoadingListings(true);
    try {
      // Fetch both Listing and Product records
      const [listingsRes, productsRes] = await Promise.all([
        fetch(`/api/listings/my-listings?userId=${user?.id}`),
        fetch(`/api/products/my-listings?userId=${user?.id}`),
      ]);
      
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setMyListings(listingsData.listings || []);
      }
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setMyProducts(productsData.products || []);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoadingListings(false);
    }
  }

  async function handleDeleteListing(listingId: string) {
    if (!user) return;
    
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${listingId}?userId=${user?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // If listing was deactivated (not deleted), update it in the list
        if (data.deactivated) {
          setMyListings((prev) => 
            prev.map((l) => 
              l.id === listingId ? { ...l, isActive: false } : l
            )
          );
          alert(data.message || "Listing has been deactivated. It cannot be permanently deleted because it has associated orders, deals, or reports.");
        } else {
          // Listing was actually deleted, remove it from the list
          setMyListings((prev) => prev.filter((l) => l.id !== listingId));
          // Update the listings count
          setStats((prev) => ({ ...prev, listings: prev.listings - 1 }));
          alert("Listing deleted successfully!");
        }
      } else {
        alert(data.error || "Failed to delete listing");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("An error occurred while deleting the listing");
    }
  }

  async function handleDeleteProduct(productId: string) {
    if (!user) return;
    
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}?userId=${user?.id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user?.id || "",
        },
      });

      if (response.ok) {
        // Remove the product from the list
        setMyProducts((prev) => prev.filter((p) => p.id !== productId));
        // Update the listings count
        setStats((prev) => ({ ...prev, listings: prev.listings - 1 }));
        alert("Product deleted successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("An error occurred while deleting the product");
    }
  }

  if (loading) {
    return (
      <main className="p-6">
        <div className="text-center text-gray-500 py-10">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="p-3 sm:p-4 space-y-4 sm:space-y-6 md:space-y-8 pb-24">
      {/* Logo Section */}
      <section className="flex justify-center mb-2 sm:mb-4">
        <Logo className="w-full max-w-2xl sm:max-w-3xl" />
      </section>

      {/* Search Bar */}
      <section className="max-w-2xl mx-auto px-2 sm:px-0">
        <SearchBar />
      </section>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <StatCard number={stats.orders} label="Orders" emoji="📦" href="/orders" />
        <StatCard number={stats.favorites} label="Favorites" emoji="❤️" href="/favorites" />
        <StatCard number={stats.listings} label="Listings" emoji="📝" href="#my-listings" />
        <StatCard number={stats.messages} label="Messages" emoji="💬" href="/messages" />
      </div>

      {/* User Info Card */}
      <section className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl mx-1 sm:mx-0">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center">Account Information</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-gray-500 text-xs sm:text-sm">Email</p>
              <p className="font-semibold text-sm sm:text-lg truncate">{user.email}</p>
            </div>
            <span className="text-xl sm:text-2xl flex-shrink-0">📧</span>
          </div>

          {user.username && (
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-gray-500 text-xs sm:text-sm">Username</p>
                <p className="font-semibold text-sm sm:text-lg truncate">{user.username}</p>
              </div>
              <span className="text-xl sm:text-2xl flex-shrink-0">👤</span>
            </div>
          )}

          <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-gray-500 text-xs sm:text-sm">Account Type</p>
              <p className="font-semibold text-sm sm:text-lg capitalize">{user.role.toLowerCase()}</p>
            </div>
            <span className="text-xl sm:text-2xl flex-shrink-0">
              {user.role === "ADMIN" ? "👑" : "⭐"}
            </span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl mx-1 sm:mx-0 mb-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">About</h2>
          {!editingAbout && (
            <button
              onClick={() => setEditingAbout(true)}
              className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
            >
              Edit
            </button>
          )}
        </div>
        {editingAbout ? (
          <div className="space-y-3">
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell customers about yourself, your shop, and what makes your products special..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={6}
            />
            <div className="flex gap-2">
              <button
                onClick={saveAbout}
                disabled={savingAbout}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {savingAbout ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditingAbout(false);
                  fetchAbout(); // Reset to original
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            {about ? (
              <p className="text-gray-700 whitespace-pre-wrap">{about}</p>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-3">No about section yet.</p>
                <button
                  onClick={() => setEditingAbout(true)}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Add an about section →
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Shop Policies Section */}
      <section className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl mx-1 sm:mx-0 mb-4">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-center flex-1">Shop Policies</h2>
          {user?.id && (
            <button
              onClick={() => {
                if (!editingPolicies && !shopPolicies) {
                  setShopPolicies({
                    shopAnnouncement: "",
                    shopAbout: "",
                    shippingPolicy: "",
                    returnsPolicy: "",
                    cancellationsPolicy: "",
                    faqs: [],
                    digitalDownloadsPolicy: "",
                    paymentMethods: "",
                  });
                }
                setEditingPolicies(!editingPolicies);
              }}
              className="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-1"
            >
              {editingPolicies ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                  Edit
                </>
              )}
            </button>
          )}
        </div>
        {editingPolicies ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Announcements</label>
              <textarea
                value={shopPolicies?.shopAnnouncement || ""}
                onChange={(e) => setShopPolicies({ ...shopPolicies, shopAnnouncement: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                placeholder="Share important announcements with your customers..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">About Your Shop</label>
              <textarea
                value={shopPolicies?.shopAbout || ""}
                onChange={(e) => setShopPolicies({ ...shopPolicies, shopAbout: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                placeholder="Tell customers about your shop..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shipping Policy</label>
              <textarea
                value={shopPolicies?.shippingPolicy || ""}
                onChange={(e) => setShopPolicies({ ...shopPolicies, shippingPolicy: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                placeholder="Describe your shipping policy..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Returns and Exchanges</label>
              <textarea
                value={shopPolicies?.returnsPolicy || ""}
                onChange={(e) => setShopPolicies({ ...shopPolicies, returnsPolicy: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                placeholder="Describe your returns and exchanges policy..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cancellations</label>
              <textarea
                value={shopPolicies?.cancellationsPolicy || ""}
                onChange={(e) => setShopPolicies({ ...shopPolicies, cancellationsPolicy: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                placeholder="Describe your cancellation policy..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Digital Downloads</label>
              <textarea
                value={shopPolicies?.digitalDownloadsPolicy || ""}
                onChange={(e) => setShopPolicies({ ...shopPolicies, digitalDownloadsPolicy: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                placeholder="Describe your digital downloads policy..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Methods</label>
              <textarea
                value={shopPolicies?.paymentMethods || ""}
                onChange={(e) => setShopPolicies({ ...shopPolicies, paymentMethods: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
                placeholder="List accepted payment methods..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">FAQs</label>
              <div className="space-y-2">
                {(shopPolicies?.faqs || []).map((faq: any, index: number) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-3">
                    <input
                      type="text"
                      value={faq.question || faq.q || ""}
                      onChange={(e) => {
                        const newFaqs = [...(shopPolicies?.faqs || [])];
                        newFaqs[index] = { ...newFaqs[index], question: e.target.value, q: e.target.value };
                        setShopPolicies({ ...shopPolicies, faqs: newFaqs });
                      }}
                      className="w-full mb-2 p-2 border border-gray-300 rounded-lg"
                      placeholder="Question"
                    />
                    <textarea
                      value={faq.answer || faq.a || ""}
                      onChange={(e) => {
                        const newFaqs = [...(shopPolicies?.faqs || [])];
                        newFaqs[index] = { ...newFaqs[index], answer: e.target.value, a: e.target.value };
                        setShopPolicies({ ...shopPolicies, faqs: newFaqs });
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Answer"
                      rows={2}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newFaqs = (shopPolicies?.faqs || []).filter((_: any, i: number) => i !== index);
                        setShopPolicies({ ...shopPolicies, faqs: newFaqs });
                      }}
                      className="mt-2 text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setShopPolicies({
                      ...shopPolicies,
                      faqs: [...(shopPolicies?.faqs || []), { question: "", answer: "" }],
                    });
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors"
                >
                  + Add FAQ
                </button>
              </div>
            </div>
            <button
              onClick={saveShopPolicies}
              disabled={savingPolicies}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {savingPolicies ? "Saving..." : "Save Shop Policies"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {shopPolicies && (
              <>
                {shopPolicies.shopAnnouncement && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Shop Announcements</h3>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{shopPolicies.shopAnnouncement}</p>
                  </div>
                )}
                {shopPolicies.shopAbout && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">About Your Shop</h3>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{shopPolicies.shopAbout}</p>
                  </div>
                )}
                {shopPolicies.shippingPolicy && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Shipping</h3>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{shopPolicies.shippingPolicy}</p>
                  </div>
                )}
                {shopPolicies.returnsPolicy && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Returns and Exchanges</h3>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{shopPolicies.returnsPolicy}</p>
                  </div>
                )}
                {shopPolicies.cancellationsPolicy && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Cancellations</h3>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{shopPolicies.cancellationsPolicy}</p>
                  </div>
                )}
                {shopPolicies.digitalDownloadsPolicy && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Digital Downloads</h3>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{shopPolicies.digitalDownloadsPolicy}</p>
                  </div>
                )}
                {shopPolicies.paymentMethods && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Payment Methods</h3>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{shopPolicies.paymentMethods}</p>
                  </div>
                )}
                {shopPolicies.faqs && shopPolicies.faqs.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">FAQs</h3>
                    <div className="space-y-2">
                      {shopPolicies.faqs.map((faq: any, index: number) => (
                        <div key={index} className="border-l-2 border-purple-500 pl-3">
                          <p className="font-semibold text-gray-900 text-sm">{faq.question || faq.q}</p>
                          <p className="text-gray-700 text-sm">{faq.answer || faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {(!shopPolicies || (!shopPolicies.shopAnnouncement && !shopPolicies.shopAbout && !shopPolicies.shippingPolicy && !shopPolicies.returnsPolicy && !shopPolicies.cancellationsPolicy && !shopPolicies.faqs && !shopPolicies.digitalDownloadsPolicy && !shopPolicies.paymentMethods)) && (
              <div className="text-gray-500 text-center py-4">
                <p className="mb-3">No shop policies added yet.</p>
                <button
                  onClick={() => {
                    setShopPolicies({
                      shopAnnouncement: "",
                      shopAbout: "",
                      shippingPolicy: "",
                      returnsPolicy: "",
                      cancellationsPolicy: "",
                      faqs: [],
                      digitalDownloadsPolicy: "",
                      paymentMethods: "",
                    });
                    setEditingPolicies(true);
                  }}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Add Shop Policies →
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-2 gap-2 sm:gap-3">
        <QuickLinkCard 
          title="📦 Orders" 
          description="Track purchases"
          href="/orders"
          color="bg-green-500"
        />
        <QuickLinkCard 
          title="❤️ Favorites" 
          description="Saved items"
          href="/favorites"
          color="bg-pink-500"
        />
        <QuickLinkCard 
          title="🏪 My Shop" 
          description="Seller dashboard"
          href="/seller/dashboard"
          color="bg-purple-500"
        />
        <QuickLinkCard 
          title="💬 Messages" 
          description="Chat with sellers"
          href="/messages"
          color="bg-blue-500"
        />
        <QuickLinkCard 
          title="📧 Contact Us" 
          description="Get help & support"
          href="/contact"
          color="bg-orange-500"
        />
      </section>

      {/* My Listings Section */}
      <section id="my-listings" className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl mx-1 sm:mx-0">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center">My Listings</h2>
        {loadingListings ? (
          <div className="text-center py-4 text-gray-500">Loading listings...</div>
        ) : myListings.length === 0 && myProducts.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-gray-500">You haven't created any listings yet.</p>
            <Link
              href="/sell"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Display Listing records */}
            {myListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {listing.images && Array.isArray(listing.images) && listing.images.length > 0 ? (
                    <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide image if it fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : listing.images && typeof listing.images === 'string' ? (
                    <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={listing.images}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">{listing.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{listing.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                      <span className="font-bold text-purple-600">
                        ${(listing.priceCents / 100).toFixed(2)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        listing.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {listing.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        View →
                      </Link>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link
                        href={`/listings/${listing.id}/edit`}
                        className="flex-1 bg-blue-500 text-white text-center px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteListing(listing.id);
                        }}
                        className="flex-1 bg-red-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Display Product records (legacy) */}
            {myProducts.map((product) => {
              const productImages = parseImages(product.images);
              return (
                <div
                  key={product.id}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 border-2 border-transparent hover:border-purple-300 relative group"
                >
                  <Link
                    href={`/product/${product.id}`}
                    className="block hover:scale-105 transition-transform"
                  >
                    {productImages && productImages.length > 0 ? (
                      <div className="relative w-full aspect-square mb-2 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={productImages[0]}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square mb-2 rounded-lg bg-gray-200 flex items-center justify-center text-4xl">
                        📦
                      </div>
                    )}
                    <div className="font-bold text-xs sm:text-sm mb-1 line-clamp-2">{product.title}</div>
                    <div className="text-purple-600 font-semibold text-xs sm:text-sm">
                      ${(product.price / 100).toFixed(2)}
                    </div>
                    {product.hidden && (
                      <div className="text-xs text-red-500 mt-1">⚠️ Hidden</div>
                    )}
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteProduct(product.id);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                    title="Delete listing"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Seller Links */}
      {user.role === "ADMIN" || (
        <section className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl mx-1 sm:mx-0">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center">Seller Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <Link
              href="/seller/dashboard"
              className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-purple-300 active:scale-95"
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2 text-center">📊</div>
              <div className="font-bold text-sm sm:text-base text-center mb-1">Seller Dashboard</div>
              <div className="text-xs text-gray-600 text-center">View sales & fees</div>
            </Link>
            <Link
              href="/seller/platforms"
              className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-blue-300 active:scale-95"
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2 text-center">🔗</div>
              <div className="font-bold text-sm sm:text-base text-center mb-1">Platforms</div>
              <div className="text-xs text-gray-600 text-center">Connect stores</div>
            </Link>
            <Link
              href="/seller/strikes"
              className="bg-gradient-to-br from-red-100 to-orange-100 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-red-300 active:scale-95"
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2 text-center">⚠️</div>
              <div className="font-bold text-sm sm:text-base text-center mb-1">Strikes</div>
              <div className="text-xs text-gray-600 text-center">View strikes</div>
            </Link>
            <Link
              href="/sell"
              className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:scale-105 transition-transform cursor-pointer border-2 border-transparent hover:border-green-300 active:scale-95"
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2 text-center">➕</div>
              <div className="font-bold text-sm sm:text-base text-center mb-1">Create Listing</div>
              <div className="text-xs text-gray-600 text-center">List new product</div>
            </Link>
          </div>
        </section>
      )}

      {/* Logout Button */}
      <button
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="w-full bg-red-600 text-white py-3 sm:py-4 rounded-xl font-bold hover:bg-red-700 active:bg-red-800 transition-all shadow-lg min-h-[44px] touch-manipulation"
      >
        🚪 Logout
      </button>
    </main>
  );
}

function StatCard({ number, label, emoji, href }: { number: number; label: string; emoji: string; href?: string }) {
  const content = (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
      <div className="text-2xl sm:text-3xl mb-0.5 sm:mb-1">{emoji}</div>
      <div className="text-xl sm:text-2xl font-bold text-purple-600">{number}</div>
      <div className="text-xs text-gray-600 font-semibold">{label}</div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function QuickLinkCard({ 
  title, 
  description, 
  href, 
  color 
}: { 
  title: string; 
  description: string;
  href: string; 
  color: string;
}) {
  return (
    <Link href={href} className="min-h-[80px] sm:min-h-[100px] flex items-center">
      <div className={`${color} rounded-lg sm:rounded-xl p-3 sm:p-4 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer w-full min-h-[80px] sm:min-h-[100px] flex flex-col justify-center`}>
        <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{title.split(' ')[0]}</div>
        <div className="font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">{title.split(' ').slice(1).join(' ')}</div>
        <div className="text-xs opacity-90 leading-tight">{description}</div>
      </div>
    </Link>
  );
}
