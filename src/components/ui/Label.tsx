import { LabelHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  className?: string;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required, className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={twMerge(
          'block text-sm font-medium',
          'text-dark-900 dark:text-light-100',
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-1 text-danger-600 dark:text-danger-500">*</span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';

export default Label; 