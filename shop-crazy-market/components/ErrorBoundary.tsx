"use client";

import React from "react";
import Link from "next/link";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    console.error("Error stack:", error.stack);
    console.error("Component stack:", errorInfo.componentStack);
    
    // Store detailed error info in state so it can be displayed
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo,
    });
    
    // Log to console for debugging
    if (typeof window !== 'undefined') {
      console.error("Full error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
      
      // Also try to send to an error tracking service or API
      try {
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            url: window.location.href,
          }),
        }).catch(() => {}); // Silently fail if error logging fails
      } catch (e) {}
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">😅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
            {this.state.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-left">
                <p className="text-sm font-semibold text-red-800 mb-1">Error Details:</p>
                <p className="text-xs text-red-700 font-mono break-words mb-2">
                  <strong>Message:</strong> {this.state.error.message || "Unknown error occurred"}
                </p>
                <p className="text-xs text-red-700 font-mono break-words mb-2">
                  <strong>Type:</strong> {this.state.error.name || "Error"}
                </p>
                
                {this.state.error.message?.includes("DATABASE_URL") || this.state.error.message?.includes("database") || this.state.error.message?.includes("Database") ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                    <p className="text-xs text-yellow-800 font-semibold mb-1">🔍 Database Issue Detected</p>
                    <p className="text-xs text-yellow-700">
                      This is likely a database connection problem. Check:
                    </p>
                    <ul className="text-xs text-yellow-700 list-disc list-inside mt-1">
                      <li>DATABASE_URL is set in Vercel environment variables</li>
                      <li>Redeployed after adding environment variables</li>
                      <li>Database is accessible from Vercel</li>
                    </ul>
                  </div>
                ) : this.state.error.message?.includes("timeout") || this.state.error.message?.includes("fetch") ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                    <p className="text-xs text-yellow-800 font-semibold mb-1">⚠️ Network/Timeout Issue</p>
                    <p className="text-xs text-yellow-700">
                      The server took too long to respond or there's a network issue.
                    </p>
                  </div>
                ) : this.state.error.message?.includes("useAuth") || this.state.error.message?.includes("useCart") || this.state.error.message?.includes("Context") ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                    <p className="text-xs text-yellow-800 font-semibold mb-1">⚠️ Context Issue</p>
                    <p className="text-xs text-yellow-700">
                      There's an issue with React context providers. This might be a code issue.
                    </p>
                  </div>
                ) : null}
                
                {process.env.NODE_ENV === "development" && this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer">View stack trace (Dev Mode)</summary>
                    <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-40 bg-white p-2 rounded">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
                
                {this.state.errorInfo?.componentStack && process.env.NODE_ENV === "development" && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer">View component stack (Dev Mode)</summary>
                    <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-40 bg-white p-2 rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Refresh Page
              </button>
              <Link
                href="/marketplace"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back to Marketplace
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
