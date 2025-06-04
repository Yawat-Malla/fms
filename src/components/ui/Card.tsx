import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, className = '', variant = 'default', ...props }: CardProps) {
  const variantClasses = {
    default: 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 shadow-sm',
    elevated: 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 shadow-md',
    outlined: 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 border-2',
  };

  return (
    <div 
      className={twMerge(
        'rounded-lg',
        'transition-all duration-200',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 