const { google } = require('googleapis');

class YouTubeTracker {
  constructor() {
    this.youtube = google.youtube('v3');
    this.apiKey = process.env.YOUTUBE_API_KEY;
  }

  async track(keywords) {
    if (!this.apiKey || this.apiKey === 'your_youtube_api_key_here') {
      return [{ error: 'YouTube API not configured', keyword: keywords[0] }];
    }

    const results = [];
    const maxResults = parseInt(process.env.MAX_RESULTS_PER_API) || 20;

    for (const keyword of keywords) {
      try {
        const response = await this.youtube.search.list({
          key: this.apiKey,
          part: ['snippet'],
          q: keyword,
          type: ['video'],
          order: 'viewCount',
          maxResults: maxResults,
          publishedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours
        });

        if (response.data.items) {
          for (const item of response.data.items) {
            // Get video statistics
            const statsResponse = await this.youtube.videos.list({
              key: this.apiKey,
              part: ['statistics'],
              id: [item.id.videoId]
            });

            const stats = statsResponse.data.items?.[0]?.statistics;
            const score = this.calculateScore(stats);

            results.push({
              id: item.id.videoId,
              type: 'youtube_video',
              keyword,
              title: item.snippet.title,
              content: item.snippet.description,
              author: item.snippet.channelTitle,
              url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
              engagement: stats || { viewCount: 0, likeCount: 0, commentCount: 0 },
              score,
              timestamp: item.snippet.publishedAt,
              source: 'youtube'
            });
          }
        }
      } catch (error) {
        console.error(`YouTube search error for "${keyword}":`, error.message);
        results.push({
          error: error.message,
          keyword
        });
      }
    }

    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  calculateScore(stats) {
    if (!stats) return 0;
    
    return (
      parseInt(stats.viewCount || 0) * 1 +
      parseInt(stats.likeCount || 0) * 3 +
      parseInt(stats.commentCount || 0) * 5
    );
  }
}

module.exports = YouTubeTracker;