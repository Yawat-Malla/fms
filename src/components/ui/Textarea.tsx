import { TextareaHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
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
        <textarea
          ref={ref}
          className={twMerge(
            'block w-full rounded-lg border-2',
            'bg-light-100 dark:bg-dark-700',
            'border-light-300 dark:border-dark-600',
            'text-dark-900 dark:text-light-100',
            'placeholder:text-dark-400 dark:placeholder:text-dark-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-danger-500 dark:border-danger-500',
            'resize-none',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea; 