import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'light' | 'dark';
  className?: string;
}

export default function Spinner({
  size = 'md',
  variant = 'primary',
  className = '',
  ...props
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const variantClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    light: 'text-light-100',
    dark: 'text-dark-900 dark:text-dark-100',
  };

  return (
    <div
      className={twMerge(
        'animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
} 