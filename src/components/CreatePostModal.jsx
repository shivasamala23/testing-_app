import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, MapPin, Smile, Check } from 'lucide-react';
import { CURRENT_USER } from '../data/mockData';

const FILTER_PRESETS = [
  { name: 'Normal', filter: 'none' },
  { name: 'Clarendon', filter: 'contrast(1.2) saturate(1.25)' },
  { name: 'Gingham', filter: 'brightness(1.05) hue-rotate(-10deg)' },
  { name: 'Juno', filter: 'contrast(1.15) saturate(1.4) sepia(0.15)' },
  { name: 'Lark', filter: 'contrast(0.9) brightness(1.1) saturate(1.2)' },
  { name: 'Noir', filter: 'grayscale(1) contrast(1.4)' },
  { name: 'Aden', filter: 'sepia(0.2) brightness(1.15) saturate(1.4)' },
];

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80',
];

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_PHOTOS[0]);
  const [selectedFilter, setSelectedFilter] = useState(FILTER_PRESETS[0]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');
  const [step, setStep] = useState(1); // 1: Select & Filter, 2: Caption & Share

  if (!isOpen) return null;

  const handleCustomFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedPhoto(url);
    }
  };

  const handlePublish = () => {
    const newPost = {
      id: `post_${Date.now()}`,
      user: {
        username: CURRENT_USER.username,
        avatar: CURRENT_USER.avatar,
        isVerified: true,
        location: location.trim() || undefined
      },
      images: [selectedPhoto],
      filter: selectedFilter.filter,
      caption: caption || 'Created with modern distributed feed engine 🚀 #scalability #instagram',
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      timeAgo: 'Just now',
      isLiked: true,
      isSaved: false,
      isCelebrity: false,
      comments: []
    };

    onPostCreated(newPost);
    onClose();
  };

  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <button className="create-modal-close" onClick={onClose} aria-label="Close modal">
        <X size={26} />
      </button>

      <div className="create-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {step === 2 ? (
            <button className="modal-nav-back" onClick={() => setStep(1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          <h3 className="modal-title">Create New Post</h3>
          {step === 1 ? (
            <button className="modal-next-btn" onClick={() => setStep(2)}>
              Next
            </button>
          ) : (
            <button className="modal-share-btn" onClick={handlePublish}>
              Share
            </button>
          )}
        </div>

        <div className="modal-body">
          {step === 1 ? (
            <div className="filter-step-layout">
              {/* Media Preview Stage with Filter applied */}
              <div className="preview-stage">
                <img 
                  src={selectedPhoto} 
                  alt="Preview" 
                  style={{ filter: selectedFilter.filter }}
                  className="preview-img"
                />

                <label className="upload-custom-btn">
                  <ImageIcon size={18} />
                  <span>Upload from device</span>
                  <input type="file" accept="image/*" onChange={handleCustomFileUpload} hidden />
                </label>
              </div>

              {/* Filter Presets Column */}
              <div className="filters-tray">
                <div className="filters-tray-title">
                  <Sparkles size={16} /> Filters
                </div>
                <div className="filter-presets-list">
                  {FILTER_PRESETS.map((f) => (
                    <button
                      key={f.name}
                      className={`filter-preset-card ${selectedFilter.name === f.name ? 'active' : ''}`}
                      onClick={() => setSelectedFilter(f)}
                    >
                      <div className="filter-thumb-wrap">
                        <img 
                          src={selectedPhoto} 
                          alt={f.name} 
                          style={{ filter: f.filter }} 
                        />
                      </div>
                      <span className="filter-name">{f.name}</span>
                    </button>
                  ))}
                </div>

                <div className="sample-photos-row">
                  <span className="sample-label">Or choose a preset:</span>
                  <div className="sample-photos-list">
                    {SAMPLE_PHOTOS.map((src, i) => (
                      <img 
                        key={i} 
                        src={src} 
                        alt="preset" 
                        className={`sample-thumb ${selectedPhoto === src ? 'selected' : ''}`}
                        onClick={() => setSelectedPhoto(src)} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Step 2: Caption & Metadata */
            <div className="caption-step-layout">
              <div className="caption-left-preview">
                <img 
                  src={selectedPhoto} 
                  alt="Preview" 
                  style={{ filter: selectedFilter.filter }} 
                  className="caption-thumb"
                />
              </div>

              <div className="caption-right-form">
                <div className="author-row">
                  <img src={CURRENT_USER.avatar} alt="You" className="author-avatar" />
                  <span className="author-username">{CURRENT_USER.username}</span>
                </div>

                <textarea 
                  placeholder="Write a caption..." 
                  className="caption-textarea"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={2200}
                />

                <div className="location-input-row">
                  <MapPin size={18} className="form-icon" />
                  <input 
                    type="text" 
                    placeholder="Add location" 
                    className="location-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="advanced-scale-info">
                  <span className="scale-info-title">Fan-out Simulation Target</span>
                  <p>
                    This post will simulate publishing to 14,200 follower timeline caches in Redis using asynchronous worker queues.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
