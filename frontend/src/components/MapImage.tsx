'use client';

import Image from 'next/image';

interface MapImageProps {
  src: string;
  alt: string;
}

export default function MapImage({ src, alt }: MapImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      className="w-full h-full object-contain p-2"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
} 