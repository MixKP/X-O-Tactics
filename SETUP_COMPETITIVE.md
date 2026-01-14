# X/O Tactics - Competitive Multiplayer Setup Guide

This guide will help you set up the competitive multiplayer feature with Supabase backend.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in project details:
   - Name: `xo-tactics` (or any name you prefer)
   - Database Password: (save this securely)
   - Region: Choose closest to your players
5. Wait for project to be provisioned (~2 minutes)

## Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)

This will create:
- `profiles` table (user data)
- `elo_ratings` table (ELO ratings by game mode)
- `matches` table (match history)
- `matchmaking_queue` table (real-time matchmaking)
- Database functions for ELO calculations
- Row Level Security (RLS) policies

## Step 3: Configure Environment Variables

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - Project URL
   - anon public key

3. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

4. Edit `.env` and paste your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Install Dependencies & Run

```bash
npm install
npm run dev
```

## Step 5: Test the Features

1. Open the app in your browser
2. Click **⚔️ Competitive** on the title screen
3. **Register** a new account
4. View your **Profile Dashboard** with ELO rating
5. Click **🎮 Find Match** to test matchmaking (note: full online play requires WebSocket implementation)

## Features Implemented

### ✅ Completed
- User authentication (Sign up / Sign in)
- Profile system with username
- ELO rating system (ranked mode)
- Match history tracking
- Stats dashboard (games played, win rate, streaks)
- Rank system (Bronze → Grandmaster)
- Matchmaking queue system
- Real-time matchmaking infrastructure

### 🚧 To Be Completed
- WebSocket integration for real-time online gameplay
- Game session management
- In-game chat
- Leaderboards page
- Seasonal resets
- Tournament mode

## Database Schema Overview

### Profiles Table
```sql
- id: UUID (references auth.users)
- username: TEXT (unique)
- games_played, games_won, games_lost, games_drawn
- current_streak, best_streak
```

### ELO Ratings Table
```sql
- user_id: UUID
- game_mode: TEXT ('ranked', 'casual')
- rating: INTEGER (starts at 1000)
- peak_rating: INTEGER
- wins, losses, draws
```

### Matches Table
```sql
- player1_id, player2_id, winner_id
- is_draw: BOOLEAN
- player1/2_rating_before: INTEGER
- player1/2_rating_change: INTEGER
- moves: JSONB (stores all moves)
- duration_seconds: INTEGER
```

## ELO Calculation

The game uses the standard ELO formula with K=32:

```
Expected Score = 1 / (1 + 10^((OpponentRating - YourRating) / 400))
New Rating = CurrentRating + K × (ActualScore - ExpectedScore)
```

### Rating Changes
- **Win against equal rating**: +16 ELO
- **Loss against equal rating**: -16 ELO
- **Draw against equal rating**: 0 ELO

### Ranks
- **Bronze**: 1000-1199
- **Silver**: 1200-1399
- **Gold**: 1400-1599
- **Platinum**: 1600-1799
- **Diamond**: 1800-1999
- **Grandmaster**: 2000+

## Testing Matchmaking Locally

For testing matchmaking with multiple players locally:

1. Open the app in two different browsers (or incognito windows)
2. Register two different accounts
3. Both click "Find Match" simultaneously
4. The matchmaking system will pair them together

## Security Notes

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Users can read all profiles
- Users can only update their own profile
- Matches are publicly readable (for transparency)
- Queue entries are user-specific

### API Keys
- **anon key**: Safe to expose in frontend (limited by RLS)
- **service_role key**: Never expose in frontend (admin access)

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Check variable names match exactly
- Restart dev server after adding `.env`

### Auth errors
- Check Supabase project is active
- Verify Email templates are enabled in Supabase → Auth → Email Templates
- For testing, you can disable email confirmation in Auth → Settings

### Matchmaking not working
- Check browser console for WebSocket errors
- Verify Realtime is enabled in Supabase → Settings → API
- Check `matchmaking_queue` table for entries

## Next Steps

To complete the online multiplayer feature:

1. **WebSocket Integration**: Implement real-time game state sync
2. **Game Sessions**: Create `game_sessions` table for active games
3. **Turn Synchronization**: Add turn validation server-side
4. **Reconnection**: Handle disconnect/reconnect scenarios
5. **Leaderboards**: Create global and friends leaderboards

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [ELO Rating System](https://en.wikipedia.org/wiki/Elo_rating_system)
