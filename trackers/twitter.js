const { TwitterApi } = require('twitter-api-v2');

class TwitterTracker {
  constructor() {
    this.client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || 'dummy_token');
    this.readOnly = this.client.readOnly;
  }

  async track(keywords) {
    if (!process.env.TWITTER_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN === 'your_twitter_bearer_token_here') {
      return [{ error: 'Twitter API not configured', keyword: keywords[0] }];
    }

    const results = [];
    const maxResults = parseInt(process.env.MAX_RESULTS_PER_API) || 20;

    for (const keyword of keywords) {
      try {
        const searchQuery = `${keyword} -is:retweet lang:en`;
        const tweets = await this.readOnly.v2.search(searchQuery, {
          'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
          'user.fields': ['username', 'name'],
          max_results: maxResults,
          sort_order: 'relevancy'
        });

        if (tweets.data) {
          for (const tweet of tweets.data) {
            const score = this.calculateScore(tweet);
            results.push({
              id: tweet.id,
              type: 'tweet',
              keyword,
              title: tweet.text.substring(0, 100) + '...',
              content: tweet.text,
              author: `@${tweet.author_id}`,
              url: `https://twitter.com/user/status/${tweet.id}`,
              engagement: tweet.public_metrics,
              score,
              timestamp: tweet.created_at,
              source: 'twitter'
            });
          }
        }
      } catch (error) {
        // Handle Twitter API credit/pricing issues gracefully
        if (error.message.includes('CreditsDepleted') || error.message.includes('402')) {
          console.log(`⚠️  Twitter API credits depleted for "${keyword}" - skipping`);
          results.push({
            warning: 'Twitter API credits depleted - consider upgrading plan',
            keyword
          });
        } else {
          console.error(`Twitter search error for "${keyword}":`, error.message);
          results.push({
            error: error.message,
            keyword
          });
        }
      }
    }

    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  calculateScore(tweet) {
    const metrics = tweet.public_metrics;
    return (
      metrics.like_count * 1 +
      metrics.retweet_count * 2 +
      metrics.reply_count * 3 +
      metrics.quote_count * 2
    );
  }
}

module.exports = TwitterTracker;