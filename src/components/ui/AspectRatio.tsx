import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto';
  className?: string;
}

export default function AspectRatio({
  ratio = 'auto',
  className = '',
  ...props
}: AspectRatioProps) {
  const ratioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: 'aspect-auto',
  };

  return (
    <div
      className={twMerge(
        'relative w-full',
        ratioClasses[ratio],
        className
      )}
      {...props}
    />
  );
} 