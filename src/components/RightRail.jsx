import React, { useState } from 'react';
import { CURRENT_USER, SUGGESTED_USERS } from '../data/mockData';
import { CheckCircle2 } from 'lucide-react';

export default function RightRail() {
  const [suggestions, setSuggestions] = useState(SUGGESTED_USERS);

  const toggleFollow = (id) => {
    setSuggestions(prev => prev.map(user => {
      if (user.id === id) {
        return { ...user, isFollowing: !user.isFollowing };
      }
      return user;
    }));
  };

  return (
    <aside className="right-rail">
      {/* Current User Switcher */}
      <div className="current-user-card">
        <div className="current-user-avatar-wrap">
          <img src={CURRENT_USER.avatar} alt={CURRENT_USER.username} className="user-avatar" />
        </div>
        <div className="current-user-info">
          <div className="username-verified">
            <span className="username">{CURRENT_USER.username}</span>
            {CURRENT_USER.isVerified && <CheckCircle2 size={13} className="verified-badge" />}
          </div>
          <span className="user-fullname">{CURRENT_USER.name}</span>
        </div>
        <button className="switch-user-btn">Switch</button>
      </div>

      {/* Suggested for you header */}
      <div className="suggestions-header">
        <span className="suggestions-title">Suggested for you</span>
        <button className="see-all-btn">See All</button>
      </div>

      {/* Suggested list */}
      <div className="suggestions-list">
        {suggestions.map((user) => (
          <div key={user.id} className="suggested-item">
            <img src={user.avatar} alt={user.username} className="suggested-avatar" />
            <div className="suggested-info">
              <span className="suggested-username">{user.username}</span>
              <span className="suggested-relation">{user.relation}</span>
            </div>
            <button 
              className={`follow-btn ${user.isFollowing ? 'following' : ''}`}
              onClick={() => toggleFollow(user.id)}
            >
              {user.isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>

      {/* Scale Insights Card */}
      <div className="scale-architect-card">
        <div className="insight-badge">SYSTEM ARCHITECTURE</div>
        <h4>High-Throughput Partitioning</h4>
        <p>
          Each follower relationship is partitioned across ScyllaDB nodes using <code>HASH(user_id)</code> to achieve sub-millisecond graph traversals.
        </p>
      </div>

      {/* Footer copyright */}
      <footer className="rail-footer">
        <div className="footer-links">
          <a href="#about">About</a> • <a href="#help">Help</a> • <a href="#press">Press</a> • <a href="#api">API</a> • <a href="#jobs">Jobs</a> • <a href="#privacy">Privacy</a> • <a href="#terms">Terms</a>
        </div>
        <div className="footer-copy">
          © 2026 INSTAGRAM CLONE POWERED BY DISTRIBUTED HYBRID FAN-OUT
        </div>
      </footer>
    </aside>
  );
}
