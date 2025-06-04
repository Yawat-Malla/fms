import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import NextLink from 'next/link';

interface LinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
}

export default function Link({
  href,
  className = '',
  ...props
}: LinkProps) {
  return (
    <NextLink
      href={href}
      className={twMerge(
        'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300',
        'underline-offset-4 hover:underline',
        className
      )}
      {...props}
    />
  );
} 