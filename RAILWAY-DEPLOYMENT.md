# 🚀 Railway Deployment Guide

Railway is perfect for this application because it supports WebSockets and provides better Node.js hosting than Vercel for real-time apps.

## 🎯 Quick Deployment

### Option 1: Deploy via GitHub (Recommended)
1. Push your code to GitHub
2. Go to https://railway.app
3. Sign up/login with GitHub
4. Click "New Project" → "Deploy from GitHub repo"
5. Select your trending-app repository
6. Railway will automatically detect and deploy

### Option 2: Deploy via Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd trending-app
railway init
railway deploy
```

### Option 3: Deploy via Railway Dashboard
1. Go to https://railway.app
2. Click "New Project" → "Empty Project"
3. Connect your GitHub repository
4. Or drag & drop your trending-app folder

## 🔧 Environment Variables

Railway will automatically use your `.env` file, but you can also set them in the Railway dashboard:

1. Go to your project on Railway
2. Click "Variables" tab
3. Add your API keys:
   - `YOUTUBE_API_KEY`
   - `TWITTER_BEARER_TOKEN` 
   - `REDDIT_CLIENT_ID`
   - `REDDIT_CLIENT_SECRET`
   - `REDDIT_USER_AGENT`

## 🌐 Domain & URL

After deployment, Railway will provide:
- **Default URL**: `https://your-project-name.up.railway.app`
- **Custom Domain**: You can add your own domain in settings

## 📊 Features Working on Railway

- ✅ **WebSocket Support** - Real-time updates
- ✅ **Persistent Storage** - Better than Vercel serverless
- ✅ **Environment Variables** - Secure API key storage
- ✅ **Auto-deploy** - On every Git push
- ✅ **Public by Default** - No authentication required

## 🚀 Performance Benefits

- **Faster cold starts** than Vercel serverless
- **WebSocket support** for real-time features
- **Persistent memory** between requests
- **Better Node.js runtime** optimization

## 🔍 Monitoring

Railway provides:
- Real-time logs
- Performance metrics
- Error tracking
- Resource usage

## 🛠️ Troubleshooting

### Common Issues:

**Build Fails**
- Check Railway logs for error details
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

**API Errors**
- Check environment variables are set correctly
- Verify API keys have proper permissions
- Monitor Railway logs for specific errors

**WebSocket Issues**
- Railway supports WebSockets by default
- Check browser console for connection errors
- Verify your Railway plan supports WebSockets

### Debugging:
```bash
# View logs
railway logs

# SSH into container
railway ssh

# Run locally with Railway environment
railway run npm start
```

## 📈 Scaling

Railway automatically scales based on traffic:
- **Free tier**: Suitable for development and testing
- **Paid plans**: For production traffic and advanced features

## 🔄 Updates

Railway automatically redeploys on:
- Git pushes to connected branch
- Environment variable changes
- Manual trigger from dashboard

## 🎉 Success Metrics

With Railway deployment, expect:
- **Faster load times** than Vercel
- **Better WebSocket performance**
- **More reliable API endpoints**
- **Public access without authentication**

---

**Your trending app will perform much better on Railway than Vercel!** 🚀