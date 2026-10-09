# Instagram Scale Infrastructure • Docker Guide

This infrastructure mirrors the distributed production architecture of Instagram, handling millions of read/write requests, high-throughput media ingestion, and micro-batched event synchronization.

---

## 1. Services & Ports Map

| Service | Port | Description | Web Dashboard |
| :--- | :--- | :--- | :--- |
| **Vite Frontend Client** | `5173` | React Feed, Double-tap Likes, Telemetry Lab | `http://localhost:5173` |
| **Fastify Ingestion API** | `4000` | Sub-millisecond Likes, Fan-Out, Pre-signed URLs | `http://localhost:4000/api/health` |
| **PostgreSQL 16** | `5432` | Relational Store (Users, Graph, Posts, Comments) | Connect via DBeaver / TablePlus |
| **Redis 7 Cluster** | `6379` | In-Memory Timeline Cache & Atomic Like Sets | CLI / Redis Commander |
| **Redis Commander** | `8081` | Web GUI to view Redis Keys, Sets, and Timelines | `http://localhost:8081` |
| **Redpanda (Kafka)** | `9092` | Raft-native distributed event broker | API on port 9092 |
| **Redpanda Console** | `8080` | Kafka UI to view live topics, consumer lag, and messages | `http://localhost:8080` |
| **MinIO Object Store** | `9000` | S3-compatible storage for Photos and Video Reels | `http://localhost:9000` |
| **MinIO Web Console** | `9001` | S3 Bucket UI (credentials in `.env`) | `http://localhost:9001` |

---

## 2. Quick Start Commands

### Start All Services
```bash
docker compose up -d
```

### View Status & Health
```bash
docker compose ps
```

### View Live Ingestion Logs
```bash
docker compose logs -f app-server
```

### Stop All Services
```bash
docker compose down
```

---

## 3. Database Schema & Seed Data
On container startup, `docker/postgres/init.sql` automatically initializes:
- `users` (with `is_celebrity` flag for Hybrid Fan-Out)
- `posts` (with descending timestamp indexes)
- `post_media` (multi-image carousel & video support)
- `follows` (composite key graph structure)
- `post_likes` (permanent database tier updated via Kafka micro-batches)
- `comments`

---

## 4. Why This Architecture Scales to Millions of Users

1. **Write Absorption via Redis**: Incoming likes are processed in-memory via Redis sets (`SADD`) and counters (`INCR`) in $< 1\text{ms}$, preventing row-lock contention on PostgreSQL.
2. **Kafka Micro-Batching**: 5,000 viral likes in a burst are consolidated into a single SQL update every 500ms, eliminating 99.8% of database disk IOPS.
3. **Hybrid Fan-Out**: Standard accounts push posts to follower timelines on write, while celebrity accounts (e.g. NASA) are dynamically merged on read, avoiding multi-million follower write amplification.
4. **Direct-to-S3 Uploads**: Photos and videos never transit through backend app servers; clients upload directly to MinIO/S3 using pre-signed tokens.
