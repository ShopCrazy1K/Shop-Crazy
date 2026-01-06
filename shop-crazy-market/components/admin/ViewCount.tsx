"use client";

import { useEffect, useState } from "react";

interface ViewStats {
  todayViews: number;
  todayUniqueVisitors: number;
  totalViews: number;
  dailyViews: Array<{ date: string; count: number }>;
  topPages: Array<{ path: string; views: number }>;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function ViewCount() {
  const [stats, setStats] = useState<ViewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchStats();
  }, [days]);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/views?days=${days}`);
      const data = await response.json();
      
      if (data.ok) {
        setStats(data);
      } else {
        setError(data.error || "Failed to fetch view statistics");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch view statistics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">View Statistics</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">View Statistics</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate average daily views
  const avgDailyViews = stats.dailyViews.length > 0
    ? Math.round(stats.dailyViews.reduce((sum, day) => sum + day.count, 0) / stats.dailyViews.length)
    : 0;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">View Statistics</h2>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Today's Views</p>
          <p className="text-3xl font-bold text-purple-700">{stats.todayViews.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Today's Unique Visitors</p>
          <p className="text-3xl font-bold text-blue-700">{stats.todayUniqueVisitors.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Views</p>
          <p className="text-3xl font-bold text-green-700">{stats.totalViews.toLocaleString()}</p>
        </div>
      </div>

      {/* Average Daily Views */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-1">Average Daily Views ({days} days)</p>
        <p className="text-2xl font-bold text-gray-900">{avgDailyViews.toLocaleString()}</p>
      </div>

      {/* Daily Views Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Daily Views</h3>
        {stats.dailyViews.length > 0 ? (
          <div className="space-y-2">
            {stats.dailyViews.slice(0, 14).map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-24">{formatDate(day.date)}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-purple-600 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.min((day.count / Math.max(...stats.dailyViews.map(d => d.count))) * 100, 100)}%`,
                    }}
                  >
                    {day.count > 0 && (
                      <span className="text-xs text-white font-medium">{day.count}</span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium w-16 text-right">{day.count.toLocaleString()}</span>
              </div>
            ))}
            {stats.dailyViews.length > 14 && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Showing last 14 days. Total: {stats.dailyViews.length} days
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No view data available</p>
        )}
      </div>

      {/* Top Pages */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Most Viewed Pages</h3>
        {stats.topPages.length > 0 ? (
          <div className="space-y-2">
            {stats.topPages.map((page, index) => (
              <div
                key={page.path}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                  <span className="text-sm text-gray-900 font-mono">{page.path || '/'}</span>
                </div>
                <span className="text-sm font-bold text-purple-700">{page.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No page data available</p>
        )}
      </div>
    </div>
  );
}