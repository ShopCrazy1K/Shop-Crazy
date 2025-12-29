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
  }, [user, router]);

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
              className="block p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between">
                <strong>{c.username}</strong>
                <span className="text-sm text-gray-500">
                  {formatDate(c.updatedAt)}
                </span>
              </div>
              <p className="text-gray-600 truncate">{c.lastMessage}</p>
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

