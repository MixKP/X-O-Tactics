# X/O Tactics - Supabase Setup Guide

## Quick Setup (2 minutes)

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/nhrbfbpwqzyqruwmlwrq/sql/new

### Step 2: Run the Setup Script
1. Open file: `supabase/complete-setup.sql`
2. Copy ALL the SQL code
3. Paste into Supabase SQL Editor
4. Click **Run** button (or press `Ctrl+Enter`)

### Step 3: Verify Success
Run this query to verify tables were created:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- ✅ elo_ratings
- ✅ game_moves
- ✅ game_sessions
- ✅ matches
- ✅ matchmaking_queue
- ✅ profiles

### Step 4: Test Registration
1. Go to: http://localhost:5176/register
2. Fill in: username, email, password
3. Click "Register"
4. Should redirect to dashboard

### Step 5: Verify User Created
Run this query:
```sql
SELECT
  p.username,
  p.games_played,
  e.rating,
  e.wins,
  e.losses
FROM public.profiles p
LEFT JOIN public.elo_ratings e ON e.user_id = p.id
ORDER BY p.created_at DESC
LIMIT 10;
```

## Troubleshooting

### Error: "relation 'public.profiles' does not exist"
**Solution**: Run the complete-setup.sql script first

### Error: 401 Unauthorized
**Solution**: Enable RLS policies (included in setup script)

### Error: 406 Not Acceptable
**Solution**: Check RLS policies are created (run setup script again)

### Error: "new column 'rating' does not exist"
**Solution**: Drop tables and re-run setup:
```sql
DROP TABLE IF EXISTS public.game_moves CASCADE;
DROP TABLE IF EXISTS public.game_sessions CASCADE;
DROP TABLE IF EXISTS public.matchmaking_queue CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.elo_ratings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
```

Then re-run `complete-setup.sql`

## What Gets Created

### Tables (6)
- **profiles**: User profiles with stats
- **elo_ratings**: ELO ratings per game mode
- **matches**: Match history
- **matchmaking_queue**: Real-time matchmaking
- **game_sessions**: Active online games
- **game_moves**: Move history for reconnection

### Triggers (4)
- Auto-create profile on signup
- Auto-update ELO after match
- Auto-update session activity
- Clean up expired queue entries

### RLS Policies (13)
- Public read for profiles/ratings/matches
- Authenticated users can insert
- Users can only update their own data
- Players can view their own games

## Database Functions Available

### `complete_online_game(p_session_id, p_winner, p_is_draw, p_abandoned)`
Ends an online game and updates ELO

### `cleanup_expired_queue()`
Removes old matchmaking entries

### `update_user_stats(p_user_id, p_won, p_is_draw)`
Updates user stats after match

## URLs After Setup

- **Register**: http://localhost:5176/register
- **Login**: http://localhost:5176/login
- **Dashboard**: http://localhost:5176/dashboard
- **Matchmaking**: http://localhost:5176/matchmaking
- **Leaderboard**: http://localhost:5176/leaderboard

## Need Help?

1. Check Supabase logs: Dashboard → Logs
2. Check browser console: F12 → Console
3. Verify tables: SQL Editor → Run verification query
