# Deploying X/O Tactics to Vercel

This guide will walk you through deploying your X/O Tactics game to Vercel.

## Prerequisites

1. **Supabase Project**: You should already have a Supabase project set up
2. **Vercel Account**: Create a free account at https://vercel.com
3. **GitHub Repository**: Your code should be in a GitHub repository

## Step-by-Step Deployment

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   cd /home/mix/vibecode
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? (Select your account)
   - Link to existing project? **N** (to create new project)
   - Project name: **xo-tactics** (or your preferred name)
   - In which directory is your code located? **./** (current directory)
   - Want to override settings? **N**

5. **Add Environment Variables**:
   When asked about environment variables, add:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

   Or add them later in the Vercel dashboard (see Option 2).

### Option 2: Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Import Your Repository**:
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
   Click "Environment Variables" and add:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
     - Get from: https://app.supabase.com/project/_/settings/api
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
     - Get from: https://app.supabase.com/project/_/settings/api

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (~1-2 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

## Post-Deployment Configuration

### 1. Verify Environment Variables
Make sure your environment variables are set in production:
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Check that both Supabase variables are set for all environments (Production, Preview, Development)

### 2. Test Your Deployment
Visit your deployed URL and test:
- User registration and login
- Local gameplay
- Matchmaking
- Online gameplay

### 3. Configure Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel

## Environment Variables Reference

You can find your Supabase credentials here:
- URL: https://app.supabase.com/project/_/settings/api
- Project URL: Under "Project URL"
- Anon Key: Under "Project API keys" → "anon" key

## Common Issues & Solutions

### Build Failures
- **Error**: "Environment variable not found"
  - **Solution**: Make sure environment variables are set in Vercel dashboard with `VITE_` prefix

- **Error**: "TypeScript error"
  - **Solution**: Run `npm run build` locally first to catch errors

### Runtime Issues
- **Error**: "Supabase connection failed"
  - **Solution**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct

- **Error**: "Realtime not working"
  - **Solution**: Ensure Realtime is enabled in your Supabase dashboard for the `game_sessions` table

### Routing Issues
- **Error**: "404 on refresh"
  - **Solution**: The `vercel.json` file handles SPA routing - make sure it's deployed

## Automatic Deployments

Once connected to GitHub, Vercel will:
- **Automatically deploy** when you push to main branch
- **Create preview deployments** for pull requests
- **Rollback** to previous deployments if needed

## Updating Your Deployment

After making changes:
```bash
git add .
git commit -m "Your commit message"
git push
```

Vercel will automatically redeploy!

## Monitoring

- **View Logs**: Vercel Dashboard → Your Project → Deployments → Click a deployment → View Logs
- **Analytics**: Vercel Dashboard → Your Project → Analytics
- **Error Tracking**: Consider integrating Vercel Speed Insights or Sentry

## Production Checklist

Before going live:
- ✅ Environment variables configured
- ✅ Supabase Realtime enabled
- ✅ Database schema set up (run `supabase/schema.sql`)
- ✅ Test all game modes
- ✅ Check mobile responsiveness
- ✅ Verify authentication flow
- ✅ Test matchmaking with real players

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Project Issues: Check your GitHub issues
