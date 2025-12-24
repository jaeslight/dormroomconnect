
import React from 'react';
import { StoreButtons } from './StoreButtons';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
            D
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-800">Dorm Room Connect 🇳🇬</span>
        </div>
        <button 
          onClick={onEnter}
          className="bg-emerald-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
        >
          Open App
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between">
        <div className="lg:w-1/2 text-left space-y-8 z-10">
          <div className="inline-block bg-emerald-100 text-emerald-800 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
            Campus Social Network
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
            No Internet, <br/>
            No WiFi, <br/>
            <span className="text-emerald-600">No Problem. 😎</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-lg">
            Stay connected with your campus even when the network fails. 
            Dorm Room Connect uses proprietary offline sync to keep the vibes flowing.
          </p>
          <StoreButtons />
          <div className="flex items-center space-x-4 pt-4 text-sm text-gray-500 font-medium">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <img key={i} className="w-8 h-8 rounded-full border-2 border-white" src={`https://picsum.photos/100/100?random=${i}`} alt="user" />
              ))}
            </div>
            <span>Joined by 50k+ Nigerian students</span>
          </div>
        </div>

        <div className="lg:w-1/2 mt-16 lg:mt-0 relative">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
          <div className="relative glass p-4 rounded-3xl border-gray-200 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://picsum.photos/800/1200?campus" 
              className="rounded-2xl w-full h-[500px] object-cover" 
              alt="App Interface"
            />
            <div className="absolute top-1/2 -left-8 bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-3 border border-gray-100 animate-bounce">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                <i className="fas fa-bolt text-sm"></i>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500">OFFLINE MODE</p>
                <p className="text-sm font-bold">Always Active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">Built for the Naija Campus Life</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Optimized for low data, poor coverage, and maximum fun. Stay in the loop without breaking the bank.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="fa-wifi-slash"
              title="Mesh Connectivity"
              description="Connect with dorm mates nearby via Bluetooth Mesh when the internet goes out."
              color="bg-blue-500"
            />
            <FeatureCard 
              icon="fa-bolt"
              title="Data Lite"
              description="Proprietary compression that saves up to 80% data on images and videos."
              color="bg-emerald-500"
            />
            <FeatureCard 
              icon="fa-university"
              title="Campus Hubs"
              description="Dedicated channels for UNILAG, UI, OAU, ABU, and every top school in Nigeria."
              color="bg-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-6 md:mb-0">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-bold">D</div>
            <span className="font-bold">Dorm Room Connect</span>
          </div>
          <div className="flex space-x-8 text-gray-500 font-medium">
            <a href="#" className="hover:text-emerald-600">Privacy</a>
            <a href="#" className="hover:text-emerald-600">Terms</a>
            <a href="#" className="hover:text-emerald-600">Campus Partners</a>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400 text-sm">
          © 2024 DormRoomConnect.xyz. All rights reserved. Made with 🇳🇬 for the world.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string, title: string, description: string, color: string }> = ({ icon, title, description, color }) => (
  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);
