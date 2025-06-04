import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'vertical' | 'horizontal';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Stack({
  direction = 'vertical',
  spacing = 'md',
  className = '',
  ...props
}: StackProps) {
  const directionClasses = {
    vertical: 'flex-col',
    horizontal: 'flex-row',
  };

  const spacingClasses = {
    none: 'space-y-0 space-x-0',
    sm: 'space-y-2 space-x-2',
    md: 'space-y-4 space-x-4',
    lg: 'space-y-6 space-x-6',
    xl: 'space-y-8 space-x-8',
  };

  return (
    <div
      className={twMerge(
        'flex',
        directionClasses[direction],
        spacingClasses[spacing],
        className
      )}
      {...props}
    />
  );
} 