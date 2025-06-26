'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const DEFAULT_LOGO = '/nepal-emblem.png';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  logoPath?: string;  
}

export default function Logo({ 
  width = 80, 
  height = 80, 
  className = '',
  logoPath = DEFAULT_LOGO 
}: LogoProps) {
  const [hasError, setHasError] = useState(false);
  
  // If there was an error loading the custom logo, use default
  const imageSrc = logoPath || DEFAULT_LOGO;

  return (
    <div className="relative" style={{ width, height }}>
      <Image
        src={imageSrc}
        alt="Site Logo"
        width={width}
        height={height}
        className={className}
        onError={() => {
          if (!hasError) {
            setHasError(true);
          }
        }}
        priority
        unoptimized
      />
    </div>
  );
}
