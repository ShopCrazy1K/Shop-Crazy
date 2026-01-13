"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

interface Conversation {
  userId: string;
  username: string;
  lastMessage: string;
  updatedAt: Date | string;
  unreadCount?: number;
  avatar?: string;
}

function MessagesContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    // If a userId is provided in the URL, redirect to that conversation
    if (targetUserId && targetUserId !== user.id) {
      router.push(`/messages/${targetUserId}`);
    }
  }, [user, router, targetUserId]);

  const currentUserId = user?.id || "";

  useEffect(() => {
    async function fetchConversations() {
      try {
        const response = await fetch(`/api/messages?userId=${currentUserId}`);
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [currentUserId]);

  function formatDate(date: Date | string): string {
    if (typeof date === "string") return date;
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="font-accent text-4xl mb-6">Messages</h1>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading conversations...</div>
      ) : conversations.length === 0 ? (
        <div className="border rounded-xl bg-white shadow p-8 text-center text-gray-500">
          <p className="text-lg">No conversations yet</p>
          <p className="text-sm mt-2">Start messaging sellers from product pages!</p>
        </div>
      ) : (
        <div className="border rounded-xl divide-y bg-white shadow">
          {conversations.map((c) => (
            <Link
              key={c.userId}
              href={`/messages/${c.userId}`}
              className="block p-4 hover:bg-gray-50 transition-colors relative"
            >
              <div className="flex items-start gap-3">
                {c.avatar ? (
                  <img src={c.avatar} alt={c.username} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-lg">
                    {c.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <strong className="text-gray-900">{c.username}</strong>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatDate(c.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-gray-600 truncate text-sm">{c.lastMessage}</p>
                    {c.unreadCount && c.unreadCount > 0 && (
                      <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {c.unreadCount > 9 ? "9+" : c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500 py-8">Loading messages...</div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}

