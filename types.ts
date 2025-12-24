
export interface Post {
  id: string;
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  avatar: string;
  image?: string;
  isOffline?: boolean;
}

export interface User {
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  posts: number;
  followers: number;
  following: number;
  meshColor?: string;
}

export interface MeshPeer {
  id: string;
  handle: string;
  distance: string; // e.g., "2m", "10m"
  lastSeen: number;
  color: string;
  coordinates?: { x: number; y: number }; // Relative map positioning
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'pending' | 'failed' | 'mesh_relayed';
}

export interface Conversation {
  id: string;
  participant: {
    name: string;
    handle: string;
    avatar: string;
    isOnline: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export type ViewType = 'feed' | 'explore' | 'notifications' | 'profile' | 'messages' | 'landing' | 'game' | 'map';

export interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  highScore: number;
}
