import React from 'react';
import Link from 'next/link';
import { TranslatedText } from '@/components/TranslatedText';

interface BreadcrumbsProps {
  items: {
    name: string;
    path: string;
  }[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-dark-300">
      <Link
        href="/dashboard"
        className="hover:text-dark-100 transition-colors"
      >
        <TranslatedText text="Home" />
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <Link
            href={item.path}
            className={`hover:text-dark-100 transition-colors ${
              index === items.length - 1 ? 'text-dark-100' : ''
            }`}
          >
            <TranslatedText text={item.name} />
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs; 