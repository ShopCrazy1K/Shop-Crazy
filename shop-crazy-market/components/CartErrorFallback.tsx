"use client";

export default function CartErrorFallback() {
  return (
    <div className="p-4 text-center">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-yellow-800 font-semibold mb-2">⚠️ Cart Error</p>
        <p className="text-yellow-700 text-sm mb-3">There was an issue loading your cart. Click the button below to clear it and refresh.</p>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('cart');
              window.location.reload();
            }
          }}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Clear Cart & Refresh
        </button>
      </div>
    </div>
  );
}
