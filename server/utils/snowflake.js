/**
 * 64-Bit Distributed Snowflake ID Generator (Instagram Algorithm)
 * 
 * Bit Allocation (Total: 64 bits):
 * - 41 bits: Epoch timestamp in milliseconds (~69 years of IDs)
 * - 13 bits: Logical Shard ID (supports up to 8,192 database shards)
 * - 10 bits: Auto-increment sequence number (supports up to 1,024 IDs per shard per millisecond)
 * 
 * Key Advantages over UUIDv4:
 * 1. Monotonically increasing: Natural chronological ordering (ORDER BY id DESC is index-friendly)
 * 2. 64-bit integer fits directly into PostgreSQL BIGINT (8 bytes vs 16 bytes for UUID)
 * 3. Decentralized: Zero network round-trips or locks needed to generate an ID
 */

class SnowflakeIdGenerator {
  constructor(shardId = 1) {
    // Custom epoch: 2026-01-01T00:00:00Z
    this.customEpoch = 1767225600000n;
    this.shardId = BigInt(shardId & 0x1fff); // 13 bits max (0 to 8191)
    this.sequence = 0n;
    this.lastTimestamp = -1n;

    // Bit shift offsets
    this.sequenceBits = 10n;
    this.shardBits = 13n;
    
    this.maxSequence = (1n << this.sequenceBits) - 1n; // 1023
    this.shardShift = this.sequenceBits;               // 10
    this.timestampShift = this.sequenceBits + this.shardBits; // 23
  }

  /**
   * Generate next 64-bit unique ID as a BigInt string
   */
  nextId() {
    let now = BigInt(Date.now());

    if (now < this.lastTimestamp) {
      throw new Error(`Clock moved backwards! Refusing to generate ID for ${this.lastTimestamp - now}ms`);
    }

    if (now === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & this.maxSequence;
      if (this.sequence === 0n) {
        // Sequence exhausted for this millisecond: wait for next millisecond
        while (now <= this.lastTimestamp) {
          now = BigInt(Date.now());
        }
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = now;

    // Construct 64-bit ID
    const timeDelta = now - this.customEpoch;
    const id = (timeDelta << this.timestampShift) | 
               (this.shardId << this.shardShift) | 
               this.sequence;

    return id.toString();
  }

  /**
   * Deconstruct a Snowflake ID back into its constituent parts
   */
  decompose(snowflakeIdStr) {
    const id = BigInt(snowflakeIdStr);
    const sequence = id & this.maxSequence;
    const shardId = (id >> this.shardShift) & ((1n << this.shardBits) - 1n);
    const timeDelta = id >> this.timestampShift;
    const timestampMs = Number(timeDelta + this.customEpoch);

    return {
      id: snowflakeIdStr,
      timestamp: new Date(timestampMs).toISOString(),
      timestampMs,
      shardId: Number(shardId),
      sequence: Number(sequence)
    };
  }
}

// Export singleton configured with Shard #1
export const snowflake = new SnowflakeIdGenerator(1);
export { SnowflakeIdGenerator };
