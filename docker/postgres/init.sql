-- ====================================================================
-- INSTAGRAM SCALE DATABASE SCHEMA (PostgreSQL 16)
-- Designed for high read/write ratios, partitioning, and batched sync
-- ====================================================================

-- Snowflake Sequence for 10-bit counter
CREATE SEQUENCE IF NOT EXISTS global_id_sequence;

-- Instagram 64-bit Snowflake ID Generator in PL/pgSQL
CREATE OR REPLACE FUNCTION next_id(shard_id INT DEFAULT 1)
RETURNS BIGINT AS $$
DECLARE
    our_epoch BIGINT := 1767225600000; -- 2026-01-01
    seq_id BIGINT;
    now_millis BIGINT;
    result BIGINT := 0;
BEGIN
    SELECT nextval('global_id_sequence') % 1024 INTO seq_id;
    SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;
    result := (now_millis - our_epoch) << 23;
    result := result | ((shard_id % 8192) << 10);
    result := result | (seq_id);
    RETURN result;
END;
$$ LANGUAGE plpgsql;


-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_celebrity BOOLEAN DEFAULT FALSE, -- Flag for Fan-out on Read (>20k followers)
    followers_count BIGINT DEFAULT 0,
    following_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 2. Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(64) PRIMARY KEY,
    author_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    caption TEXT,
    location VARCHAR(120),
    likes_count BIGINT DEFAULT 0,       -- Periodically synchronized from Redis/Kafka
    comments_count BIGINT DEFAULT 0,
    shares_count BIGINT DEFAULT 0,
    is_celebrity_post BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fast timeline index for user post lookups
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- 3. Post Media Table (Multiple photos / video reels per post)
CREATE TABLE IF NOT EXISTS post_media (
    id VARCHAR(64) PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) DEFAULT 'image', -- 'image' or 'video'
    display_order INT DEFAULT 0,
    aspect_ratio VARCHAR(10) DEFAULT '1:1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON post_media(post_id, display_order);

-- 4. Follower Graph Table
CREATE TABLE IF NOT EXISTS follows (
    follower_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- 5. Post Likes Table (Permanent Storage Tier)
-- Populated asynchronously via Kafka batched write-back flusher
CREATE TABLE IF NOT EXISTS post_likes (
    post_id VARCHAR(64) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- 6. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(64) PRIMARY KEY,
    post_id VARCHAR(64) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at DESC);

-- ====================================================================
-- SEED INITIAL DATA FOR LOCAL VERIFICATION
-- ====================================================================
INSERT INTO users (id, username, full_name, email, avatar_url, is_verified, is_celebrity, followers_count)
VALUES 
    ('usr_me', 'alex_codes', 'Alex Rivera', 'alex@instagram.scale', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', TRUE, FALSE, 14200),
    ('usr_nasa', 'nasa', 'NASA', 'contact@nasa.gov', 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=200&q=80', TRUE, TRUE, 89000000),
    ('usr_scale', 'scale_engineering', 'Scale Engineering', 'eng@scale.lab', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80', TRUE, FALSE, 84200)
ON CONFLICT (id) DO NOTHING;

INSERT INTO posts (id, author_id, caption, location, likes_count, comments_count, is_celebrity_post)
VALUES 
    ('post_viral_01', 'usr_nasa', 'Cosmic nursery in the Carina Nebula captured in infrared light. 🌌✨ #space #webbtelescope', 'Deep Space • James Webb Telescope', 1482930, 28410, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO post_media (id, post_id, media_url, media_type, display_order)
VALUES 
    ('med_01', 'post_viral_01', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1080&q=80', 'image', 0),
    ('med_02', 'post_viral_01', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1080&q=80', 'image', 1)
ON CONFLICT (id) DO NOTHING;
