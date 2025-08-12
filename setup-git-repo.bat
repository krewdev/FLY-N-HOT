@echo off
echo Setting up FLY-IN-HIGH Git Repository...
echo.

echo Step 1: Configuring Git (replace with your info)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

echo.
echo Step 2: Initializing repository
git init

echo.
echo Step 3: Adding all files
git add .

echo.
echo Step 4: Creating initial commit
git commit -m "Initial commit: FLY-IN-HIGH with security improvements - Fixed race condition in booking system - Added authentication middleware - Implemented input validation and sanitization - Added security headers and rate limiting - Fixed admin secret bypass vulnerability - Production-ready with 17+ critical bug fixes applied!"

echo.
echo Step 5: Ready to connect to GitHub!
echo Next steps:
echo 1. Create repository 'fly-in-high' on GitHub
echo 2. Run: git remote add origin https://github.com/YOUR_USERNAME/fly-in-high.git
echo 3. Run: git branch -M main
echo 4. Run: git push -u origin main
echo.
echo Setup complete! Repository ready for GitHub.
pause
