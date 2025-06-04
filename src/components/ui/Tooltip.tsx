import { HTMLAttributes, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export default function Tooltip({
  children,
  content,
  position = 'top',
  className = '',
  ...props
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  const arrowClasses = {
    top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-light-100 dark:border-t-dark-800',
    right: 'left-[-6px] top-1/2 -translate-y-1/2 border-r-light-100 dark:border-r-dark-800',
    bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-b-light-100 dark:border-b-dark-800',
    left: 'right-[-6px] top-1/2 -translate-y-1/2 border-l-light-100 dark:border-l-dark-800',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      role="tooltip"
      {...props}
    >
      {children}
      {isVisible && (
        <div
          className={twMerge(
            'absolute z-50 px-2 py-1 text-sm font-medium rounded-md shadow-lg',
            'bg-light-100 dark:bg-dark-800',
            'text-dark-900 dark:text-light-100',
            'border border-light-300 dark:border-dark-700',
            positionClasses[position],
            className
          )}
        >
          {content}
          <div
            className={twMerge(
              'absolute w-0 h-0 border-4 border-transparent',
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
} 