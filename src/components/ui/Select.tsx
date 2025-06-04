import { SelectHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className={twMerge(
              'block text-sm font-medium mb-1',
              'text-dark-900 dark:text-light-100',
              props.disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            className={twMerge(
              'block w-full rounded-lg border-2',
              'bg-light-100 dark:bg-dark-700',
              'border-light-300 dark:border-dark-600',
              'text-dark-900 dark:text-light-100',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-danger-500 dark:border-danger-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              'appearance-none',
              className
            )}
            {...props}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg
              className="h-4 w-4 text-dark-900 dark:text-light-100"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select; 