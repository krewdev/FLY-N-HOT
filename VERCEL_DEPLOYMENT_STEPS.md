# 🚀 Vercel Deployment Steps for FLY-IN-HIGH

This guide will walk you through deploying your FLY-IN-HIGH application to Vercel.

## Prerequisites Completed ✅
- ✅ Git repository initialized
- ✅ Vercel CLI installed globally
- ✅ Environment variables documented
- ✅ CORS configuration updated for Vercel domains
- ✅ Project structure ready for deployment

## Step 1: Login to Vercel

Open a terminal on your local machine and run:

```bash
vercel login
```

This will open a browser window. Sign in with your Vercel account (or create one if you don't have one).

## Step 2: Deploy the Project

From the project root directory (`/workspace`), run:

```bash
vercel
```

You'll be prompted with several questions:

1. **Set up and deploy "~/fly-in-high"?** → Yes
2. **Which scope do you want to deploy to?** → Select your account
3. **Link to existing project?** → No (unless you already have one)
4. **What's your project's name?** → `fly-in-high` (or your preferred name)
5. **In which directory is your code located?** → `./` (press Enter for current directory)
6. **Want to modify these settings?** → No

## Step 3: Configure Environment Variables

After the initial deployment, you need to set up environment variables:

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your `fly-in-high` project
3. Go to "Settings" → "Environment Variables"
4. Add the following variables:

```
NODE_ENV=production
DATABASE_URL=your_database_connection_string
JWT_SECRET=generate-a-secure-32-character-string-here
ADMIN_SECRET=generate-a-secure-16-character-string-here
```

### Option B: Using Vercel CLI

```bash
# Set each environment variable
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add ADMIN_SECRET production
vercel env add NODE_ENV production
```

## Step 4: Set Up Database

You'll need a PostgreSQL database. Here are some free options:

### Supabase (Recommended for beginners)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Use it as your `DATABASE_URL`

### Alternative: Neon
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use it as your `DATABASE_URL`

## Step 5: Run Database Migrations

After setting up your database, run migrations:

```bash
# Install dependencies first
cd apps/api
npm install

# Run migrations with your production DATABASE_URL
DATABASE_URL="your-production-database-url" npx prisma migrate deploy
```

## Step 6: Deploy to Production

Once environment variables are set, deploy to production:

```bash
vercel --prod
```

## Step 7: Update Frontend API URL

If deploying the frontend separately, update the API URL:

1. In Vercel dashboard, add this environment variable to your frontend:
   ```
   NEXT_PUBLIC_API_URL=https://fly-in-high.vercel.app
   ```

2. Or update it in your code if needed.

## Step 8: Verify Deployment

Test your deployment:

```bash
# Check API health
curl https://fly-in-high.vercel.app/health

# Should return: {"status":"ok"}
```

## 🎉 Your App URLs

- **API**: `https://fly-in-high.vercel.app`
- **Frontend**: `https://fly-in-high.vercel.app` (if using the same deployment)

## 📝 Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] Database is connected and migrations are run
- [ ] API health check passes
- [ ] Frontend can connect to API
- [ ] Authentication is working
- [ ] CORS is properly configured

## 🔧 Troubleshooting

### "Invalid token" error
- Run `vercel login` again

### Build fails
- Check logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Check for TypeScript errors: `npm run build`

### Database connection fails
- Verify DATABASE_URL format
- Check if database allows connections from Vercel IPs
- Some databases require SSL: add `?sslmode=require` to connection string

### CORS errors
- The CORS configuration has been updated to allow Vercel domains
- For custom domains, update `apps/api/src/app.ts` lines 56-57

## 🔐 Security Notes

1. **Generate secure secrets**:
   ```bash
   # Generate JWT_SECRET (32+ chars)
   openssl rand -base64 32
   
   # Generate ADMIN_SECRET (16+ chars)
   openssl rand -base64 16
   ```

2. **Never commit .env files** - they're already in .gitignore

3. **Use different secrets for production** than development

## 📱 Optional: Set Up Notifications

If you want SMS notifications via Twilio:
1. Sign up at [twilio.com](https://twilio.com)
2. Get your credentials
3. Add these environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM_NUMBER`

## 🚀 Next Steps

1. **Custom Domain**: Add your domain in Vercel dashboard → Settings → Domains
2. **Monitoring**: Set up error tracking with Sentry
3. **Analytics**: Add Vercel Analytics for performance insights
4. **CI/CD**: Connect GitHub for automatic deployments

---

Need help? Check the [Vercel documentation](https://vercel.com/docs) or review the error logs in your Vercel dashboard.