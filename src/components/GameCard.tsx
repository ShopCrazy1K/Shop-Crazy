import React, { useState } from 'react';
import { NFLGame } from '../services/nflApi';
import { Bet, bettingService } from '../services/bettingService';
import { Clock, Trophy } from 'lucide-react';

interface GameCardProps {
  game: NFLGame;
  onBetPlaced: (bet: Omit<Bet, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
  userBets: Bet[];
}

const GameCard: React.FC<GameCardProps> = ({ game, onBetPlaced, userBets }) => {
  const [selectedBetType, setSelectedBetType] = useState<'moneyline' | 'spread' | 'over_under'>('moneyline');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(5);
  const [showBetForm, setShowBetForm] = useState(false);

  const formatGameTime = (gameTime: string) => {
    const date = new Date(gameTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = () => {
    switch (game.status) {
      case 'final':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">FINAL</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs animate-pulse">LIVE</span>;
      default:
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">UPCOMING</span>;
    }
  };

  const getBettingOdds = (betType: 'moneyline' | 'spread' | 'over_under', selection: string) => {
    return bettingService.getBettingOdds(game, betType, selection);
  };

  const calculatePayout = (amount: number, odds: number) => {
    return bettingService.calculatePayout(amount, odds);
  };

  const handleBetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeam || betAmount < 5) {
      alert('Please select a team and bet at least $5');
      return;
    }

    const odds = getBettingOdds(selectedBetType, selectedTeam);
    const potentialPayout = calculatePayout(betAmount, odds);

    onBetPlaced({
      gameId: game.id,
      betType: selectedBetType,
      selection: selectedTeam,
      amount: betAmount,
      odds,
      potentialPayout,
      week: game.week,
      season: game.season
    });

    setShowBetForm(false);
    setSelectedTeam('');
    setBetAmount(5);
  };

  const existingBets = userBets.filter(bet => bet.betType === selectedBetType);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Game Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock size={16} />
            <span className="text-sm">{formatGameTime(game.gameTime)}</span>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Teams */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <img src={game.awayTeamLogo} alt={game.awayTeam} className="w-12 h-12" />
            <div>
              <p className="font-bold text-lg">{game.awayTeam}</p>
              <p className="text-sm text-gray-600">Away</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold">VS</p>
            {game.status === 'final' && (
              <p className="text-lg font-semibold">
                {game.awayScore} - {game.homeScore}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="font-bold text-lg">{game.homeTeam}</p>
              <p className="text-sm text-gray-600">Home</p>
            </div>
            <img src={game.homeTeamLogo} alt={game.homeTeam} className="w-12 h-12" />
          </div>
        </div>

        {/* Betting Options */}
        <div className="space-y-4">
          {/* Bet Type Selector */}
          <div className="flex space-x-2">
            {[
              { key: 'moneyline', label: 'Moneyline' },
              { key: 'spread', label: `Spread (${game.spread > 0 ? '+' : ''}${game.spread})` },
              { key: 'over_under', label: `O/U ${game.overUnder}` }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setSelectedBetType(option.key as any)}
                className={`px-3 py-2 rounded text-sm font-medium ${
                  selectedBetType === option.key
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Betting Options */}
          {selectedBetType === 'moneyline' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedTeam(game.awayTeam);
                  setShowBetForm(true);
                }}
                className="p-3 border rounded-lg hover:bg-gray-50 text-left"
              >
                <p className="font-semibold">{game.awayTeam}</p>
                <p className="text-sm text-gray-600">
                  {getBettingOdds('moneyline', game.awayTeam) > 0 ? '+' : ''}
                  {getBettingOdds('moneyline', game.awayTeam)}
                </p>
              </button>
              <button
                onClick={() => {
                  setSelectedTeam(game.homeTeam);
                  setShowBetForm(true);
                }}
                className="p-3 border rounded-lg hover:bg-gray-50 text-left"
              >
                <p className="font-semibold">{game.homeTeam}</p>
                <p className="text-sm text-gray-600">
                  {getBettingOdds('moneyline', game.homeTeam) > 0 ? '+' : ''}
                  {getBettingOdds('moneyline', game.homeTeam)}
                </p>
              </button>
            </div>
          )}

          {selectedBetType === 'spread' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedTeam(game.awayTeam);
                  setShowBetForm(true);
                }}
                className="p-3 border rounded-lg hover:bg-gray-50 text-left"
              >
                <p className="font-semibold">{game.awayTeam}</p>
                <p className="text-sm text-gray-600">
                  {game.spread > 0 ? '+' : ''}{game.spread} ({getBettingOdds('spread', game.awayTeam) > 0 ? '+' : ''}{getBettingOdds('spread', game.awayTeam)})
                </p>
              </button>
              <button
                onClick={() => {
                  setSelectedTeam(game.homeTeam);
                  setShowBetForm(true);
                }}
                className="p-3 border rounded-lg hover:bg-gray-50 text-left"
              >
                <p className="font-semibold">{game.homeTeam}</p>
                <p className="text-sm text-gray-600">
                  {game.spread < 0 ? '' : '-'}{Math.abs(game.spread)} ({getBettingOdds('spread', game.homeTeam) > 0 ? '+' : ''}{getBettingOdds('spread', game.homeTeam)})
                </p>
              </button>
            </div>
          )}

          {selectedBetType === 'over_under' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedTeam('over');
                  setShowBetForm(true);
                }}
                className="p-3 border rounded-lg hover:bg-gray-50 text-left"
              >
                <p className="font-semibold">Over {game.overUnder}</p>
                <p className="text-sm text-gray-600">
                  {getBettingOdds('over_under', 'over') > 0 ? '+' : ''}{getBettingOdds('over_under', 'over')}
                </p>
              </button>
              <button
                onClick={() => {
                  setSelectedTeam('under');
                  setShowBetForm(true);
                }}
                className="p-3 border rounded-lg hover:bg-gray-50 text-left"
              >
                <p className="font-semibold">Under {game.overUnder}</p>
                <p className="text-sm text-gray-600">
                  {getBettingOdds('over_under', 'under') > 0 ? '+' : ''}{getBettingOdds('over_under', 'under')}
                </p>
              </button>
            </div>
          )}

          {/* Existing Bets */}
          {existingBets.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Your Bets:</p>
              {existingBets.map((bet) => (
                <div key={bet.id} className="flex justify-between text-sm">
                  <span>{bet.selection} - ${bet.amount}</span>
                  <span className="font-semibold">${bet.potentialPayout.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bet Form Modal */}
      {showBetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Place Bet</h3>
            <form onSubmit={handleBetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selection: {selectedTeam}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bet Amount (Minimum $5)
                </label>
                <input
                  type="number"
                  min="5"
                  step="0.01"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">
                  Odds: {getBettingOdds(selectedBetType, selectedTeam) > 0 ? '+' : ''}{getBettingOdds(selectedBetType, selectedTeam)}
                </p>
                <p className="font-semibold">
                  Potential Payout: ${calculatePayout(betAmount, getBettingOdds(selectedBetType, selectedTeam)).toFixed(2)}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBetForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Place Bet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCard;
