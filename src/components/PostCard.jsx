import React, { useState, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Smile,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PostCard({ 
  post, 
  onLikeToggle, 
  onOpenComments, 
  onAddComment,
  onRecordTelemetryEvent 
}) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const lastTapRef = useRef(0);

  // Format large numbers cleanly (e.g. 1,482,930 -> 1.4M or full formatted)
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Double tap handler
  const handleImageTap = (e) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      triggerLikeEffect();
    }
    lastTapRef.current = now;
  };

  const triggerLikeEffect = () => {
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 900);

    // If not liked already, toggle it
    if (!post.isLiked) {
      onLikeToggle(post.id);
    }

    if (onRecordTelemetryEvent) {
      onRecordTelemetryEvent({
        type: 'DOUBLE_TAP_LIKE',
        postId: post.id,
        latencyMs: Math.floor(Math.random() * 5 + 3), // 3-8ms Redis latency
        cacheHit: true
      });
    }

    // Mini confetti burst
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ff3040', '#f09433', '#dc2743', '#bc1888'],
      ticks: 70
    });
  };

  const handleLikeBtnClick = () => {
    onLikeToggle(post.id);
    if (!post.isLiked && onRecordTelemetryEvent) {
      onRecordTelemetryEvent({
        type: 'API_LIKE_INCREMENT',
        postId: post.id,
        latencyMs: Math.floor(Math.random() * 4 + 2),
        cacheHit: true
      });
    }
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (currentImageIdx < post.images.length - 1) {
      setCurrentImageIdx(prev => prev + 1);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (currentImageIdx > 0) {
      setCurrentImageIdx(prev => prev - 1);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  // Highlight hashtags and mentions in captions
  const formatCaption = (text) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.startsWith('#') || part.startsWith('@')) {
        return <span key={i} className="hashtag">{part}</span>;
      }
      return part;
    });
  };

  return (
    <article className="post-card">
      {/* Post Header */}
      <header className="post-header">
        <div className="post-author-group">
          <div className="author-avatar-wrap">
            <img src={post.user.avatar} alt={post.user.username} className="author-avatar" />
          </div>
          <div className="author-details">
            <div className="author-name-row">
              <span className="author-username">{post.user.username}</span>
              {post.user.isVerified && (
                <CheckCircle2 size={14} className="verified-badge" />
              )}
              <span className="post-bullet">•</span>
              <span className="post-time">{post.timeAgo}</span>
            </div>
            {post.user.location && (
              <span className="post-location">{post.user.location}</span>
            )}
          </div>
        </div>

        <div className="header-right-meta">
          {post.isCelebrity ? (
            <span className="routing-badge celebrity" title="Fan-out on Read: Pulled on demand to prevent millions of simultaneous writes">
              Fan-out on Read
            </span>
          ) : (
            <span className="routing-badge standard" title="Fan-out on Write: Pushed into active followers timeline cache in Redis">
              Fan-out on Write
            </span>
          )}
          <button className="post-options-btn" aria-label="More options">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      {/* Post Media Carousel / Double Tap Container */}
      <div 
        className="post-media-stage"
        onClick={handleImageTap}
        onDoubleClick={triggerLikeEffect}
      >
        <img 
          src={post.images[currentImageIdx]} 
          alt={`Post by ${post.user.username}`} 
          className="post-image"
          loading="lazy"
        />

        {/* Double-tap bursting heart */}
        {showHeartPop && (
          <div className="burst-heart-wrapper">
            <Heart size={100} fill="#ffffff" color="#ffffff" className="burst-heart-icon" />
          </div>
        )}

        {/* Carousel arrows */}
        {post.images.length > 1 && currentImageIdx > 0 && (
          <button className="carousel-nav-btn prev" onClick={handlePrevImage} aria-label="Previous image">
            <ChevronLeft size={20} />
          </button>
        )}
        {post.images.length > 1 && currentImageIdx < post.images.length - 1 && (
          <button className="carousel-nav-btn next" onClick={handleNextImage} aria-label="Next image">
            <ChevronRight size={20} />
          </button>
        )}

        {/* Image index badges */}
        {post.images.length > 1 && (
          <div className="carousel-indicator-pill">
            {currentImageIdx + 1}/{post.images.length}
          </div>
        )}
      </div>

      {/* Carousel dots pagination */}
      {post.images.length > 1 && (
        <div className="carousel-dots-row">
          {post.images.map((_, idx) => (
            <span 
              key={idx} 
              className={`dot ${idx === currentImageIdx ? 'active' : ''}`}
            />
          ))}
        </div>
      )}

      {/* Post Action Bar */}
      <div className="post-actions-bar">
        <div className="actions-left">
          <button 
            className={`action-btn heart-btn ${post.isLiked ? 'active' : ''}`}
            onClick={handleLikeBtnClick}
            aria-label="Like post"
          >
            <Heart 
              size={26} 
              fill={post.isLiked ? "var(--like-red)" : "none"} 
              color={post.isLiked ? "var(--like-red)" : "currentColor"} 
              className={post.isLiked ? "heart-liked-anim" : ""}
            />
          </button>

          <button 
            className="action-btn comment-btn"
            onClick={() => onOpenComments(post)}
            aria-label="Open comments"
          >
            <MessageCircle size={25} />
          </button>

          <button 
            className="action-btn share-btn"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert("Post link copied to clipboard!");
            }}
            aria-label="Share post"
          >
            <Send size={24} />
          </button>
        </div>

        <div className="actions-right">
          <button 
            className={`action-btn save-btn ${isSaved ? 'active' : ''}`}
            onClick={() => setIsSaved(!isSaved)}
            aria-label="Bookmark post"
          >
            <Bookmark 
              size={25} 
              fill={isSaved ? "var(--text-primary)" : "none"}
            />
          </button>
        </div>
      </div>

      {/* Likes Count Row with Live Pulse */}
      <div className="post-metrics-row">
        <span className="likes-tally-number">
          {formatNumber(post.likesCount)} likes
        </span>
        {post.likesCount > 100000 && (
          <span className="trending-pill" title="High throughput topic">
            <Zap size={12} /> Viral Hotspot
          </span>
        )}
      </div>

      {/* Caption & Read More */}
      <div className="post-caption-section">
        <p className={`caption-text ${!isExpanded ? 'truncated' : ''}`}>
          <span className="caption-username">{post.user.username}</span>
          {' '}
          {formatCaption(post.caption)}
        </p>
        {post.caption.length > 90 && !isExpanded && (
          <button 
            className="expand-caption-btn"
            onClick={() => setIsExpanded(true)}
          >
            more
          </button>
        )}
      </div>

      {/* Comments Preview */}
      {post.commentsCount > 0 && (
        <button 
          className="view-all-comments-btn"
          onClick={() => onOpenComments(post)}
        >
          View all {formatNumber(post.commentsCount)} comments
        </button>
      )}

      {/* Last comments preview */}
      {post.comments && post.comments.slice(0, 2).map((c) => (
        <div key={c.id} className="preview-comment-row">
          <span className="comment-author">{c.user}</span>
          <span className="comment-body">{c.text}</span>
          <Heart size={12} className="comment-mini-heart" />
        </div>
      ))}

      {/* Inline Quick Comment Input */}
      <form className="inline-comment-box" onSubmit={handleCommentSubmit}>
        <button type="button" className="emoji-trigger-btn" aria-label="Insert emoji">
          <Smile size={20} />
        </button>
        <input 
          type="text" 
          placeholder="Add a comment..."
          className="inline-comment-input"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        {commentText.trim() && (
          <button type="submit" className="inline-comment-post-btn">
            Post
          </button>
        )}
      </form>
    </article>
  );
}
