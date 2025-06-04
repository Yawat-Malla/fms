import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'danger',
}: ConfirmationDialogProps) {
  const variantClasses = {
    danger: {
      button: 'bg-danger-600 hover:bg-danger-700 text-white',
      icon: 'text-danger-600 dark:text-danger-500',
    },
    warning: {
      button: 'bg-warning-600 hover:bg-warning-700 text-white',
      icon: 'text-warning-600 dark:text-warning-500',
    },
    info: {
      button: 'bg-primary-600 hover:bg-primary-700 text-white',
      icon: 'text-primary-600 dark:text-primary-500',
    },
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-light-100 dark:bg-dark-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className={twMerge(
                    'text-lg font-medium leading-6',
                    'text-dark-900 dark:text-light-100'
                  )}
                >
                  {title}
                </Dialog.Title>
                <div className="mt-2">
                  <p className={twMerge(
                    'text-sm',
                    'text-dark-700 dark:text-dark-300'
                  )}>
                    {message}
                  </p>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className={twMerge(
                      'inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium',
                      'text-dark-700 dark:text-dark-300',
                      'bg-light-200 dark:bg-dark-700',
                      'hover:bg-light-300 dark:hover:bg-dark-600',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
                    )}
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={twMerge(
                      'inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium',
                      variantClasses[variant].button,
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      'focus-visible:ring-primary-500'
                    )}
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 