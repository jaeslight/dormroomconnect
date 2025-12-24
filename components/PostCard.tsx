
import React, { useState } from 'react';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  onBlockUser?: (handle: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onBlockUser }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <div className={`rounded-2xl p-4 shadow-sm border transition-all duration-300 mb-4 animate-fadeIn relative ${
      post.isOffline 
        ? 'bg-gradient-to-br from-white to-blue-50/50 border-blue-100 shadow-blue-50' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img src={post.avatar} className="w-10 h-10 rounded-full border-2 border-emerald-100 object-cover" alt={post.author} />
            {post.isOffline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                <i className="fas fa-tower-broadcast text-[8px] text-white"></i>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <h4 className="font-bold text-sm text-gray-900">{post.author}</h4>
              <i className="fas fa-circle-check text-blue-500 text-[10px]" title="Campus Verified"></i>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 font-medium">{post.handle}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">{post.timestamp}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {post.isOffline && (
            <div 
              className="group relative flex items-center" 
              title="This post was broadcasted via the campus mesh network"
            >
              <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black flex items-center tracking-widest shadow-lg shadow-blue-100">
                <i className="fas fa-tower-broadcast mr-1 text-[8px] animate-pulse"></i> MESH RELAYED
              </span>
            </div>
          )}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-ellipsis-h"></i>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-slideUp">
                <button 
                  onClick={() => { setShowMenu(false); onBlockUser?.(post.handle); }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors flex items-center space-x-2"
                >
                  <i className="fas fa-ban"></i>
                  <span>Block {post.handle}</span>
                </button>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                >
                  Report Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-gray-800 text-[15px] leading-relaxed mb-4 whitespace-pre-line font-medium">
        {post.content}
      </p>

      {post.image && (
        <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 shadow-inner">
          <img src={post.image} className="w-full h-auto object-cover max-h-96" alt="Post content" />
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-gray-500">
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-2 group transition-all duration-300 ${liked ? 'text-rose-500 scale-110' : 'hover:text-rose-500'}`}
        >
          <div className={`p-2 rounded-full transition-colors ${liked ? 'bg-rose-50' : 'group-hover:bg-rose-50'}`}>
            <i className={`${liked ? 'fas' : 'far'} fa-heart`}></i>
          </div>
          <span className="text-xs font-bold">{likesCount}</span>
        </button>

        <button className="flex items-center space-x-2 group hover:text-emerald-500 transition-colors">
          <div className="p-2 rounded-full group-hover:bg-emerald-50 transition-colors">
            <i className="far fa-comment"></i>
          </div>
          <span className="text-xs font-bold">{post.comments}</span>
        </button>

        <button className="flex items-center space-x-2 group hover:text-blue-500 transition-colors">
          <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
            <i className="far fa-share-square"></i>
          </div>
        </button>

        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <i className="far fa-bookmark"></i>
        </button>
      </div>
      
      {post.isOffline && (
        <div className="mt-3 py-1.5 px-3 bg-blue-50/50 rounded-lg flex items-center space-x-2 border border-blue-100/50">
          <i className="fas fa-info-circle text-[10px] text-blue-400"></i>
          <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tight">Handled by Local Dorm Relay Node</p>
        </div>
      )}
    </div>
  );
};
