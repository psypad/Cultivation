/**
 * Page Not Found Component
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e8e4dc] flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="font-serif text-4xl mb-4">404</h1>
        <p className="text-[#8a8680] mb-8">The page you seek does not exist on this path.</p>
        <Link 
          to="/" 
          className="px-8 py-3 border border-[#7c9a82]/40 text-[#7c9a82] tracking-wider text-sm uppercase hover:bg-[#7c9a82]/10 transition-colors duration-500"
        >
          Return to Start
        </Link>
      </div>
    </div>
  );
}
