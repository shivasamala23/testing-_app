import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function StoriesTray({ stories, onSelectStory }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="stories-container">
      <button 
        className="story-scroll-btn left" 
        onClick={() => scroll('left')}
        aria-label="Scroll stories left"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="stories-tray" ref={scrollRef}>
        {stories.map((story, index) => {
          return (
            <div 
              key={story.id} 
              className="story-item"
              onClick={() => onSelectStory(story, index)}
            >
              <div className={`story-ring ${story.hasUnseen ? 'unseen' : 'seen'} ${story.isOwner ? 'owner' : ''}`}>
                <div className="story-avatar-wrap">
                  <img src={story.avatar} alt={story.username} className="story-avatar" />
                  {story.isOwner && (
                    <span className="story-add-badge">
                      <Plus size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </div>
              <span className="story-username">{story.username}</span>
            </div>
          );
        })}
      </div>

      <button 
        className="story-scroll-btn right" 
        onClick={() => scroll('right')}
        aria-label="Scroll stories right"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
