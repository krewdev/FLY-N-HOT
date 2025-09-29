# ✅ FLY-IN-HIGH Deployment Checklist

## Pre-Deployment
- [x] Project initialized with Git
- [x] Vercel CLI installed (`npm install -g vercel`)
- [x] CORS configuration updated for Vercel domains
- [x] Environment variables documented (.env.example)
- [x] Build scripts configured (vercel-build in API)

## Deployment Steps
- [ ] Run `vercel login` on your local machine
- [ ] Run `vercel` from project root to deploy
- [ ] Set up PostgreSQL database (Supabase/Neon/Railway)
- [ ] Add environment variables in Vercel dashboard:
  - [ ] NODE_ENV=production
  - [ ] DATABASE_URL=your_database_url
  - [ ] JWT_SECRET=your_jwt_secret (use `node generate-secrets.js`)
  - [ ] ADMIN_SECRET=your_admin_secret (use `node generate-secrets.js`)
- [ ] Run database migrations: `cd apps/api && DATABASE_URL="..." npx prisma migrate deploy`
- [ ] Deploy to production: `vercel --prod`

## Post-Deployment Verification
- [ ] Test API health: `curl https://your-app.vercel.app/health`
- [ ] Check frontend loads properly
- [ ] Test authentication flow
- [ ] Verify CORS is working (no console errors)

## Optional Enhancements
- [ ] Add custom domain
- [ ] Set up Stripe for payments
- [ ] Configure Twilio for SMS notifications
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring (Sentry)

## Important URLs
- Vercel Dashboard: https://vercel.com/dashboard
- Project will be at: https://fly-in-high.vercel.app (or your chosen name)

## Quick Commands
```bash
# Generate secrets
node generate-secrets.js

# Deploy
vercel

# Deploy to production
vercel --prod

# Check deployment
curl https://your-app.vercel.app/health
```