import Image from 'next/image';
import { getLogoPath } from '@/lib/config';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export async function Logo({ width = 100, height = 100, className = '' }: LogoProps) {
  const logoPath = await getLogoPath();
  
  return (
    <div className={className}>
      <Image
        src={logoPath}
        alt="Site Logo"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </div>
  );
} 