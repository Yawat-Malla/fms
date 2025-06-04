import { HTMLAttributes, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({
  tabs,
  defaultTab,
  className = '',
  ...props
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className={twMerge('w-full', className)} {...props}>
      <div className="border-b border-dark-600 dark:border-dark-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={twMerge(
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-dark-900 dark:text-dark-100 hover:text-dark-900 dark:hover:text-dark-100 hover:border-dark-600 dark:hover:border-dark-700',
                tab.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
} 