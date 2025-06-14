import React from 'react';
import { Heart } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Heart size={24} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">🐕 Poop Tracker</h1>
            <p className="text-sm text-gray-600">Keep your pup healthy & happy</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;