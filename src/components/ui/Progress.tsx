import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  showLabel?: boolean;
  className?: string;
}

export default function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  className = '',
  ...props
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4',
  };

  const variantClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600',
  };

  return (
    <div className={twMerge('w-full', className)} {...props}>
      <div className="relative">
        <div className="overflow-hidden rounded-full bg-light-200 dark:bg-dark-700">
          <div
            className={twMerge(
              'rounded-full transition-all duration-300 ease-in-out',
              sizeClasses[size],
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 text-sm text-dark-900 dark:text-dark-100">
            {percentage.toFixed(0)}%
          </div>
        )}
      </div>
    </div>
  );
} 