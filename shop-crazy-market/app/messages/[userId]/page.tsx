"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  createdAt: Date;
  attachments?: string[];
  sender?: {
    id: string;
    username: string | null;
    email: string;
  };
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
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (userId && currentUserId) {
      fetchMessages();
      // Poll for new messages every 5 seconds when conversation is open
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [userId, currentUserId]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function handleFileUpload(files: File[]) {
    if (files.length === 0) return;
    
    setUploadingAttachments(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        // Validate file size (max 10MB per file)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum file size is 10MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({ error: "Unknown error" }));
          alert(`Failed to upload ${file.name}: ${errorData.error || "Unknown error"}`);
          continue;
        }

        const uploadData = await uploadResponse.json();
        const fileUrl = uploadData.url || uploadData.path;
        if (fileUrl) {
          uploadedUrls.push(fileUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setAttachments((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setUploadingAttachments(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function sendMessage() {
    if ((!input.trim() && attachments.length === 0) || sending) return;

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
          content: input.trim(),
          attachments: attachments.length > 0 ? attachments : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      if (response.ok) {
        const newMessage = await response.json();
        setInput("");
        setAttachments([]);
        // Refresh messages to get the latest
        const refreshResponse = await fetch(
          `/api/messages/${userId}?currentUserId=${currentUserId}`
        );
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setMessages(refreshData);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col h-[80vh]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-accent text-3xl">Conversation</h1>
        <Link
          href="/messages"
          className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
        >
          ← Back to Messages
        </Link>
      </div>

      <div className="flex-1 border rounded-xl p-4 space-y-3 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg mb-2">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((m, index) => {
            const showDate = index === 0 || 
              new Date(m.createdAt).getDate() !== new Date(messages[index - 1].createdAt).getDate();
            
            return (
              <div key={m.id}>
                {showDate && (
                  <div className="text-center text-xs text-gray-500 my-4">
                    {new Date(m.createdAt).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                )}
                <div
                  className={`flex gap-2 ${m.fromMe ? "justify-end" : "justify-start"}`}
                >
                  {!m.fromMe && (
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm flex-shrink-0">
                      {m.sender?.username?.charAt(0).toUpperCase() || m.sender?.email?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div className={`max-w-xs p-3 rounded-xl ${
                    m.fromMe
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 rounded-bl-none"
                  }`}>
                    {m.text && <p className="text-sm">{m.text}</p>}
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {m.attachments.map((url, idx) => {
                          const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('/image');
                          return isImage ? (
                            <div key={idx} className="rounded-lg overflow-hidden">
                              <img
                                src={url}
                                alt={`Attachment ${idx + 1}`}
                                className="max-w-full h-auto max-h-64 object-contain cursor-pointer"
                                onClick={() => window.open(url, '_blank')}
                              />
                            </div>
                          ) : (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`block p-2 rounded text-sm underline ${
                                m.fromMe ? "text-purple-100" : "text-purple-600"
                              }`}
                            >
                              📎 Attachment {idx + 1}
                            </a>
                          );
                        })}
                      </div>
                    )}
                    <p className={`text-xs mt-1 ${
                      m.fromMe ? "text-purple-100" : "text-gray-400"
                    }`}>
                      {new Date(m.createdAt).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </p>
                  </div>
                  {m.fromMe && (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      You
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 space-y-2">
        {/* Preview attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
            {attachments.map((url, idx) => {
              const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('/image');
              return (
                <div key={idx} className="relative group">
                  {isImage ? (
                    <img
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      📎
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAttachments || sending}
            className="bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            title="Add attachment"
          >
            {uploadingAttachments ? "⏳" : "📎"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.zip,.rar,.txt"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                handleFileUpload(files);
              }
            }}
            className="hidden"
          />
          <div className="flex-1 border rounded-xl bg-white p-2 focus-within:ring-2 focus-within:ring-purple-500">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="w-full border-none outline-none resize-none p-2 min-h-[40px] max-h-[120px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={sending || (!input.trim() && attachments.length === 0)}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

