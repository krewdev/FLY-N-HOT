# 🚀 Deployment Guide for FLY-IN-HIGH

## Prerequisites

1. **Git installed** - Download from [git-scm.com](https://git-scm.com/download/win)
2. **Vercel CLI installed** - Run: `npm install -g vercel`
3. **Database setup** (for production)

## Step 1: Initialize Git Repository

Open a new terminal/PowerShell and run:

```bash
# Navigate to your project directory
cd "C:\Users\Rosey Duncan\fly-in-high"

# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit with security improvements

- Fixed race condition in booking system
- Added authentication middleware
- Implemented input validation and sanitization
- Added security headers and rate limiting
- Fixed admin secret bypass vulnerability
- Added database indexes for performance
- Improved error handling and logging
- Fixed TypeScript configuration issues"
```

## Step 2: Push to GitHub (Optional but Recommended)

```bash
# Create a new repository on GitHub, then:
git branch -M main
git remote add origin https://github.com/yourusername/lets-go-fly.git
git push -u origin main
```

## Step 3: Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy from project root
vercel --prod

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No (unless you have one)
# - What's your project's name? lets-go-fly
# - In which directory is your code located? ./
```

## Step 4: Environment Variables for Production

After deployment, set these environment variables in Vercel dashboard:

### Required Variables:
```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your-super-secure-jwt-secret-here-at-least-32-chars
ADMIN_SECRET=your-admin-secret-here
```

### Optional (for full functionality):
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
```

## Step 5: Database Setup

### Option A: Use Vercel Postgres
1. Go to Vercel dashboard → Storage → Create Database → Postgres
2. Copy the connection string to `DATABASE_URL`

### Option B: Use External Provider (Recommended)
- **Supabase**: [supabase.com](https://supabase.com) (free tier)
- **PlanetScale**: [planetscale.com](https://planetscale.com) (free tier)
- **Railway**: [railway.app](https://railway.app) (free tier)

## Step 6: Run Database Migration

After setting up the database:

```bash
# Run this locally with production DATABASE_URL
cd apps/api
npx prisma migrate deploy
```

## Step 7: Test Deployment

```bash
# Test health endpoint
curl https://your-app.vercel.app/health

# Should return: {"status": "ok"}
```

## 🔒 Security Checklist for Production

✅ **Environment Variables Set**
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Strong ADMIN_SECRET (16+ characters) 
- [ ] Production DATABASE_URL

✅ **CORS Configuration**
- [ ] Update CORS origins in `apps/api/src/app.ts` lines 19-20
- [ ] Replace with your actual domains

✅ **Rate Limiting**
- [ ] Rate limits are active (100 req/15min in production)
- [ ] Auth endpoints limited to 5 attempts/15min

✅ **Database Security**
- [ ] Database migration applied
- [ ] Indexes created for performance
- [ ] Constraints enforced via application logic

## 🐛 Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run build`
- Ensure all dependencies installed: `npm install`

### Database Connection Issues
- Verify DATABASE_URL format
- Check database server is accessible
- Ensure SSL mode if required: `?sslmode=require`

### CORS Errors
- Update allowed origins in `apps/api/src/app.ts`
- Ensure frontend URL matches CORS configuration

### Rate Limiting Too Strict
- Adjust limits in `apps/api/src/app.ts` lines 25-40
- Consider different limits for development vs production

## 📁 Project Structure Post-Deployment

```
lets-go-fly/
├── apps/
│   ├── api/          # Backend API (deployed to Vercel)
│   └── web/          # Frontend (deploy separately if needed)
├── vercel.json       # Vercel configuration
├── .gitignore        # Git ignore rules
└── README.md         # Project documentation
```

## Next Steps

1. **Frontend Deployment**: Deploy the Next.js frontend separately
2. **Domain Setup**: Configure custom domain in Vercel
3. **Monitoring**: Set up error tracking (Sentry, LogRocket)
4. **CI/CD**: Set up automated deployments from GitHub
5. **Testing**: Add integration tests for critical endpoints

Your API will be available at: `https://your-project-name.vercel.app`

## 🛡️ Security Improvements Applied

1. **Race Condition Fix** - Atomic booking operations
2. **Authentication Framework** - JWT-based auth ready
3. **Input Validation** - Zod schemas with sanitization  
4. **Security Headers** - Helmet middleware
5. **Rate Limiting** - DDoS protection
6. **Admin Security** - Mandatory admin secrets
7. **CORS Protection** - Environment-specific origins
8. **Error Handling** - Proper logging and responses
9. **Database Optimization** - Indexes and constraints
10. **Type Safety** - Fixed TypeScript configuration

All critical security vulnerabilities have been addressed! 🎉
