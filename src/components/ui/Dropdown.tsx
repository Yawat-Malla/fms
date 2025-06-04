import { HTMLAttributes, useState, useRef, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  trigger: React.ReactNode;
  items: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
  }[];
  align?: 'left' | 'right';
  className?: string;
}

export default function Dropdown({
  trigger,
  items,
  align = 'left',
  className = '',
  ...props
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} {...props}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={twMerge(
            'absolute z-50 mt-2 w-48 rounded-md shadow-lg',
            'bg-light-100 dark:bg-dark-800 border border-dark-600 dark:border-dark-700',
            alignClasses[align],
            className
          )}
        >
          <div className="py-1" role="menu">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={twMerge(
                  'w-full px-4 py-2 text-left text-sm',
                  'text-dark-900 dark:text-dark-100',
                  'hover:bg-light-200 dark:hover:bg-dark-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center gap-2'
                )}
                role="menuitem"
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 