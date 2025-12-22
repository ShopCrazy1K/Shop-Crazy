import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface AlumniMember {
  id: string;
  name: string;
  avatar: string;
  graduationYear: number;
  school: string;
  major: string;
  isVerified: boolean;
  lastSeen: Date;
}

const AlumniRoom: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'chat' | 'events'>('members');
  const [message, setMessage] = useState('');

  // Mock data for alumni members
  const alumniMembers: AlumniMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '👩‍🎓',
      graduationYear: 2020,
      school: 'Stanford University',
      major: 'Computer Science',
      isVerified: true,
      lastSeen: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: '👨‍🎓',
      graduationYear: 2019,
      school: 'MIT',
      major: 'Engineering',
      isVerified: true,
      lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      id: '3',
      name: 'Emily Davis',
      avatar: '👩‍🎓',
      graduationYear: 2021,
      school: 'Harvard University',
      major: 'Business',
      isVerified: true,
      lastSeen: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // In a real app, this would send the message
      console.log('Message sent:', message);
      setMessage('');
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎓 Alumni Room
              </h1>
              <p className="text-lg text-gray-600">
                Connect with verified alumni from your network
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {alumniMembers.length} Members Online
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'chat'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Group Chat
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'events'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Events
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'members' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Alumni Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alumniMembers.map((member) => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{member.avatar}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.school}</p>
                        <p className="text-sm text-gray-500">{member.major} • {member.graduationYear}</p>
                        <p className="text-xs text-gray-400">
                          Last seen: {formatLastSeen(member.lastSeen)}
                        </p>
                      </div>
                      {member.isVerified && (
                        <span className="text-blue-600 text-sm">✓ Verified</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Group Chat</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 h-64 overflow-y-auto">
                <div className="text-center text-gray-500 py-8">
                  <p>Welcome to the Alumni Group Chat!</p>
                  <p className="text-sm">Start a conversation with your fellow alumni.</p>
                </div>
              </div>
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
              <div className="text-center text-gray-500 py-8">
                <p>No upcoming events scheduled.</p>
                <p className="text-sm">Check back later for alumni meetups and networking events.</p>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow p-6 mt-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Want to join the Alumni Room?</h3>
          <p className="mb-4 opacity-90">Verify your alumni status to access exclusive features.</p>
          <Link
            to="/profile"
            className="bg-white text-purple-600 px-6 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors inline-block"
          >
            Verify Alumni Status
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AlumniRoom;
