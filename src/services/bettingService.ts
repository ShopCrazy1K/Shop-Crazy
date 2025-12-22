import { doc, setDoc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { NFLGame } from './nflApi';

export interface Bet {
  id: string;
  userId: string;
  gameId: string;
  betType: 'moneyline' | 'spread' | 'over_under';
  selection: string; // Team abbreviation or 'over'/'under'
  amount: number;
  odds: number;
  potentialPayout: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: Date;
  week: number;
  season: number;
}

export interface ParlayBet {
  id: string;
  userId: string;
  legs: ParlayLeg[];
  totalAmount: number;
  totalOdds: number;
  potentialPayout: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: Date;
  week: number;
  season: number;
}

export interface ParlayLeg {
  gameId: string;
  betType: 'moneyline' | 'spread' | 'over_under';
  selection: string;
  odds: number;
}

class BettingService {
  async placeBet(userId: string, bet: Omit<Bet, 'id' | 'userId' | 'createdAt' | 'status'>): Promise<string> {
    const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newBet: Bet = {
      ...bet,
      id: betId,
      userId,
      status: 'pending',
      createdAt: new Date()
    };

    await setDoc(doc(db, 'bets', betId), newBet);
    return betId;
  }

  async placeParlayBet(userId: string, parlay: Omit<ParlayBet, 'id' | 'userId' | 'createdAt' | 'status'>): Promise<string> {
    const parlayId = `parlay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newParlay: ParlayBet = {
      ...parlay,
      id: parlayId,
      userId,
      status: 'pending',
      createdAt: new Date()
    };

    await setDoc(doc(db, 'parlays', parlayId), newParlay);
    return parlayId;
  }

  async getUserBets(userId: string, week?: number): Promise<Bet[]> {
    let q = query(collection(db, 'bets'), where('userId', '==', userId));
    
    if (week) {
      q = query(q, where('week', '==', week));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), createdAt: doc.data().createdAt.toDate() } as Bet));
  }

  async getUserParlays(userId: string, week?: number): Promise<ParlayBet[]> {
    let q = query(collection(db, 'parlays'), where('userId', '==', userId));
    
    if (week) {
      q = query(q, where('week', '==', week));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), createdAt: doc.data().createdAt.toDate() } as ParlayBet));
  }

  calculatePayout(amount: number, odds: number): number {
    // American odds format
    if (odds > 0) {
      return amount + (amount * odds / 100);
    } else {
      return amount + (amount * 100 / Math.abs(odds));
    }
  }

  calculateParlayOdds(legs: ParlayLeg[]): number {
    let totalOdds = 1;
    
    for (const leg of legs) {
      const decimalOdds = this.americanToDecimal(leg.odds);
      totalOdds *= decimalOdds;
    }
    
    return this.decimalToAmerican(totalOdds);
  }

  private americanToDecimal(americanOdds: number): number {
    if (americanOdds > 0) {
      return (americanOdds / 100) + 1;
    } else {
      return (100 / Math.abs(americanOdds)) + 1;
    }
  }

  private decimalToAmerican(decimalOdds: number): number {
    if (decimalOdds >= 2) {
      return Math.round((decimalOdds - 1) * 100);
    } else {
      return Math.round(-100 / (decimalOdds - 1));
    }
  }

  getBettingOdds(game: NFLGame, betType: 'moneyline' | 'spread' | 'over_under', selection: string): number {
    // Mock odds - in real app, these would come from sportsbook API
    switch (betType) {
      case 'moneyline':
        return selection === game.homeTeam ? -110 : 110;
      case 'spread':
        return -110; // Standard spread odds
      case 'over_under':
        return -110; // Standard over/under odds
      default:
        return -110;
    }
  }
}

export const bettingService = new BettingService();
