
import React, { useState, useEffect, useMemo } from 'react';
import { Post, User, ViewType, MeshPeer } from '../types';
import { PostCard } from './PostCard';
import { MessageView } from './MessageView';
import { GameCenter } from './GameCenter';
import { MapView } from './MapView';
import { generateSmartPost, summarizeFeed } from '../services/geminiService';

interface AppShellProps {
  meshIdentity: { handle: string; color: string };
}

const DEFAULT_USER: User = {
  name: "New Student",
  handle: "new_student",
  bio: "Just joined Dorm Room Connect! 🇳🇬",
  avatar: "https://picsum.photos/200/200?u=default",
  posts: 0,
  followers: 0,
  following: 0
};

const INITIAL_POSTS: Post[] = [
  {
    id: "1",
    author: "Tunde Ednut",
    handle: "king_tunde",
    content: "UNILAG girls, why are you like this? 😭 Saw someone eating Shawarma with swallow today.",
    timestamp: "2h ago",
    likes: 120,
    comments: 45,
    avatar: "https://picsum.photos/100/100?u2"
  },
  {
    id: "2",
    author: "Ifeanyi",
    handle: "if_tech",
    content: "Just configured my Dorm Room mesh network. Chilling with 0 WiFi but still chatting with the boys. Life is good.",
    timestamp: "4h ago",
    likes: 89,
    comments: 12,
    avatar: "https://picsum.photos/100/100?u3",
    isOffline: true
  },
  {
    id: "3",
    author: "Zainab",
    handle: "zee_vibes",
    content: "The jollof in Jaja Hall is 10/10 today! Who's joining me for lunch?",
    timestamp: "5h ago",
    likes: 230,
    comments: 56,
    avatar: "https://picsum.photos/100/100?u4",
    image: "https://picsum.photos/600/400?food"
  }
];

const LOCAL_PEERS: MeshPeer[] = [
  { id: 'p1', handle: '@Zainab', distance: '2m', lastSeen: Date.now(), color: 'bg-rose-500' },
  { id: 'p2', handle: '@Ifeanyi', distance: '15m', lastSeen: Date.now(), color: 'bg-blue-500' },
  { id: 'p3', handle: '@Tunde', distance: '45m', lastSeen: Date.now(), color: 'bg-purple-500' },
  { id: 'p4', handle: '@Bolaji', distance: '12m', lastSeen: Date.now(), color: 'bg-amber-500' },
  { id: 'p5', handle: '@Favour', distance: '100m', lastSeen: Date.now(), color: 'bg-emerald-500' },
];

export const AppShell: React.FC<AppShellProps> = ({ meshIdentity }) => {
  const [activeView, setActiveView] = useState<ViewType>('feed');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [newPostContent, setNewPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedVibe, setFeedVibe] = useState('Loading campus vibe...');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [blockedHandles, setBlockedHandles] = useState<Set<string>>(new Set<string>());
  const [showQR, setShowQR] = useState(false);

  // Profile Management
  const [profile, setProfile] = useState<User>(() => {
    const saved = localStorage.getItem('dormconnect_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, handle: meshIdentity.handle }; 
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
    return { ...DEFAULT_USER, handle: meshIdentity.handle };
  });

  useEffect(() => {
    const handleConnectivityChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleConnectivityChange);
    window.addEventListener('offline', handleConnectivityChange);

    const savedBlocks = localStorage.getItem('dormconnect_blocked');
    if (savedBlocks) {
      try {
        const parsed = JSON.parse(savedBlocks);
        if (Array.isArray(parsed)) {
          setBlockedHandles(new Set<string>(parsed.map((h: any) => String(h))));
        }
      } catch (e) {
        console.error("Failed to load blocks", e);
      }
    }

    const fetchVibe = async () => {
      if (activeView === 'feed') {
        const vibe = await summarizeFeed(posts.filter(p => !blockedHandles.has(String(p.handle))));
        setFeedVibe(vibe);
      }
    };
    fetchVibe();
    
    return () => {
      window.removeEventListener('online', handleConnectivityChange);
      window.removeEventListener('offline', handleConnectivityChange);
    };
  }, [posts, activeView, blockedHandles]);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    const newPost: Post = {
      id: Date.now().toString(),
      author: profile.name,
      handle: meshIdentity.handle,
      content: newPostContent,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      avatar: profile.avatar,
      isOffline: !isOnline
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const handleBlockUser = (handle: string) => {
    const newBlocks = new Set<string>(blockedHandles);
    if (newBlocks.has(handle)) {
      newBlocks.delete(handle);
      setBlockedHandles(newBlocks);
      localStorage.setItem('dormconnect_blocked', JSON.stringify(Array.from(newBlocks)));
    } else {
      if (window.confirm(`Are you sure you want to block ${handle}? You won't see their posts or messages.`)) {
        newBlocks.add(handle);
        setBlockedHandles(newBlocks);
        localStorage.setItem('dormconnect_blocked', JSON.stringify(Array.from(newBlocks)));
      }
    }
  };

  const handleAIAssistant = async () => {
    setIsGenerating(true);
    const aiText = await generateSmartPost("campus life, social events, and network challenges in Nigeria");
    setNewPostContent(aiText);
    setIsGenerating(false);
  };

  const displayPosts = useMemo(() => {
    return posts.filter(p => !blockedHandles.has(String(p.handle)) && !blockedHandles.has(`@${p.handle}`));
  }, [posts, blockedHandles]);

  const filteredPeers = useMemo(() => {
    const base = LOCAL_PEERS.filter(p => !blockedHandles.has(String(p.handle)));
    if (!searchQuery) return base;
    return base.filter(p => 
      p.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, blockedHandles]);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden lg:flex flex-col w-64 fixed left-[max(0px,calc(50%-600px))] top-0 h-full p-4 space-y-6 pt-8">
        <div className="flex items-center space-x-3 mb-8 px-4 cursor-pointer" onClick={() => setActiveView('feed')}>
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">D</div>
          <span className="font-bold text-xl tracking-tight text-gray-800">Dorm Room</span>
        </div>
        
        <nav className="space-y-2">
          <NavItem active={activeView === 'feed'} icon="fa-house" label="Feed" onClick={() => setActiveView('feed')} />
          <NavItem active={activeView === 'explore'} icon="fa-magnifying-glass" label="Explore" onClick={() => setActiveView('explore')} />
          <NavItem active={activeView === 'map'} icon="fa-map-location-dot" label="Campus Map" onClick={() => setActiveView('map')} />
          <NavItem active={activeView === 'messages'} icon="fa-message" label="Messages" onClick={() => setActiveView('messages')} />
          <NavItem active={activeView === 'game'} icon="fa-gamepad" label="Games" onClick={() => setActiveView('game')} />
          <NavItem active={activeView === 'notifications'} icon="fa-bell" label="Notifications" onClick={() => setActiveView('notifications')} />
          <NavItem active={activeView === 'profile'} icon="fa-user" label="Profile" onClick={() => setActiveView('profile')} />
        </nav>

        {/* Local Node Stats */}
        <div className="mt-auto bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">My Local Node</p>
          <div className="flex items-center space-x-3">
             <div className={`w-10 h-10 rounded-full ${meshIdentity.color} flex items-center justify-center text-white shadow-lg`}>
                <i className="fas fa-tower-broadcast text-xs"></i>
             </div>
             <div className="min-w-0">
                <p className="text-xs font-bold truncate">{meshIdentity.handle}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">MESH ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`w-full ${activeView === 'messages' || activeView === 'game' || activeView === 'map' ? 'max-w-4xl' : 'max-w-xl'} lg:ml-20 lg:mr-80 min-h-screen bg-white shadow-xl flex flex-col`}>
        {/* Header */}
        <header className="sticky top-0 z-30 glass px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="font-bold text-lg uppercase tracking-widest text-gray-500">
              {activeView === 'feed' ? 'Campus Feed' : activeView === 'game' ? 'Naija Game Center' : activeView === 'map' ? 'Mesh Radar' : activeView}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter shadow-sm ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
              <i className={`fas ${isOnline ? 'fa-globe' : 'fa-bluetooth-b animate-pulse'}`}></i>
              <span>{isOnline ? 'GLOBAL SYNC' : 'LOCAL MESH'}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {activeView === 'feed' && (
            <div className="p-4">
              {/* Create Post Area */}
              <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
                <div className="flex space-x-3 mb-4">
                  <img src={profile.avatar} className="w-10 h-10 rounded-full object-cover" alt="Me" />
                  <textarea 
                    className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none min-h-[80px]"
                    placeholder="Broadcast to nearby students..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <i className="far fa-image"></i>
                    </button>
                    <button 
                      onClick={handleAIAssistant}
                      disabled={isGenerating}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                      <span className="text-[10px] font-bold uppercase">AI Draft</span>
                    </button>
                  </div>
                  <button 
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                    className="bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Smart Summary */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-2xl mb-6 text-white shadow-lg relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                 <div className="relative">
                   <div className="flex items-center space-x-2 mb-2">
                     <i className="fas fa-sparkles text-sm"></i>
                     <span className="text-[10px] font-extrabold uppercase tracking-widest">Campus Vibe Analysis</span>
                   </div>
                   <p className="text-sm font-medium leading-relaxed italic">"{feedVibe}"</p>
                 </div>
              </div>

              <div className="space-y-4">
                {displayPosts.map(post => (
                  <PostCard key={post.id} post={post} onBlockUser={handleBlockUser} />
                ))}
              </div>
            </div>
          )}

          {activeView === 'game' && <GameCenter peers={filteredPeers} />}
          {activeView === 'messages' && <MessageView blockedHandles={blockedHandles} peers={filteredPeers} />}
          {activeView === 'map' && <MapView peers={filteredPeers} onStartChat={() => setActiveView('messages')} />}
          
          {activeView === 'explore' && (
             <div className="p-4">
                <div className="relative mb-8">
                  <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input 
                    type="text"
                    placeholder="Search campus posts, students, or slang..."
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all shadow-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
             </div>
          )}

          {activeView === 'profile' && (
            <div className="animate-fadeIn pb-10">
              <div className={`h-40 ${meshIdentity.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
              <div className="px-6 relative">
                <div className="absolute -top-12 flex items-end justify-between w-full pr-12">
                   <img src={profile.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white" alt="Me" />
                   <button 
                      onClick={() => setShowQR(true)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg shadow-emerald-200"
                    >
                      <i className="fas fa-qrcode mr-2"></i> Share
                    </button>
                </div>
                <div className="pt-16 pb-4">
                   <h1 className="text-2xl font-black text-gray-900 tracking-tight">{profile.name}</h1>
                   <p className="text-emerald-600 font-bold text-sm mb-4">{profile.handle}</p>
                   <p className="text-gray-700 leading-relaxed max-w-md whitespace-pre-line">{profile.bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pb-24 lg:pb-0"></div>
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 w-full glass border-t border-gray-200 px-6 py-4 flex justify-between items-center z-50">
        <MobNavItem active={activeView === 'feed'} icon="fa-house" onClick={() => setActiveView('feed')} />
        <MobNavItem active={activeView === 'map'} icon="fa-map-location-dot" onClick={() => setActiveView('map')} />
        <div className="relative -top-10">
          <button 
            onClick={() => setActiveView('feed')}
            className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl shadow-xl border-4 border-white"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
        <MobNavItem active={activeView === 'game'} icon="fa-gamepad" onClick={() => setActiveView('game')} />
        <MobNavItem active={activeView === 'messages'} icon="fa-message" onClick={() => setActiveView('messages')} />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean, icon: string, label: string, onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all ${active ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
  >
    <i className={`fas ${icon} text-lg w-6`}></i>
    <span className="text-md">{label}</span>
  </button>
);

const MobNavItem: React.FC<{ active: boolean, icon: string, onClick: () => void }> = ({ active, icon, onClick }) => (
  <button onClick={onClick} className={`p-2 transition-colors ${active ? 'text-emerald-600' : 'text-gray-400'}`}>
    <i className={`fas ${icon} text-xl`}></i>
  </button>
);
