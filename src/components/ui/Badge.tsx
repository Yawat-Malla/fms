import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Badge({
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-light-200 dark:bg-dark-700 text-dark-700 dark:text-light-200',
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-100',
    success: 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-100',
    warning: 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-100',
    danger: 'bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-100',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <span
      className={twMerge(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
} 