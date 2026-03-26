const snoowrap = require('snoowrap');

class RedditTracker {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_ID !== 'your_reddit_client_id_here') {
      this.client = new snoowrap({
        userAgent: process.env.REDDIT_USER_AGENT || 'TrendingTracker/1.0',
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET
      });
    }
  }

  async track(keywords) {
    if (!this.client) {
      return [{ error: 'Reddit API not configured', keyword: keywords[0] }];
    }

    const results = [];
    const maxResults = parseInt(process.env.MAX_RESULTS_PER_API) || 20;
    const subreddits = ['programming', 'artificial', 'MachineLearning', 'ClaudeAI', 'OpenAI'];

    for (const keyword of keywords) {
      try {
        for (const subreddit of subreddits) {
          const searchResults = await this.client.getSubreddit(subreddit).search({
            query: keyword,
            limit: Math.floor(maxResults / subreddits.length),
            sort: 'hot',
            time: 'day'
          });

          for (const post of searchResults) {
            const score = this.calculateScore(post);
            results.push({
              id: post.id,
              type: 'reddit_post',
              keyword,
              title: post.title,
              content: post.selftext?.substring(0, 200) || '',
              author: post.author.name,
              url: `https://reddit.com${post.permalink}`,
              subreddit: post.subreddit.display_name,
              engagement: {
                upvotes: post.ups,
                comments: post.num_comments,
                score: post.score
              },
              score,
              timestamp: new Date(post.created_utc * 1000).toISOString(),
              source: 'reddit'
            });
          }
        }
      } catch (error) {
        console.error(`Reddit search error for "${keyword}":`, error.message);
        results.push({
          error: error.message,
          keyword
        });
      }
    }

    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  calculateScore(post) {
    return (
      post.ups * 1 +
      post.num_comments * 3 +
      (post.gilded ? 50 : 0)
    );
  }
}

module.exports = RedditTracker;