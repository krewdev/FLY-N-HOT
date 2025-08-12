# 🚀 FLY-IN-HIGH Quick Deploy Commands

## After Installing Git, run these commands:

### 1. Configure Git (replace with your info):
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2. Initialize and commit:
```bash
git init
git add .
git commit -m "Initial commit: FLY-IN-HIGH with security improvements"
```

### 3. Create GitHub repository:
- Go to [github.com/new](https://github.com/new)
- Repository name: `fly-in-high`
- Set to Public
- Don't initialize with README
- Click "Create repository"

### 4. Connect and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/fly-in-high.git
git branch -M main
git push -u origin main
```

### 5. Deploy to Vercel:
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub
- Import `fly-in-high` repository
- Set environment variables:
  - `NODE_ENV=production`
  - `DATABASE_URL=your-database-url`
  - `JWT_SECRET=your-32-char-secret`

## Environment Variables:

### Required:
```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/fly_in_high
JWT_SECRET=your-super-secure-jwt-secret-here-at-least-32-chars
```

### Optional:
```
ADMIN_SECRET=your-admin-secret-16-chars-minimum
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Database Options:
- **Supabase**: [supabase.com](https://supabase.com) (Free)
- **PlanetScale**: [planetscale.com](https://planetscale.com) (Free)
- **Railway**: [railway.app](https://railway.app) (Free)

Your API will be live at: `https://fly-in-high.vercel.app`
