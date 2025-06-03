'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-800">
      <div className="flex space-x-3">
        <span className="w-4 h-4 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
        <span className="w-4 h-4 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.18s' }}></span>
        <span className="w-4 h-4 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.36s' }}></span>
      </div>
    </div>
  );
}
