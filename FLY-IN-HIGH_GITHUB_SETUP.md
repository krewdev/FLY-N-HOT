# 🚀 FLY-IN-HIGH GitHub + Vercel Integration Setup Guide

## Step 1: Install Git

### **Download and Install Git:**
1. Go to [git-scm.com/download/win](https://git-scm.com/download/win)
2. Download the 64-bit Git for Windows Setup
3. Run the installer with default settings
4. **Restart PowerShell/Command Prompt** after installation

## Step 2: Configure Git (First Time Setup)

Open a **new** PowerShell and run:

```bash
# Set your name and email (required for commits)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify setup
git --version
```

## Step 3: Initialize Git Repository

```bash
# Navigate to your project
cd "C:\Users\Rosey Duncan\fly-in-high"

# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: FLY-IN-HIGH with security improvements

✅ Fixed race condition in booking system with database transactions
✅ Added authentication middleware for protected routes  
✅ Implemented input validation and sanitization
✅ Added security headers and rate limiting with Helmet
✅ Fixed admin secret bypass vulnerability
✅ Strengthened JWT secret configuration
✅ Configured CORS properly for security
✅ Added database indexes for performance optimization
✅ Improved error handling with proper logging
✅ Fixed TypeScript module resolution issues
✅ Made Stripe API version configurable
✅ Added foreign key validation in API routes

Production-ready with 17+ critical bug fixes applied!"
```

## Step 4: Create GitHub Repository

### **Option A: Using GitHub CLI (Recommended)**
```bash
# Install GitHub CLI (if not installed)
winget install GitHub.CLI

# Login to GitHub
gh auth login

# Create repository and push
gh repo create fly-in-high --public --source=. --remote=origin --push
```

### **Option B: Using GitHub Website**
1. Go to [github.com](https://github.com)
2. Click "New repository" (green button)
3. Repository name: `fly-in-high`
4. Description: `FLY-IN-HIGH: Hot air balloon flight booking platform with security improvements`
5. Set to **Public** (required for free Vercel)
6. ❌ Don't initialize with README (you already have files)
7. Click "Create repository"

8. **Connect your local repo to GitHub:**
```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/fly-in-high.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 5: Connect Vercel to GitHub

### **Setup Vercel Account:**
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign up"
3. **Choose "Continue with GitHub"** (this automatically connects your account)
4. Authorize Vercel to access your GitHub repositories

### **Deploy from GitHub:**
1. In Vercel dashboard, click "New Project"
2. Find your `fly-in-high` repository
3. Click "Import"

### **Configure Project Settings:**
- **Project Name**: `fly-in-high`
- **Framework Preset**: Other
- **Root Directory**: `./` (leave default)
- **Build Command**: `cd apps/api && npm run vercel-build` (auto-detected)
- **Output Directory**: (leave empty)
- **Install Command**: `cd apps/api && npm ci` (auto-detected)

## Step 6: Set Environment Variables

In Vercel project settings, add these environment variables:

### **Required Variables:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/fly_in_high
JWT_SECRET=your-super-secure-jwt-secret-here-at-least-32-chars
```

### **Generate Strong Secrets:**
```bash
# Generate JWT Secret (run in PowerShell)
[System.Web.Security.Membership]::GeneratePassword(32, 0)

# Or use online generator: https://generate-secret.vercel.app/32
```

### **Optional Variables (for full functionality):**
```bash
ADMIN_SECRET=your-admin-secret-16-chars-minimum
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_API_VERSION=2024-04-10
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
```

## Step 7: Set Up Production Database

### **Recommended: Supabase (Free Tier)**
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Create new project: `fly-in-high-db`
4. Database → Settings → Connection string
5. Copy the connection string
6. Add to Vercel as `DATABASE_URL`

### **Alternative: PlanetScale**
1. Go to [planetscale.com](https://planetscale.com)
2. Create database: `fly-in-high`
3. Get connection string from dashboard

## Step 8: Deploy!

1. Click "Deploy" in Vercel
2. Wait for build to complete (2-3 minutes)
3. ✅ Success! Your FLY-IN-HIGH API is live

## Step 9: Test Deployment

```bash
# Test your live API
curl https://fly-in-high.vercel.app/health

# Expected response:
{"status": "ok"}
```

## 🔄 Automatic Deployments

Once connected:
- ✅ **Push to main branch** → Automatic production deployment
- ✅ **Push to other branches** → Preview deployments
- ✅ **Pull requests** → Preview deployments with unique URLs

Example workflow:
```bash
# Make changes to your code
git add .
git commit -m "Add new feature to FLY-IN-HIGH"
git push origin main

# Vercel automatically deploys! 🚀
```

## 🎉 Success Checklist

- [ ] Git installed and configured
- [ ] Repository `fly-in-high` created on GitHub
- [ ] Code pushed to GitHub
- [ ] Vercel connected to GitHub repository
- [ ] Environment variables configured
- [ ] Production database set up
- [ ] Deployment successful
- [ ] Health endpoint returns `{"status": "ok"}`
- [ ] All API endpoints working

## 🔄 Future Workflow

```bash
# Daily development workflow:
git checkout -b feature/new-feature
# Make changes...
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create Pull Request on GitHub
# Vercel creates preview deployment
# Merge PR → Automatic production deployment
```

Your FLY-IN-HIGH API will be live at: `https://fly-in-high.vercel.app`

🚀 **Ready to deploy when you've completed the Git setup!**
