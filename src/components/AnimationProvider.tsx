'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

type AnimationContextType = {
  isReducedMotion: boolean;
  enableAnimations: boolean;
  toggleAnimations: () => void;
};

const AnimationContext = createContext<AnimationContextType>({
  isReducedMotion: false,
  enableAnimations: true,
  toggleAnimations: () => {},
});

export const useAnimation = () => useContext(AnimationContext);

export default function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [enableAnimations, setEnableAnimations] = useState(true);

  // Check for user's motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setIsReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Add iOS-like touch effects to buttons and interactive elements
  useEffect(() => {
    if (!enableAnimations || isReducedMotion) return;

    const enhanceClickables = () => {
      const buttons = document.querySelectorAll('button, a, [role="button"]');
      buttons.forEach(button => {
        button.classList.add('transition-transform', 'duration-150');
        button.addEventListener('mousedown', () => {
          if (!button.classList.contains('no-animation')) {
            (button as HTMLElement).style.transform = 'scale(0.97)';
          }
        });
        button.addEventListener('mouseup', () => {
          if (!button.classList.contains('no-animation')) {
            (button as HTMLElement).style.transform = 'scale(1)';
          }
        });
        button.addEventListener('mouseleave', () => {
          if (!button.classList.contains('no-animation')) {
            (button as HTMLElement).style.transform = 'scale(1)';
          }
        });
      });
    };

    // Run once on mount
    enhanceClickables();

    // Setup a mutation observer to catch new buttons
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          enhanceClickables();
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [enableAnimations, isReducedMotion]);

  const toggleAnimations = () => {
    setEnableAnimations(prev => !prev);
  };

  return (
    <AnimationContext.Provider value={{ 
      isReducedMotion, 
      enableAnimations, 
      toggleAnimations 
    }}>
      <div className={enableAnimations && !isReducedMotion ? 'animated-app' : ''}>
        {children}
      </div>
    </AnimationContext.Provider>
  );
} 