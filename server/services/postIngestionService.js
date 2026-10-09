import { redis } from '../storage/redisAdapter.js';
import crypto from 'crypto';

/**
 * Post Ingestion Service
 * Handles pre-signed media upload tokens, post metadata ingestion, and fan-out routing.
 */
class PostIngestionService {
  constructor() {
    this.postsStore = new Map(); // Primary post metadata store
    this.followersGraph = new Map(); // userId -> Set of follower userIds
    
    // Seed initial follow graph
    this.seedFollowGraph();
  }

  seedFollowGraph() {
    // Current user follows some creators
    this.followersGraph.set('tech_architect', new Set(['usr_me', 'usr_2', 'usr_3']));
    this.followersGraph.set('scale_engineering', new Set(['usr_me', 'usr_4', 'usr_5']));
    this.followersGraph.set('tokyo_vibes', new Set(['usr_me', 'usr_6']));
    
    // NASA is a celebrity with millions of followers
    this.followersGraph.set('nasa', new Set(['usr_me'])); // Fan-out on read
  }

  /**
   * Generate Pre-signed S3/Blob URL
   * In a real deployment, this signs an AWS S3 PUT request using AWS SDK.
   * Allows the mobile/web client to stream heavy photo/video directly to storage.
   */
  generatePreSignedUploadUrl({ userId, filename, contentType }) {
    const fileId = crypto.randomUUID();
    const storageKey = `media/${userId}/${fileId}_${filename}`;
    
    return {
      uploadUrl: `https://storage.instagram-cdn.internal/${storageKey}?signature=${crypto.randomBytes(16).toString('hex')}`,
      publicCdnUrl: `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1080&q=80`,
      storageKey,
      expiresInSeconds: 900 // 15 minutes
    };
  }

  /**
   * Ingest New Post
   */
  async createPost({ authorId, authorUsername, images, caption, location, isCelebrity = false }) {
    const postId = `post_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const timestamp = Date.now();

    const postRecord = {
      id: postId,
      authorId,
      authorUsername,
      images,
      caption,
      location,
      likesCount: 0,
      commentsCount: 0,
      isCelebrity,
      createdAt: timestamp
    };

    // 1. Save post metadata to primary store
    this.postsStore.set(postId, postRecord);

    // 2. Initialize Redis post counter
    await redis.setCounter(`post:${postId}:likes_count`, 0);

    // 3. Hybrid Fan-Out Routing
    if (isCelebrity) {
      // Fan-Out on Read: Do NOT push to millions of followers' lists (prevents write amplification)
      console.log(`[FanOut] Post ${postId} from celebrity @${authorUsername} flagged for Fan-Out on Read`);
    } else {
      // Fan-Out on Write: Push to active followers' Redis timeline caches
      const followers = this.followersGraph.get(authorUsername) || new Set();
      for (const followerId of followers) {
        await redis.lpush(`timeline:${followerId}`, postId);
      }
      console.log(`[FanOut] Post ${postId} pushed to ${followers.size} follower timelines in Redis`);
    }

    return postRecord;
  }

  async getPostById(postId) {
    const post = this.postsStore.get(postId);
    if (!post) return null;

    // Fetch real-time like count from Redis
    const liveLikes = await redis.getCounter(`post:${postId}:likes_count`);
    return {
      ...post,
      likesCount: liveLikes
    };
  }
}

export const postIngestionService = new PostIngestionService();
