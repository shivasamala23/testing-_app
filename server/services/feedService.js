import { redis } from '../storage/redisAdapter.js';
import { postIngestionService } from './postIngestionService.js';

/**
 * Feed Generation & Delivery Service
 * Implements Instagram's Hybrid Fan-Out Architecture:
 * - Reads pre-computed timeline from Redis (Fan-out on Write)
 * - Merges latest posts from followed celebrities (Fan-out on Read)
 * - Decorates posts with real-time like statuses (SISMEMBER O(1))
 */
class FeedService {
  constructor() {
    this.followedCelebrities = new Map(); // userId -> Array of celebrity userIds
    this.seedCelebrityGraph();
  }

  seedCelebrityGraph() {
    this.followedCelebrities.set('usr_me', ['nasa']);
  }

  async getUserFeed(userId, page = 0, limit = 15) {
    const startTime = Date.now();

    // 1. Fetch pre-materialized timeline from Redis cache (O(k))
    const startIdx = page * limit;
    const endIdx = startIdx + limit - 1;
    const cachedPostIds = await redis.lrange(`timeline:${userId}`, startIdx, endIdx);

    // 2. Fetch posts from followed celebrities on read
    const followedCelebs = this.followedCelebrities.get(userId) || [];
    const celebPosts = [];
    
    for (const celebUsername of followedCelebs) {
      // In production: SELECT * FROM posts WHERE author = 'nasa' ORDER BY created_at DESC LIMIT 5
      // Simulated:
      const viralPost = await postIngestionService.getPostById('post_viral_01');
      if (viralPost) {
        celebPosts.push(viralPost);
      }
    }

    // 3. Hydrate standard post details
    const standardPosts = [];
    for (const id of cachedPostIds) {
      const post = await postIngestionService.getPostById(id);
      if (post) standardPosts.push(post);
    }

    // 4. Merge and sort by timestamp
    const combinedPosts = [...celebPosts, ...standardPosts].sort((a, b) => b.createdAt - a.createdAt);

    // 5. Decorate with real-time user-specific like status (SISMEMBER O(1))
    const decoratedPosts = await Promise.all(
      combinedPosts.map(async (post) => {
        const isLiked = await redis.sismember(`post:${post.id}:likes`, userId);
        const liveLikes = await redis.getCounter(`post:${post.id}:likes_count`);
        return {
          ...post,
          likesCount: liveLikes || post.likesCount,
          isLiked: Boolean(isLiked)
        };
      })
    );

    const latencyMs = Date.now() - startTime;

    return {
      posts: decoratedPosts,
      meta: {
        count: decoratedPosts.length,
        latencyMs,
        cacheHitRate: redis.getHitRate(),
        strategy: 'Hybrid Fan-Out'
      }
    };
  }
}

export const feedService = new FeedService();
