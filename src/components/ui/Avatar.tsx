import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({ name, imageUrl, size = 'md', className = '' }: AvatarProps) {
  // Get initials from name
  const initials = name && typeof name === 'string'
    ? name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?';

  // Base classes for the avatar container
  const baseClasses = 'rounded-full flex items-center justify-center bg-dark-600 text-dark-100';
  
  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  // If we have an image URL, show the image
  if (imageUrl) {
    return (
      <div className={`${baseClasses} ${sizeClasses[size]} ${className} overflow-hidden`}>
        <img
          src={imageUrl}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Otherwise show initials
  return (
    <div className={`${baseClasses} ${sizeClasses[size]} ${className}`}>
      <span>{initials}</span>
    </div>
  );
} 