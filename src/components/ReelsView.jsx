import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, Music, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import { REELS_DATA } from '../data/mockData';

export default function ReelsView({ onOpenComments }) {
  const [reels, setReels] = useState(REELS_DATA);
  const [isMuted, setIsMuted] = useState(true);

  const toggleReelLike = (id) => {
    setReels(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          isLiked: !r.isLiked,
          likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1
        };
      }
      return r;
    }));
  };

  return (
    <div className="reels-container">
      {reels.map((reel) => (
        <div key={reel.id} className="reel-card">
          <div className="reel-video-wrapper">
            <video 
              src={reel.videoUrl} 
              poster={reel.poster}
              autoPlay 
              loop 
              muted={isMuted} 
              playsInline
              className="reel-video-element"
            />

            <button 
              className="reel-mute-btn" 
              onClick={() => setIsMuted(!isMuted)}
              aria-label="Toggle mute"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Bottom info overlay */}
            <div className="reel-info-overlay">
              <div className="reel-author-row">
                <img src={reel.user.avatar} alt={reel.user.username} className="reel-avatar" />
                <span className="reel-username">{reel.user.username}</span>
                {reel.user.isVerified && <CheckCircle2 size={14} className="verified-badge" />}
                <button className="reel-follow-btn">Follow</button>
              </div>

              <p className="reel-caption">{reel.caption}</p>

              <div className="reel-audio-track">
                <Music size={14} className="music-icon" />
                <span className="audio-marquee">{reel.audioTitle}</span>
              </div>
            </div>
          </div>

          {/* Side action column */}
          <div className="reel-actions-column">
            <button 
              className={`reel-action-btn ${reel.isLiked ? 'liked' : ''}`}
              onClick={() => toggleReelLike(reel.id)}
            >
              <Heart 
                size={28} 
                fill={reel.isLiked ? "var(--like-red)" : "none"} 
                color={reel.isLiked ? "var(--like-red)" : "currentColor"} 
              />
              <span>{reel.likesCount.toLocaleString()}</span>
            </button>

            <button 
              className="reel-action-btn"
              onClick={() => onOpenComments({ ...reel, images: [reel.poster] })}
            >
              <MessageCircle size={28} />
              <span>{reel.commentsCount.toLocaleString()}</span>
            </button>

            <button className="reel-action-btn">
              <Send size={26} />
            </button>

            <button className="reel-action-btn">
              <Bookmark size={26} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
