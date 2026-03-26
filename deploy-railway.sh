#!/bin/bash

# Railway Deployment Script for Trending App

echo "🚀 Preparing Trending App for Railway deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the trending-app directory"
    exit 1
fi

echo "📦 Checking dependencies..."
npm list || npm install

echo "🔧 Environment check..."
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating template..."
    cat > .env << 'EOF'
# API Configuration

# X/Twitter API v2
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Reddit API
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here
REDDIT_USER_AGENT=TrendingApp/1.0 (by your_reddit_username)

# YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key_here

# Search keywords to track
KEYWORDS=claude code,openclaw,ai assistant,claude ai,openclaw ai

# Monitoring settings
CHECK_INTERVAL_MINUTES=60
MAX_RESULTS_PER_API=20

# Server settings
PORT=3000
NODE_ENV=production
EOF
    echo "📝 Created .env template. Please edit with your API keys."
else
    echo "✅ .env file exists"
fi

echo ""
echo "🎯 Railway Deployment Options:"
echo ""
echo "1. GitHub Deployment (Recommended):"
echo "   - Push this directory to GitHub"
echo "   - Go to https://railway.app"
echo "   - Connect your repository"
echo "   - Railway will auto-deploy"
echo ""
echo "2. Railway CLI Deployment:"
echo "   npm install -g @railway/cli"
echo "   railway login"
echo "   railway init"
echo "   railway deploy"
echo ""
echo "3. Manual Upload:"
echo "   - Go to https://railway.app"
echo "   - Create new project"
echo "   - Drag & drop this folder"
echo ""
echo "📊 App Features:"
echo "- Real-time trending content tracking"
echo "- YouTube API integration"
echo "- Beautiful responsive dashboard"
echo "- WebSocket support (Railway advantage)"
echo "- Hourly automated tracking"
echo ""
echo "🔗 Your app will be available at: https://your-project.up.railway.app"
echo ""
echo "🚀 Ready for Railway deployment!"