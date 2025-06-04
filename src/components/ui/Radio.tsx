import { InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="radio"
            className={twMerge(
              'w-4 h-4',
              'text-primary-600 dark:text-primary-500',
              'focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500',
              'border-2 border-light-300 dark:border-dark-600',
              'bg-light-100 dark:bg-dark-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-danger-500 dark:border-danger-500',
              className
            )}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-2">
            <label
              htmlFor={props.id}
              className={twMerge(
                'text-sm font-medium',
                'text-dark-900 dark:text-light-100',
                props.disabled && 'opacity-50'
              )}
            >
              {label}
            </label>
            {error && (
              <p className="mt-1 text-sm text-danger-600 dark:text-danger-500">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export default Radio; 