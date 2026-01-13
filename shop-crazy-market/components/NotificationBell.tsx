"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all"); // "all", "message", "order", "review", "dmca", "strike"

  useEffect(() => {
    console.log("[NOTIFICATION BELL] Component mounted/updated, user:", user?.id ? `${user.id.substring(0, 8)}...` : 'none');
    if (user?.id) {
      console.log("[NOTIFICATION BELL] User logged in, fetching notifications");
      fetchNotifications();
      // Poll for new notifications every 15 seconds (more responsive)
      const interval = setInterval(() => {
        console.log("[NOTIFICATION BELL] Polling for new notifications");
        fetchNotifications();
      }, 15000);
      return () => {
        console.log("[NOTIFICATION BELL] Cleaning up interval");
        clearInterval(interval);
      };
    } else {
      // Reset notifications when user logs out
      console.log("[NOTIFICATION BELL] User logged out, clearing notifications");
      setNotifications([]);
      setUnreadCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  
  // Log state changes for debugging
  useEffect(() => {
    console.log("[NOTIFICATION BELL] State changed:", {
      isOpen,
      unreadCount,
      notificationsCount: notifications.length,
      loading,
    });
  }, [isOpen, unreadCount, notifications.length, loading]);

  async function fetchNotifications() {
    if (!user?.id) {
      console.log("[NOTIFICATION BELL] No user ID, clearing notifications");
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    try {
      console.log("[NOTIFICATION BELL] Fetching notifications for user:", user.id);
      setLoading(true);
      const response = await fetch(`/api/notifications?userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Ensure fresh data
      });
      
      console.log("[NOTIFICATION BELL] Response status:", response.status, response.statusText);
      
      if (response.ok) {
        let data: any;
        try {
          data = await response.json();
          console.log("[NOTIFICATION BELL] Received data:", {
            hasNotifications: !!data.notifications,
            notificationsCount: Array.isArray(data.notifications) ? data.notifications.length : 0,
            unreadCount: data.unreadCount,
          });
        } catch (jsonError) {
          console.error("[NOTIFICATION BELL] Failed to parse notifications JSON:", jsonError);
          // Don't clear notifications on JSON parse error, keep existing ones
          return;
        }
        
        if (data && typeof data === 'object') {
          // Validate and set notifications
          const notificationsArray = Array.isArray(data.notifications) 
            ? data.notifications.filter((n: any) => n && n.id && n.title && n.message)
            : [];
          console.log("[NOTIFICATION BELL] Setting notifications:", notificationsArray.length, "valid notifications");
          setNotifications(notificationsArray);
          setUnreadCount(typeof data.unreadCount === 'number' ? Math.max(0, data.unreadCount) : 0);
          setError(null); // Clear error on success
        } else {
          console.error("[NOTIFICATION BELL] Invalid notifications data format:", data);
          // Don't clear notifications on invalid data, keep existing ones
        }
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error("[NOTIFICATION BELL] Failed to fetch notifications:", response.status, response.statusText, errorText);
        // Don't clear notifications on error, keep existing ones
      }
    } catch (error: any) {
      console.error("[NOTIFICATION BELL] Error fetching notifications:", error);
      console.error("[NOTIFICATION BELL] Error details:", {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      });
      // Don't clear notifications on error, keep existing ones
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId: string) {
    if (!user?.id) {
      console.error("Cannot mark as read: no user ID");
      return;
    }
    
    // Optimistically update UI first
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to mark notification as read:", response.status, errorData);
        // Revert optimistic update on error
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: false } : n
          )
        );
        setUnreadCount((prev) => prev + 1);
      } else {
        // Success - refresh to ensure sync
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert optimistic update on error
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: false } : n
        )
      );
      setUnreadCount((prev) => prev + 1);
    }
  }

  async function deleteNotification(notificationId: string) {
    if (!user?.id) {
      console.error("Cannot delete notification: no user ID");
      return;
    }
    
    // Optimistically remove from UI
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (notifications.find((n) => n.id === notificationId && !n.read)) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        // Revert on error
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Revert on error
      await fetchNotifications();
    }
  }

  async function markAllAsRead() {
    if (!user?.id) {
      console.error("Cannot mark all as read: no user ID");
      return;
    }
    
    // Optimistically update UI first
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
    setUnreadCount(0);
    
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to mark all notifications as read:", response.status, errorData);
        // Revert optimistic update on error
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
      } else {
        // Success - refresh to ensure sync
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      // Revert optimistic update on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  }

  function formatTime(dateString: string): string {
    try {
      if (!dateString) return "Unknown";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Unknown";
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative inline-flex items-center" style={{ zIndex: 100 }}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("[NOTIFICATION BELL] Button clicked, current state:", { isOpen, unreadCount, notificationsCount: notifications.length });
          setIsOpen((prev) => {
            const newState = !prev;
            console.log("[NOTIFICATION BELL] Setting isOpen to:", newState);
            return newState;
          });
        }}
        className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md flex items-center justify-center"
        aria-label="Notifications"
        aria-expanded={isOpen}
        type="button"
        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 101 }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs" style={{ zIndex: 102 }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {error && (
          <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-[8px] px-1 rounded" title={error}>
            ⚠️
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20"
            style={{ zIndex: 99 }}
            onClick={(e) => {
              e.stopPropagation();
              console.log("[NOTIFICATION BELL] Backdrop clicked, closing dropdown");
              setIsOpen(false);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
          
          {/* Dropdown - Positioned differently for mobile vs desktop */}
          <div 
            className="fixed sm:absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden flex flex-col"
            style={{ 
              position: 'fixed',
              top: '60px',
              right: '20px',
              zIndex: 10000,
              pointerEvents: 'auto',
              maxWidth: 'calc(100vw - 40px)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              console.log("[NOTIFICATION BELL] Dropdown clicked");
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              console.log("[NOTIFICATION BELL] Dropdown mouseDown");
            }}
          >
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                    type="button"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {/* Filter buttons */}
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilter("all");
                  }}
                  className={`text-xs px-2 py-1 rounded ${filter === "all" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}
                  type="button"
                >
                  All
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilter("message");
                  }}
                  className={`text-xs px-2 py-1 rounded ${filter === "message" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                  type="button"
                >
                  Messages
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilter("order");
                  }}
                  className={`text-xs px-2 py-1 rounded ${filter === "order" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  type="button"
                >
                  Orders
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilter("dmca");
                  }}
                  className={`text-xs px-2 py-1 rounded ${filter === "dmca" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}
                  type="button"
                >
                  DMCA
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-4 sm:p-6 text-center text-gray-500 text-xs sm:text-sm">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 sm:p-6 text-center text-gray-500 text-xs sm:text-sm">
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications
                    .filter((n) => filter === "all" || n.type === filter)
                    .map((notification) => {
                    // Validate notification data before rendering
                    if (!notification || !notification.id || !notification.title || !notification.message) {
                      console.warn("Invalid notification data:", notification);
                      return null;
                    }
                    return (
                    <div
                      key={notification.id}
                      className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                    >
                      {notification.link ? (
                        <div
                          onClick={async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            try {
                              // Mark as read first (don't await to avoid blocking navigation)
                              markAsRead(notification.id).catch(err => console.error("Error marking as read:", err));
                              setIsOpen(false);
                              // Small delay to ensure state updates
                              await new Promise(resolve => setTimeout(resolve, 100));
                              // Navigate to the link using router
                              if (notification.link && typeof notification.link === 'string' && notification.link.trim()) {
                                try {
                                  router.push(notification.link);
                                } catch (navError: any) {
                                  console.error("Navigation error:", navError);
                                  // Fallback to window.location if router.push fails
                                  window.location.href = notification.link;
                                }
                              }
                            } catch (error: any) {
                              console.error("Error handling notification click:", error);
                              // Still try to navigate even if mark as read fails
                              if (notification.link && typeof notification.link === 'string' && notification.link.trim()) {
                                try {
                                  router.push(notification.link);
                                } catch (navError: any) {
                                  console.error("Navigation error:", navError);
                                  // Fallback to window.location if router.push fails
                                  window.location.href = notification.link;
                                }
                              }
                            }
                          }}
                          className="block cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {notification.type === "message" && (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 text-sm sm:text-lg">💬</span>
                                </div>
                              )}
                              {notification.type === "order" && (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-green-600 text-sm sm:text-lg">📦</span>
                                </div>
                              )}
                              {notification.type === "review" && (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <span className="text-yellow-600 text-sm sm:text-lg">⭐</span>
                                </div>
                              )}
                              {notification.type === "dmca" && (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
                                  <span className="text-red-600 text-sm sm:text-lg">⚠️</span>
                                </div>
                              )}
                              {notification.type === "strike" && (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                  <span className="text-orange-600 text-sm sm:text-lg">🚫</span>
                                </div>
                              )}
                              {notification.type === "copyright" && (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <span className="text-yellow-600 text-sm sm:text-lg">🔍</span>
                                </div>
                              )}
                              {!["message", "order", "review", "dmca", "strike", "copyright"].includes(notification.type) && (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                  <span className="text-purple-600 text-sm sm:text-lg">🔔</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs sm:text-sm text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-600 text-xs"
                                type="button"
                                title="Delete"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 text-lg">🔔</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-700"
                              type="button"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2 sm:p-3 border-t border-gray-200 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-semibold"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

