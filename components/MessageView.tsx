
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Conversation, Message, MeshPeer } from '../types';

const STORAGE_KEY = 'dormconnect_offline_messages';

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    participant: {
      name: 'Zainab',
      handle: 'zee_vibes',
      avatar: 'https://picsum.photos/100/100?u4',
      isOnline: true
    },
    lastMessage: 'The jollof was fire! 🔥',
    lastMessageTime: '12:45 PM',
    unreadCount: 2,
    messages: [
      { id: 'm1', senderId: 'zee_vibes', text: 'Hey, are you coming for the lunch?', timestamp: '12:30 PM', status: 'sent' },
      { id: 'm2', senderId: 'me', text: 'Yeah, just finishing my lab work.', timestamp: '12:35 PM', status: 'sent' },
      { id: 'm3', senderId: 'zee_vibes', text: 'The jollof was fire! 🔥', timestamp: '12:45 PM', status: 'sent' },
    ]
  },
  {
    id: '2',
    participant: {
      name: 'Ifeanyi',
      handle: 'if_tech',
      avatar: 'https://picsum.photos/100/100?u3',
      isOnline: false
    },
    lastMessage: 'Did you see the new mesh update?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      { id: 'm4', senderId: 'if_tech', text: 'Did you see the new mesh update?', timestamp: 'Yesterday', status: 'sent' },
    ]
  }
];

interface OfflineMessage {
  convId: string;
  message: Message;
}

interface MessageViewProps {
  blockedHandles?: Set<string>;
  peers?: MeshPeer[];
}

export const MessageView: React.FC<MessageViewProps> = ({ blockedHandles = new Set(), peers = [] }) => {
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showMeshConfirm, setShowMeshConfirm] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const lastPeerCount = useRef(peers.length);

  // Sync function to "send" pending messages
  const syncOfflineMessages = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const queue: OfflineMessage[] = JSON.parse(saved);
      if (queue.length === 0) return;

      const hasMeshConnection = peers.length > 0;
      const mode = isOnline ? 'CLOUD_SYNC' : (hasMeshConnection ? 'MESH_RELAY' : null);

      if (!mode) return;

      setSyncStatus(`Syncing via ${mode === 'CLOUD_SYNC' ? 'Internet' : 'Mesh'}...`);

      // Simulate network delay
      setTimeout(() => {
        setConversations(prev => prev.map(conv => ({
          ...conv,
          messages: conv.messages.map(msg => ({
            ...msg,
            status: msg.status === 'pending' 
              ? (isOnline ? 'sent' : 'mesh_relayed') 
              : msg.status
          }))
        })));

        localStorage.removeItem(STORAGE_KEY);
        setSyncStatus(`Success! All messages ${mode === 'CLOUD_SYNC' ? 'synchronized' : 'relayed via mesh'}.`);
        setTimeout(() => setSyncStatus(null), 3000);
      }, 1500);

    } catch (e) {
      console.error("Sync failed", e);
      setSyncStatus("Sync failed. Will retry automatically.");
      setTimeout(() => setSyncStatus(null), 3000);
    }
  }, [isOnline, peers.length]);

  // Monitor connectivity and peer discovery to trigger sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineMessages();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check and peer discovery check
    if (isOnline || peers.length > lastPeerCount.current) {
      syncOfflineMessages();
    }
    
    // Update ref for next check
    lastPeerCount.current = peers.length;

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline, peers.length, syncOfflineMessages]);

  // Load any pending messages from storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const queue: OfflineMessage[] = JSON.parse(saved);
        setConversations(prev => prev.map(conv => {
          const pendingForThisConv = queue.filter(q => q.convId === conv.id).map(q => q.message);
          if (pendingForThisConv.length > 0) {
            const lastPending = pendingForThisConv[pendingForThisConv.length - 1];
            return {
              ...conv,
              messages: [...conv.messages, ...pendingForThisConv],
              lastMessage: lastPending.text,
              lastMessageTime: lastPending.timestamp
            };
          }
          return conv;
        }));
      } catch (e) {
        console.error("Failed to load offline messages", e);
      }
    }
  }, []);

  const processSendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    const msg: Message = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: isOnline ? 'sent' : 'pending'
    };

    // If offline, queue to localStorage
    if (!isOnline) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const queue: OfflineMessage[] = saved ? JSON.parse(saved) : [];
      queue.push({ convId: activeChat.id, message: msg });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      
      // Attempt immediate sync if peers are present
      if (peers.length > 0) {
        setTimeout(syncOfflineMessages, 500);
      }
    }

    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeChat.id) {
        return {
          ...conv,
          messages: [...conv.messages, msg],
          lastMessage: newMessage,
          lastMessageTime: msg.timestamp
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setActiveChat(updatedConversations.find(c => c.id === activeChat.id) || null);
    setNewMessage('');
    setShowMeshConfirm(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;
    
    if (!isOnline && peers.length === 0) {
      setShowMeshConfirm(true);
    } else {
      processSendMessage();
    }
  };

  const retryMessage = (msgId: string) => {
    setConversations(prev => prev.map(conv => ({
      ...conv,
      messages: conv.messages.map(m => 
        m.id === msgId ? { ...m, status: isOnline ? 'sent' : 'pending' } : m
      )
    })));
  };

  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case 'sent':
        return <span className="flex items-center text-emerald-100 group-hover:text-emerald-50 transition-colors"><i className="fas fa-check-double mr-1"></i> SENT</span>;
      case 'mesh_relayed':
        return <span className="flex items-center text-blue-100 group-hover:text-blue-50 transition-colors"><i className="fas fa-tower-broadcast mr-1"></i> RELAYED</span>;
      case 'pending':
        return <span className="flex items-center text-blue-100 animate-pulse font-bold tracking-widest"><i className="fas fa-clock mr-1"></i> QUEUED</span>;
      case 'failed':
        return <span className="flex items-center text-red-100 font-bold"><i className="fas fa-circle-exclamation mr-1"></i> FAILED</span>;
      default:
        return null;
    }
  };

  const displayConversations = conversations.filter(c => !blockedHandles.has(c.participant.handle));

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden animate-fadeIn relative">
      {/* Connectivity Banner */}
      {!isOnline && (
        <div className="bg-blue-600 text-white text-[10px] font-black py-2 px-4 text-center animate-pulse flex items-center justify-center space-x-2 z-20 uppercase tracking-[0.2em]">
          <i className="fas fa-bluetooth-b"></i>
          <span>Campus Mesh: Local Relay Active ({peers.length} Nodes)</span>
        </div>
      )}

      {/* Sync Status Toast */}
      {syncStatus && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[60] animate-bounce">
          <div className="bg-emerald-600 text-white px-6 py-2 rounded-full text-xs font-black shadow-2xl flex items-center space-x-2 border border-emerald-400">
             <i className="fas fa-rotate text-xs animate-spin"></i>
             <span>{syncStatus}</span>
          </div>
        </div>
      )}

      {/* Mesh Send Confirmation Dialog */}
      {showMeshConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-slideUp border border-blue-50">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6">
              <i className="fas fa-tower-broadcast"></i>
            </div>
            <h3 className="text-xl font-black text-center text-gray-900 mb-2">Broadcast via Mesh?</h3>
            <p className="text-gray-500 text-sm text-center mb-8 leading-relaxed">
              You're currently offline. This message will be sent using the local campus mesh network via nearby student nodes.
            </p>
            <div className="space-y-3">
              <button 
                onClick={processSendMessage}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center space-x-2"
              >
                <i className="fas fa-paper-plane text-xs"></i>
                <span>Send Anyway</span>
              </button>
              <button 
                onClick={() => setShowMeshConfirm(false)}
                className="w-full bg-gray-50 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden bg-gray-50">
        {/* Conversation List */}
        <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 bg-white ${activeChat && 'hidden md:flex'} flex-col`}>
          <div className="p-4 border-b border-gray-50">
            <div className="relative">
              <i className="fas fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input 
                type="text" 
                placeholder="Search mesh contacts..." 
                className="w-full bg-gray-50 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {displayConversations.map(conv => {
              const hasPending = conv.messages.some(m => m.status === 'pending');
              const hasFailed = conv.messages.some(m => m.status === 'failed');
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveChat(conv)}
                  className={`w-full p-4 flex items-center space-x-3 hover:bg-emerald-50/50 transition-colors border-b border-gray-50 relative ${activeChat?.id === conv.id ? 'bg-emerald-50 border-r-4 border-r-emerald-600' : ''}`}
                >
                  <div className="relative">
                    <img src={conv.participant.avatar} className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100" alt={conv.participant.name} />
                    {conv.participant.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{conv.participant.name}</h4>
                      <span className="text-[10px] text-gray-400 font-medium">{conv.lastMessageTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {hasFailed ? (
                         <i className="fas fa-circle-exclamation text-[10px] text-red-500"></i>
                      ) : hasPending && (
                        <i className="fas fa-clock text-[10px] text-blue-500 animate-pulse"></i>
                      )}
                      <p className={`text-xs truncate ${hasFailed ? 'text-red-500 font-bold' : hasPending ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                  {conv.unreadCount > 0 && !hasPending && !hasFailed && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))}
              {displayConversations.length === 0 && (
                <div className="p-10 text-center text-gray-400">
                  <p className="text-sm font-bold uppercase tracking-widest">No mesh relays found</p>
                </div>
              )}
          </div>
        </div>

        {/* Active Chat Window */}
        <div className={`flex-1 flex flex-col ${!activeChat && 'hidden md:flex'}`}>
          {activeChat ? (
            <>
              <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center space-x-3">
                  <button onClick={() => setActiveChat(null)} className="md:hidden text-gray-400 hover:text-emerald-600 mr-2">
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <img src={activeChat.participant.avatar} className="w-10 h-10 rounded-full border border-emerald-50 shadow-sm" alt={activeChat.participant.name} />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{activeChat.participant.name}</h4>
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${activeChat.participant.isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">
                        {activeChat.participant.isOnline ? 'Direct Mesh Node' : 'Bridge Link'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-5 text-gray-400">
                  <button className="hover:text-emerald-600 transition-colors"><i className="fas fa-phone-flip text-sm"></i></button>
                  <button className="hover:text-emerald-600 transition-colors"><i className="fas fa-video text-sm"></i></button>
                  <button className="hover:text-emerald-600 transition-colors"><i className="fas fa-ellipsis-vertical text-sm"></i></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeChat.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col space-y-1 max-w-[80%]">
                      <div className={`rounded-2xl px-4 py-3 text-[15px] shadow-md transition-all duration-300 relative group ${
                        msg.senderId === 'me' 
                        ? `${msg.status === 'failed' ? 'bg-red-500' : msg.status === 'pending' ? 'bg-blue-600' : 'bg-emerald-600'} text-white rounded-br-none` 
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                        
                        {msg.senderId === 'me' && (
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10">
                            <div className="text-[9px] uppercase font-black tracking-tighter opacity-80">
                              {getStatusDisplay(msg.status)}
                            </div>
                            <p className="text-[9px] font-bold opacity-60">
                              {msg.timestamp}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {msg.status === 'failed' && (
                        <button 
                          onClick={() => retryMessage(msg.id)}
                          className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center self-end mt-1 hover:underline"
                        >
                          <i className="fas fa-rotate-right mr-1"></i> Retry Broadcast
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center space-x-3 bg-gray-50 rounded-3xl px-5 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-emerald-100 transition-all shadow-inner">
                  <button className="text-gray-400 hover:text-emerald-600 transition-colors"><i className="far fa-face-smile text-lg"></i></button>
                  <input 
                    type="text" 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 font-medium placeholder-gray-400" 
                    placeholder={isOnline ? "Write a message..." : "Broadcast via Local Mesh..."}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <div className="flex items-center space-x-3 pr-1 border-l border-gray-200 ml-2 pl-3">
                    <button className="text-gray-400 hover:text-emerald-600 transition-colors"><i className="fas fa-paperclip"></i></button>
                    <button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className={`${!isOnline ? 'bg-blue-600 shadow-blue-200 w-auto px-4' : 'bg-emerald-600 shadow-emerald-200 w-10'} text-white h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg whitespace-nowrap overflow-hidden`}
                      title={isOnline ? "Send Cloud Sync" : "Broadcast via Mesh"}
                    >
                      <i className={`fas ${!isOnline ? 'fa-tower-broadcast' : 'fa-paper-plane'} text-sm ${!isOnline ? 'mr-2' : ''}`}></i>
                      {!isOnline && <span className="text-[10px] font-black uppercase tracking-widest">Mesh Send</span>}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 space-y-6 bg-white">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping scale-150 opacity-20"></div>
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl relative z-10 border-2 border-dashed border-gray-200">
                  <i className="fas fa-tower-broadcast"></i>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-black text-gray-900 uppercase tracking-[0.2em] text-sm">Mesh Node Idle</p>
                <p className="text-gray-400 text-sm font-medium">Connect with nearby students using local relaying</p>
              </div>
              <button className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                Discover Nearby Nodes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
