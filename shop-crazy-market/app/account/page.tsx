"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import SearchBar from "@/components/SearchBar";

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [storeCredit, setStoreCredit] = useState<number>(0);
  const [loadingCredit, setLoadingCredit] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralLink, setReferralLink] = useState<string>("");
  const [referralStats, setReferralStats] = useState({ referralCount: 0, totalEarned: 0 });
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchStoreCredit();
      fetchReferralInfo();
    }
  }, [user, authLoading, router]);

  async function fetchCreditHistory() {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/users/${user.id}/store-credit/history`, {
        headers: {
          "x-user-id": user.id,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCreditHistory(data.history || []);
      }
    } catch (error) {
      console.error("Error fetching credit history:", error);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function fetchStoreCredit() {
    if (!user?.id) return;
    setLoadingCredit(true);
    try {
      const response = await fetch(`/api/users/${user.id}/store-credit`);
      if (response.ok) {
        const data = await response.json();
        setStoreCredit(data.storeCredit || 0);
      }
    } catch (error) {
      console.error("Error fetching store credit:", error);
    } finally {
      setLoadingCredit(false);
    }
  }

  async function fetchReferralInfo() {
    if (!user?.id) return;
    setLoadingReferral(true);
    try {
      const response = await fetch(`/api/referrals/code?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setReferralCode(data.referralCode || "");
        setReferralLink(data.referralLink || "");
        setReferralStats(data.stats || { referralCount: 0, totalEarned: 0 });
      }
    } catch (error) {
      console.error("Error fetching referral info:", error);
    } finally {
      setLoadingReferral(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (authLoading) {
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

      {/* Account Section */}
      <section className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl mx-1 sm:mx-0 max-w-2xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">My Account</h2>
        
        <div className="space-y-4">
          {/* Store Credit Display */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm sm:text-base mb-1">Store Credit Balance</p>
                {loadingCredit ? (
                  <p className="text-2xl sm:text-3xl font-bold text-gray-400">Loading...</p>
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    ${((storeCredit || 0) / 100).toFixed(2)}
                  </p>
                )}
              </div>
              <span className="text-4xl sm:text-5xl">💳</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Use your store credit during checkout to save on purchases
            </p>
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory && creditHistory.length === 0) {
                  fetchCreditHistory();
                }
              }}
              className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-semibold underline"
            >
              {showHistory ? "Hide" : "View"} Credit History
            </button>
          </div>

          {/* Credit History */}
          {showHistory && (
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Credit History</h3>
              {loadingHistory ? (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              ) : creditHistory.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No credit history yet</div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {creditHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-lg border ${
                        entry.isUsage
                          ? "bg-red-50 border-red-200"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {entry.isUsage ? "Used" : "Earned"}: ${Math.abs(entry.amountDollars).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {entry.reason.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </p>
                          {entry.expiresAt && (
                            <p className={`text-xs mt-1 ${entry.isExpired ? "text-red-600" : "text-gray-500"}`}>
                              {entry.isExpired ? "Expired" : `Expires: ${new Date(entry.expiresAt).toLocaleDateString()}`}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Info */}
          <div className="space-y-3">
            {/* Email Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              {!editingEmail ? (
                <div className="flex justify-between items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-xs sm:text-sm mb-1">Email</p>
                    <p className="font-semibold text-sm sm:text-base truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNewEmail(user.email);
                        setEmailPassword("");
                        setEditingEmail(true);
                        setEmailError("");
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg border-2 border-purple-600 transition-colors whitespace-nowrap shadow-sm"
                      type="button"
                    >
                      Edit Email
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700">New Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setEmailError("");
                    }}
                    placeholder="Enter new email"
                    className="w-full px-3 sm:px-4 py-2 border-2 border-purple-300 rounded-lg text-sm sm:text-base"
                  />
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mt-2">Current Password</label>
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={(e) => {
                      setEmailPassword(e.target.value);
                      setEmailError("");
                    }}
                    placeholder="Enter your password to confirm"
                    className="w-full px-3 sm:px-4 py-2 border-2 border-purple-300 rounded-lg text-sm sm:text-base"
                  />
                  {emailError && (
                    <p className="text-xs text-red-600">{emailError}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Your password is required to change your email address
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!newEmail.trim()) {
                          setEmailError("Email cannot be empty");
                          return;
                        }

                        if (!emailPassword.trim()) {
                          setEmailError("Password is required");
                          return;
                        }

                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(newEmail.trim())) {
                          setEmailError("Invalid email format");
                          return;
                        }

                        if (newEmail.toLowerCase() === user.email.toLowerCase()) {
                          setEmailError("New email must be different from current email");
                          return;
                        }

                        setSavingEmail(true);
                        setEmailError("");
                        try {
                          const response = await fetch(`/api/users/${user.id}/change-email`, {
                            method: "POST",
                            headers: { 
                              "Content-Type": "application/json",
                              "x-user-id": user.id,
                            },
                            body: JSON.stringify({ 
                              newEmail: newEmail.trim(),
                              password: emailPassword,
                            }),
                          });

                          const data = await response.json();
                          if (response.ok) {
                            // Update local user state
                            const updatedUser = { ...user, email: newEmail.trim() };
                            // Update in localStorage if it exists
                            const storedUser = localStorage.getItem("user");
                            if (storedUser) {
                              localStorage.setItem("user", JSON.stringify(updatedUser));
                            }
                            alert("Email address updated successfully!");
                            // Force page reload to update auth context
                            window.location.reload();
                          } else {
                            setEmailError(data.error || "Failed to update email address");
                          }
                        } catch (error) {
                          console.error("Error updating email:", error);
                          setEmailError("An error occurred while updating email address");
                        } finally {
                          setSavingEmail(false);
                        }
                      }}
                      disabled={savingEmail}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      {savingEmail ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingEmail(false);
                        setNewEmail("");
                        setEmailPassword("");
                        setEmailError("");
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Username Section */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              {!editingUsername ? (
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-gray-500 text-xs sm:text-sm">Username</p>
                    <p className="font-semibold text-sm sm:text-lg truncate">
                      {user.username || "Not set"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl flex-shrink-0">👤</span>
                    <button
                      onClick={() => {
                        setNewUsername(user.username || "");
                        setEditingUsername(true);
                        setUsernameError("");
                      }}
                      className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-semibold px-2 py-1"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700">Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value);
                      setUsernameError("");
                    }}
                    placeholder="Enter username"
                    className="w-full px-3 sm:px-4 py-2 border-2 border-purple-300 rounded-lg text-sm sm:text-base"
                    maxLength={20}
                  />
                  {usernameError && (
                    <p className="text-xs text-red-600">{usernameError}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    3-20 characters, letters, numbers, underscores, or hyphens
                  </p>
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
                            // Update local user state
                            const updatedUser = { ...user, username: newUsername.trim() };
                            // Update in localStorage if it exists
                            const storedUser = localStorage.getItem("user");
                            if (storedUser) {
                              localStorage.setItem("user", JSON.stringify(updatedUser));
                            }
                            // Force page reload to update auth context
                            window.location.reload();
                          } else {
                            setUsernameError(data.error || "Failed to update username");
                          }
                        } catch (error) {
                          console.error("Error updating username:", error);
                          setUsernameError("An error occurred while updating username");
                        } finally {
                          setSavingUsername(false);
                        }
                      }}
                      disabled={savingUsername}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      {savingUsername ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingUsername(false);
                        setNewUsername("");
                        setUsernameError("");
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Password Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              {!editingPassword ? (
                <div className="flex justify-between items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-xs sm:text-sm mb-1">Password</p>
                    <p className="font-semibold text-sm sm:text-base">••••••••</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setEditingPassword(true);
                        setPasswordError("");
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg border-2 border-purple-600 transition-colors whitespace-nowrap shadow-sm"
                      type="button"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Enter current password"
                    className="w-full px-3 sm:px-4 py-2 border-2 border-purple-300 rounded-lg text-sm sm:text-base"
                  />
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mt-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Enter new password"
                    className="w-full px-3 sm:px-4 py-2 border-2 border-purple-300 rounded-lg text-sm sm:text-base"
                  />
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mt-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Confirm new password"
                    className="w-full px-3 sm:px-4 py-2 border-2 border-purple-300 rounded-lg text-sm sm:text-base"
                  />
                  {passwordError && (
                    <p className="text-xs text-red-600">{passwordError}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!currentPassword.trim()) {
                          setPasswordError("Current password is required");
                          return;
                        }

                        if (!newPassword.trim()) {
                          setPasswordError("New password is required");
                          return;
                        }

                        if (newPassword.length < 8) {
                          setPasswordError("New password must be at least 8 characters long");
                          return;
                        }

                        if (newPassword !== confirmPassword) {
                          setPasswordError("New passwords do not match");
                          return;
                        }

                        setSavingPassword(true);
                        setPasswordError("");
                        try {
                          const response = await fetch(`/api/users/${user.id}/change-password`, {
                            method: "POST",
                            headers: { 
                              "Content-Type": "application/json",
                              "x-user-id": user.id,
                            },
                            body: JSON.stringify({ 
                              currentPassword: currentPassword,
                              newPassword: newPassword,
                            }),
                          });

                          const data = await response.json();
                          if (response.ok) {
                            alert("Password changed successfully!");
                            setEditingPassword(false);
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                          } else {
                            setPasswordError(data.error || "Failed to change password");
                          }
                        } catch (error) {
                          console.error("Error changing password:", error);
                          setPasswordError("An error occurred while changing password");
                        } finally {
                          setSavingPassword(false);
                        }
                      }}
                      disabled={savingPassword}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      {savingPassword ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordError("");
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-gray-500 text-xs sm:text-sm">Account Type</p>
                <p className="font-semibold text-sm sm:text-lg capitalize">{user.role?.toLowerCase() || "user"}</p>
              </div>
              <span className="text-xl sm:text-2xl flex-shrink-0">
                {user.role === "ADMIN" ? "👑" : "⭐"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Program Section */}
      <section className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl mx-1 sm:mx-0 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">💰 Referral Program</h2>
          <Link
            href="/referrals"
            className="text-sm sm:text-base text-purple-600 hover:underline font-semibold"
          >
            View Full Page →
          </Link>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-purple-200">
            <p className="text-sm sm:text-base text-gray-700 mb-4">
              💰 <strong>Earn $5</strong> in store credit for every friend you refer! Share your unique referral link and get rewarded when they sign up.
            </p>
            <Link
              href="/referrals"
              className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
            >
              Get Your Referral Link →
            </Link>
          </div>

          {loadingReferral ? (
            <div className="text-center py-4 text-gray-500">Loading referral info...</div>
          ) : referralCode ? (
            <>
              {/* Referral Code */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700">Your Referral Code</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 px-3 sm:px-4 py-2 border-2 border-purple-300 rounded-lg font-mono font-bold text-base sm:text-lg bg-white text-center sm:text-left"
                  />
                  <button
                    onClick={() => copyToClipboard(referralCode)}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm sm:text-base"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Referral Link */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700">Your Referral Link</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-3 sm:px-4 py-2 border-2 border-purple-300 rounded-lg text-xs sm:text-sm bg-white break-all"
                  />
                  <button
                    onClick={() => copyToClipboard(referralLink)}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors whitespace-nowrap text-sm sm:text-base"
                  >
                    {copied ? "✓ Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700">Share Your Link</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const text = `Join Shop Crazy Market and get great deals! Use my referral link: ${referralLink}`;
                      if (navigator.share) {
                        navigator.share({
                          title: "Join Shop Crazy Market",
                          text: text,
                          url: referralLink,
                        }).catch(() => copyToClipboard(referralLink));
                      } else {
                        copyToClipboard(referralLink);
                      }
                    }}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <span className="text-sm sm:text-base">📱</span> <span>Share</span>
                  </button>
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent("Join Shop Crazy Market!");
                      const body = encodeURIComponent(`Hi! I wanted to share Shop Crazy Market with you. It's a great marketplace with amazing deals!\n\nSign up using my referral link and we both benefit:\n${referralLink}\n\nWhen you sign up, I'll get $5 in store credit!`);
                      window.location.href = `mailto:?subject=${subject}&body=${body}`;
                    }}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <span className="text-sm sm:text-base">📧</span> <span>Email</span>
                  </button>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Join Shop Crazy Market! Use my referral link: ${referralLink}`);
                      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                    }}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <span className="text-sm sm:text-base">🐦</span> <span>X</span>
                  </button>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Join Shop Crazy Market! Use my referral link: ${referralLink}`);
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${text}`, '_blank');
                    }}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <span className="text-sm sm:text-base">📘</span> <span>Facebook</span>
                  </button>
                </div>
              </div>

              {/* Share Message Template */}
              {referralLink && (
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700">Copy & Paste Message</label>
                  <textarea
                    readOnly
                    value={`Hey! I wanted to share Shop Crazy Market with you. It's an amazing marketplace with great deals!\n\nSign up using my referral link and we both benefit:\n${referralLink}\n\nWhen you sign up, I'll get $5 in store credit! 🎉`}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-purple-300 rounded-lg text-xs sm:text-sm bg-white resize-none"
                    onClick={(e) => {
                      (e.target as HTMLTextAreaElement).select();
                      copyToClipboard((e.target as HTMLTextAreaElement).value);
                    }}
                  />
                  <p className="text-xs text-gray-500">Tap the message above to copy it</p>
                </div>
              )}

              {/* Referral Stats */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <p className="text-sm text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold text-green-600">{referralStats.referralCount}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-yellow-200">
                  <p className="text-sm text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ${(referralStats.totalEarned / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">Unable to load referral code. Please try refreshing the page.</p>
              <button
                onClick={fetchReferralInfo}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

