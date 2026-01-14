# Vercel Integration Guide for X/O Tactics

This guide explains how to connect your GitHub repository to Vercel for automatic deployments after GitHub Actions CI passes.

## Overview

**CI**: GitHub Actions (`.github/workflows/ci.yml`)
- Runs tests, linting, type checking, and build
- Must pass before Vercel deploys
- Runs on every push and pull request

**CD**: Vercel (Automatic via GitHub Integration)
- Deploys to production on merge to `main` branch
- Creates preview deployments for pull requests
- Waits for GitHub Actions CI to pass before deploying

## Step-by-Step Setup

### 1. Import Repository to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Click **"Import"**

### 2. Configure Project Settings

Vercel will auto-detect most settings, but verify:

**Framework Preset**: Vite
✅ Vercel should auto-detect this

**Build Command**:
```bash
npm run build
```

**Output Directory**:
```
dist
```

**Install Command**:
```bash
npm ci
```

### 3. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add the following variables:

| Name | Value | Environment |
|------|-------|--------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview |

**Get your Supabase credentials**:
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy Project URL and anon/public key

### 4. Configure Deploy Hooks (Optional but Recommended)

**Require GitHub Actions CI to Pass**:

Vercel doesn't natively wait for GitHub Actions, but you can:

**Option A: Branch Protection Rules** (Recommended)
1. Go to your GitHub repository
2. Settings → Branches → Add Rule
3. Branch name pattern: `main` (or `master`)
4. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select `CI` as required check

**Option B: Vercel GitHub Integration (Built-in)**
Vercel will automatically:
- Show CI status in Vercel dashboard
- Not deploy if GitHub Actions fails
- Comment deployment status on PRs

### 5. Deployment Behavior

**On Pull Request**:
1. Developer pushes to feature branch
2. GitHub Actions CI runs (~2-3 minutes)
3. If CI passes, Vercel creates preview deployment
4. Preview URL available in PR comments and Vercel dashboard

**On Merge to Main**:
1. PR merged to `main`
2. GitHub Actions CI runs
3. If CI passes, Vercel deploys to production
4. Production URL: `https://your-project.vercel.app`

**On Push to Other Branches**:
- GitHub Actions CI runs
- Vercel doesn't deploy (only `main` and PRs)

### 6. Custom Domain (Optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Click **"Add Domain"**
3. Enter your domain (e.g., `xo-tactics.com`)
4. Configure DNS records as instructed by Vercel
5. Vercel will issue SSL certificate automatically

## Environment-Specific Variables

### Production Environment
Used when deploying from `main` branch:
- `VITE_SUPABASE_URL` - Production Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Production Supabase key

### Preview Environment
Used for PR deployments:
- Same variables as production (using same Supabase)
- Or use separate Supabase project for testing

## Deployment Logs

### View Deployment Logs:
1. Vercel Dashboard → Your Project
2. Click on Deployments tab
3. Click on a specific deployment
4. View build logs, error messages, and function logs

### Common Issues:

**Build Failures**:
- Check that `npm run build` works locally
- Verify environment variables are set in Vercel
- Check deployment logs for specific errors

**Environment Variables Missing**:
- Supabase connections will fail
- Game functionality won't work
- Add all required variables in Vercel dashboard

**GitHub Actions Not Passing**:
- Check Actions tab in GitHub
- Fix failing tests/lint/type errors
- Push fix to trigger CI again

## Rollback Deployment

If you need to rollback to a previous deployment:

1. Vercel Dashboard → Your Project → Deployments
2. Find the previous successful deployment
3. Click **"Promote to Production"**
4. Vercel will redeploy that version

## Monitoring and Analytics

### Vercel Analytics:
- Visit Vercel Dashboard → Your Project → Analytics
- View page views, unique visitors, bandwidth
- Top pages, referrers, geographic data

### Performance:
- Vercel provides Web Vitals scores
- Lighthouse scores for deployments
- Core Web Vitals (LCP, FID, CLS)

## Cost and Limits

**Hobby Plan (Free)**:
- Unlimited deployments
- Automatic HTTPS
- CI/CD with GitHub integration
- 100 GB bandwidth per month
- Serverless Function execution limits

**Pro Plan ($20/month)**:
- Everything in Hobby, plus:
- 1 TB bandwidth
- Team collaboration
- Priority support

For X/O Tactics, the **Hobby Plan** should be sufficient.

## Workflow Summary

```
Developer Push
    ↓
GitHub Actions CI (tests, lint, type check, build)
    ↓ (2-3 minutes)
CI Passes? ✅
    ↓
Vercel Deploy (production or preview)
    ↓ (1-2 minutes)
Deployment Live 🚀
```

## Troubleshooting

### Issue: "Deploy failed but works locally"

**Solution**:
- Check environment variables in Vercel
- Verify `npm ci` vs `npm install` differences
- Check deployment logs in Vercel dashboard
- Ensure all dependencies are in `package.json`

### Issue: "GitHub Actions CI passes but Vercel doesn't deploy"

**Solution**:
- Check Vercel deployment logs
- Verify GitHub connection in Vercel
- Check if Vercel is linked to correct repository
- Try manual deploy from Vercel dashboard

### Issue: "Preview deployments not working"

**Solution**:
- Verify repository has Vercel connected
- Check that PRs are from the same repository
- Enable "Deployments" in Vercel project settings

## Next Steps

After completing Vercel integration:

1. **Test the flow**:
   - Create a PR
   - Wait for GitHub Actions CI
   - Check preview deployment
   - Merge to main
   - Verify production deployment

2. **Set up branch protection** (Recommended)
   - Require CI checks before merge
   - Require 1 approval for PRs

3. **Configure custom domain** (Optional)
   - Add your domain in Vercel
   - Configure DNS

4. **Monitor deployments**
   - Check Vercel dashboard regularly
   - Set up error tracking (e.g., Sentry)

## Support Links

- Vercel Docs: https://vercel.com/docs
- Vercel GitHub Integration: https://vercel.com/docs/deployments/overview
- GitHub Actions Docs: https://docs.github.com/en/actions
- Supabase Docs: https://supabase.com/docs

## Success Criteria

✅ GitHub Actions CI runs successfully
✅ All tests pass
✅ Lint passes with no errors
✅ Type check passes
✅ Production build succeeds
✅ Vercel deploys to production on merge
✅ Preview deployments work for PRs
✅ Environment variables configured correctly
✅ Game works in deployed environment
