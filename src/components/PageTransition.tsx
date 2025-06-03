'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  // Handle route changes to animate between page transitions
  useEffect(() => {
    setIsAnimating(true);
    
    // Short timeout to ensure the animation plays
    const animationTimeout = setTimeout(() => {
      setDisplayChildren(children);
      setIsAnimating(false);
    }, 300);
    
    return () => clearTimeout(animationTimeout);
  }, [pathname, children]);

  return (
    <div className="page-wrapper">
      <div
        className={`
          transition-all duration-300 ease-out
          ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
        `}
      >
        {displayChildren}
      </div>
    </div>
  );
} 