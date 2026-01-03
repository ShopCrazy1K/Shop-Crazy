"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotUsername, setShowForgotUsername] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotUsername(e: React.FormEvent) {
    e.preventDefault();
    setForgotMessage("");
    setForgotLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setForgotMessage("Your username has been sent to your email address.");
        setForgotEmail("");
        setTimeout(() => setShowForgotUsername(false), 3000);
      } else {
        setForgotMessage(data.error || "Failed to send username");
      }
    } catch (err: any) {
      setForgotMessage("An error occurred. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotMessage("");
    setForgotLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setForgotMessage("Password reset instructions have been sent to your email address.");
        setForgotEmail("");
        setTimeout(() => setShowForgotPassword(false), 3000);
      } else {
        setForgotMessage(data.error || "Failed to send reset email");
      }
    } catch (err: any) {
      setForgotMessage("An error occurred. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="font-accent text-4xl text-center">Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-xl px-4 py-2"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-xl px-4 py-2"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <button
              type="button"
              onClick={() => {
                setShowForgotUsername(true);
                setShowForgotPassword(false);
                setForgotEmail(email);
              }}
              className="text-purple-600 hover:underline"
            >
              Forgot Username?
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setShowForgotUsername(false);
                setForgotEmail(email);
              }}
              className="text-purple-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Forgot Username Modal */}
        {showForgotUsername && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Forgot Username?</h2>
              <form onSubmit={handleForgotUsername} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full border rounded-xl px-4 py-2"
                    placeholder="your@email.com"
                  />
                </div>
                {forgotMessage && (
                  <div className={`p-3 rounded-lg ${
                    forgotMessage.includes("sent") 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {forgotMessage}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {forgotLoading ? "Sending..." : "Send Username"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotUsername(false);
                      setForgotMessage("");
                      setForgotEmail("");
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Forgot Password?</h2>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full border rounded-xl px-4 py-2"
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send you a link to reset your password
                  </p>
                </div>
                {forgotMessage && (
                  <div className={`p-3 rounded-lg ${
                    forgotMessage.includes("sent") 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {forgotMessage}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-xl font-semibold disabled:opacity-50"
                  >
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotMessage("");
                      setForgotEmail("");
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-purple-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

