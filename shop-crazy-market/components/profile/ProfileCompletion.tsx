"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface CompletionItem {
  id: string;
  label: string;
  completed: boolean;
  skipped?: boolean; // Whether user has skipped this item
  href: string;
  emoji: string;
  description: string;
  weight: number; // How much this contributes to total (out of 100)
  skippable?: boolean; // Whether this item can be skipped
}

interface Props {
  user: any;
  avatar: string | null;
  coverPhoto: string | null;
  about: string;
  shopPolicies: any;
  listingsCount: number;
  referralCount: number;
}

export default function ProfileCompletion({
  user,
  avatar,
  coverPhoto,
  about,
  shopPolicies,
  listingsCount,
  referralCount,
  onCompletionChange,
}: Props) {
  const [items, setItems] = useState<CompletionItem[]>([]);
  const [completion, setCompletion] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingPolicies, setEditingPolicies] = useState(false);
  const [aboutText, setAboutText] = useState(about);
  const [policiesData, setPoliciesData] = useState(shopPolicies || {
    shopAbout: "",
    shippingPolicy: "",
    returnsPolicy: "",
  });
  const [savingAbout, setSavingAbout] = useState(false);
  const [savingPolicies, setSavingPolicies] = useState(false);
  const [skippedItems, setSkippedItems] = useState<Set<string>>(new Set());
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load skipped items from localStorage
    if (typeof window !== 'undefined' && user?.id) {
      const stored = localStorage.getItem(`skippedItems_${user.id}`);
      if (stored) {
        try {
          setSkippedItems(new Set(JSON.parse(stored)));
        } catch (e) {
          console.error("Error loading skipped items:", e);
        }
      }
    }
  }, [user?.id]);

  useEffect(() => {
    setAboutText(about);
  }, [about]);

  useEffect(() => {
    setPoliciesData(shopPolicies || {
      shopAbout: "",
      shippingPolicy: "",
      returnsPolicy: "",
    });
  }, [shopPolicies]);

  useEffect(() => {
    calculateCompletion();
  }, [user, avatar, coverPhoto, about, shopPolicies, listingsCount, referralCount, skippedItems]);

  function calculateCompletion() {
    const completionItems: CompletionItem[] = [
      {
        id: "username",
        label: "Add Username",
        completed: !!user?.username,
        skipped: skippedItems.has("username"),
        href: "/profile#settings",
        emoji: "👤",
        description: "Help buyers find you with a memorable username",
        weight: 15,
        skippable: false,
      },
      {
        id: "avatar",
        label: "Upload Profile Picture",
        completed: !!avatar,
        skipped: skippedItems.has("avatar"),
        href: "/profile",
        emoji: "🖼️",
        description: "Add a profile picture to build trust with buyers",
        weight: 15,
        skippable: false,
      },
      {
        id: "cover",
        label: "Add Cover Photo",
        completed: !!coverPhoto,
        skipped: skippedItems.has("cover"),
        href: "/profile",
        emoji: "🎨",
        description: "Personalize your shop with a cover photo",
        weight: 10,
        skippable: true,
      },
      {
        id: "about",
        label: "Write About Section",
        completed: !!about && about.trim().length > 20,
        skipped: skippedItems.has("about"),
        href: "/profile#overview",
        emoji: "📝",
        description: "Tell buyers about yourself and your shop",
        weight: 15,
        skippable: true,
      },
      {
        id: "policies",
        label: "Add Shop Policies",
        completed: !!(
          shopPolicies?.shopAbout ||
          shopPolicies?.shippingPolicy ||
          shopPolicies?.returnsPolicy
        ),
        skipped: skippedItems.has("policies"),
        href: "/profile#overview",
        emoji: "📋",
        description: "Set up shipping, returns, and shop policies",
        weight: 15,
        skippable: true,
      },
      {
        id: "listings",
        label: "Create First Listing",
        completed: listingsCount > 0,
        skipped: skippedItems.has("listings"),
        href: "/listings/new",
        emoji: "📦",
        description: "Start selling by creating your first listing",
        weight: 20,
        skippable: false,
      },
      {
        id: "verify",
        label: "Verify Email",
        completed: true, // Assuming email is verified if user can login
        skipped: false,
        href: "#",
        emoji: "✓",
        description: "Your email is verified",
        weight: 5,
        skippable: false,
      },
      {
        id: "referrals",
        label: "Invite Friends",
        completed: referralCount > 0,
        skipped: skippedItems.has("referrals"),
        href: "/referrals",
        emoji: "👥",
        description: "Invite friends and earn rewards",
        weight: 5,
        skippable: true,
      },
    ];

    setItems(completionItems);

    // Calculate completion: only count non-skipped items
    const nonSkippedItems = completionItems.filter((item) => !item.skipped);
    const totalWeight = nonSkippedItems.reduce((sum, item) => sum + item.weight, 0);
    const completedWeight = nonSkippedItems
      .filter((item) => item.completed)
      .reduce((sum, item) => sum + item.weight, 0);

    const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    setCompletion(percentage);
    // Notify parent component of completion change
    if (onCompletionChange) {
      onCompletionChange(percentage);
    }
  }

  const incompleteItems = items.filter((item) => !item.completed && !item.skipped);
  const completedCount = items.filter((item) => item.completed).length;

  function handleSkipItem(itemId: string) {
    if (!user?.id) return;
    const newSkipped = new Set(skippedItems);
    newSkipped.add(itemId);
    setSkippedItems(newSkipped);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`skippedItems_${user.id}`, JSON.stringify(Array.from(newSkipped)));
    }
  }

  async function handleSaveAbout() {
    if (!user?.id || !aboutText.trim()) {
      alert("Please enter some text for your about section");
      return;
    }

    setSavingAbout(true);
    try {
      const response = await fetch(`/api/users/${user.id}/about`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ about: aboutText }),
      });

      if (response.ok) {
        setEditingAbout(false);
        alert("About section saved successfully!");
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save about section");
      }
    } catch (error) {
      console.error("Error saving about:", error);
      alert("Failed to save about section");
    } finally {
      setSavingAbout(false);
    }
  }

  async function handleSavePolicies() {
    if (!user?.id) return;

    setSavingPolicies(true);
    try {
      const response = await fetch(`/api/users/${user.id}/policies`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify(policiesData),
      });

      if (response.ok) {
        setEditingPolicies(false);
        alert("Shop policies saved successfully!");
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save shop policies");
      }
    } catch (error) {
      console.error("Error saving policies:", error);
      alert("Failed to save shop policies");
    } finally {
      setSavingPolicies(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) {
      console.log("[PROFILE COMPLETION] No file selected or user not logged in");
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

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || errorData.message || "Failed to upload avatar");
      }

      const uploadData = await uploadResponse.json();
      const avatarUrl = uploadData.url || uploadData.path;
      
      if (!avatarUrl) {
        throw new Error("No URL returned from upload");
      }

      const saveResponse = await fetch(`/api/users/${user.id}/avatar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ avatar: avatarUrl }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || errorData.message || "Failed to save avatar");
      }

      // Reload the page to refresh the avatar state
      window.location.reload();
    } catch (error: any) {
      console.error("[PROFILE COMPLETION] Error uploading avatar:", error);
      alert(error.message || "Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  }

  async function handleCoverPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) {
      console.log("[PROFILE COMPLETION] No file selected or user not logged in");
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

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || errorData.message || "Failed to upload cover photo");
      }

      const uploadData = await uploadResponse.json();
      const coverUrl = uploadData.url || uploadData.path;
      
      if (!coverUrl) {
        throw new Error("No URL returned from upload");
      }

      const saveResponse = await fetch(`/api/users/${user.id}/cover-photo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ coverPhoto: coverUrl }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || errorData.message || "Failed to save cover photo");
      }

      // Reload the page to refresh the cover photo state
      window.location.reload();
    } catch (error: any) {
      console.error("[PROFILE COMPLETION] Error uploading cover photo:", error);
      alert(error.message || "Failed to upload cover photo. Please try again.");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Profile Completion</h3>
          <p className="text-sm text-gray-600">
            {completedCount} of {items.length} tasks completed
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-purple-600">{completion}%</div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              completion === 100
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : completion >= 75
                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                : completion >= 50
                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                : "bg-gradient-to-r from-red-400 to-red-500"
            }`}
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Completion Message */}
      {completion === 100 ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold text-green-800">Profile Complete!</p>
              <p className="text-sm text-green-700">
                Your profile is fully set up. Buyers can now see all your information!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-semibold mb-2">
            {incompleteItems.length} task{incompleteItems.length !== 1 ? "s" : ""} remaining to
            complete your profile
          </p>
          <p className="text-xs text-yellow-700">
            Complete your profile to increase buyer trust and boost sales!
          </p>
        </div>
      )}

      {/* Incomplete Items */}
      {incompleteItems.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 mb-2">Next Steps:</h4>
          {incompleteItems.slice(0, 4).map((item) => {
            // Special handling for avatar upload
            if (item.id === "avatar") {
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
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
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingAvatar ? "Uploading..." : "Upload"}
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
              );
            }

            // Special handling for cover photo upload
            if (item.id === "cover") {
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                  </div>
                  <div className="flex gap-2">
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
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingCover ? "Uploading..." : "Upload"}
                    </button>
                    {item.skippable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleSkipItem(item.id);
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-400 transition-colors"
                      >
                        Skip
                      </button>
                    )}
                  </div>
                  <input
                    ref={coverPhotoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverPhotoUpload}
                    disabled={uploadingCover}
                    className="hidden"
                  />
                </div>
              );
            }

            // Special handling for about section - inline editing
            if (item.id === "about") {
              if (editingAbout) {
                return (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.emoji}</span>
                      <p className="font-semibold text-gray-900">{item.label}</p>
                    </div>
                    <textarea
                      value={aboutText}
                      onChange={(e) => setAboutText(e.target.value)}
                      placeholder="Tell buyers about yourself and your shop..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveAbout}
                        disabled={savingAbout || !aboutText.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingAbout ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAbout(false);
                          setAboutText(about);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      {item.skippable && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAbout(false);
                            handleSkipItem(item.id);
                          }}
                          className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-400 transition-colors"
                        >
                          Skip
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setEditingAbout(true);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                    {item.skippable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleSkipItem(item.id);
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-400 transition-colors"
                      >
                        Skip
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            // Special handling for shop policies - inline editing
            if (item.id === "policies") {
              if (editingPolicies) {
                return (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.emoji}</span>
                      <p className="font-semibold text-gray-900">{item.label}</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">About Your Shop</label>
                        <textarea
                          value={policiesData.shopAbout || ""}
                          onChange={(e) => setPoliciesData({ ...policiesData, shopAbout: e.target.value })}
                          placeholder="Tell customers about your shop..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Shipping Policy</label>
                        <textarea
                          value={policiesData.shippingPolicy || ""}
                          onChange={(e) => setPoliciesData({ ...policiesData, shippingPolicy: e.target.value })}
                          placeholder="Describe your shipping policy..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Returns Policy</label>
                        <textarea
                          value={policiesData.returnsPolicy || ""}
                          onChange={(e) => setPoliciesData({ ...policiesData, returnsPolicy: e.target.value })}
                          placeholder="Describe your returns policy..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSavePolicies}
                        disabled={savingPolicies}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingPolicies ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPolicies(false);
                          setPoliciesData(shopPolicies || {
                            shopAbout: "",
                            shippingPolicy: "",
                            returnsPolicy: "",
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      {item.skippable && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPolicies(false);
                            handleSkipItem(item.id);
                          }}
                          className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-400 transition-colors"
                        >
                          Skip
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setEditingPolicies(true);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                    {item.skippable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleSkipItem(item.id);
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-400 transition-colors"
                      >
                        Skip
                      </button>
                    )}
                  </div>
                </div>
              );
            }
            
            // Regular link for other items (with skip button if skippable)
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={item.href}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Go
                  </Link>
                  {item.skippable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleSkipItem(item.id);
                      }}
                      className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-400 transition-colors"
                    >
                      Skip
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Items Summary */}
      {completedCount > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors">
              ✓ View Completed Items ({completedCount})
            </summary>
            <div className="mt-3 space-y-2">
              {items
                .filter((item) => item.completed)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                  >
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                ))}
            </div>
          </details>
        </div>
      )}

      {/* Quick Actions */}
      {completion < 100 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex gap-2">
            <Link
              href="/profile"
              className="flex-1 text-center px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
            >
              Complete Profile
            </Link>
            {listingsCount === 0 && (
              <Link
                href="/listings/new"
                className="flex-1 text-center px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
              >
                Create Listing
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
