import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface AvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({ name, imageUrl, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [imagePath, setImagePath] = useState<string | null>(null);
  
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

  // Handle image URL changes and path construction
  useEffect(() => {
    if (imageUrl) {
      const path = imageUrl.startsWith('http') 
        ? imageUrl 
        : `${process.env.NEXT_PUBLIC_APP_URL || ''}${imageUrl}?t=${imageKey}`;
      setImagePath(path);
      console.log('Avatar - Image path constructed:', {
        originalUrl: imageUrl,
        constructedPath: path
      });
    }
  }, [imageUrl, imageKey]);

  // Reset states when imageUrl changes
  useEffect(() => {
    console.log('Avatar - Image URL changed:', {
      imageUrl,
      currentKey: imageKey
    });
    setImageError(false);
    setIsLoading(true);
    setImageKey(Date.now());
  }, [imageUrl]);

  // If we have an image URL and no error, show the image
  if (imagePath && !imageError) {
    console.log('Avatar - Rendering image:', {
      imagePath,
      isLoading,
      hasError: imageError
    });

    return (
      <div className={`${baseClasses} ${sizeClasses[size]} ${className} overflow-hidden relative`}>
        <Image
          key={imageKey}
          src={imagePath}
          alt={name || 'Avatar'}
          fill
          className={`object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          onError={(e) => {
            console.error('Avatar - Image load error:', {
              imagePath,
              error: e
            });
            setImageError(true);
          }}
          onLoad={() => {
            console.log('Avatar - Image loaded successfully:', imagePath);
            setIsLoading(false);
          }}
          unoptimized
          priority
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
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