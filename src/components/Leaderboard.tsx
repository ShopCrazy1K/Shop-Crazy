import React, { useState } from 'react';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  category: string;
  change: 'up' | 'down' | 'same';
  changeAmount: number;
}

const Leaderboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Overall');
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');

  // Mock data for leaderboard
  const mockLeaderboard: LeaderboardEntry[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '👩‍🎓',
      score: 2847,
      rank: 1,
      category: 'Overall',
      change: 'up',
      changeAmount: 2
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: '👨‍💻',
      score: 2712,
      rank: 2,
      category: 'Overall',
      change: 'same',
      changeAmount: 0
    },
    {
      id: '3',
      name: 'Emily Davis',
      avatar: '��‍🏃‍♀️',
      score: 2658,
      rank: 3,
      category: 'Overall',
      change: 'up',
      changeAmount: 1
    },
    {
      id: '4',
      name: 'Alex Rodriguez',
      avatar: '👨‍🎨',
      score: 2591,
      rank: 4,
      category: 'Overall',
      change: 'down',
      changeAmount: 1
    },
    {
      id: '5',
      name: 'Jessica Kim',
      avatar: '👩‍🔬',
      score: 2487,
      rank: 5,
      category: 'Overall',
      change: 'up',
      changeAmount: 3
    }
  ];

  const categories = ['Overall', 'Posts', 'Engagement', 'Alumni', 'Newcomers'];
  const timeFrames = [
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'allTime', label: 'All Time' }
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getChangeIcon = (change: 'up' | 'down' | 'same') => {
    if (change === 'up') return '↗️';
    if (change === 'down') return '↘️';
    return '➡️';
  };

  const getChangeColor = (change: 'up' | 'down' | 'same') => {
    if (change === 'up') return 'text-green-600';
    if (change === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🏆 Leaderboard
              </h1>
              <p className="text-lg text-gray-600">
                See who's leading the community
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                🎯 Your Rank: #42
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Frame</label>
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {timeFrames.map(timeFrame => (
                  <option key={timeFrame.value} value={timeFrame.value}>{timeFrame.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Performers - {selectedCategory}
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {mockLeaderboard.map((entry, index) => (
              <div key={entry.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 text-center">
                    <span className="text-2xl">{getRankIcon(entry.rank)}</span>
                  </div>

                  {/* Avatar and Name */}
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-2xl">{entry.avatar}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{entry.name}</h3>
                      <p className="text-sm text-gray-500">{entry.category}</p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{entry.score.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>

                  {/* Change */}
                  <div className="text-right">
                    <div className={`flex items-center space-x-1 ${getChangeColor(entry.change)}`}>
                      <span className="text-sm">{getChangeIcon(entry.change)}</span>
                      {entry.change !== 'same' && (
                        <span className="text-sm font-medium">{entry.changeAmount}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.change === 'same' ? 'No change' : 
                       entry.change === 'up' ? 'Gained' : 'Lost'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Stats */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Your Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">#42</div>
              <div className="text-indigo-200">Current Rank</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">1,247</div>
              <div className="text-indigo-200">Total Points</div>
              </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">+156</div>
              <div className="text-indigo-200">This Week</div>
            </div>
          </div>
        </div>

        {/* How to Climb */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Climb the Leaderboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-lg">✓</span>
                <div>
                  <h4 className="font-medium text-gray-900">Create Engaging Posts</h4>
                  <p className="text-sm text-gray-600">Share valuable content that gets likes and comments</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-lg">✓</span>
                <div>
                  <h4 className="font-medium text-gray-900">Participate in Discussions</h4>
                  <p className="text-sm text-gray-600">Be active in chat rooms and comment sections</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-lg">✓</span>
                <div>
                  <h4 className="font-medium text-gray-900">Help Other Users</h4>
                  <p className="text-sm text-gray-600">Answer questions and provide support</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-lg">✓</span>
                <div>
                  <h4 className="font-medium text-gray-900">Stay Active Daily</h4>
                  <p className="text-sm text-gray-600">Consistent activity boosts your score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
