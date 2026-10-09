import React from 'react';
import { 
  Home, 
  Search, 
  Compass, 
  Film, 
  MessageCircle, 
  Heart, 
  PlusSquare, 
  User, 
  Activity, 
  Sun, 
  Moon, 
  Menu
} from 'lucide-react';
import { CURRENT_USER } from '../data/mockData';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  openCreateModal, 
  toggleScaleLab, 
  showScaleLab,
  isDark, 
  setIsDark,
  unreadCount = 3
}) {
  const navItems = [
    { id: 'feed', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'reels', label: 'Reels', icon: Film },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: 2 },
    { id: 'notifications', label: 'Notifications', icon: Heart, badge: unreadCount },
    { id: 'create', label: 'Create', icon: PlusSquare, action: openCreateModal },
    { id: 'profile', label: 'Profile', icon: User, avatar: CURRENT_USER.avatar },
  ];

  return (
    <aside className="ig-sidebar">
      <div className="sidebar-top">
        <a href="#feed" className="brand-logo" onClick={(e) => { e.preventDefault(); setActiveTab('feed'); }}>
          <span className="brand-logo-text">Instagram</span>
          <span className="scale-pill">vScale</span>
        </a>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setActiveTab(item.id);
                }
              }}
              title={item.label}
            >
              <div className="nav-icon-wrapper">
                {item.avatar ? (
                  <img src={item.avatar} alt="Profile" className="nav-avatar" />
                ) : (
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 1.75} />
                )}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        {/* Scale Lab Engine Button */}
        <button 
          className={`scale-lab-btn ${showScaleLab ? 'active' : ''}`}
          onClick={toggleScaleLab}
          title="Distributed Scale Architecture Simulation"
        >
          <div className="scale-lab-glow" />
          <Activity size={20} className="scale-lab-icon" />
          <div className="scale-lab-text">
            <span className="scale-title">Scale Telemetry</span>
            <span className="scale-sub">1M+ QPS Engine</span>
          </div>
          <span className="live-status-dot" />
        </button>

        {/* Theme toggle & more */}
        <div className="sidebar-footer-actions">
          <button 
            className="theme-toggle-btn"
            onClick={() => setIsDark(!isDark)}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span className="nav-label">{isDark ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
