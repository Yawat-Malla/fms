import { HTMLAttributes, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  items: AccordionItem[];
  defaultOpen?: string[];
  className?: string;
}

export default function Accordion({
  items,
  defaultOpen = [],
  className = '',
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className={twMerge('w-full space-y-2', className)} {...props}>
      {items.map((item) => (
        <div
          key={item.id}
          className="border border-dark-600 dark:border-dark-700 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => !item.disabled && toggleItem(item.id)}
            disabled={item.disabled}
            className={twMerge(
              'w-full px-4 py-3 text-left flex items-center justify-between',
              'bg-light-100 dark:bg-dark-800 text-dark-900 dark:text-dark-100',
              'hover:bg-light-200 dark:hover:bg-dark-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <span className="font-medium">{item.title}</span>
            <svg
              className={twMerge(
                'w-5 h-5 transform transition-transform duration-200',
                openItems.includes(item.id) ? 'rotate-180' : ''
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {openItems.includes(item.id) && (
            <div className="px-4 py-3 bg-light-50 dark:bg-dark-900 border-t border-dark-600 dark:border-dark-700">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 