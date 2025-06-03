'use client';

import { useState, useEffect } from 'react';
import Toast, { ToastProps } from './Toast';

export type ToastData = Omit<ToastProps, 'onClose'>;

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'bottom-center';
}

// Toast context and provider are defined in a separate context file
// This is just the UI container component

export default function ToastContainer({ position = 'bottom-center' }: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  const handleCloseToast = (id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className={`fixed z-50 flex flex-col gap-3 ${positionClasses[position]} pointer-events-none`}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={handleCloseToast}
        />
      ))}
    </div>
  );
} 