import { HTMLAttributes, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  ...props
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-dark-900/75 dark:bg-dark-900/75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className={twMerge(
            'relative transform overflow-hidden rounded-lg',
            'bg-light-100 dark:bg-dark-800',
            'text-dark-900 dark:text-light-100',
            'shadow-xl transition-all',
            'sm:my-8 sm:w-full sm:max-w-lg',
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          {...props}
        >
          {title && (
            <div className="border-b border-light-300 dark:border-dark-700 px-4 py-3">
              <h3
                id="modal-title"
                className="text-lg font-medium text-dark-900 dark:text-light-100"
              >
                {title}
              </h3>
            </div>
          )}
          <div className="px-4 py-3">{children}</div>
        </div>
      </div>
    </div>
  );
} 