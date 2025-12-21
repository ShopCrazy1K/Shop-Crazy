"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  createdAt: Date;
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const userId = params.userId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router]);

  const currentUserId = user?.id || "";

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch(
          `/api/messages/${userId}?currentUserId=${currentUserId}`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchMessages();
    }
  }, [userId]);

  async function sendMessage() {
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: userId,
          content: input,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([
          ...messages,
          {
            id: newMessage.id,
            text: newMessage.content,
            fromMe: true,
            createdAt: newMessage.createdAt,
          },
        ]);
        setInput("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col h-[80vh]">
      <h1 className="font-accent text-3xl mb-4">Conversation</h1>

      <div className="flex-1 border rounded-xl p-4 space-y-3 overflow-y-auto bg-white">
        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-xs p-3 rounded-xl ${
                m.fromMe
                  ? "ml-auto bg-purple-600 text-white"
                  : "mr-auto bg-gray-100"
              }`}
            >
              {m.text}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 border rounded-xl p-3"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="bg-purple-600 text-white px-6 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

