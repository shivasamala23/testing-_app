/**
 * Asynchronous Message Broker & Batched Write-Back Buffer
 * Simulates Apache Kafka / Redpanda partitioned topics with consumer micro-batching.
 * Converts thousands of high-concurrency writes into consolidated bulk DB updates.
 */

class KafkaWriteBackBuffer {
  constructor() {
    this.buffer = [];
    this.batchIntervalMs = 500; // Flush micro-batches every 500ms
    this.batchThreshold = 1000;  // Or when 1,000 items are queued
    this.timer = null;

    // Metrics for observability
    this.metrics = {
      totalEventsProduced: 0,
      totalBatchesFlushed: 0,
      totalDbWritesSaved: 0, // Number of individual DB writes avoided
      currentQueueDepth: 0
    };

    // Simulated persistent relational database (PostgreSQL mock)
    this.dbPostLikes = new Map();

    this.startConsumerLoop();
  }

  /**
   * Produce an event to the 'post-likes' topic
   */
  async produceLikeEvent(event) {
    this.buffer.push({
      ...event,
      enqueuedAt: Date.now()
    });
    this.metrics.totalEventsProduced++;
    this.metrics.currentQueueDepth = this.buffer.length;

    // Flush immediately if buffer reaches threshold
    if (this.buffer.length >= this.batchThreshold) {
      this.flushBatch();
    }
  }

  /**
   * Start consumer polling loop
   */
  startConsumerLoop() {
    this.timer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flushBatch();
      }
    }, this.batchIntervalMs);
  }

  /**
   * Micro-batch flush: Aggregates queued events and applies bulk updates
   */
  flushBatch() {
    if (this.buffer.length === 0) return;

    const eventsToProcess = [...this.buffer];
    this.buffer = [];
    this.metrics.currentQueueDepth = 0;

    // 1. Group likes by post_id
    const aggregatedDeltas = new Map(); // postId -> net count delta (+1 / -1)

    for (const event of eventsToProcess) {
      const delta = event.action === 'LIKE' ? 1 : -1;
      const current = aggregatedDeltas.get(event.postId) || 0;
      aggregatedDeltas.set(event.postId, current + delta);
    }

    // 2. Perform consolidated batch update (Simulating 1 SQL bulk query)
    // SQL equivalent:
    // UPDATE posts SET likes_count = likes_count + delta WHERE id IN (...)
    for (const [postId, delta] of aggregatedDeltas.entries()) {
      const current = this.dbPostLikes.get(postId) || 0;
      this.dbPostLikes.set(postId, Math.max(0, current + delta));
    }

    this.metrics.totalBatchesFlushed++;
    // The difference between raw events and the number of post rows updated represents DB writes saved
    this.metrics.totalDbWritesSaved += (eventsToProcess.length - aggregatedDeltas.size);

    return {
      processedEvents: eventsToProcess.length,
      distinctPostsUpdated: aggregatedDeltas.size
    };
  }

  getMetrics() {
    return {
      ...this.metrics,
      currentQueueDepth: this.buffer.length
    };
  }
}

export const kafkaBuffer = new KafkaWriteBackBuffer();
