import Fastify from 'fastify';
import cors from '@fastify/cors';
import { redis } from './storage/redisAdapter.js';
import { kafkaBuffer } from './queue/kafkaBuffer.js';
import { postIngestionService } from './services/postIngestionService.js';
import { feedService } from './services/feedService.js';

const app = Fastify({
  logger: false, // minimize overhead for maximum QPS
  keepAliveTimeout: 30000
});

// Register CORS for frontend client communication
await app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS']
});

// Seed Initial Feed Data into Ingestion Service & Redis
async function seedInitialData() {
  // 1. Viral Post by NASA (Celebrity)
  await postIngestionService.createPost({
    authorId: 'usr_nasa',
    authorUsername: 'nasa',
    images: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1080&q=80'
    ],
    caption: 'Cosmic nursery in the Carina Nebula captured in infrared light. 7,500 light-years from Earth. 🌌✨ #space #webbtelescope',
    location: 'Deep Space • James Webb Telescope',
    isCelebrity: true
  });
  // Seed initial like count for the viral post
  await redis.setCounter('post:post_viral_01:likes_count', 1482930);

  // 2. Standard Post by Scale Engineering
  const devPost = await postIngestionService.createPost({
    authorId: 'usr_scale',
    authorUsername: 'scale_engineering',
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1080&q=80'
    ],
    caption: 'Benchmarked our new Redis + Kafka write-back buffer against 1,000,000 requests/sec. Latency remained < 8ms under p99. 🚀⚡ #distributed #systemdesign',
    location: 'Silicon Valley, CA',
    isCelebrity: false
  });
  await redis.setCounter(`post:${devPost.id}:likes_count`, 84920);

  // 3. Standard Post by Tokyo Vibes
  const tokyoPost = await postIngestionService.createPost({
    authorId: 'usr_tokyo',
    authorUsername: 'tokyo_vibes',
    images: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1080&q=80'
    ],
    caption: 'Late night ramen runs in the neon rain. Shinjuku never sleeps. 🍜🌧️ #tokyo #japan',
    location: 'Shinjuku, Tokyo, Japan',
    isCelebrity: false
  });
  await redis.setCounter(`post:${tokyoPost.id}:likes_count`, 31240);
}

await seedInitialData();

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check
app.get('/api/health', async () => {
  return { status: 'healthy', timestamp: Date.now(), service: 'instagram-ingestion-service' };
});

// 2. Pre-signed S3 Upload URL Generator
app.post('/api/upload/presign', async (request, reply) => {
  const { userId = 'usr_me', filename = 'photo.jpg', contentType = 'image/jpeg' } = request.body || {};
  const presignData = postIngestionService.generatePreSignedUploadUrl({ userId, filename, contentType });
  return presignData;
});

// 3. Post Ingestion
app.post('/api/posts', async (request, reply) => {
  const { authorId = 'usr_me', authorUsername = 'alex_codes', images, caption, location, isCelebrity } = request.body || {};

  if (!images || !Array.isArray(images) || images.length === 0) {
    reply.status(400).send({ error: 'Images array is required' });
    return;
  }

  const post = await postIngestionService.createPost({
    authorId,
    authorUsername,
    images,
    caption: caption || '',
    location: location || '',
    isCelebrity: Boolean(isCelebrity)
  });

  reply.status(201).send(post);
});

// 4. High-Throughput Atomic Like Ingestion
app.post('/api/posts/:id/like', async (request, reply) => {
  const { id: postId } = request.params;
  const { userId = 'usr_me' } = request.body || {};
  const startTime = process.hrtime.bigint();

  // Step A: Atomic Set Addition in Redis O(1)
  const isNewLike = await redis.sadd(`post:${postId}:likes`, userId);

  let updatedLikesCount;
  if (isNewLike) {
    // Step B: Atomic In-Memory Counter Increment
    updatedLikesCount = await redis.incr(`post:${postId}:likes_count`);

    // Step C: Produce Event to Asynchronous Kafka Queue
    await kafkaBuffer.produceLikeEvent({
      postId,
      userId,
      action: 'LIKE'
    });
  } else {
    // Already liked (idempotent response)
    updatedLikesCount = await redis.getCounter(`post:${postId}:likes_count`);
  }

  const endTime = process.hrtime.bigint();
  const latencyMicros = Number(endTime - startTime) / 1000;

  return {
    postId,
    userId,
    isLiked: true,
    likesCount: updatedLikesCount,
    latencyMs: Number((latencyMicros / 1000).toFixed(3)),
    bufferedInKafka: Boolean(isNewLike),
    storageTier: 'Redis-L1-Cache'
  };
});

// 5. Unlike Ingestion
app.delete('/api/posts/:id/like', async (request, reply) => {
  const { id: postId } = request.params;
  const { userId = 'usr_me' } = request.body || {};

  const wasRemoved = await redis.srem(`post:${postId}:likes`, userId);
  let updatedLikesCount;

  if (wasRemoved) {
    updatedLikesCount = await redis.decr(`post:${postId}:likes_count`);
    await kafkaBuffer.produceLikeEvent({
      postId,
      userId,
      action: 'UNLIKE'
    });
  } else {
    updatedLikesCount = await redis.getCounter(`post:${postId}:likes_count`);
  }

  return {
    postId,
    userId,
    isLiked: false,
    likesCount: updatedLikesCount
  };
});

// 6. News Feed Retrieval
app.get('/api/feed', async (request, reply) => {
  const { userId = 'usr_me', page = 0, limit = 15 } = request.query || {};
  const feed = await feedService.getUserFeed(userId, Number(page), Number(limit));
  return feed;
});

// 7. Real-Time Telemetry & Scaled Metrics
app.get('/api/metrics', async () => {
  const queueStats = kafkaBuffer.getMetrics();
  const cacheHitRate = redis.getHitRate();

  return {
    service: 'Ingestion-Gateway',
    uptimeSeconds: Math.floor(process.uptime()),
    redisHitRatio: cacheHitRate,
    kafkaQueueDepth: queueStats.currentQueueDepth,
    totalEventsBuffered: queueStats.totalEventsProduced,
    totalBatchesFlushed: queueStats.totalBatchesFlushed,
    dbDiskWritesSaved: queueStats.totalDbWritesSaved,
    architecture: {
      readStrategy: 'Hybrid Fan-Out (Push on write for users, Pull on read for celebrities)',
      writeStrategy: 'In-Memory Atomic Redis Cache + 500ms Kafka Write-Back Micro-Batching'
    }
  };
});

// 8. Load-Test Burst Simulator Endpoint
app.post('/api/loadtest/burst', async (request) => {
  const { count = 5000, postId = 'post_viral_01' } = request.body || {};
  const startTime = Date.now();

  for (let i = 0; i < count; i++) {
    const dummyUser = `sim_user_${Math.floor(Math.random() * 1000000)}`;
    await redis.sadd(`post:${postId}:likes`, dummyUser);
    await redis.incr(`post:${postId}:likes_count`);
    await kafkaBuffer.produceLikeEvent({
      postId,
      userId: dummyUser,
      action: 'LIKE'
    });
  }

  const durationMs = Date.now() - startTime;
  const throughputQps = Math.round((count / (durationMs || 1)) * 1000);

  return {
    simulatedLikes: count,
    durationMs,
    throughputQps,
    status: 'Absorbed in Redis & Buffered in Kafka'
  };
});

// Start Server on Port 4000
const PORT = 4000;
try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🚀 [Ingestion Service] Live on http://localhost:${PORT}`);
} catch (err) {
  console.error('Error starting Fastify server:', err);
  process.exit(1);
}
