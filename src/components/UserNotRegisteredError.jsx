/**
 * User Not Registered Error Component
 */

import React from 'react';

export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e8e4dc] flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl mb-4">Registration Required</h1>
        <p className="text-[#8a8680] mb-8">
          You need to be registered to access this application.
        </p>
      </div>
    </div>
  );
}
