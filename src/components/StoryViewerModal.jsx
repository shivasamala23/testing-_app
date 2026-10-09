import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

export default function StoryViewerModal({ story, stories, onClose, onSelectStory }) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [replyText, setReplyText] = useState('');
  const duration = 5000; // 5 seconds per story
  const currentIndex = stories.findIndex(s => s.id === story.id);

  useEffect(() => {
    setProgress(0);
  }, [story.id]);

  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // update every 50ms
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          goToNext();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [story.id, isPaused, currentIndex]);

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      onSelectStory(stories[currentIndex + 1], currentIndex + 1);
    } else {
      onClose();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      onSelectStory(stories[currentIndex - 1], currentIndex - 1);
    }
  };

  return (
    <div className="story-modal-overlay" onClick={onClose}>
      <button className="story-close-btn" onClick={onClose}>
        <X size={28} />
      </button>

      <div className="story-viewer-card" onClick={(e) => e.stopPropagation()}>
        {/* Progress Bar */}
        <div className="story-progress-bar-wrap">
          {stories.map((s, idx) => {
            let fill = 0;
            if (idx < currentIndex) fill = 100;
            else if (idx === currentIndex) fill = progress;
            return (
              <div key={s.id} className="story-progress-track">
                <div className="story-progress-fill" style={{ width: `${fill}%` }} />
              </div>
            );
          })}
        </div>

        {/* Story Header */}
        <div className="story-header">
          <div className="story-author-info">
            <img src={story.avatar} alt={story.username} className="story-author-avatar" />
            <span className="story-author-name">{story.username}</span>
            <span className="story-author-time">{story.time}</span>
          </div>

          <button 
            className="story-pause-btn"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>

        {/* Media content */}
        <div 
          className="story-media-container"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <img src={story.media} alt="Story" className="story-media-img" />

          {/* Nav tap areas */}
          <div className="story-tap-area left" onClick={goToPrev} />
          <div className="story-tap-area right" onClick={goToNext} />
        </div>

        {/* Navigation arrows for desktop */}
        {currentIndex > 0 && (
          <button className="story-arrow-btn left" onClick={goToPrev}>
            <ChevronLeft size={24} />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button className="story-arrow-btn right" onClick={goToNext}>
            <ChevronRight size={24} />
          </button>
        )}

        {/* Story Footer / Reply */}
        <div className="story-footer">
          <input 
            type="text" 
            placeholder={`Reply to ${story.username}...`}
            className="story-reply-input"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && replyText.trim()) {
                alert(`Sent reply to ${story.username}: "${replyText}"`);
                setReplyText('');
              }
            }}
          />
          <button 
            className={`story-like-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart size={24} fill={isLiked ? "#ff3040" : "none"} color={isLiked ? "#ff3040" : "#ffffff"} />
          </button>
          <button className="story-send-btn">
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
