import React, { useState } from 'react';

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'alumni';
  category: string;
  memberCount: number;
  isActive: boolean;
  lastMessage?: string;
  lastMessageTime?: Date;
}

const ChatRooms: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private' | 'alumni',
    category: 'General',
  });

  // Mock data for chat rooms
  const mockRooms: ChatRoom[] = [
    {
      id: '1',
      name: 'General Chat',
      description: 'Open discussion for everyone',
      type: 'public',
      category: 'General',
      memberCount: 156,
      isActive: true,
      lastMessage: 'Anyone up for a game night?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: '2',
      name: 'Tech Enthusiasts',
      description: 'Discuss latest technology trends',
      type: 'public',
      category: 'Technology',
      memberCount: 89,
      isActive: true,
      lastMessage: 'Check out this new AI tool!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
      id: '3',
      name: 'Alumni Network',
      description: 'Exclusive for verified alumni',
      type: 'alumni',
      category: 'Alumni',
      memberCount: 234,
      isActive: true,
      lastMessage: 'Great to reconnect with everyone!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: '4',
      name: 'Study Group',
      description: 'Collaborative learning space',
      type: 'private',
      category: 'Education',
      memberCount: 12,
      isActive: false,
      lastMessage: 'Meeting tomorrow at 3 PM',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2)
    }
  ];

  // Get unique categories from rooms
  const categories = ['All', ...Array.from(new Set(mockRooms.map(room => room.category)))];

  // Filter rooms based on search and category
  const filteredRooms = mockRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || room.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would create a new room
    console.log('Creating room:', newRoomData);
    setShowCreateRoom(false);
    setNewRoomData({ name: '', description: '', type: 'public', category: 'General' });
  };

  const handleJoinRoom = (roomId: string) => {
    setSelectedRoom(roomId);
    // In a real app, this would join the room
    console.log('Joining room:', roomId);
  };

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-yellow-100 text-yellow-800';
      case 'alumni': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedRoom) {
    const room = mockRooms.find(r => r.id === selectedRoom);
    if (!room) return null;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Room Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back to Rooms
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
                  <p className="text-gray-600">{room.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoomTypeColor(room.type)}`}>
                  {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                </span>
                <span className="text-gray-500">{room.memberCount} members</span>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                <div className="text-center text-gray-500 py-8">
                  <p>Welcome to {room.name}!</p>
                  <p className="text-sm">Start chatting with other members.</p>
                </div>
              </div>
              
              <form className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                💬 Chat Rooms
              </h1>
              <p className="text-lg text-gray-600">
                Join conversations and connect with others
              </p>
            </div>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Create Room
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search chat rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chat Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomTypeColor(room.type)}`}>
                    {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{room.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{room.memberCount} members</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    room.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {room.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {room.lastMessage && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-1">{room.lastMessage}</p>
                    <p className="text-xs text-gray-500">{formatLastMessageTime(room.lastMessageTime!)}</p>
                  </div>
                )}

                <button
                  onClick={() => handleJoinRoom(room.id)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium transition-colors"
                >
                  Join Room
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Chat Room</h2>
              
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                  <input
                    type="text"
                    value={newRoomData.name}
                    onChange={(e) => setNewRoomData({...newRoomData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newRoomData.description}
                    onChange={(e) => setNewRoomData({...newRoomData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newRoomData.type}
                      onChange={(e) => setNewRoomData({...newRoomData, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="alumni">Alumni</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newRoomData.category}
                      onChange={(e) => setNewRoomData({...newRoomData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="General">General</option>
                      <option value="Technology">Technology</option>
                      <option value="Education">Education</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateRoom(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                  >
                    Create Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRooms;
// Force reload
