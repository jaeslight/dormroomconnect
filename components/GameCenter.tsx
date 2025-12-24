
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MeshPeer } from '../types';

type GameType = 'center' | 'whot' | 'ludo' | 'chess' | 'snake';

interface GameCenterProps {
  peers: MeshPeer[];
}

export const GameCenter: React.FC<GameCenterProps> = ({ peers }) => {
  const [activeGame, setActiveGame] = useState<GameType>('center');
  const [selectedPeer, setSelectedPeer] = useState<MeshPeer | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleStartGame = (game: GameType) => {
    setIsSyncing(true);
    // Simulate mesh handshake
    setTimeout(() => {
      setIsSyncing(false);
      setActiveGame(game);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden relative">
      {isSyncing && (
        <div className="absolute inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-fadeIn">
          <div className="relative">
             <div className="w-24 h-24 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
             <i className="fas fa-tower-broadcast absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600 text-xl animate-pulse"></i>
          </div>
          <p className="mt-6 font-black text-gray-900 uppercase tracking-[0.3em] text-sm">Mesh Handshake...</p>
          <p className="text-gray-500 text-xs mt-2">Connecting to {selectedPeer?.handle || 'Local Node'}</p>
        </div>
      )}

      {activeGame === 'center' && (
        <div className="p-6 animate-fadeIn overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">Nearby Players</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
              {peers.length > 0 ? peers.map(peer => (
                <button 
                  key={peer.id}
                  onClick={() => setSelectedPeer(peer)}
                  className={`flex-shrink-0 flex flex-col items-center space-y-2 p-4 rounded-3xl border-2 transition-all ${selectedPeer?.id === peer.id ? 'border-emerald-500 bg-emerald-50' : 'border-transparent bg-white shadow-sm'}`}
                >
                  <div className={`w-12 h-12 rounded-full ${peer.color} flex items-center justify-center text-white text-lg font-bold shadow-md`}>
                    {peer.handle.charAt(1).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">{peer.handle}</span>
                </button>
              )) : (
                <div className="bg-white p-4 rounded-2xl border border-dashed border-gray-200 w-full text-center">
                   <p className="text-xs text-gray-400 font-bold italic">No nodes found. Connect with someone to play Versus mode!</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
            <GameCard 
              title="Naija Whot" 
              icon="fa-layer-group" 
              color="bg-rose-500" 
              description="The ultimate Nigerian card game. Quick sync, faster plays."
              onClick={() => handleStartGame('whot')}
              hasMultiplayer={!!selectedPeer}
            />
            <GameCard 
              title="Ludo Master" 
              icon="fa-dice" 
              color="bg-amber-500" 
              description="Pro Ludo board with local mesh sync. Kick 'em out!"
              onClick={() => handleStartGame('ludo')}
              hasMultiplayer={!!selectedPeer}
            />
            <GameCard 
              title="Grand Chess" 
              icon="fa-chess-knight" 
              color="bg-blue-600" 
              description="High-fidelity strategy. Think 3 mesh-hops ahead."
              onClick={() => handleStartGame('chess')}
              hasMultiplayer={!!selectedPeer}
            />
            <GameCard 
              title="Classic Snake" 
              icon="fa-dragon" 
              color="bg-emerald-500" 
              description="Retro chaos. Versus mode enabled for peer play."
              onClick={() => handleStartGame('snake')}
              hasMultiplayer={!!selectedPeer}
            />
          </div>
        </div>
      )}

      {activeGame === 'snake' && <SnakeGame onBack={() => setActiveGame('center')} peer={selectedPeer} />}
      {activeGame === 'whot' && <WhotGame onBack={() => setActiveGame('center')} peer={selectedPeer} />}
      {activeGame === 'ludo' && <LudoGame onBack={() => setActiveGame('center')} peer={selectedPeer} />}
      {activeGame === 'chess' && <ChessGame onBack={() => setActiveGame('center')} peer={selectedPeer} />}
    </div>
  );
};

const GameCard: React.FC<{ title: string, icon: string, color: string, description: string, onClick: () => void, hasMultiplayer: boolean }> = ({ title, icon, color, description, onClick, hasMultiplayer }) => (
  <button 
    onClick={onClick}
    className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all text-left flex flex-col group active:scale-95"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform`}>
        <i className={`fas ${icon}`}></i>
      </div>
      {hasMultiplayer && (
        <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse border border-emerald-200">
          Sync Ready
        </span>
      )}
    </div>
    <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed mb-4">{description}</p>
    <div className="mt-auto flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest">
      Start Session <i className="fas fa-arrow-right ml-2 group-hover:translate-x-2 transition-transform"></i>
    </div>
  </button>
);

/* --- PRO LUDO GAME --- */
const LudoGame: React.FC<{ onBack: () => void, peer: MeshPeer | null }> = ({ onBack, peer }) => {
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [turn, setTurn] = useState<'player' | 'opponent'>('player');
  const [playerTokens, setPlayerTokens] = useState([0, 0, 0, 0]);
  const [opponentTokens, setOpponentTokens] = useState([0, 0, 0, 0]);
  const [message, setMessage] = useState('Your Turn');

  const rollDice = () => {
    if (turn !== 'player' || isRolling) return;
    setIsRolling(true);
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 10) {
        clearInterval(interval);
        const finalVal = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalVal);
        setIsRolling(false);
        handleMove(finalVal);
      }
    }, 50);
  };

  const handleMove = (val: number) => {
    setPlayerTokens(prev => {
      const next = [...prev];
      // Basic AI: Move the first token that can move and isn't finished
      const moveableTokenIndex = next.findIndex(pos => pos < 30);
      if (moveableTokenIndex !== -1) {
        next[moveableTokenIndex] = Math.min(next[moveableTokenIndex] + val, 30);
        if (next[moveableTokenIndex] === 30) setMessage(`Token ${moveableTokenIndex + 1} Home! 🎉`);
      }
      return next;
    });
    setTurn('opponent');
    setMessage(`${peer?.handle || 'Opponent'} is rolling...`);
  };

  useEffect(() => {
    if (turn === 'opponent') {
      const timer = setTimeout(() => {
        const val = Math.floor(Math.random() * 6) + 1;
        setDiceValue(val);
        setOpponentTokens(prev => {
          const next = [...prev];
          // Opponent AI: Move first available token
          const moveableTokenIndex = next.findIndex(pos => pos < 30);
          if (moveableTokenIndex !== -1) {
            next[moveableTokenIndex] = Math.min(next[moveableTokenIndex] + val, 30);
          }
          return next;
        });
        setTurn('player');
        setMessage('Your Turn');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [turn, peer]);

  return (
    <div className="flex-1 flex flex-col bg-amber-50 animate-fadeIn h-full overflow-hidden">
      <div className="p-4 flex items-center justify-between bg-white border-b border-amber-100">
        <button onClick={onBack} className="text-gray-400 hover:text-amber-600"><i className="fas fa-arrow-left"></i></button>
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Ludo Master • Mesh Sync</span>
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><i className="fas fa-dice"></i></div>
      </div>

      <div className="flex-1 p-4 flex flex-col items-center justify-center space-y-6">
        <div className="w-full max-w-[320px] aspect-square bg-white rounded-3xl shadow-2xl p-2 border-8 border-amber-100 relative grid grid-cols-11 grid-rows-11">
          <div className="col-span-4 row-span-4 bg-rose-500 rounded-xl m-1 flex items-center justify-center">
             <div className="w-2/3 h-2/3 bg-white rounded-lg flex flex-wrap p-1">
                {opponentTokens.map((pos, i) => (
                  <div key={i} className={`w-1/2 h-1/2 p-0.5`}>
                    <div className={`w-full h-full bg-rose-600 rounded-full shadow-inner ${pos === 30 ? 'opacity-20' : ''}`}></div>
                  </div>
                ))}
             </div>
          </div>
          <div className="col-span-3 row-span-4 bg-gray-50 m-1 rounded-lg flex flex-col justify-end p-1">
             <div className="text-[6px] font-black text-rose-300 text-center uppercase tracking-tighter">Opponent Track</div>
          </div>
          <div className="col-span-4 row-span-4 bg-emerald-500 rounded-xl m-1 flex items-center justify-center">
            <div className="w-2/3 h-2/3 bg-white rounded-lg flex flex-wrap p-1">
              {playerTokens.map((pos, i) => (
                <div key={i} className={`w-1/2 h-1/2 p-0.5`}>
                  <div className={`w-full h-full bg-emerald-600 rounded-full shadow-inner ${pos === 30 ? 'opacity-20' : ''}`}></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="col-start-5 col-span-3 row-start-5 row-span-3 bg-amber-200 m-1 rounded-lg flex items-center justify-center">
             <i className="fas fa-crown text-amber-600 text-xl animate-bounce"></i>
          </div>

          <div className="col-span-11 row-start-10 row-span-2 flex items-center justify-around px-4">
             <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Mesh Track Synchronized</div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
           <div className={`p-8 bg-white rounded-[2.5rem] shadow-xl border-4 ${turn === 'player' ? 'border-emerald-500' : 'border-rose-400'} transition-all ${isRolling ? 'animate-bounce' : ''}`}>
             <i className={`fas fa-dice-${['zero', 'one', 'two', 'three', 'four', 'five', 'six'][diceValue]} text-6xl ${turn === 'player' ? 'text-emerald-600' : 'text-rose-500'}`}></i>
           </div>
           <p className={`text-xs font-black uppercase tracking-[0.2em] ${turn === 'player' ? 'text-emerald-600' : 'text-rose-500'}`}>{message}</p>
        </div>

        <button 
          onClick={rollDice}
          disabled={turn !== 'player' || isRolling}
          className="w-full max-w-xs bg-emerald-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 active:scale-95 transition-all"
        >
          ROLL DICE
        </button>
      </div>
    </div>
  );
};

/* --- GRAND CHESS --- */
const ChessGame: React.FC<{ onBack: () => void, peer: MeshPeer | null }> = ({ onBack, peer }) => {
  const [board, setBoard] = useState<(string | null)[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const initBoard = useCallback(() => {
    const b = Array(8).fill(null).map(() => Array(8).fill(null));
    const mainRow = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    b[0] = mainRow.map(p => `b${p}`);
    b[1] = Array(8).fill('bp');
    b[6] = Array(8).fill('wp');
    b[7] = mainRow.map(p => `w${p}`);
    setBoard(b);
    setTurn('w');
    setMoveHistory([]);
  }, []);

  useEffect(() => initBoard(), [initBoard]);

  const handleSquareClick = (r: number, c: number) => {
    if (turn === 'b' && !isAiThinking) return; 

    if (selected) {
      const [sr, sc] = selected;
      if (sr === r && sc === c) {
        setSelected(null);
        return;
      }

      // Execute Move
      const piece = board[sr][sc];
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = piece;
      newBoard[sr][sc] = null;
      setBoard(newBoard);
      setSelected(null);
      setMoveHistory(prev => [...prev, `${piece![1].toUpperCase()}${String.fromCharCode(97+c)}${8-r}`]);
      setTurn('b');
    } else {
      const piece = board[r][c];
      if (piece && piece[0] === 'w') {
        setSelected([r, c]);
      }
    }
  };

  // Simple Chess AI for black pieces
  useEffect(() => {
    if (turn === 'b' && !peer) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const blackPieces: [number, number, string][] = [];
        board.forEach((row, r) => row.forEach((cell, c) => {
          if (cell && cell[0] === 'b') blackPieces.push([r, c, cell]);
        }));

        if (blackPieces.length > 0) {
          // AI Logic: Pick a random piece and move it randomly one row forward if possible
          const [sr, sc, piece] = blackPieces[Math.floor(Math.random() * blackPieces.length)];
          let tr = sr + 1;
          let tc = sc + (Math.random() > 0.5 ? 1 : -1);
          
          // Constrain to board
          if (tr > 7) tr = 7;
          if (tc < 0) tc = 0; if (tc > 7) tc = 7;

          const newBoard = board.map(row => [...row]);
          newBoard[tr][tc] = piece;
          newBoard[sr][sc] = null;
          setBoard(newBoard);
          setMoveHistory(prev => [...prev, `${piece[1].toUpperCase()}${String.fromCharCode(97+tc)}${8-tr}`]);
        }
        
        setIsAiThinking(false);
        setTurn('w');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [turn, peer, board]);

  const getPieceIcon = (p: string | null) => {
    if (!p) return null;
    const colorClass = p[0] === 'w' ? 'text-gray-800' : 'text-blue-600';
    const icons: any = { p: 'fa-chess-pawn', r: 'fa-chess-rook', n: 'fa-chess-knight', b: 'fa-chess-bishop', q: 'fa-chess-queen', k: 'fa-chess-king' };
    return <i className={`fas ${icons[p[1]]} ${colorClass} text-2xl drop-shadow-sm`}></i>;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 h-full overflow-hidden animate-fadeIn">
      <div className="p-4 flex items-center justify-between bg-white/5 border-b border-white/10">
        <button onClick={onBack} className="text-gray-400 hover:text-white"><i className="fas fa-arrow-left"></i></button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Grand Chess • Dorm Master</span>
        <div className="flex items-center space-x-2">
           <div className={`w-2 h-2 rounded-full ${turn === 'w' ? 'bg-white' : 'bg-blue-600'} ${isAiThinking ? 'animate-pulse' : ''}`}></div>
           <span className="text-[8px] text-white/50 font-bold uppercase tracking-widest">
             {isAiThinking ? 'AI THINKING...' : turn === 'w' ? 'WHITE TO MOVE' : 'BLACK TO MOVE'}
           </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white/5 p-2 rounded-2xl shadow-2xl border-4 border-white/10 backdrop-blur-md">
          <div className="grid grid-cols-8 grid-rows-8 w-80 h-80 border border-white/20">
            {board.map((row, r) => row.map((square, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`flex items-center justify-center transition-all ${
                  (r + c) % 2 === 0 ? 'bg-slate-200' : 'bg-slate-400'
                } ${selected?.[0] === r && selected?.[1] === c ? 'bg-blue-200 ring-4 ring-blue-500/50 z-10 scale-105 shadow-xl' : 'hover:opacity-90'}`}
              >
                {getPieceIcon(square)}
              </button>
            )))}
          </div>
        </div>

        <div className="mt-8 w-full max-w-[320px] flex space-x-4">
           <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 h-24 overflow-y-auto no-scrollbar">
              <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-2">Move Log</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {moveHistory.map((move, i) => (
                  <span key={i} className="text-[10px] text-white/60 font-mono">
                    {i % 2 === 0 ? `${Math.floor(i/2) + 1}. ` : ''} {move}
                  </span>
                ))}
              </div>
           </div>
        </div>
      </div>

      <div className="p-4 bg-black/40 text-center">
         <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Handshake Latency: 12ms • {peer ? 'Peer Relay' : 'Local AI Engine'}</p>
      </div>
    </div>
  );
};

/* --- SNAKE VERSUS --- */
const SnakeGame: React.FC<{ onBack: () => void, peer: MeshPeer | null }> = ({ onBack, peer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [peerScore, setPeerScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState('Wait for peer...');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let s1 = [{ x: 5, y: 10 }];
    let s2 = [{ x: 15, y: 10 }];
    let food = { x: 10, y: 10 };
    let d1 = { x: 1, y: 0 };
    let d2 = { x: -1, y: 0 };
    
    const gridSize = 15;
    const tc = canvas.width / gridSize;

    const draw = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for(let i=0; i<tc; i++) {
        ctx.beginPath(); ctx.moveTo(i*gridSize, 0); ctx.lineTo(i*gridSize, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i*gridSize); ctx.lineTo(canvas.width, i*gridSize); ctx.stroke();
      }

      // P1 (Emerald)
      ctx.fillStyle = '#10b981';
      s1.forEach(p => ctx.fillRect(p.x*gridSize+1, p.y*gridSize+1, gridSize-2, gridSize-2));
      
      // P2 (Rose)
      ctx.fillStyle = '#f43f5e';
      s2.forEach(p => ctx.fillRect(p.x*gridSize+1, p.y*gridSize+1, gridSize-2, gridSize-2));

      // Food (Amber)
      ctx.fillStyle = '#f59e0b';
      ctx.shadowBlur = 10; ctx.shadowColor = '#f59e0b';
      ctx.beginPath(); ctx.arc(food.x*gridSize+gridSize/2, food.y*gridSize+gridSize/2, gridSize/3, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    };

    const update = () => {
      const h1 = { x: s1[0].x + d1.x, y: s1[0].y + d1.y };
      const h2 = { x: s2[0].x + d2.x, y: s2[0].y + d2.y };

      if (h1.x < 0 || h1.x >= tc || h1.y < 0 || h1.y >= tc) return 'YOU CRASHED';
      if (h2.x < 0 || h2.x >= tc || h2.y < 0 || h2.y >= tc) return `${peer?.handle || 'AI'} CRASHED`;

      s1.unshift(h1);
      if (h1.x === food.x && h1.y === food.y) {
        setScore(s => s + 10);
        food = { x: Math.floor(Math.random()*tc), y: Math.floor(Math.random()*tc) };
      } else s1.pop();

      s2.unshift(h2);
      if (h2.x === food.x && h2.y === food.y) {
        setPeerScore(s => s + 10);
        food = { x: Math.floor(Math.random()*tc), y: Math.floor(Math.random()*tc) };
      } else s2.pop();

      // Simple AI for s2
      if (!peer || Math.random() > 0.8) {
        if (food.x > h2.x) d2 = { x: 1, y: 0 };
        else if (food.x < h2.x) d2 = { x: -1, y: 0 };
        else if (food.y > h2.y) d2 = { x: 0, y: 1 };
        else d2 = { x: 0, y: -1 };
      }

      return null;
    };

    const loop = setInterval(() => {
      const err = update();
      if (err) { setGameOver(true); setStatus(err); clearInterval(loop); }
      draw();
    }, 150);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && d1.y === 0) d1 = { x: 0, y: -1 };
      if (e.key === 'ArrowDown' && d1.y === 0) d1 = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft' && d1.x === 0) d1 = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && d1.x === 0) d1 = { x: 1, y: 0 };
    };

    window.addEventListener('keydown', handleKey);
    return () => { clearInterval(loop); window.removeEventListener('keydown', handleKey); };
  }, [peer]);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-full overflow-hidden">
      <div className="p-4 flex items-center justify-between bg-black border-b border-white/5">
        <button onClick={onBack} className="text-white/40"><i className="fas fa-arrow-left"></i></button>
        <div className="flex space-x-8">
           <div className="text-center">
              <p className="text-[8px] font-black text-emerald-400 uppercase">You</p>
              <p className="text-lg font-black text-white">{score}</p>
           </div>
           <div className="text-center">
              <p className="text-[8px] font-black text-rose-500 uppercase">{peer?.handle || 'Peer'}</p>
              <p className="text-lg font-black text-white">{peerScore}</p>
           </div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="relative p-1 bg-white/5 rounded-[2rem] border-4 border-white/10">
          <canvas ref={canvasRef} width={300} height={300} className="rounded-2xl" />
          
          {gameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-8 text-center z-50 animate-fadeIn">
               <h3 className="text-2xl font-black text-white uppercase mb-2">{status}</h3>
               <button onClick={() => window.location.reload()} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-900/40">Rematch</button>
            </div>
          )}
        </div>

        <div className="mt-8 flex space-x-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
           <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Mesh Versus Active</p>
        </div>
      </div>
    </div>
  );
};

/* --- WHOT GAME --- */
interface Card {
  id: string;
  number: number;
  shape: 'Circle' | 'Triangle' | 'Cross' | 'Star' | 'Square' | 'Whot';
}

const WhotGame: React.FC<{ onBack: () => void, peer: MeshPeer | null }> = ({ onBack, peer }) => {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [opponentHand, setOpponentHand] = useState<Card[]>([]);
  const [lastPlayed, setLastPlayed] = useState<Card | null>(null);
  const [turn, setTurn] = useState<'player' | 'opponent'>('player');
  const [message, setMessage] = useState('Syncing Mesh...');

  const generateCard = (): Card => {
    const shapes: Card['shape'][] = ['Circle', 'Triangle', 'Cross', 'Star', 'Square'];
    const nums = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14];
    return {
      id: Math.random().toString(),
      shape: shapes[Math.floor(Math.random()*shapes.length)],
      number: nums[Math.floor(Math.random()*nums.length)]
    };
  };

  const initGame = useCallback(() => {
    const pHand: Card[] = Array(5).fill(0).map(() => generateCard());
    const oHand: Card[] = Array(5).fill(0).map(() => generateCard());
    setPlayerHand(pHand);
    setOpponentHand(oHand);
    setLastPlayed(generateCard());
    setMessage(peer ? `Connected to ${peer.handle}` : "Solo Play against CPU");
  }, [peer]);

  useEffect(() => initGame(), [initGame]);

  const playCard = (card: Card) => {
    if (turn !== 'player') return;
    // Basic validity check (matches shape or number)
    if (lastPlayed && (card.shape === lastPlayed.shape || card.number === lastPlayed.number || card.shape === 'Whot')) {
      setLastPlayed(card);
      setPlayerHand(prev => prev.filter(c => c.id !== card.id));
      setTurn('opponent');
      setMessage(`${peer?.handle || 'AI'} is thinking...`);
    } else {
      setMessage("Invalid Move! Same Shape or Number.");
      setTimeout(() => setMessage(peer ? `Connected to ${peer.handle}` : "Your Turn"), 1500);
    }
  };

  // AI Opponent Logic for Whot
  useEffect(() => {
    if (turn === 'opponent' && !peer) {
      const timer = setTimeout(() => {
        // AI: Look for a valid card to play
        const validCard = opponentHand.find(c => 
          lastPlayed && (c.shape === lastPlayed.shape || c.number === lastPlayed.number)
        );

        if (validCard) {
          setLastPlayed(validCard);
          setOpponentHand(prev => prev.filter(c => c.id !== validCard.id));
        } else {
          // If no valid card, "draw" a card (simulated by adding one to hand)
          setOpponentHand(prev => [...prev, generateCard()]);
          setMessage("AI Draw Card!");
        }
        
        setTurn('player');
        setMessage("Your Turn");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [turn, peer, opponentHand, lastPlayed]);

  return (
    <div className="flex-1 flex flex-col bg-emerald-900 h-full overflow-hidden">
      <div className="p-4 flex items-center justify-between bg-black/20 border-b border-white/5">
        <button onClick={onBack} className="text-white/40"><i className="fas fa-arrow-left"></i></button>
        <span className="text-[10px] font-black text-white uppercase tracking-widest">Whot • {peer ? peer.handle : 'Local AI'}</span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between items-center">
        <div className="flex -space-x-8">
           {opponentHand.map((_, i) => (
             <div key={i} className="w-14 h-20 bg-emerald-800 rounded-xl border-2 border-white/20 shadow-xl rotate-[-5deg]"></div>
           ))}
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-8">
             <button 
              onClick={() => turn === 'player' && setPlayerHand(p => [...p, generateCard()])}
              className="w-20 h-28 bg-emerald-800 rounded-2xl border-4 border-white/10 flex items-center justify-center group active:scale-95 transition-all"
             >
                <span className="text-white/20 font-black text-xs uppercase rotate-[-45deg] group-hover:text-white/40">Market</span>
             </button>
             <div className="w-24 h-36 bg-white rounded-2xl shadow-2xl flex items-center justify-center transform rotate-3 animate-slideUp">
                {lastPlayed && (
                  <div className="flex flex-col items-center">
                     <span className="text-gray-900 font-black text-xl">{lastPlayed.number}</span>
                     <i className={`fas fa-${getShapeIcon(lastPlayed.shape)} text-2xl mt-1 text-gray-800`}></i>
                  </div>
                )}
             </div>
          </div>
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">{message}</p>
        </div>

        <div className="w-full flex justify-center pb-4">
           <div className="flex overflow-x-auto p-4 space-x-2 no-scrollbar max-w-full">
              {playerHand.map(card => (
                <button 
                  key={card.id}
                  onClick={() => playCard(card)}
                  className="flex-shrink-0 w-20 h-32 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center hover:-translate-y-4 transition-transform active:scale-95 border border-gray-100"
                >
                   <span className="text-gray-900 font-black text-lg">{card.number}</span>
                   <i className={`fas fa-${getShapeIcon(card.shape)} text-xl mt-1 text-gray-800`}></i>
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const getShapeIcon = (s: Card['shape']) => {
  const icons: any = { Circle: 'circle', Triangle: 'triangle-exclamation', Cross: 'plus', Star: 'star', Square: 'square', Whot: 'clover' };
  return icons[s];
};
