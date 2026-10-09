import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import StoriesTray from './components/StoriesTray';
import StoryViewerModal from './components/StoryViewerModal';
import PostCard from './components/PostCard';
import RightRail from './components/RightRail';
import CreatePostModal from './components/CreatePostModal';
import CommentsModal from './components/CommentsModal';
import ScaleSimulator from './components/ScaleSimulator';
import ReelsView from './components/ReelsView';
import ExploreGrid from './components/ExploreGrid';
import { INITIAL_POSTS, INITIAL_STORIES } from './data/mockData';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [stories, setStories] = useState(INITIAL_STORIES);

  // Modals state
  const [activeStory, setActiveStory] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [showScaleLab, setShowScaleLab] = useState(true); // Open telemetry by default to showcase scale!

  // Distributed Event Stream Telemetry logs
  const [telemetryLogs, setTelemetryLogs] = useState([
    { time: '12:00:01', type: 'REDIS_GET', target: 'timeline:usr_me', latency: 3.2, strategy: 'FanOut-Read' },
    { time: '12:00:03', type: 'KAFKA_PRODUCE', target: 'topic:post-views', latency: 4.1, strategy: 'Async-Queue' },
    { time: '12:00:06', type: 'REDIS_SISMEMBER', target: 'post:viral_01:likes', latency: 1.8, strategy: 'O(1) Set' },
  ]);

  // Sync theme with document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  // Record an event in the telemetry stream
  const recordTelemetryEvent = ({ type, postId, latencyMs, cacheHit }) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newLog = {
      time: timeStr,
      type: type || 'REDIS_INCR',
      target: `post:${postId}:likes`,
      latency: latencyMs || 3.5,
      strategy: cacheHit ? 'Redis Atomic INCR' : 'Write-Back Kafka'
    };

    setTelemetryLogs(prev => [...prev.slice(-20), newLog]);
  };

  // Optimistic like toggle connected to Live Ingestion Service
  const handleLikeToggle = async (postId) => {
    const targetPost = posts.find(p => p.id === postId);
    const willLike = !targetPost?.isLiked;

    // 1. Optimistic UI update immediately (< 1ms)
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const newLiked = !post.isLiked;
          const newCount = newLiked ? post.likesCount + 1 : post.likesCount - 1;
          return {
            ...post,
            isLiked: newLiked,
            likesCount: newCount
          };
        }
        return post;
      })
    );

    // 2. Dispatch to Fastify Ingestion Gateway
    try {
      const endpoint = `http://localhost:4000/api/posts/${postId}/like`;
      const res = await fetch(endpoint, {
        method: willLike ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr_me' })
      });
      if (res.ok) {
        const data = await res.json();
        recordTelemetryEvent({
          type: willLike ? 'FASTIFY_POST_LIKE' : 'FASTIFY_DELETE_LIKE',
          postId,
          latencyMs: data.latencyMs || 0.5,
          cacheHit: true
        });
      }
    } catch {
      // Offline fallback simulation
    }
  };

  // Simulated massive batch like injection hitting Backend Load-Test Gateway
  const handleSimulateBatchLikes = async (postId, count) => {
    // 1. Update UI state smoothly
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likesCount: post.likesCount + count
          };
        }
        return post;
      })
    );

    // 2. Dispatch burst to Backend Kafka Ingestion Buffer
    try {
      fetch('http://localhost:4000/api/loadtest/burst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: Math.min(count, 2000), postId })
      });
    } catch {
      // Ignore network errors in simulation
    }
  };

  // Add comment to post
  const handleAddComment = (postId, text) => {
    const newComment = {
      id: `comm_${Date.now()}`,
      user: 'alex_codes',
      text: text,
      time: 'Just now',
      isLiked: false,
      likes: 0
    };

    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [newComment, ...(post.comments || [])]
          };
        }
        return post;
      })
    );

    recordTelemetryEvent({
      type: 'KAFKA_EVENT',
      postId,
      latencyMs: 6,
      cacheHit: false
    });
  };

  // Publish new post
  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setActiveTab('feed');
    recordTelemetryEvent({
      type: 'FANOUT_WORKER_PUSH',
      postId: newPost.id,
      latencyMs: 14.2,
      cacheHit: true
    });
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        openCreateModal={() => setIsCreateModalOpen(true)}
        toggleScaleLab={() => setShowScaleLab(!showScaleLab)}
        showScaleLab={showScaleLab}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Main Viewport Content */}
      <main className="main-viewport">
        {activeTab === 'feed' && (
          <>
            <div className="content-column">
              {/* Stories Tray */}
              <StoriesTray 
                stories={stories} 
                onSelectStory={(story) => setActiveStory(story)} 
              />

              {/* Feed Posts List */}
              <div className="posts-feed-stream">
                {posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onLikeToggle={handleLikeToggle}
                    onOpenComments={(p) => setActiveCommentPost(p)}
                    onAddComment={handleAddComment}
                    onRecordTelemetryEvent={recordTelemetryEvent}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Right Rail */}
            <RightRail />
          </>
        )}

        {/* Reels Tab */}
        {activeTab === 'reels' && (
          <ReelsView onOpenComments={(p) => setActiveCommentPost(p)} />
        )}

        {/* Explore Tab */}
        {activeTab === 'explore' && (
          <ExploreGrid onSelectPost={(item) => alert(`Explore post ${item.id} opened`)} />
        )}
      </main>

      {/* Modals & Overlays */}
      {activeStory && (
        <StoryViewerModal 
          story={activeStory} 
          stories={stories}
          onClose={() => setActiveStory(null)}
          onSelectStory={(s) => setActiveStory(s)}
        />
      )}

      <CreatePostModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      {activeCommentPost && (
        <CommentsModal 
          post={activeCommentPost}
          isOpen={Boolean(activeCommentPost)}
          onClose={() => setActiveCommentPost(null)}
          onAddComment={handleAddComment}
        />
      )}

      {/* Scale Simulator / High-Concurrency Telemetry Drawer */}
      <ScaleSimulator 
        posts={posts}
        isOpen={showScaleLab}
        onClose={() => setShowScaleLab(false)}
        onSimulateBatchLikes={handleSimulateBatchLikes}
        telemetryLogs={telemetryLogs}
      />
    </div>
  );
}
