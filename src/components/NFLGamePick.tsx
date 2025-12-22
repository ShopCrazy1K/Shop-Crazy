import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { nflApiService, NFLGame } from '../services/nflApi';
import { bettingService, Bet, ParlayBet } from '../services/bettingService';
import ESPNNavbar from './ESPNNavbar';
import GameCard from './GameCard';
import ParlayBuilder from './ParlayBuilder';
import AccountBalance from './AccountBalance';
import { DollarSign, Trophy, TrendingUp } from 'lucide-react';

const NFLGamePick: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [games, setGames] = useState<NFLGame[]>([]);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [userParlays, setUserParlays] = useState<ParlayBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'games' | 'picks' | 'parlays'>('games');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gamesData, currentWeekData] = await Promise.all([
          nflApiService.getGamesByWeek(2025, currentWeek),
          nflApiService.getCurrentWeek()
        ]);
        
        setGames(gamesData);
        setCurrentWeek(currentWeekData);
        
        if (userProfile) {
          const [bets, parlays] = await Promise.all([
            bettingService.getUserBets(userProfile.uid, currentWeek),
            bettingService.getUserParlays(userProfile.uid, currentWeek)
          ]);
          setUserBets(bets);
          setUserParlays(parlays);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentWeek, userProfile]);

  const handleBetPlaced = async (bet: Omit<Bet, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    if (!userProfile) return;

    // Check if user has enough balance
    if (userProfile.balance < bet.amount) {
      alert('Insufficient balance');
      return;
    }

    try {
      await bettingService.placeBet(userProfile.uid, bet);
      
      // Update user balance
      await updateUserProfile({
        balance: userProfile.balance - bet.amount,
        totalBets: userProfile.totalBets + 1
      });

      // Refresh bets
      const updatedBets = await bettingService.getUserBets(userProfile.uid, currentWeek);
      setUserBets(updatedBets);
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet');
    }
  };

  const handleParlayPlaced = async (parlay: Omit<ParlayBet, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    if (!userProfile) return;

    if (userProfile.balance < parlay.totalAmount) {
      alert('Insufficient balance');
      return;
    }

    try {
      await bettingService.placeParlayBet(userProfile.uid, parlay);
      
      await updateUserProfile({
        balance: userProfile.balance - parlay.totalAmount,
        totalBets: userProfile.totalBets + 1
      });

      const updatedParlays = await bettingService.getUserParlays(userProfile.uid, currentWeek);
      setUserParlays(updatedParlays);
    } catch (error) {
      console.error('Error placing parlay:', error);
      alert('Failed to place parlay');
    }
  };

  const totalPotentialWinnings = userBets
    .filter(bet => bet.status === 'pending')
    .reduce((sum, bet) => sum + bet.potentialPayout, 0) +
    userParlays
      .filter(parlay => parlay.status === 'pending')
      .reduce((sum, parlay) => sum + parlay.potentialPayout, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading NFL games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ESPNNavbar currentWeek={currentWeek} onWeekChange={setCurrentWeek} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Account Balance and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AccountBalance />
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Winnings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${userProfile?.totalWinnings.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userProfile?.totalBets || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Potential Winnings</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${totalPotentialWinnings.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('games')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'games'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Games ({games.length})
              </button>
              <button
                onClick={() => setActiveTab('picks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'picks'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Picks ({userBets.length})
              </button>
              <button
                onClick={() => setActiveTab('parlays')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'parlays'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Parlays ({userParlays.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'games' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Week {currentWeek} Games
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {games.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onBetPlaced={handleBetPlaced}
                      userBets={userBets.filter(bet => bet.gameId === game.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'picks' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">My Picks</h2>
                {userBets.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bets placed for this week</p>
                ) : (
                  <div className="space-y-4">
                    {userBets.map((bet) => (
                      <div key={bet.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{bet.betType.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-sm text-gray-600">{bet.selection}</p>
                            <p className="text-sm text-gray-500">${bet.amount} @ {bet.odds > 0 ? '+' : ''}{bet.odds}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">${bet.potentialPayout.toFixed(2)}</p>
                            <span className={`px-2 py-1 rounded text-xs ${
                              bet.status === 'won' ? 'bg-green-100 text-green-800' :
                              bet.status === 'lost' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {bet.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'parlays' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Parlay Builder</h2>
                <ParlayBuilder
                  games={games}
                  onParlayPlaced={handleParlayPlaced}
                  userParlays={userParlays}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFLGamePick;
