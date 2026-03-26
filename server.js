require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cron = require('node-cron');

// Import trackers
const TwitterTracker = require('./trackers/twitter');
const RedditTracker = require('./trackers/reddit');
const YouTubeTracker = require('./trackers/youtube');

class TrendingApp {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: { 
        origin: "*", 
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });
    
    this.port = process.env.PORT || process.env.RAILWAY_PORT || 3000;
    // Simple in-memory storage (will reset on serverless cold starts)
    this.latestResults = {
      timestamp: new Date().toISOString(),
      totalItems: 0,
      topItems: [
        {
          id: "demo-1",
          type: "youtube_video",
          keyword: "claude code",
          title: "Demo Content - Run tracking to see real data",
          content: "Click 'Run Manual Check' to start tracking real trending content",
          author: "Trending App",
          url: "#",
          engagement: { viewCount: "0", likeCount: "0", commentCount: "0" },
          score: 0,
          timestamp: new Date().toISOString(),
          source: "demo"
        }
      ]
    };
    
    this.trackers = {
      twitter: new TwitterTracker(),
      reddit: new RedditTracker(),
      youtube: new YouTubeTracker()
    };
    
    this.keywords = process.env.KEYWORDS?.split(',') || ['claude code', 'openclaw', 'ai assistant', 'claude ai', 'openclaw ai'];
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocket();
  }

  setupMiddleware() {
    this.app.use(require('cors')());
    this.app.use(express.json());
    this.app.use(express.static('public'));
    
    // Serve socket.io client
    this.app.get('/socket.io/socket.io.js', (req, res) => {
      res.redirect('https://cdn.socket.io/4.7.2/socket.io.min.js');
    });
  }

  setupRoutes() {
    // Serve dashboard
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'static-dashboard.html'));
    });
    
    // Also serve the original for reference
    this.app.get('/realtime', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // API endpoints
    this.app.get('/api/results/latest', (req, res) => {
      if (this.latestResults) {
        res.json(this.latestResults);
      } else {
        res.json({ error: 'No results available', message: 'Run tracking first' });
      }
    });

    this.app.post('/api/run-check', async (req, res) => {
      try {
        console.log('🔍 Manual check triggered');
        const results = await this.trackAll();
        res.json({ 
          success: true, 
          results: {
            totalItems: results.totalItems,
            timestamp: results.timestamp
          }
        });
      } catch (error) {
        console.error('❌ Manual check error:', error);
        res.status(500).json({ 
          error: error.message,
          message: 'Check server logs for details'
        });
      }
    });
  }

  setupSocket() {
    this.io.on('connection', (socket) => {
      console.log('📊 Client connected to dashboard');
      
      if (this.latestResults) {
        socket.emit('latest-results', this.latestResults);
      }
      
      socket.on('disconnect', () => {
        console.log('📊 Client disconnected');
      });
    });
  }

  async trackAll() {
    const timestamp = new Date().toISOString();
    const results = {
      timestamp,
      keywords: this.keywords,
      sources: {}
    };

    console.log(`\n🔄 Tracking trends for: ${this.keywords.join(', ')}`);
    console.log(`📅 ${timestamp}`);

    // Track each source
    for (const [sourceName, tracker] of Object.entries(this.trackers)) {
      try {
        console.log(`\n🔍 Checking ${sourceName}...`);
        results.sources[sourceName] = await tracker.track(this.keywords);
        console.log(`✅ ${sourceName}: Found ${results.sources[sourceName].length} items`);
      } catch (error) {
        console.error(`❌ ${sourceName} error:`, error.message);
        console.error('Stack:', error.stack);
        results.sources[sourceName] = { 
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
      }
    }

    // Generate summary
    const summary = await this.generateSummary(results);
    
    // Store and broadcast
    this.latestResults = summary;
    this.io.emit('latest-results', summary);
    
    console.log(`📊 Summary: ${summary.totalItems} total items tracked`);
    
    return summary;
  }

  async generateSummary(results) {
    const summary = {
      timestamp: results.timestamp,
      totalItems: 0,
      topItems: []
    };

    // Count total items and find top performers
    for (const [source, data] of Object.entries(results.sources)) {
      if (Array.isArray(data)) {
        summary.totalItems += data.length;
        
        // Add top 3 items from each source
        const topSourceItems = data
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 3)
          .map(item => ({ ...item, source }));
        
        summary.topItems.push(...topSourceItems);
      }
    }

    // Sort all top items
    summary.topItems.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    return summary;
  }

  startScheduler() {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      console.log('\n⏰ Scheduled tracking run starting...');
      await this.trackAll();
    });
    
    console.log('⏰ Scheduler started - running every hour');
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`🚀 Trending App running on http://localhost:${this.port}`);
      console.log(`📊 Dashboard available at http://localhost:${this.port}`);
      console.log(`🔍 Tracking keywords: ${this.keywords.join(', ')}`);
      
      // Start scheduler if not in track-only mode
      if (!process.argv.includes('--track')) {
        this.startScheduler();
      }
    });
  }
}

// Handle command line arguments
if (require.main === module) {
  const app = new TrendingApp();
  
  if (process.argv.includes('--track')) {
    // Track only mode
    app.trackAll().then(() => {
      console.log('✅ Tracking completed');
      process.exit(0);
    }).catch(console.error);
  } else {
    // Full app mode
    app.start();
  }
}

module.exports = TrendingApp;