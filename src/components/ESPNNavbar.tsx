import React, { useState, useEffect } from 'react';
import { Bell, Volume2, VolumeX } from 'lucide-react';
import { nflApiService, NFLGame } from '../services/nflApi';

interface ESPNNavbarProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

const ESPNNavbar: React.FC<ESPNNavbarProps> = ({ currentWeek, onWeekChange }) => {
  const [liveScores, setLiveScores] = useState<NFLGame[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [breakingNews, setBreakingNews] = useState<string>('');

  useEffect(() => {
    const fetchLiveScores = async () => {
      try {
        const games = await nflApiService.getGamesByWeek(2025, currentWeek);
        const liveGames = games.filter(game => game.status === 'in_progress' || game.status === 'final');
        setLiveScores(liveGames);
      } catch (error) {
        console.error('Error fetching live scores:', error);
      }
    };

    fetchLiveScores();
    const interval = setInterval(fetchLiveScores, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [currentWeek]);

  useEffect(() => {
    if (soundEnabled && breakingNews) {
      playTicketlineSound();
    }
  }, [breakingNews, soundEnabled]);

  const playTicketlineSound = () => {
    const audio = new Audio('/sounds/espn-ticketline.mp3');
    audio.play().catch(console.error);
  };

  const triggerBreakingNews = (message: string) => {
    setBreakingNews(message);
    setTimeout(() => setBreakingNews(''), 5000);
  };

  const formatScore = (game: NFLGame) => {
    if (game.status === 'scheduled') {
      return new Date(game.gameTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return `${game.awayScore || 0} - ${game.homeScore || 0}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final':
        return 'text-gray-600';
      case 'in_progress':
        return 'text-red-600 font-bold';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="bg-red-600 text-white shadow-lg">
      {/* Breaking News Banner */}
      {breakingNews && (
        <div className="bg-yellow-500 text-black text-center py-2 font-bold animate-pulse">
          🚨 BREAKING: {breakingNews} 🚨
        </div>
      )}

      {/* Main Navbar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">🏈 NFL CENTER</h1>
            <div className="text-sm">
              Week {currentWeek} • 2025 Season
            </div>
          </div>

          {/* Week Selector */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
              className="px-3 py-1 bg-red-700 hover:bg-red-800 rounded text-sm"
              disabled={currentWeek <= 1}
            >
              ←
            </button>
            <span className="px-4 py-1 bg-red-700 rounded text-sm font-semibold">
              Week {currentWeek}
            </span>
            <button
              onClick={() => onWeekChange(Math.min(18, currentWeek + 1))}
              className="px-3 py-1 bg-red-700 hover:bg-red-800 rounded text-sm"
              disabled={currentWeek >= 18}
            >
              →
            </button>
          </div>

          {/* Live Scores */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              {liveScores.slice(0, 3).map((game) => (
                <div key={game.id} className="text-sm">
                  <div className="flex items-center space-x-2">
                    <img src={game.awayTeamLogo} alt={game.awayTeam} className="w-6 h-6" />
                    <span className="font-semibold">{game.awayTeam}</span>
                    <span className={getStatusColor(game.status)}>
                      {formatScore(game)}
                    </span>
                    <img src={game.homeTeamLogo} alt={game.homeTeam} className="w-6 h-6" />
                    <span className="font-semibold">{game.homeTeam}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-red-700 rounded"
              title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            {/* Notifications */}
            <button className="p-2 hover:bg-red-700 rounded relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="flex items-center space-x-8 py-2 border-t border-red-500">
          <a href="#games" className="hover:text-yellow-300 text-sm font-medium">Games</a>
          <a href="#picks" className="hover:text-yellow-300 text-sm font-medium">My Picks</a>
          <a href="#parlays" className="hover:text-yellow-300 text-sm font-medium">Parlays</a>
          <a href="#leaderboard" className="hover:text-yellow-300 text-sm font-medium">Leaderboard</a>
          <a href="#account" className="hover:text-yellow-300 text-sm font-medium">Account</a>
        </div>
      </div>
    </div>
  );
};

export default ESPNNavbar;
