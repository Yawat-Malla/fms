'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const DEFAULT_LOGO = '/nepal-emblem.png';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  initialLogoPath?: string;
}

export default function Logo({ 
  width = 80, 
  height = 80, 
  className = '',
  initialLogoPath = DEFAULT_LOGO 
}: LogoProps) {
  const [logoPath, setLogoPath] = useState<string>(initialLogoPath);
  const [error, setError] = useState<string | null>(null);

  // Update logoPath when initialLogoPath changes
  useEffect(() => {
    console.log('[Logo] InitialLogoPath changed:', initialLogoPath);
    setLogoPath(initialLogoPath);
    setError(null);
  }, [initialLogoPath]);

  console.log('[Logo] Rendering with:', {
    width,
    height,
    className,
    logoPath,
    error
  });

  if (error) {
    console.error('[Logo] Error state:', error);
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        <Image
          src={DEFAULT_LOGO}
          alt="Default Site Logo"
          width={width}
          height={height}
          className={className}
          priority
          unoptimized
        />
      </div>
    );
  }
  
  return (
    <div className="relative" style={{ width, height }}>
      <Image
        src={logoPath}
        alt="Site Logo"
        width={width}
        height={height}
        className={className}
        onError={(e) => {
          console.error('[Logo] Image load error:', {
            path: logoPath,
            error: e
          });
          setLogoPath(DEFAULT_LOGO);
          setError('Failed to load logo image');
        }}
        onLoad={() => {
          console.log('[Logo] Image loaded successfully:', {
            path: logoPath,
            dimensions: { width, height }
          });
        }}
        priority
        unoptimized
      />
    </div>
  );
} 