
import React, { useState, useEffect } from 'react';
import { MeshPeer } from '../types';

interface MeshSetupProps {
  onComplete: (username: string, color: string) => void;
}

const MOCK_NAMES = ['LagosVibe', 'OyoPrince', 'ZazaBoi', 'IbadanQueen', 'KanoKing', 'TechBro_99', 'DormGenius', 'NaijaCoder', 'JollofMaster', 'CampusStar'];
const DISTANCES = ['2m', '5m', '8m', '12m', '15m', '20m'];
const PEER_COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 
  'bg-rose-500', 'bg-amber-500', 'bg-indigo-500'
];

export const MeshSetup: React.FC<MeshSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'name' | 'scanning'>('name');
  const [handle, setHandle] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-emerald-500');
  const [discoveredPeers, setDiscoveredPeers] = useState<MeshPeer[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [isScanningComplete, setIsScanningComplete] = useState(false);

  const colors = [
    'bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 
    'bg-rose-500', 'bg-amber-500', 'bg-indigo-500'
  ];

  useEffect(() => {
    if (step === 'scanning') {
      const interval = setInterval(() => {
        setDiscoveredPeers(prev => {
          if (prev.length >= 8) {
            setIsScanningComplete(true);
            clearInterval(interval);
            return prev;
          }
          
          const newPeer: MeshPeer = {
            id: Math.random().toString(36).substr(2, 9),
            handle: `@${MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]}_${Math.floor(Math.random() * 99)}`,
            distance: DISTANCES[Math.floor(Math.random() * DISTANCES.length)],
            lastSeen: Date.now(),
            color: PEER_COLORS[Math.floor(Math.random() * PEER_COLORS.length)]
          };

          // Avoid duplicates in mock list
          if (prev.some(p => p.handle === newPeer.handle)) return prev;
          return [...prev, newPeer];
        });
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [step]);

  const toggleAddPeer = (id: string) => {
    const next = new Set(addedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setAddedIds(next);
  };

  const handlePing = (handle: string) => {
    // Simulated ping feedback
    const originalText = document.title;
    document.title = `Pinged ${handle}!`;
    setTimeout(() => document.title = originalText, 2000);
  };

  const handleFinish = () => {
    const finalHandle = handle.startsWith('@') ? handle : `@${handle}`;
    const identity = { handle: finalHandle, color: selectedColor };
    
    // Persist to localStorage for subsequent launches
    localStorage.setItem('dormconnect_mesh_identity', JSON.stringify(identity));
    
    onComplete(finalHandle, selectedColor);
  };

  if (step === 'name') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-900/20 backdrop-blur-xl p-6 animate-fadeIn">
        <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-emerald-100">
          <div className="text-center space-y-4 mb-8">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto shadow-lg shadow-emerald-200">
              <i className="fas fa-id-card"></i>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Mesh Identity</h2>
            <p className="text-gray-500">Pick a handle to be discovered by others on your campus mesh network.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Your Campus Handle</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-lg">@</span>
                <input 
                  type="text" 
                  autoFocus
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-4 pl-10 pr-4 text-lg font-bold outline-none transition-all"
                  placeholder="LagosLegend"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/\s/g, ''))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Node Signal Color</label>
              <div className="flex justify-between">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full ${color} transition-all duration-300 ${selectedColor === color ? 'ring-4 ring-offset-2 ring-emerald-600 scale-110' : 'opacity-60 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            <button
              disabled={handle.length < 3}
              onClick={() => setStep('scanning')}
              className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
            >
              Initialize Mesh Node
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white animate-fadeIn flex flex-col">
      {/* Header Area */}
      <div className="p-8 text-center bg-white border-b border-gray-100">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 -m-8">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-100 animate-[ping_3s_linear_infinite]"></div>
            <div className="absolute inset-0 rounded-full border-2 border-emerald-50 animate-[ping_4.5s_linear_infinite]"></div>
          </div>
          <div className={`w-20 h-20 ${selectedColor} rounded-full flex items-center justify-center text-white text-3xl relative z-10 shadow-2xl`}>
            <i className={`fas ${isScanningComplete ? 'fa-check' : 'fa-bluetooth-b animate-pulse'}`}></i>
          </div>
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
          {isScanningComplete ? 'Network Initialized' : 'Scanning Campus Mesh...'}
        </h2>
        <p className="text-gray-400 text-sm font-medium mt-1">
          {isScanningComplete ? 'All clear! Your node is active.' : 'Establishing handshakes with nearby dorm nodes...'}
        </p>
      </div>

      {/* Peer Discovery List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
             Found Nodes ({discoveredPeers.length})
           </h3>
           {!isScanningComplete && (
             <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Searching...</span>
             </div>
           )}
        </div>

        {discoveredPeers.map((peer, idx) => (
          <div 
            key={peer.id} 
            className="bg-white border border-gray-100 rounded-3xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all animate-slideUp"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${peer.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-gray-100`}>
                <i className="fas fa-tower-broadcast text-sm"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{peer.handle}</h4>
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-tight">{peer.distance} away</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handlePing(peer.handle)}
                className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                title="Ping Peer"
              >
                <i className="fas fa-bolt"></i>
              </button>
              <button 
                onClick={() => toggleAddPeer(peer.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                  addedIds.has(peer.id) 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                  : 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700'
                }`}
              >
                {addedIds.has(peer.id) ? 'Added' : 'Add Node'}
              </button>
            </div>
          </div>
        ))}

        {discoveredPeers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-fadeIn">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-100 shadow-inner">
                <i className="fas fa-satellite-dish text-emerald-600 text-4xl animate-bounce"></i>
              </div>
            </div>
            <div className="space-y-3 px-8">
              <p className="text-gray-900 font-black text-xl uppercase tracking-tight">Silent Sector Detected</p>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto font-medium">
                We're looking for other students nearby. Make sure your friends have their mesh enabled and are within range (approx. 50m)!
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              <div className="flex items-center space-x-2 bg-gray-50 text-gray-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Checking BLE</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 text-gray-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <span>Syncing Hop</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 text-gray-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                <span>Node Handshake</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
        <button 
          onClick={handleFinish}
          className="w-full max-w-md bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center space-x-3 mx-auto"
        >
          <span>Enter Dorm Room</span>
          <i className="fas fa-arrow-right"></i>
        </button>
        <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest">
          Secure BLE Handshake Enabled • AES-256 Mesh Encryption
        </p>
      </div>
    </div>
  );
};
