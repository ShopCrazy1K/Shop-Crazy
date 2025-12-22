import React, { useState } from 'react';
import { NFLGame } from '../services/nflApi';
import { ParlayBet, ParlayLeg, bettingService } from '../services/bettingService';
import { Plus, X, Calculator } from 'lucide-react';

interface ParlayBuilderProps {
  games: NFLGame[];
  onParlayPlaced: (parlay: Omit<ParlayBet, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
  userParlays: ParlayBet[];
}

const ParlayBuilder: React.FC<ParlayBuilderProps> = ({ games, onParlayPlaced, userParlays }) => {
  const [parlayLegs, setParlayLegs] = useState<ParlayLeg[]>([]);
  const [betAmount, setBetAmount] = useState<number>(5);
  const [showCalculator, setShowCalculator] = useState(false);

  const addLegToParlay = (game: NFLGame, betType: 'moneyline' | 'spread' | 'over_under', selection: string) => {
    const odds = bettingService.getBettingOdds(game, betType, selection);
    
    const newLeg: ParlayLeg = {
      gameId: game.id,
      betType,
      selection,
      odds
    };

    // Check if this exact leg already exists
    const existingLeg = parlayLegs.find(leg => 
      leg.gameId === game.id && leg.betType === betType && leg.selection === selection
    );

    if (existingLeg) {
      alert('This selection is already in your parlay');
      return;
    }

    setParlayLegs([...parlayLegs, newLeg]);
  };

  const removeLegFromParlay = (index: number) => {
    setParlayLegs(parlayLegs.filter((_, i) => i !== index));
  };

  const getTotalOdds = () => {
    if (parlayLegs.length === 0) return 0;
    return bettingService.calculateParlayOdds(parlayLegs);
  };

  const getPotentialPayout = () => {
    if (parlayLegs.length === 0) return 0;
    return bettingService.calculatePayout(betAmount, getTotalOdds());
  };

  const handlePlaceParlay = () => {
    if (parlayLegs.length < 2) {
      alert('Parlay must have at least 2 legs');
      return;
    }

    if (betAmount < 5) {
      alert('Minimum bet amount is $5');
      return;
    }

    const totalOdds = getTotalOdds();
    const potentialPayout = getPotentialPayout();

    onParlayPlaced({
      legs: parlayLegs,
      totalAmount: betAmount,
      totalOdds,
      potentialPayout,
      week: games[0]?.week || 1,
      season: games[0]?.season || 2025
    });

    setParlayLegs([]);
    setBetAmount(5);
  };

  const getGameById = (gameId: string) => {
    return games.find(game => game.id === gameId);
  };

  const formatSelection = (leg: ParlayLeg) => {
    const game = getGameById(leg.gameId);
    if (!game) return 'Unknown Game';

    switch (leg.betType) {
      case 'moneyline':
        return `${leg.selection} (ML)`;
      case 'spread':
        return `${leg.selection} (${game.spread > 0 ? '+' : ''}${game.spread})`;
      case 'over_under':
        return `${leg.selection} ${game.overUnder}`;
      default:
        return leg.selection;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Parlay */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Parlay Builder</h3>
        
        {parlayLegs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Add games to build your parlay</p>
        ) : (
          <div className="space-y-3">
            {parlayLegs.map((leg, index) => {
              const game = getGameById(leg.gameId);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{game?.awayTeam} vs {game?.homeTeam}</p>
                    <p className="text-sm text-gray-600">{formatSelection(leg)}</p>
                    <p className="text-sm text-gray-500">
                      {leg.odds > 0 ? '+' : ''}{leg.odds}
                    </p>
                  </div>
                  <button
                    onClick={() => removeLegFromParlay(index)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Odds</p>
                  <p className="text-xl font-bold text-green-600">
                    {getTotalOdds() > 0 ? '+' : ''}{getTotalOdds()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Potential Payout</p>
                  <p className="text-xl font-bold text-purple-600">
                    ${getPotentialPayout().toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <input
                  type="number"
                  min="5"
                  step="0.01"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Bet Amount"
                />
                <button
                  onClick={handlePlaceParlay}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Place Parlay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Games */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Available Games</h3>
        <div className="space-y-4">
          {games.map((game) => (
            <div key={game.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img src={game.awayTeamLogo} alt={game.awayTeam} className="w-8 h-8" />
                  <span className="font-semibold">{game.awayTeam}</span>
                  <span className="text-gray-500">vs</span>
                  <span className="font-semibold">{game.homeTeam}</span>
                  <img src={game.homeTeamLogo} alt={game.homeTeam} className="w-8 h-8" />
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(game.gameTime).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Moneyline */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Moneyline</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => addLegToParlay(game, 'moneyline', game.awayTeam)}
                      className="w-full p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {game.awayTeam} ({bettingService.getBettingOdds(game, 'moneyline', game.awayTeam) > 0 ? '+' : ''}{bettingService.getBettingOdds(game, 'moneyline', game.awayTeam)})
                    </button>
                    <button
                      onClick={() => addLegToParlay(game, 'moneyline', game.homeTeam)}
                      className="w-full p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {game.homeTeam} ({bettingService.getBettingOdds(game, 'moneyline', game.homeTeam) > 0 ? '+' : ''}{bettingService.getBettingOdds(game, 'moneyline', game.homeTeam)})
                    </button>
                  </div>
                </div>

                {/* Spread */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Spread</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => addLegToParlay(game, 'spread', game.awayTeam)}
                      className="w-full p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {game.awayTeam} ({game.spread > 0 ? '+' : ''}{game.spread})
                    </button>
                    <button
                      onClick={() => addLegToParlay(game, 'spread', game.homeTeam)}
                      className="w-full p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {game.homeTeam} ({game.spread < 0 ? '' : '-'}{Math.abs(game.spread)})
                    </button>
                  </div>
                </div>

                {/* Over/Under */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Over/Under</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => addLegToParlay(game, 'over_under', 'over')}
                      className="w-full p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Over {game.overUnder}
                    </button>
                    <button
                      onClick={() => addLegToParlay(game, 'over_under', 'under')}
                      className="w-full p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Under {game.overUnder}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Existing Parlays */}
      {userParlays.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Your Parlays</h3>
          <div className="space-y-3">
            {userParlays.map((parlay) => (
              <div key={parlay.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">
                      {parlay.legs.length} Leg Parlay
                    </p>
                    <p className="text-sm text-gray-600">
                      ${parlay.totalAmount} @ {parlay.totalOdds > 0 ? '+' : ''}{parlay.totalOdds}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      ${parlay.potentialPayout.toFixed(2)}
                    </p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      parlay.status === 'won' ? 'bg-green-100 text-green-800' :
                      parlay.status === 'lost' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {parlay.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  {parlay.legs.map((leg, index) => {
                    const game = getGameById(leg.gameId);
                    return (
                      <p key={index} className="text-sm text-gray-600">
                        {game?.awayTeam} vs {game?.homeTeam}: {formatSelection(leg)}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParlayBuilder;
