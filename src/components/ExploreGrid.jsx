import React from 'react';
import { Heart, MessageCircle, Copy } from 'lucide-react';
import { EXPLORE_GRID } from '../data/mockData';

export default function ExploreGrid({ onSelectPost }) {
  return (
    <div className="explore-container">
      <div className="explore-grid">
        {EXPLORE_GRID.map((item) => (
          <div 
            key={item.id} 
            className={`explore-item ${item.isWide ? 'wide' : ''}`}
            onClick={() => onSelectPost?.(item)}
          >
            <img src={item.img} alt="Explore content" className="explore-img" loading="lazy" />
            
            {item.isWide && (
              <div className="carousel-badge">
                <Copy size={16} />
              </div>
            )}

            <div className="explore-hover-overlay">
              <div className="hover-stat">
                <Heart size={20} fill="#ffffff" color="#ffffff" />
                <span>{item.likes}</span>
              </div>
              <div className="hover-stat">
                <MessageCircle size={20} fill="#ffffff" color="#ffffff" />
                <span>{item.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
