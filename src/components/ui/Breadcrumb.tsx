import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps extends HTMLAttributes<HTMLDivElement> {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({
  items,
  className = '',
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      className={twMerge('flex', className)}
      aria-label="Breadcrumb"
      {...props}
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="h-5 w-5 flex-shrink-0 text-dark-600 dark:text-dark-700"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className={twMerge(
                  'ml-2 text-sm font-medium',
                  index === items.length - 1
                    ? 'text-dark-900 dark:text-dark-100'
                    : 'text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-100'
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={twMerge(
                  'ml-2 text-sm font-medium',
                  index === items.length - 1
                    ? 'text-dark-900 dark:text-dark-100'
                    : 'text-dark-600 dark:text-dark-400'
                )}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 