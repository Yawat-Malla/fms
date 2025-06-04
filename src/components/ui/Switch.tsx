import { InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-6">
          <input
            type="checkbox"
            ref={ref}
            className="sr-only"
            {...props}
          />
          <span
            className={twMerge(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900',
              props.checked
                ? 'bg-primary-600 dark:bg-primary-500'
                : 'bg-light-200 dark:bg-dark-700',
              error && 'bg-danger-500 dark:bg-danger-500',
              className
            )}
          >
            <span
              className={twMerge(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                props.checked ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </span>
        </div>
        {label && (
          <div className="ml-3">
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

Switch.displayName = 'Switch';

export default Switch; 