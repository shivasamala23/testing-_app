import React, { useState } from 'react';
import { X, Heart, Smile, Send, CheckCircle2 } from 'lucide-react';
import { CURRENT_USER } from '../data/mockData';

export default function CommentsModal({ post, isOpen, onClose, onAddComment }) {
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState(post?.comments || []);

  if (!isOpen || !post) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: `comm_${Date.now()}`,
      user: CURRENT_USER.username,
      text: commentInput.trim(),
      time: 'Just now',
      isLiked: false,
      likes: 0
    };

    setCommentsList([newComment, ...commentsList]);
    onAddComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  const toggleCommentLike = (commentId) => {
    setCommentsList(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          isLiked: !c.isLiked,
          likes: c.isLiked ? (c.likes || 1) - 1 : (c.likes || 0) + 1
        };
      }
      return c;
    }));
  };

  return (
    <div className="comments-modal-overlay" onClick={onClose}>
      <button className="comments-modal-close" onClick={onClose} aria-label="Close comments">
        <X size={26} />
      </button>

      <div className="comments-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="comments-card-media">
          <img src={post.images[0]} alt="Post media" className="comments-media-img" />
        </div>

        <div className="comments-card-content">
          {/* Post author header */}
          <div className="comments-author-header">
            <img src={post.user.avatar} alt={post.user.username} className="author-avatar" />
            <div className="author-info">
              <span className="author-username">{post.user.username}</span>
              {post.user.isVerified && <CheckCircle2 size={13} className="verified-badge" />}
            </div>
          </div>

          {/* Comments scroll container */}
          <div className="comments-scroll-tray">
            {/* Caption as first comment */}
            <div className="comment-item caption-item">
              <img src={post.user.avatar} alt={post.user.username} className="comment-avatar" />
              <div className="comment-content-wrap">
                <span className="comment-username">{post.user.username}</span>
                <span className="comment-text">{post.caption}</span>
                <div className="comment-meta">
                  <span>{post.timeAgo}</span>
                </div>
              </div>
            </div>

            {/* List of comments */}
            {commentsList.map((c) => (
              <div key={c.id} className="comment-item">
                <img 
                  src={`https://images.unsplash.com/photo-${1530000000000 + (c.id.charCodeAt(0) * 1000)}?auto=format&fit=crop&w=100&q=80`} 
                  onError={(e) => { e.target.src = CURRENT_USER.avatar; }}
                  alt={c.user} 
                  className="comment-avatar" 
                />
                <div className="comment-content-wrap">
                  <div className="comment-line">
                    <span className="comment-username">{c.user}</span>
                    <span className="comment-text">{c.text}</span>
                  </div>
                  <div className="comment-meta">
                    <span>{c.time}</span>
                    {c.likes > 0 && <span>{c.likes} likes</span>}
                    <button className="reply-btn">Reply</button>
                  </div>
                </div>

                <button 
                  className={`comment-like-btn ${c.isLiked ? 'liked' : ''}`}
                  onClick={() => toggleCommentLike(c.id)}
                  aria-label="Like comment"
                >
                  <Heart 
                    size={14} 
                    fill={c.isLiked ? "var(--like-red)" : "none"} 
                    color={c.isLiked ? "var(--like-red)" : "var(--text-muted)"} 
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Add comment bar */}
          <form className="comments-add-bar" onSubmit={handleSubmit}>
            <button type="button" className="emoji-btn" aria-label="Emoji">
              <Smile size={20} />
            </button>
            <input 
              type="text" 
              placeholder="Add a comment..."
              className="comments-input"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <button 
              type="submit" 
              className={`comments-post-btn ${commentInput.trim() ? 'active' : ''}`}
              disabled={!commentInput.trim()}
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
