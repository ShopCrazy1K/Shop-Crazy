# NFL GamePick App

A comprehensive NFL betting application that allows users to pick games, place bets, and build parlays with real-time NFL data.

## Features

### 🏈 Core Features
- **User Authentication**: Secure login/signup with Firebase
- **Account Management**: Add money to account (minimum $5)
- **Live NFL Games**: Real-time games and scores for weeks 1-18
- **Game Picking**: Pick winners, spreads, and over/under totals
- **Parlay Betting**: Build multi-leg parlays for higher payouts
- **Withdrawal System**: Multiple withdrawal methods (banking, PayPal, Venmo, Play+)

### 🎯 Betting Options
- **Moneyline**: Pick the winner of the game
- **Point Spread**: Bet on teams with point spreads
- **Over/Under**: Bet on total points scored
- **Parlays**: Combine multiple bets for higher payouts

### 💰 Payment Methods
- **Deposits**: Credit/Debit cards, PayPal, Venmo, Bank transfers
- **Withdrawals**: 
  - Bank transfers (1-3 business days, free)
  - PayPal (instant, 2.9% + $0.30 fee)
  - Venmo (instant, 1.5% fee)
  - Play+ prepaid cards (instant, free)

### 📱 User Interface
- **ESPN-style Navbar**: Live scores, breaking news, ticketline sound
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Live scores and game status
- **Account Dashboard**: Balance, winnings, and betting history

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **API**: SportsData.io NFL API (with mock data fallback)
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase project setup

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd social-app
```

2. Install dependencies
```bash
npm install
```

3. Set up Firebase
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update `src/config/firebase.ts` with your config

4. Set up environment variables
```bash
cp env.example .env
# Add your API keys and configuration
```

5. Start the development server
```bash
npm run dev
```

### Environment Variables
```env
REACT_APP_SPORTSDATA_API_KEY=your_sportsdata_api_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
```

## Project Structure

```
src/
├── components/
│   ├── NFLGamePick.tsx          # Main app component
│   ├── ESPNNavbar.tsx           # ESPN-style navigation
│   ├── GameCard.tsx             # Individual game betting card
│   ├── ParlayBuilder.tsx        # Parlay betting interface
│   ├── AccountBalance.tsx       # Account management
│   ├── WithdrawalSystem.tsx     # Withdrawal methods
│   ├── Login.tsx                # User login
│   └── Register.tsx             # User registration
├── contexts/
│   └── AuthContext.tsx          # Authentication context
├── services/
│   ├── nflApi.ts               # NFL API integration
│   └── bettingService.ts       # Betting logic and Firestore
├── config/
│   └── firebase.ts             # Firebase configuration
└── App.tsx                     # Main app component
```

## API Integration

### NFL API (SportsData.io)
- **Games by Week**: Fetch all games for a specific week
- **Live Scores**: Real-time score updates
- **Team Information**: Team logos and details
- **Current Week**: Get the current NFL week

### Mock Data
The app includes mock data for demonstration purposes when the API is unavailable.

## Database Schema

### Users Collection
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  balance: number;
  totalWinnings: number;
  totalBets: number;
  createdAt: Date;
}
```

### Bets Collection
```typescript
{
  id: string;
  userId: string;
  gameId: string;
  betType: 'moneyline' | 'spread' | 'over_under';
  selection: string;
  amount: number;
  odds: number;
  potentialPayout: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: Date;
  week: number;
  season: number;
}
```

### Parlays Collection
```typescript
{
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
```

## Features in Detail

### Game Picking
- Users can pick games week by week (weeks 1-18)
- Three betting types: moneyline, spread, over/under
- Real-time odds and potential payouts
- Minimum bet amount: $5

### Parlay System
- Combine 2+ games for higher payouts
- Odds multiply together for total parlay odds
- Higher risk, higher reward
- Visual parlay builder interface

### Account Management
- Secure balance tracking
- Multiple deposit methods
- Comprehensive withdrawal system
- Transaction history

### Live Features
- Real-time score updates
- Breaking news notifications
- ESPN-style sound effects
- Live game status indicators

## Security Considerations

- Firebase Authentication for secure user management
- Firestore security rules for data protection
- Input validation on all forms
- Secure API key management
- HTTPS enforcement in production

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Netlify
- Firebase Hosting
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@nflgamepick.com or create an issue in the repository.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Social features (leaderboards, friends)
- [ ] Advanced analytics
- [ ] Live streaming integration
- [ ] Cryptocurrency payments
- [ ] AI-powered predictions
