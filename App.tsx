
import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { AppShell } from './components/AppShell';
import { MeshSetup } from './components/MeshSetup';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'setup' | 'app' | 'loading'>('loading');
  const [userData, setUserData] = useState({ handle: '', color: '' });

  useEffect(() => {
    // Check if user already has an identity
    const savedIdentity = localStorage.getItem('dormconnect_mesh_identity');
    if (savedIdentity) {
      try {
        const parsed = JSON.parse(savedIdentity);
        if (parsed.handle && parsed.color) {
          setUserData(parsed);
          setView('app');
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved mesh identity", e);
      }
    }
    // No saved identity, go to landing page
    setView('landing');
  }, []);

  const handleMeshSetupComplete = (handle: string, color: string) => {
    setUserData({ handle, color });
    setView('app');
  };

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {view === 'landing' && (
        <LandingPage onEnter={() => setView('setup')} />
      )}
      
      {view === 'setup' && (
        <MeshSetup onComplete={handleMeshSetupComplete} />
      )}

      {view === 'app' && (
        <AppShell meshIdentity={userData} />
      )}
    </div>
  );
};

export default App;
