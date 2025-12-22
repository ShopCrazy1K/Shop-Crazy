import axios from 'axios';

export interface NFLGame {
  id: string;
  week: number;
  season: number;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  spread: number;
  overUnder: number;
  gameTime: string;
  status: 'scheduled' | 'in_progress' | 'final';
  homeTeamLogo: string;
  awayTeamLogo: string;
}

export interface NFLTeam {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
  city: string;
}

class NFLApiService {
  private baseUrl = 'https://api.sportsdata.io/v3/nfl';
  private apiKey = process.env.REACT_APP_SPORTSDATA_API_KEY || 'demo';

  async getCurrentWeek(): Promise<number> {
    try {
      const response = await axios.get(`${this.baseUrl}/scores/json/CurrentWeek`, {
        params: { key: this.apiKey }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current week:', error);
      // Fallback to week 1 for demo purposes
      return 1;
    }
  }

  async getGamesByWeek(season: number, week: number): Promise<NFLGame[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/scores/json/ScoresByWeek/${season}/${week}`, {
        params: { key: this.apiKey }
      });
      
      return response.data.map((game: any) => ({
        id: game.GameID.toString(),
        week: game.Week,
        season: game.Season,
        homeTeam: game.HomeTeam,
        awayTeam: game.AwayTeam,
        homeScore: game.HomeScore,
        awayScore: game.AwayScore,
        spread: game.PointSpread || 0,
        overUnder: game.OverUnder || 45,
        gameTime: game.DateTime,
        status: this.getGameStatus(game.Status),
        homeTeamLogo: this.getTeamLogo(game.HomeTeam),
        awayTeamLogo: this.getTeamLogo(game.AwayTeam)
      }));
    } catch (error) {
      console.error('Error fetching games:', error);
      // Return mock data for demo
      return this.getMockGames(week);
    }
  }

  async getTeams(): Promise<NFLTeam[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/scores/json/Teams`, {
        params: { key: this.apiKey }
      });
      
      return response.data.map((team: any) => ({
        id: team.TeamID.toString(),
        name: team.FullName,
        abbreviation: team.Key,
        logo: this.getTeamLogo(team.Key),
        city: team.City
      }));
    } catch (error) {
      console.error('Error fetching teams:', error);
      return this.getMockTeams();
    }
  }

  private getGameStatus(status: string): 'scheduled' | 'in_progress' | 'final' {
    switch (status) {
      case 'Final':
        return 'final';
      case 'InProgress':
        return 'in_progress';
      default:
        return 'scheduled';
    }
  }

  private getTeamLogo(teamKey: string): string {
    const logos: { [key: string]: string } = {
      'ARI': '/images/teams/ari.png',
      'ATL': '/images/teams/atl.png',
      'BAL': '/images/teams/bal.png',
      'BUF': '/images/teams/buf.png',
      'CAR': '/images/teams/car.png',
      'CHI': '/images/teams/chi.png',
      'CIN': '/images/teams/cin.png',
      'CLE': '/images/teams/cle.png',
      'DAL': '/images/teams/dal.png',
      'DEN': '/images/teams/den.png',
      'DET': '/images/teams/det.png',
      'GB': '/images/teams/gb.png',
      'HOU': '/images/teams/hou.png',
      'IND': '/images/teams/ind.png',
      'JAX': '/images/teams/jax.png',
      'KC': '/images/teams/kc.png',
      'LV': '/images/teams/lv.png',
      'LAC': '/images/teams/lac.png',
      'LAR': '/images/teams/lar.png',
      'MIA': '/images/teams/mia.png',
      'MIN': '/images/teams/min.png',
      'NE': '/images/teams/ne.png',
      'NO': '/images/teams/no.png',
      'NYG': '/images/teams/nyg.png',
      'NYJ': '/images/teams/nyj.png',
      'PHI': '/images/teams/phi.png',
      'PIT': '/images/teams/pit.png',
      'SF': '/images/teams/sf.png',
      'SEA': '/images/teams/sea.png',
      'TB': '/images/teams/tb.png',
      'TEN': '/images/teams/ten.png',
      'WAS': '/images/teams/wsh.png'
    };
    return logos[teamKey] || '/images/teams/default.svg';
  }

  private getMockGames(week: number): NFLGame[] {
    const mockGames = [
      {
        id: '1',
        week,
        season: 2025,
        homeTeam: 'KC',
        awayTeam: 'BUF',
        spread: -3.5,
        overUnder: 52.5,
        gameTime: '2025-01-12T20:00:00Z',
        status: 'scheduled' as const,
        homeTeamLogo: '/images/teams/kc.png',
        awayTeamLogo: '/images/teams/buf.png'
      },
      {
        id: '2',
        week,
        season: 2025,
        homeTeam: 'SF',
        awayTeam: 'DAL',
        spread: -7.0,
        overUnder: 48.5,
        gameTime: '2025-01-12T17:00:00Z',
        status: 'scheduled' as const,
        homeTeamLogo: '/images/teams/sf.png',
        awayTeamLogo: '/images/teams/dal.png'
      }
    ];
    return mockGames;
  }

  private getMockTeams(): NFLTeam[] {
    return [
      { id: '1', name: 'Kansas City Chiefs', abbreviation: 'KC', logo: '/images/teams/kc.png', city: 'Kansas City' },
      { id: '2', name: 'Buffalo Bills', abbreviation: 'BUF', logo: '/images/teams/buf.png', city: 'Buffalo' },
      { id: '3', name: 'San Francisco 49ers', abbreviation: 'SF', logo: '/images/teams/sf.png', city: 'San Francisco' },
      { id: '4', name: 'Dallas Cowboys', abbreviation: 'DAL', logo: '/images/teams/dal.png', city: 'Dallas' }
    ];
  }
}

export const nflApiService = new NFLApiService();
