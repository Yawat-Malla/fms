import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export default function Alert({
  children,
  variant = 'primary',
  className = '',
  ...props
}: AlertProps) {
  const variantClasses = {
    primary: 'bg-primary-50 dark:bg-primary-900/50 text-primary-800 dark:text-primary-100 border-primary-200 dark:border-primary-800',
    success: 'bg-success-50 dark:bg-success-900/50 text-success-800 dark:text-success-100 border-success-200 dark:border-success-800',
    warning: 'bg-warning-50 dark:bg-warning-900/50 text-warning-800 dark:text-warning-100 border-warning-200 dark:border-warning-800',
    danger: 'bg-danger-50 dark:bg-danger-900/50 text-danger-800 dark:text-danger-100 border-danger-200 dark:border-danger-800',
    info: 'bg-info-50 dark:bg-info-900/50 text-info-800 dark:text-info-100 border-info-200 dark:border-info-800',
  };

  return (
    <div
      className={twMerge(
        'p-4 rounded-lg border',
        variantClasses[variant],
        className
      )}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
} 