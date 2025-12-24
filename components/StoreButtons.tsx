
import React from 'react';

export const StoreButtons: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <button className="flex items-center bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all border border-gray-700 shadow-lg">
        <i className="fab fa-apple text-3xl mr-3"></i>
        <div className="text-left">
          <div className="text-[10px] uppercase font-semibold leading-none">Download on the</div>
          <div className="text-xl font-bold leading-none">App Store</div>
        </div>
      </button>
      <button className="flex items-center bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all border border-gray-700 shadow-lg">
        <i className="fab fa-google-play text-2xl mr-3"></i>
        <div className="text-left">
          <div className="text-[10px] uppercase font-semibold leading-none">Get it on</div>
          <div className="text-xl font-bold leading-none">Google Play</div>
        </div>
      </button>
    </div>
  );
};
