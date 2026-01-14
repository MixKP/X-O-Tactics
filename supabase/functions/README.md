# Supabase Edge Functions

This directory contains Supabase Edge Functions for X/O Tactics online multiplayer.

## validate-move

Validates and processes moves for online games to prevent cheating.

### Deployment

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
cd /home/mix/vibecode
supabase link --project-ref nhrbfbpwqzyqruwmlwrq
```

4. Deploy the function:
```bash
supabase functions deploy validate-move
```

5. Set environment variables (if needed):
```bash
supabase secrets list
```

### Testing

Test the function locally:
```bash
supabase functions serve validate-move
```

Or call the deployed function:
```bash
curl -X POST \
  https://nhrbfbpwqzyqruwmlwrq.supabase.co/functions/v1/validate-move \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "uuid-here",
    "userId": "uuid-here",
    "move": {
      "type": "place",
      "cell": 4
    }
  }'
```

### Important Notes

- The Edge Function uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS policies
- This is necessary to validate moves on behalf of any player
- Never expose the service role key in client-side code
- The function validates: turn order, move legality, win conditions
