"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";
import ProfileCompletion from "@/components/profile/ProfileCompletion";

// Helper function to safely parse images
function parseImages(images: string | string[] | null | undefined): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    if (images.trim().startsWith('[') || images.trim().startsWith('{')) {
      try {
        return JSON.parse(images);
      } catch {
        return [images];
      }
    }
    return [images];
  }
  return [];
}

type Tab = "overview" | "listings" | "settings" | "activity";

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState({
    orders: 0,
    favorites: 0,
    listings: 0,
    messages: 0,
  });
  const [socialStats, setSocialStats] = useState({
    followers: 0,
    following: 0,
    reviews: 0,
    averageRating: 0,
    sales: 0,
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
  const [storeCredit, setStoreCredit] = useState<number>(0);
  const [loadingStoreCredit, setLoadingStoreCredit] = useState(false);
  const [referralCount, setReferralCount] = useState<number>(0);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchStats();
      fetchSocialStats();
      fetchMyListings();
      fetchAbout();
      fetchShopPolicies();
      fetchStoreCredit();
      fetchReferralCount();
      fetchAvatar();
      fetchCoverPhoto();
      calculateProfileCompletion();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      calculateProfileCompletion();
    }
  }, [user, about, avatar, shopPolicies, myListings]);

  async function fetchAvatar() {
    if (!user?.id) {
      console.log("[FETCH AVATAR] No user ID");
      return;
    }

    // Always fetch from API first to get the latest avatar
    try {
      console.log("[FETCH AVATAR] Fetching from API for user:", user.id);
      const response = await fetch(`/api/users/${user.id}/avatar?t=${Date.now()}`, {
        headers: {
          "x-user-id": user.id,
        },
        cache: 'no-store',
      });

      console.log("[FETCH AVATAR] API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("[FETCH AVATAR] API response data:", data);
        const avatarUrl = data.avatar || null;
        
        if (avatarUrl) {
          console.log("[FETCH AVATAR] Setting avatar URL:", avatarUrl);
          setAvatar(avatarUrl);
          
          // Update localStorage for future reference
          if (typeof window !== 'undefined') {
            try {
              const storedUser = localStorage.getItem("user");
              if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                parsedUser.avatar = avatarUrl;
                localStorage.setItem("user", JSON.stringify(parsedUser));
              }
            } catch (storageError) {
              console.error("[FETCH AVATAR] Error updating localStorage:", storageError);
            }
          }
        } else {
          console.log("[FETCH AVATAR] No avatar found in API response (null or empty)");
          setAvatar(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("[FETCH AVATAR] API error:", errorData);
        
        // Fallback: check localStorage if API fails
        if (typeof window !== 'undefined') {
          try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser.avatar) {
                console.log("[FETCH AVATAR] Falling back to localStorage:", parsedUser.avatar);
                setAvatar(parsedUser.avatar);
                return;
              }
            }
          } catch (error) {
            console.error("[FETCH AVATAR] Error reading localStorage:", error);
          }
        }
        setAvatar(null);
      }
    } catch (error) {
      console.error("[FETCH AVATAR] Error fetching avatar:", error);
      
      // Fallback: check localStorage if API call fails
      if (typeof window !== 'undefined') {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.avatar) {
              console.log("[FETCH AVATAR] Falling back to localStorage after error:", parsedUser.avatar);
              setAvatar(parsedUser.avatar);
              return;
            }
          }
        } catch (storageError) {
          console.error("[FETCH AVATAR] Error reading localStorage:", storageError);
        }
      }
      setAvatar(null);
    }
  }

  async function fetchCoverPhoto() {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/users/${user.id}/cover-photo`);
      if (response.ok) {
        const data = await response.json();
        setCoverPhoto(data.coverPhoto || null);
      }
    } catch (error) {
      console.error("Error fetching cover photo:", error);
    }
  }

  async function fetchSocialStats() {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/users/${user.id}/stats`);
      if (response.ok) {
        const data = await response.json();
        setSocialStats({
          followers: data.followersCount || 0,
          following: data.followingCount || 0,
          reviews: data.reviewsCount || 0,
          averageRating: data.averageRating || 0,
          sales: data.salesCount || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching social stats:", error);
    }
  }

  function calculateProfileCompletion() {
    if (!user) return;
    let completed = 0;
    let total = 7;

    if (user.username) completed++;
    if (avatar) completed++;
    if (about && about.trim().length > 0) completed++;
    if (coverPhoto) completed++;
    if (shopPolicies && (shopPolicies.shopAbout || shopPolicies.shippingPolicy)) completed++;
    if (myListings.length > 0 || myProducts.length > 0) completed++;
    if (referralCount > 0) completed++;

    setProfileCompletion(Math.round((completed / total) * 100));
  }

  // Get completion from ProfileCompletion component logic (will be calculated there)
  const [detailedCompletion, setDetailedCompletion] = useState(0);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) {
      console.log("[AVATAR UPLOAD] No file selected or user not logged in", { file: !!file, userId: user?.id });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      e.target.value = "";
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB");
      e.target.value = "";
      return;
    }

    console.log("[AVATAR UPLOAD] Starting upload...", { fileName: file.name, fileSize: file.size, fileType: file.type });

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("[AVATAR UPLOAD] Uploading to /api/upload...");
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("[AVATAR UPLOAD] Upload response status:", uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: "Unknown error" }));
        console.error("[AVATAR UPLOAD] Upload failed:", errorData);
        throw new Error(errorData.error || errorData.message || "Failed to upload avatar");
      }

      const uploadData = await uploadResponse.json();
      console.log("[AVATAR UPLOAD] Upload successful:", uploadData);
      
      const avatarUrl = uploadData.url || uploadData.path;
      if (!avatarUrl) {
        throw new Error("No URL returned from upload");
      }

      console.log("[AVATAR UPLOAD] Saving avatar URL to user profile...", avatarUrl);
      const saveResponse = await fetch(`/api/users/${user.id}/avatar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ avatar: avatarUrl }),
      });

      console.log("[AVATAR UPLOAD] Save response status:", saveResponse.status);

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({ error: "Unknown error" }));
        console.error("[AVATAR UPLOAD] Save failed:", errorData);
        throw new Error(errorData.error || errorData.message || "Failed to save avatar");
      }

      const saveData = await saveResponse.json();
      console.log("[AVATAR UPLOAD] Save successful:", saveData);
      console.log("[AVATAR UPLOAD] Avatar URL from save response:", saveData.avatar || avatarUrl);

      // Use the avatar from the save response, or fallback to upload URL
      const finalAvatarUrl = saveData.avatar || avatarUrl;
      
      // Update avatar state immediately with the final URL
      console.log("[AVATAR UPLOAD] Setting avatar state to:", finalAvatarUrl);
      setAvatar(finalAvatarUrl);
      
      // Update local user state
      if (typeof window !== 'undefined') {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            parsedUser.avatar = finalAvatarUrl;
            localStorage.setItem("user", JSON.stringify(parsedUser));
            console.log("[AVATAR UPLOAD] Updated localStorage with avatar:", finalAvatarUrl);
          }
        } catch (storageError) {
          console.error("[AVATAR UPLOAD] Error updating localStorage:", storageError);
        }
      }

      // Small delay then refresh avatar from API to ensure we have the latest
      setTimeout(async () => {
        console.log("[AVATAR UPLOAD] Refreshing avatar from API after upload");
        await fetchAvatar();
      }, 500);

      // Refresh profile completion
      calculateProfileCompletion();
      
      alert("Avatar updated successfully! 🎉");
    } catch (error: any) {
      console.error("[AVATAR UPLOAD] Error:", error);
      alert(error.message || "Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
      // Reset input value to allow re-uploading the same file
      e.target.value = "";
    }
  }

  async function handleCoverPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload cover photo");
      }

      const uploadData = await uploadResponse.json();
      const coverUrl = uploadData.url || uploadData.path;

      const saveResponse = await fetch(`/api/users/${user.id}/cover-photo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ coverPhoto: coverUrl }),
      });

      if (saveResponse.ok) {
        setCoverPhoto(coverUrl);
        alert("Cover photo updated successfully!");
      } else {
        throw new Error("Failed to save cover photo");
      }
    } catch (error: any) {
      console.error("Error uploading cover photo:", error);
      alert(error.message || "Failed to upload cover photo");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  }

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

  async function fetchStoreCredit() {
    if (!user?.id) return;
    setLoadingStoreCredit(true);
    try {
      const response = await fetch(`/api/users/${user.id}/store-credit`);
      if (response.ok) {
        const data = await response.json();
        setStoreCredit(data.storeCredit || 0);
      }
    } catch (error) {
      console.error("Error fetching store credit:", error);
    } finally {
      setLoadingStoreCredit(false);
    }
  }

  async function fetchReferralCount() {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/referrals/code?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setReferralCount(data.stats?.referralCount || 0);
      }
    } catch (error) {
      console.error("Error fetching referral count:", error);
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
      const ordersRes = await fetch(`/api/orders?userId=${user?.id}`);
      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        setStats((prev) => ({ ...prev, orders: orders.length }));
      }

      const favsRes = await fetch(`/api/favorites?userId=${user?.id}`);
      if (favsRes.ok) {
        const favorites = await favsRes.json();
        setStats((prev) => ({ ...prev, favorites: favorites.length }));
      }

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
        if (data.deactivated) {
          setMyListings((prev) => 
            prev.map((l) => 
              l.id === listingId ? { ...l, isActive: false } : l
            )
          );
          alert(data.message || "Listing has been deactivated.");
        } else {
          setMyListings((prev) => prev.filter((l) => l.id !== listingId));
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
        setMyProducts((prev) => prev.filter((p) => p.id !== productId));
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
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header with Logo and Search */}
      <section className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-center mb-3">
            <Logo className="w-full max-w-2xl sm:max-w-3xl" />
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Profile Header with Cover Photo and Avatar */}
      <section className="relative">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
          {coverPhoto ? (
            <img
              src={coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Cover Photo Upload Button */}
          <div className="absolute top-4 right-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (!uploadingCover && coverPhotoInputRef.current) {
                  coverPhotoInputRef.current.click();
                }
              }}
              disabled={uploadingCover}
              className="bg-white/90 hover:bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingCover ? "Uploading..." : "📷 Cover"}
            </button>
            <input
              ref={coverPhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoUpload}
              disabled={uploadingCover}
              className="hidden"
            />
          </div>

          {/* Avatar */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                {avatar ? (
                  <img 
                    src={avatar}
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    key={avatar} // Force re-render when avatar changes
                    onError={(e) => {
                      console.error("[AVATAR] Failed to load image. URL:", avatar);
                      console.error("[AVATAR] Error details:", e);
                      // Don't clear avatar immediately - might be temporary network issue
                      // Try to fetch fresh avatar from API
                      setTimeout(() => {
                        if (user?.id) {
                          console.log("[AVATAR] Retrying avatar fetch after load error");
                          fetchAvatar();
                        }
                      }, 2000);
                    }}
                    onLoad={() => {
                      console.log("[AVATAR] Image loaded successfully. URL:", avatar);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 text-white text-3xl sm:text-4xl font-bold">
                    {user.username?.[0]?.toUpperCase() || user.email[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!uploadingAvatar && avatarInputRef.current) {
                    avatarInputRef.current.click();
                  }
                }}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors shadow-lg z-20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingAvatar ? (
                  <span className="text-xs">⏳</span>
                ) : (
                  <span className="text-sm">📷</span>
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="pt-16 sm:pt-20 pb-4 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {user.username || "User"}
            </h1>
            <p className="text-gray-600 mb-4">{user.email}</p>
            
            {/* View Public Profile Button */}
            <Link
              href={`/shop/${user.id}`}
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm mb-4"
            >
              👁️ View Public Profile
            </Link>

            {/* Social Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 max-w-2xl mx-auto">
              <StatCard number={socialStats.followers} label="Followers" emoji="👥" />
              <StatCard number={socialStats.following} label="Following" emoji="➕" />
              <StatCard number={socialStats.reviews} label="Reviews" emoji="⭐" />
              <StatCard 
                number={socialStats.averageRating > 0 ? socialStats.averageRating.toFixed(1) : "0.0"} 
                label="Rating" 
                emoji="⭐" 
              />
              <StatCard number={socialStats.sales} label="Sales" emoji="💰" />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="bg-white border-b z-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex overflow-x-auto">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              label="Overview"
              emoji="📊"
            />
            <TabButton
              active={activeTab === "listings"}
              onClick={() => setActiveTab("listings")}
              label="My Listings"
              emoji="📦"
            />
            <TabButton
              active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              label="Settings"
              emoji="⚙️"
            />
            <TabButton
              active={activeTab === "activity"}
              onClick={() => setActiveTab("activity")}
              label="Activity"
              emoji="📈"
            />
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6">
        {activeTab === "overview" && (
          <OverviewTab
            stats={stats}
            referralCount={referralCount}
            storeCredit={storeCredit}
            loadingStoreCredit={loadingStoreCredit}
            user={user}
            about={about}
            editingAbout={editingAbout}
            setEditingAbout={setEditingAbout}
            setAbout={setAbout}
            saveAbout={saveAbout}
            savingAbout={savingAbout}
            shopPolicies={shopPolicies}
            editingPolicies={editingPolicies}
            setEditingPolicies={setEditingPolicies}
            setShopPolicies={setShopPolicies}
            saveShopPolicies={saveShopPolicies}
            savingPolicies={savingPolicies}
            socialStats={socialStats}
            avatar={avatar}
            coverPhoto={coverPhoto}
            listingsCount={myListings.length}
          />
        )}

        {activeTab === "listings" && (
          <ListingsTab
            myListings={myListings}
            myProducts={myProducts}
            loadingListings={loadingListings}
            handleDeleteListing={handleDeleteListing}
            handleDeleteProduct={handleDeleteProduct}
            parseImages={parseImages}
            user={user}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            user={user}
            editingUsername={editingUsername}
            setEditingUsername={setEditingUsername}
            newUsername={newUsername}
            setNewUsername={setNewUsername}
            savingUsername={savingUsername}
            setSavingUsername={setSavingUsername}
            usernameError={usernameError}
            setUsernameError={setUsernameError}
            changingPassword={changingPassword}
            setChangingPassword={setChangingPassword}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            passwordError={passwordError}
            setPasswordError={setPasswordError}
            passwordSuccess={passwordSuccess}
            setPasswordSuccess={setPasswordSuccess}
            logout={logout}
            router={router}
          />
        )}

        {activeTab === "activity" && (
          <ActivityTab
            user={user}
            stats={stats}
            socialStats={socialStats}
            referralCount={referralCount}
            myListings={myListings}
          />
        )}
      </div>
    </main>
  );
}

function TabButton({ active, onClick, label, emoji }: { active: boolean; onClick: () => void; label: string; emoji: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
        active
          ? "border-purple-600 text-purple-600 bg-purple-50"
          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
      }`}
    >
      <span>{emoji}</span>
      <span className="text-sm sm:text-base">{label}</span>
    </button>
  );
}

function StatCard({ number, label, emoji }: { number: number | string; label: string; emoji: string }) {
  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 text-center shadow-md hover:shadow-lg transition-shadow">
      <div className="text-2xl sm:text-3xl mb-1">{emoji}</div>
      <div className="text-xl sm:text-2xl font-bold text-purple-600">{number}</div>
      <div className="text-xs text-gray-600 font-semibold">{label}</div>
    </div>
  );
}

function OverviewTab({ 
  stats, 
  referralCount, 
  storeCredit, 
  loadingStoreCredit, 
  user,
  about,
  editingAbout,
  setEditingAbout,
  setAbout,
  saveAbout,
  savingAbout,
  shopPolicies,
  editingPolicies,
  setEditingPolicies,
  setShopPolicies,
  saveShopPolicies,
  savingPolicies,
  socialStats,
  avatar,
  coverPhoto,
  listingsCount,
}: any) {
  return (
    <div className="space-y-6">
      {/* Profile Completion */}
      <ProfileCompletion
        user={user}
        avatar={avatar}
        coverPhoto={coverPhoto}
        about={about}
        shopPolicies={shopPolicies}
        listingsCount={listingsCount}
        referralCount={referralCount}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <Link href="/orders" className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-2xl sm:text-3xl mb-1">📦</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.orders}</div>
          <div className="text-xs text-gray-600 font-semibold">Orders</div>
        </Link>
        <Link href="/favorites" className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-2xl sm:text-3xl mb-1">❤️</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.favorites}</div>
          <div className="text-xs text-gray-600 font-semibold">Favorites</div>
        </Link>
        <Link href="#listings" className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-2xl sm:text-3xl mb-1">📝</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.listings}</div>
          <div className="text-xs text-gray-600 font-semibold">Listings</div>
        </Link>
        <Link href="/messages" className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-2xl sm:text-3xl mb-1">💬</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.messages}</div>
          <div className="text-xs text-gray-600 font-semibold">Messages</div>
        </Link>
        <Link href="/referrals" className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-2xl sm:text-3xl mb-1">💰</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-600">{referralCount}</div>
          <div className="text-xs text-gray-600 font-semibold">Referrals</div>
        </Link>
      </div>

      {/* Store Credit Card */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Store Credit</p>
            {loadingStoreCredit ? (
              <p className="text-2xl font-bold text-gray-900">Loading...</p>
            ) : (
              <p className="text-3xl font-bold text-green-600">
                ${((storeCredit || 0) / 100).toFixed(2)}
              </p>
            )}
          </div>
          <span className="text-4xl">💳</span>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">About</h2>
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
                onClick={() => setEditingAbout(false)}
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
      </div>

      {/* Shop Policies Section */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Shop Policies</h2>
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
              {editingPolicies ? "Cancel" : "Edit"}
            </button>
          )}
        </div>
        {editingPolicies ? (
          <ShopPoliciesEditor
            shopPolicies={shopPolicies}
            setShopPolicies={setShopPolicies}
            saveShopPolicies={saveShopPolicies}
            savingPolicies={savingPolicies}
          />
        ) : (
          <ShopPoliciesViewer shopPolicies={shopPolicies} setEditingPolicies={setEditingPolicies} setShopPolicies={setShopPolicies} />
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <QuickLinkCard title="🏪 My Shop" description="Seller dashboard" href="/seller/dashboard" color="bg-purple-500" />
        <QuickLinkCard title="➕ Create" description="New listing" href="/sell" color="bg-green-500" />
        <QuickLinkCard title="🔗 Platforms" description="Connect stores" href="/seller/platforms" color="bg-blue-500" />
        <QuickLinkCard title="📧 Contact" description="Get help" href="/contact" color="bg-orange-500" />
      </div>
    </div>
  );
}

function ShopPoliciesEditor({ shopPolicies, setShopPolicies, saveShopPolicies, savingPolicies }: any) {
  return (
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">Digital Downloads</label>
        <textarea
          value={shopPolicies?.digitalDownloadsPolicy || ""}
          onChange={(e) => setShopPolicies({ ...shopPolicies, digitalDownloadsPolicy: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
          placeholder="Describe your digital downloads policy..."
        />
      </div>
      <button
        onClick={saveShopPolicies}
        disabled={savingPolicies}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
      >
        {savingPolicies ? "Saving..." : "Save Shop Policies"}
      </button>
    </div>
  );
}

function ShopPoliciesViewer({ shopPolicies, setEditingPolicies, setShopPolicies }: any) {
  if (!shopPolicies || (!shopPolicies.shopAnnouncement && !shopPolicies.shopAbout && !shopPolicies.shippingPolicy && !shopPolicies.returnsPolicy && !shopPolicies.digitalDownloadsPolicy)) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
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
      {shopPolicies.digitalDownloadsPolicy && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Digital Downloads</h3>
          <p className="text-gray-700 whitespace-pre-wrap text-sm">{shopPolicies.digitalDownloadsPolicy}</p>
        </div>
      )}
    </div>
  );
}

function ListingsTab({ myListings, myProducts, loadingListings, handleDeleteListing, handleDeleteProduct, parseImages, user }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Listings</h2>
          <Link
            href="/sell"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
          >
            ➕ Create New Listing
          </Link>
        </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myListings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} handleDeleteListing={handleDeleteListing} />
            ))}
            {myProducts.map((product: any) => {
              const productImages = parseImages(product.images);
              return (
                <ProductCard key={product.id} product={product} productImages={productImages} handleDeleteProduct={handleDeleteProduct} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing, handleDeleteListing }: any) {
  let images: string[] = [];
  if (listing.images) {
    if (Array.isArray(listing.images)) {
      images = listing.images.filter((img: any) => img && typeof img === 'string' && img.trim());
    } else if (typeof listing.images === 'string' && listing.images.trim()) {
      images = [listing.images];
    }
  }
  
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow">
      {images.length > 0 && (
        <Link href={`/listings/${listing.id}`}>
          <img
            src={images[0]}
            alt={listing.title}
            className="w-full h-48 object-cover rounded-lg mb-3"
          />
        </Link>
      )}
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{listing.description}</p>
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-purple-600">${(listing.priceCents / 100).toFixed(2)}</span>
        <span className={`px-2 py-1 rounded text-xs ${
          listing.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {listing.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="flex gap-2">
        <Link
          href={`/listings/${listing.id}/edit`}
          className="flex-1 bg-blue-500 text-white text-center px-3 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={() => handleDeleteListing(listing.id)}
          className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function ProductCard({ product, productImages, handleDeleteProduct }: any) {
  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow">
      {productImages && productImages.length > 0 && (
        <Link href={`/product/${product.id}`}>
          <img
            src={productImages[0]}
            alt={product.title}
            className="w-full h-48 object-cover rounded-lg mb-3"
          />
        </Link>
      )}
      <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-purple-600">${(product.price / 100).toFixed(2)}</span>
        {product.hidden && <span className="text-xs text-red-500">⚠️ Hidden</span>}
      </div>
      <button
        onClick={() => handleDeleteProduct(product.id)}
        className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors"
      >
        Delete
      </button>
    </div>
  );
}

function SettingsTab({
  user,
  editingUsername,
  setEditingUsername,
  newUsername,
  setNewUsername,
  savingUsername,
  setSavingUsername,
  usernameError,
  setUsernameError,
  changingPassword,
  setChangingPassword,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  setPasswordError,
  passwordSuccess,
  setPasswordSuccess,
  logout,
  router,
}: any) {
  return (
    <div className="space-y-6">
      {/* Account Information */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4">Account Information</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-semibold">{user.email}</p>
            </div>
            <span className="text-2xl">📧</span>
          </div>

          {/* Username */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
            {!editingUsername ? (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Username</p>
                  <p className="font-semibold">{user.username || "Not set"}</p>
                </div>
                <button
                  onClick={() => {
                    setNewUsername(user.username || "");
                    setEditingUsername(true);
                    setUsernameError("");
                  }}
                  className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
                >
                  Edit
                </button>
              </div>
            ) : (
              <UsernameEditor
                newUsername={newUsername}
                setNewUsername={setNewUsername}
                setEditingUsername={setEditingUsername}
                setSavingUsername={setSavingUsername}
                usernameError={usernameError}
                setUsernameError={setUsernameError}
                user={user}
              />
            )}
          </div>

          {/* Account Type */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <div>
              <p className="text-gray-500 text-sm">Account Type</p>
              <p className="font-semibold capitalize">{user.role.toLowerCase()}</p>
            </div>
            <span className="text-2xl">{user.role === "ADMIN" ? "👑" : "⭐"}</span>
          </div>

          {/* Password */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4">
            {!changingPassword ? (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Password</p>
                  <p className="font-semibold">••••••••</p>
                </div>
                <button
                  onClick={() => setChangingPassword(true)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
                >
                  Change
                </button>
              </div>
            ) : (
              <PasswordChanger
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                passwordError={passwordError}
                setPasswordError={setPasswordError}
                passwordSuccess={passwordSuccess}
                setPasswordSuccess={setPasswordSuccess}
                setChangingPassword={setChangingPassword}
                user={user}
              />
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl p-6 shadow-md border-2 border-red-200">
        <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h2>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

function UsernameEditor({ newUsername, setNewUsername, setEditingUsername, setSavingUsername, usernameError, setUsernameError, user }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">Username</label>
      <input
        type="text"
        value={newUsername}
        onChange={(e) => {
          setNewUsername(e.target.value);
          setUsernameError("");
        }}
        placeholder="Enter username"
        className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg"
        maxLength={20}
      />
      {usernameError && <p className="text-xs text-red-600">{usernameError}</p>}
      <p className="text-xs text-gray-500">3-20 characters, letters, numbers, underscores, or hyphens</p>
      <div className="flex gap-2">
        <button
          onClick={async () => {
            if (!newUsername.trim()) {
              setUsernameError("Username cannot be empty");
              return;
            }
            const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
            if (!usernameRegex.test(newUsername.trim())) {
              setUsernameError("Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens");
              return;
            }
            setSavingUsername(true);
            setUsernameError("");
            try {
              const response = await fetch(`/api/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: newUsername.trim() }),
              });
              const data = await response.json();
              if (response.ok) {
                const updatedUser = { ...user, username: newUsername.trim() };
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                  localStorage.setItem("user", JSON.stringify(updatedUser));
                }
                window.location.reload();
              } else {
                setUsernameError(data.error || "Failed to update username");
              }
            } catch (error) {
              setUsernameError("An error occurred while updating username");
            } finally {
              setSavingUsername(false);
            }
          }}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
        >
          Save
        </button>
        <button
          onClick={() => {
            setEditingUsername(false);
            setNewUsername("");
            setUsernameError("");
          }}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function PasswordChanger({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  setPasswordError,
  passwordSuccess,
  setPasswordSuccess,
  setChangingPassword,
  user,
}: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-semibold text-gray-700">Change Password</label>
        <button
          onClick={() => {
            setChangingPassword(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordError("");
            setPasswordSuccess(false);
          }}
          className="text-gray-500 hover:text-gray-700 text-xs"
        >
          Cancel
        </button>
      </div>
      {passwordSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg text-sm">
          Password changed successfully!
        </div>
      )}
      {passwordError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg text-sm">
          {passwordError}
        </div>
      )}
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => {
          setCurrentPassword(e.target.value);
          setPasswordError("");
        }}
        placeholder="Current password"
        className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg"
      />
      <input
        type="password"
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          setPasswordError("");
        }}
        placeholder="New password"
        minLength={8}
        className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          setPasswordError("");
        }}
        placeholder="Confirm new password"
        minLength={8}
        className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg"
      />
      <button
        onClick={async () => {
          if (!currentPassword) {
            setPasswordError("Please enter your current password");
            return;
          }
          if (!newPassword || newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters");
            return;
          }
          if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
          }
          setPasswordError("");
          try {
            const response = await fetch(`/api/users/${user.id}/change-password`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-user-id": user.id,
              },
              body: JSON.stringify({
                currentPassword,
                newPassword,
              }),
            });
            const data = await response.json();
            if (response.ok) {
              setPasswordSuccess(true);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setTimeout(() => {
                setChangingPassword(false);
                setPasswordSuccess(false);
              }, 2000);
            } else {
              setPasswordError(data.error || "Failed to change password");
            }
          } catch (error) {
            setPasswordError("An error occurred while changing password");
          }
        }}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
      >
        Change Password
      </button>
    </div>
  );
}

function ActivityTab({ user, stats, socialStats, referralCount, myListings }: any) {
  return (
    <div className="space-y-6">
      {/* Activity Summary */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4">Activity Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-2xl font-bold text-purple-600">{stats.orders}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-blue-600">{stats.listings}</div>
            <div className="text-sm text-gray-600">Listings Created</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-green-600">{socialStats.reviews}</div>
            <div className="text-sm text-gray-600">Reviews Received</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-yellow-600">{socialStats.sales}</div>
            <div className="text-sm text-gray-600">Total Sales</div>
          </div>
        </div>
      </div>

      {/* Social Stats */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4">Social Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link href={`/shop/${user.id}?tab=followers`} className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-2xl font-bold text-purple-600">{socialStats.followers}</div>
            <div className="text-sm text-gray-600">Followers</div>
          </Link>
          <Link href={`/shop/${user.id}?tab=following`} className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="text-2xl mb-2">➕</div>
            <div className="text-2xl font-bold text-blue-600">{socialStats.following}</div>
            <div className="text-sm text-gray-600">Following</div>
          </Link>
        </div>
      </div>

      {/* Rating */}
      {socialStats.averageRating > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Average Rating</h2>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold text-yellow-500">{socialStats.averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-2xl">
                  {i < Math.round(socialStats.averageRating) ? "⭐" : "☆"}
                </span>
              ))}
            </div>
            <div className="text-sm text-gray-600">({socialStats.reviews} reviews)</div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Listings Created</span>
            <span className="font-bold text-purple-600">{stats.listings}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Orders Placed</span>
            <span className="font-bold text-purple-600">{stats.orders}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Favorites</span>
            <span className="font-bold text-purple-600">{stats.favorites}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Referrals</span>
            <span className="font-bold text-purple-600">{referralCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLinkCard({ title, description, href, color }: { title: string; description: string; href: string; color: string }) {
  return (
    <Link href={href} className={`${color} rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-all hover:scale-105`}>
      <div className="text-2xl mb-2">{title.split(' ')[0]}</div>
      <div className="font-bold text-sm mb-1">{title.split(' ').slice(1).join(' ')}</div>
      <div className="text-xs opacity-90">{description}</div>
    </Link>
  );
}