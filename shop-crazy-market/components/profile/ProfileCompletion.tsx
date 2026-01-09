"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface CompletionItem {
  id: string;
  label: string;
  completed: boolean;
  href: string;
  emoji: string;
  description: string;
  weight: number; // How much this contributes to total (out of 100)
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
}: Props) {
  const [items, setItems] = useState<CompletionItem[]>([]);
  const [completion, setCompletion] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    calculateCompletion();
  }, [user, avatar, coverPhoto, about, shopPolicies, listingsCount, referralCount]);

  function calculateCompletion() {
    const completionItems: CompletionItem[] = [
      {
        id: "username",
        label: "Add Username",
        completed: !!user?.username,
        href: "/profile#settings",
        emoji: "👤",
        description: "Help buyers find you with a memorable username",
        weight: 15,
      },
      {
        id: "avatar",
        label: "Upload Profile Picture",
        completed: !!avatar,
        href: "/profile",
        emoji: "🖼️",
        description: "Add a profile picture to build trust with buyers",
        weight: 15,
      },
      {
        id: "cover",
        label: "Add Cover Photo",
        completed: !!coverPhoto,
        href: "/profile",
        emoji: "🎨",
        description: "Personalize your shop with a cover photo",
        weight: 10,
      },
      {
        id: "about",
        label: "Write About Section",
        completed: !!about && about.trim().length > 20,
        href: "/profile#overview",
        emoji: "📝",
        description: "Tell buyers about yourself and your shop",
        weight: 15,
      },
      {
        id: "policies",
        label: "Add Shop Policies",
        completed: !!(
          shopPolicies?.shopAbout ||
          shopPolicies?.shippingPolicy ||
          shopPolicies?.returnsPolicy
        ),
        href: "/profile#overview",
        emoji: "📋",
        description: "Set up shipping, returns, and shop policies",
        weight: 15,
      },
      {
        id: "listings",
        label: "Create First Listing",
        completed: listingsCount > 0,
        href: "/listings/new",
        emoji: "📦",
        description: "Start selling by creating your first listing",
        weight: 20,
      },
      {
        id: "verify",
        label: "Verify Email",
        completed: true, // Assuming email is verified if user can login
        href: "#",
        emoji: "✓",
        description: "Your email is verified",
        weight: 5,
      },
      {
        id: "referrals",
        label: "Invite Friends",
        completed: referralCount > 0,
        href: "/referrals",
        emoji: "👥",
        description: "Invite friends and earn rewards",
        weight: 5,
      },
    ];

    setItems(completionItems);

    const totalWeight = completionItems.reduce((sum, item) => sum + item.weight, 0);
    const completedWeight = completionItems
      .filter((item) => item.completed)
      .reduce((sum, item) => sum + item.weight, 0);

    const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    setCompletion(percentage);
  }

  const incompleteItems = items.filter((item) => !item.completed);
  const completedCount = items.filter((item) => item.completed).length;

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
            
            // Regular link for other items
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                </div>
                <span className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </Link>
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
