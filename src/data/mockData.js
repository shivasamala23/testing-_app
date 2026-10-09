export const CURRENT_USER = {
  id: 'usr_me',
  username: 'alex_codes',
  name: 'Alex Rivera',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  bio: 'Building distributed systems & visual apps 🚀 | @scale_lab',
  followers: '14.2K',
  following: '482',
  postsCount: 54,
  isVerified: true,
};

export const INITIAL_STORIES = [
  {
    id: 'story_0',
    username: 'Your Story',
    avatar: CURRENT_USER.avatar,
    hasUnseen: false,
    isOwner: true,
    media: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1080&q=80',
    time: 'Add now'
  },
  {
    id: 'story_1',
    username: 'tech_architect',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    hasUnseen: true,
    isOwner: false,
    media: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1080&q=80',
    time: '2h ago'
  },
  {
    id: 'story_2',
    username: 'design_daily',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    hasUnseen: true,
    isOwner: false,
    media: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
    time: '4h ago'
  },
  {
    id: 'story_3',
    username: 'tokyo_vibes',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    hasUnseen: true,
    isOwner: false,
    media: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1080&q=80',
    time: '7h ago'
  },
  {
    id: 'story_4',
    username: 'minimal_spaces',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    hasUnseen: true,
    isOwner: false,
    media: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1080&q=80',
    time: '11h ago'
  },
  {
    id: 'story_5',
    username: 'cyber_lens',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    hasUnseen: false,
    isOwner: false,
    media: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1080&q=80',
    time: '18h ago'
  },
];

export const INITIAL_POSTS = [
  {
    id: 'post_viral_01',
    user: {
      username: 'nasa',
      avatar: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
      location: 'Deep Space • James Webb Telescope'
    },
    images: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1080&q=80'
    ],
    caption: 'Cosmic nursery in the Carina Nebula captured in infrared light. A staggering view of star-forming regions 7,500 light-years from Earth. 🌌✨ #space #webbtelescope #universe #astronomy',
    likesCount: 1482930,
    commentsCount: 28410,
    sharesCount: 142000,
    timeAgo: '3h',
    isLiked: false,
    isSaved: true,
    isCelebrity: true, // Used for demonstrating fan-out on read vs write!
    comments: [
      { id: 'c1', user: 'elonmusk', text: 'Incredible detail and calibration 🔥', time: '2h', isLiked: true, likes: 4120 },
      { id: 'c2', user: 'astrogirl', text: 'This looks straight out of science fiction!', time: '1h', isLiked: false, likes: 189 },
      { id: 'c3', user: 'deep_thinker', text: 'We are truly tiny specs in the cosmic dance.', time: '45m', isLiked: false, likes: 64 },
    ]
  },
  {
    id: 'post_dev_02',
    user: {
      username: 'scale_engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
      location: 'Silicon Valley, CA'
    },
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1080&q=80'
    ],
    caption: 'Benchmarked our new Redis + Kafka write-back buffer against 1,000,000 requests/sec. Latency remained < 8ms under p99. Here is a glance at the architecture dashboard. 🚀⚡ #distributed #systemdesign #redis #kafka',
    likesCount: 84920,
    commentsCount: 1204,
    sharesCount: 9400,
    timeAgo: '5h',
    isLiked: true,
    isSaved: false,
    isCelebrity: false,
    comments: [
      { id: 'c4', user: 'golang_dev', text: 'Are you running ScyllaDB or Cassandra underneath?', time: '3h', isLiked: true, likes: 52 },
      { id: 'c5', user: 'frontend_ninja', text: 'Optimistic UI + background event queues make it feel instantaneous.', time: '2h', isLiked: false, likes: 19 },
    ]
  },
  {
    id: 'post_tokyo_03',
    user: {
      username: 'tokyo_vibes',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      isVerified: false,
      location: 'Shinjuku, Tokyo, Japan'
    },
    images: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1080&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1080&q=80'
    ],
    caption: 'Late night ramen runs in the neon rain. Shinjuku never sleeps. 🍜🌧️ #tokyo #japan #cyberpunk #neonvibes',
    likesCount: 31240,
    commentsCount: 421,
    sharesCount: 1800,
    timeAgo: '9h',
    isLiked: false,
    isSaved: false,
    isCelebrity: false,
    comments: [
      { id: 'c6', user: 'travel_lover', text: 'Which alley is this in? Heading there next week!', time: '6h', isLiked: false, likes: 12 }
    ]
  },
  {
    id: 'post_arch_04',
    user: {
      username: 'minimal_spaces',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
      isVerified: true,
      location: 'Copenhagen, Denmark'
    },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1080&q=80'
    ],
    caption: 'Morning light filtration across raw concrete and white oak. Clean geometry for quiet minds. ☕📐 #architecture #minimalism #design #scandinavian',
    likesCount: 19850,
    commentsCount: 230,
    sharesCount: 890,
    timeAgo: '1d',
    isLiked: false,
    isSaved: false,
    isCelebrity: false,
    comments: []
  }
];

export const SUGGESTED_USERS = [
  {
    id: 'sug_1',
    username: 'cloud_native',
    name: 'Kubernetes & Go',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    relation: 'Followed by tech_architect + 12 others',
    isFollowing: false,
  },
  {
    id: 'sug_2',
    username: 'react_core',
    name: 'Modern Web UI',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    relation: 'Suggested for you',
    isFollowing: false,
  },
  {
    id: 'sug_3',
    username: 'ai_frontiers',
    name: 'Deep Learning Labs',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    relation: 'Followed by nasa',
    isFollowing: false,
  },
  {
    id: 'sug_4',
    username: 'lens_culture',
    name: 'Cinematic Visuals',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    relation: 'New to Instagram',
    isFollowing: false,
  }
];

export const REELS_DATA = [
  {
    id: 'reel_1',
    user: {
      username: 'cyber_drone',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      isVerified: true
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-futuristic-tunnel-with-neon-lights-41566-large.mp4',
    poster: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    audioTitle: 'Original Audio • Cyber Drone Labs',
    caption: 'FPV flight through the neon grid. Zero latency transmission. 🔥🚀 #fpv #cyberpunk #reels',
    likesCount: 245100,
    commentsCount: 3120,
    isLiked: false
  },
  {
    id: 'reel_2',
    user: {
      username: 'ocean_depths',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      isVerified: true
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4',
    poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    audioTitle: 'Ambient Waves • Ocean Soundscapes',
    caption: 'Bioluminescent night tides in Maldives. 🌊✨ Pure tranquility.',
    likesCount: 512000,
    commentsCount: 4890,
    isLiked: true
  }
];

export const EXPLORE_GRID = [
  { id: 'exp_1', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', likes: '45K', comments: '1.2K', isWide: false },
  { id: 'exp_2', img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80', likes: '128K', comments: '3.4K', isWide: true },
  { id: 'exp_3', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80', likes: '92K', comments: '800', isWide: false },
  { id: 'exp_4', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', likes: '310K', comments: '9.2K', isWide: false },
  { id: 'exp_5', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', likes: '67K', comments: '920', isWide: false },
  { id: 'exp_6', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', likes: '84K', comments: '1.5K', isWide: false },
];
