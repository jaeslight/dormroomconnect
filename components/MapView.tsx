
import React, { useState, useEffect, useMemo } from 'react';
import { MeshPeer } from '../types';

interface MapViewProps {
  peers: MeshPeer[];
  onStartChat: (peer: MeshPeer) => void;
}

export const MapView: React.FC<MapViewProps> = ({ peers, onStartChat }) => {
  const [selectedPeer, setSelectedPeer] = useState<MeshPeer | null>(null);
  const [radarPulse, setRadarPulse] = useState(0);
  const [isScanning, setIsScanning] = useState(true);

  // Helper to calculate signal strength (0-1) based on distance
  const getSignalStrength = (distance: string) => {
    const dist = parseInt(distance) || 0;
    if (dist <= 5) return 1.0; // 4 bars (Excellent)
    if (dist <= 15) return 0.75; // 3 bars (Good)
    if (dist <= 40) return 0.5; // 2 bars (Fair)
    return 0.25; // 1 bar (Weak)
  };

  // Map peers to radar coordinates
  const mappedPeers = useMemo(() => {
    return peers.map((peer, index) => {
      // Use a consistent but "random" seed based on the handle for stable positioning
      const seed = peer.handle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const angle = (seed % 360) * (Math.PI / 180);
      
      // Calculate radius based on distance
      const dist = parseInt(peer.distance) || 10;
      const radius = Math.min(Math.max(dist * 2.2 + 40, 60), 145);
      
      return {
        ...peer,
        x: 160 + Math.cos(angle) * radius,
        y: 160 + Math.sin(angle) * radius,
        strength: getSignalStrength(peer.distance),
        stability: Math.min(99, 100 - dist + (seed % 10))
      };
    });
  }, [peers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadarPulse(p => (p + 2) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const renderSignalBars = (strength: number, activeColor: string) => {
    const bars = Math.ceil(strength * 4);
    return (
      <div className="flex items-end space-x-0.5">
        {[1, 2, 3, 4].map((bar) => (
          <div 
            key={bar} 
            className={`w-0.5 rounded-full transition-all duration-500 ${bar <= bars ? activeColor : 'bg-white/10'}`} 
            style={{ height: `${bar * 3 + 2}px` }}
          ></div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-full overflow-hidden animate-fadeIn select-none relative font-mono">
      {/* HUD Header */}
      <div className="p-6 flex justify-between items-start z-20">
        <div>
          <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1">Campus Mesh Radar v2.4</h2>
          <div className="flex items-center space-x-3">
             <div className="flex items-center space-x-1">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Active Scan</span>
             </div>
             <span className="text-white/20 text-[9px] font-bold uppercase tracking-widest">Nodes: {peers.length}</span>
          </div>
        </div>
        <div className="text-right">
           <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Sector: G-Block / West</p>
           <p className="text-emerald-500/60 text-[8px] font-bold uppercase">Lat: 6.5244° N | Lon: 3.3792° E</p>
        </div>
      </div>

      {/* Main Radar Display */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
           <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* Radar Circles */}
          {[100, 75, 50, 25].map((size) => (
            <div 
              key={size}
              className="absolute border border-emerald-500/10 rounded-full"
              style={{ width: `${size}%`, height: `${size}%` }}
            ></div>
          ))}

          {/* Crosshairs */}
          <div className="absolute w-full h-[1px] bg-emerald-500/5 top-1/2 -translate-y-1/2"></div>
          <div className="absolute h-full w-[1px] bg-emerald-500/5 left-1/2 -translate-x-1/2"></div>
          
          {/* Sweeping Radar Line */}
          <div 
            className="absolute w-1/2 h-20 bg-gradient-to-r from-transparent via-emerald-500/5 to-emerald-500/20 origin-left left-1/2 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
            style={{ 
              transform: `rotate(${radarPulse - 90}deg)`,
              clipPath: 'polygon(0 50%, 100% 0, 100% 100%)'
            }}
          ></div>

          {/* User Central Node */}
          <div className="relative z-40">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center border-4 border-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.6)]">
              <i className="fas fa-tower-broadcast text-white text-xs animate-pulse"></i>
            </div>
            <div className="absolute -inset-4 border border-emerald-500/20 rounded-full animate-ping pointer-events-none"></div>
          </div>

          {/* Peer Discovery Blips */}
          {mappedPeers.map((peer) => (
            <button
              key={peer.id}
              onClick={() => setSelectedPeer(peer)}
              className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 hover:z-50 group"
              style={{ left: `${peer.x}px`, top: `${peer.y}px` }}
            >
              <div className="relative flex flex-col items-center">
                {/* Visual Metadata Hook */}
                <div className="mb-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300">
                   {renderSignalBars(peer.strength, 'bg-emerald-400')}
                </div>
                
                <div className="relative">
                  {/* Outer pulse based on distance (strength) */}
                  <div className={`w-4 h-4 rounded-full ${peer.color} animate-ping absolute inset-0 opacity-20`} style={{ animationDuration: `${2000 - (peer.strength * 1000)}ms` }}></div>
                  <div className={`w-3.5 h-3.5 rounded-full ${peer.color} border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] group-hover:scale-125 transition-transform`}></div>
                </div>
                
                {/* Interactive ID Tag */}
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-all bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 px-2 py-1 rounded shadow-xl pointer-events-none whitespace-nowrap">
                   <div className="flex items-center space-x-2">
                     <p className="text-[8px] font-black text-white tracking-widest uppercase">{peer.handle}</p>
                     <span className="text-[7px] font-bold text-emerald-500">{peer.distance}</span>
                   </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Floating Detail Panel (Selected Node) */}
        {selectedPeer && (
          <div className="absolute bottom-10 left-6 right-6 z-[60] animate-slideUp">
            <div className="bg-slate-900/95 backdrop-blur-2xl border border-emerald-500/20 p-6 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
              {/* Background HUD Decor */}
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <i className="fas fa-network-wired text-6xl text-emerald-500"></i>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-3xl ${selectedPeer.color} flex items-center justify-center text-white text-2xl shadow-lg relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/10 flex items-center justify-center font-black">
                       {selectedPeer.handle.charAt(1).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-black text-base tracking-tight">{selectedPeer.handle}</h4>
                    <div className="flex items-center space-x-3 mt-0.5">
                       <span className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em]">{selectedPeer.distance} RANGE</span>
                       <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                       <div className="flex items-center space-x-1.5">
                          {renderSignalBars(getSignalStrength(selectedPeer.distance), 'bg-emerald-400')}
                          <span className="text-white/40 text-[8px] font-bold">STABLE</span>
                       </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPeer(null)}
                  className="w-10 h-10 rounded-full bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => onStartChat(selectedPeer)}
                  className="bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/40"
                >
                  <i className="fas fa-bolt-lightning animate-pulse"></i>
                  <span>Initialize Link</span>
                </button>
                <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/20"></div>
                   <span className="text-white/30 text-[7px] font-black uppercase tracking-widest mb-1.5">Link Stability Index</span>
                   <div className="flex items-baseline space-x-2">
                      <span className="text-emerald-400 text-lg font-black leading-none">
                        {selectedPeer.stability}%
                      </span>
                      <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden mb-1">
                         <div 
                           className="h-full bg-emerald-500 transition-all duration-1000" 
                           style={{ width: `${selectedPeer.stability}%` }}
                         ></div>
                      </div>
                   </div>
                </div>
              </div>
              
              {/* Node Metadata Footer */}
              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between text-[7px] font-bold text-white/20 uppercase tracking-widest">
                 <span>Relay Hops: 0 (Direct)</span>
                 <span>Prot: MESH-X1</span>
                 <span>Pings: {Math.floor(Math.random() * 50)}ms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global HUD Status Bar */}
      <div className="p-6 bg-slate-900/80 backdrop-blur-md border-t border-white/5">
        <div className="flex items-center justify-between text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">
           <div className="flex items-center space-x-3">
             <i className="fas fa-microchip text-emerald-500/50"></i>
             <span>Dorm G Sub-Network Active</span>
           </div>
           <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-emerald-500/50">Encryption: AES-P2P</span>
             </div>
             <div className="h-3 w-[1px] bg-white/10"></div>
             <span>Relays Found: {peers.length}</span>
           </div>
        </div>
      </div>
    </div>
  );
};
