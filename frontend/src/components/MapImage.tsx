'use client';

interface MapImageProps {
  src: string;
  alt: string;
}

export default function MapImage({ src, alt }: MapImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-contain p-2"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
} 