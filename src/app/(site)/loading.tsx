import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-800">
      <div className="flex space-x-3">
        <span className="w-4 h-4 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
        <span className="w-4 h-4 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.18s' }}></span>
        <span className="w-4 h-4 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.36s' }}></span>
      </div>
    </div>
  );
}

// Add custom animation in globals.css if needed:
// .animate-bounce { animation: bounce 0.8s infinite alternate; }
// @keyframes bounce { 0% { transform: scale(1); } 100% { transform: scale(0.6); opacity: 0.7; } } 