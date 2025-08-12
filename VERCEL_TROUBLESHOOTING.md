# 🔧 Vercel Build Error Troubleshooting Guide

## Fixed Issues ✅

The following Vercel deployment issues have been resolved:

1. **TypeScript Build Configuration** - Fixed module resolution and build process
2. **Package Dependencies** - Moved TypeScript to production dependencies 
3. **Vercel Build Script** - Created proper `vercel-build` command
4. **Prisma Client Generation** - Added to build process
5. **Node.js Runtime** - Specified Node.js 18.x runtime

## Common Vercel Build Errors & Solutions

### 1. **Module Resolution Errors**
```
Error: Cannot find module 'xyz'
```
**Solution**: ✅ Fixed by updating `tsconfig.json` and moving TypeScript to dependencies

### 2. **Prisma Client Not Generated**
```
Error: @prisma/client not found
```
**Solution**: ✅ Fixed by adding `prisma generate` to `vercel-build` script

### 3. **TypeScript Compilation Issues**
```
Error: tsc command not found
```
**Solution**: ✅ Fixed by moving TypeScript to production dependencies

### 4. **Build Timeout**
```
Error: Build exceeded maximum time limit
```
**Solution**: ✅ Fixed by optimizing build process and excluding unnecessary files

## Environment Variables Required for Vercel

Set these in your Vercel dashboard under Settings → Environment Variables:

### **Required for Basic Functionality:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-32-character-secret-here
```

### **Optional (for full features):**
```bash
ADMIN_SECRET=your-admin-secret-16-chars
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_API_VERSION=2024-04-10
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

## Database Setup for Production

### **Option 1: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string: Settings → Database → Connection string
4. Use format: `postgresql://postgres:[password]@[host]:5432/postgres`

### **Option 2: PlanetScale**
1. Go to [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string from dashboard

### **Option 3: Railway**
1. Go to [railway.app](https://railway.app)
2. Deploy PostgreSQL template
3. Copy connection URL

## Deployment Steps

### **Method 1: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project root
cd "C:\Users\Rosey Duncan\lets-go-fly"

# Deploy
vercel --prod

# Follow prompts to configure
```

### **Method 2: GitHub Integration**
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

### **Method 3: Direct Upload**
1. Zip project folder (exclude node_modules)
2. Upload to Vercel dashboard
3. Configure settings manually

## Build Configuration Files Created

### ✅ `vercel.json` - Updated
```json
{
  "version": 2,
  "installCommand": "cd apps/api && npm ci",
  "buildCommand": "cd apps/api && npm run vercel-build",
  "builds": [
    { "src": "apps/api/api/index.ts", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "apps/api/api/index.ts" }
  ],
  "functions": {
    "apps/api/api/index.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### ✅ `.vercelignore` - Created
Excludes unnecessary files from deployment for faster builds.

### ✅ `package.json` - Updated
- Added `vercel-build` script
- Moved TypeScript to production dependencies
- Cleaned up duplicate dependencies

## Testing Your Deployment

After successful deployment:

```bash
# Test health endpoint
curl https://your-app.vercel.app/health

# Expected response:
{"status": "ok"}

# Test API endpoints
curl https://your-app.vercel.app/flights
```

## Additional Troubleshooting

### **If builds still fail:**

1. **Check Vercel Build Logs**:
   - Go to Vercel dashboard
   - Click on failed deployment
   - Check "Building" step for detailed errors

2. **Verify Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify DATABASE_URL format is correct

3. **Test Locally**:
   ```bash
   cd apps/api
   npm run vercel-build
   ```

4. **Check Function Logs**:
   - Go to Vercel dashboard → Functions tab
   - Check runtime logs for errors

### **Performance Optimization**:

- **Cold Start**: First request may be slow (~2-3 seconds)
- **Database Connection**: Use connection pooling
- **Memory Limit**: Upgrade Vercel plan if needed

## Success Indicators

✅ Build completes without errors  
✅ Function deployment successful  
✅ Health endpoint returns `{"status": "ok"}`  
✅ Environment variables configured  
✅ Database connection working  

## Next Steps After Successful Deployment

1. **Set up custom domain** (optional)
2. **Configure production database** 
3. **Test all API endpoints**
4. **Set up monitoring** (Vercel Analytics)
5. **Configure CORS** for your frontend domain

Your API should now be live at: `https://your-project-name.vercel.app` 🚀
