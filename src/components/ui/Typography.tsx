import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  className?: string;
}

export function H1({ className = '', ...props }: TypographyProps) {
  return (
    <h1
      className={twMerge(
        'text-4xl font-bold text-dark-900 dark:text-dark-100',
        className
      )}
      {...props}
    />
  );
}

export function H2({ className = '', ...props }: TypographyProps) {
  return (
    <h2
      className={twMerge(
        'text-3xl font-bold text-dark-900 dark:text-dark-100',
        className
      )}
      {...props}
    />
  );
}

export function H3({ className = '', ...props }: TypographyProps) {
  return (
    <h3
      className={twMerge(
        'text-2xl font-bold text-dark-900 dark:text-dark-100',
        className
      )}
      {...props}
    />
  );
}

export function H4({ className = '', ...props }: TypographyProps) {
  return (
    <h4
      className={twMerge(
        'text-xl font-bold text-dark-900 dark:text-dark-100',
        className
      )}
      {...props}
    />
  );
}

export function H5({ className = '', ...props }: TypographyProps) {
  return (
    <h5
      className={twMerge(
        'text-lg font-bold text-dark-900 dark:text-dark-100',
        className
      )}
      {...props}
    />
  );
}

export function H6({ className = '', ...props }: TypographyProps) {
  return (
    <h6
      className={twMerge(
        'text-base font-bold text-dark-900 dark:text-dark-100',
        className
      )}
      {...props}
    />
  );
}

export function P({ className = '', ...props }: TypographyProps) {
  return (
    <p
      className={twMerge(
        'text-base text-dark-900 dark:text-dark-100',
        className
      )}
      {...props}
    />
  );
}

export function Small({ className = '', ...props }: TypographyProps) {
  return (
    <small
      className={twMerge(
        'text-sm text-dark-900 dark:text-dark-100',
        className
      )}
      {...props}
    />
  );
}

export function Blockquote({ className = '', ...props }: TypographyProps) {
  return (
    <blockquote
      className={twMerge(
        'border-l-4 border-dark-600 dark:border-dark-700 pl-4 italic text-dark-900 dark:text-dark-100',
        className
      )}
      {...props}
    />
  );
}

export function Code({ className = '', ...props }: TypographyProps) {
  return (
    <code
      className={twMerge(
        'rounded bg-light-200 dark:bg-dark-700 px-1.5 py-0.5 font-mono text-sm text-dark-900 dark:text-dark-100',
        className
      )}
      {...props}
    />
  );
}

export function Pre({ className = '', ...props }: TypographyProps) {
  return (
    <pre
      className={twMerge(
        'rounded-lg bg-light-200 dark:bg-dark-700 p-4 font-mono text-sm text-dark-900 dark:text-dark-100 overflow-x-auto',
        className
      )}
      {...props}
    />
  );
} 