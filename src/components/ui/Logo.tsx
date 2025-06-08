'use client';

import React, { useState } from 'react';
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

  console.log('[Logo] Component props:', {
    width,
    height,
    className,
    initialLogoPath
  });

  console.log('[Logo] Current state:', {
    logoPath,
    error
  });

  if (error) {
    console.error('[Logo] Error state:', error);
    return <div className={`text-red-500 ${className}`}>Logo error: {error}</div>;
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