import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  imageUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ imageUrl, name, size = 'md', className = '', ...props }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={twMerge(
        'relative flex items-center justify-center rounded-full overflow-hidden',
        'bg-primary-100 dark:bg-primary-900',
        'text-primary-600 dark:text-primary-300',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
        />
      ) : (
        <span className="font-medium">{getInitials(name)}</span>
      )}
    </div>
  );
} 