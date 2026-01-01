'use client';

import { useState } from 'react';

export default function ProductImage({ src, alt }: { src?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div style={{ width: '20px', height: '8px', background: 'linear-gradient(to bottom, #C4A052, #9A7B3C)', borderRadius: '2px 2px 0 0' }} />
        <div style={{ width: '32px', height: '50px', background: 'linear-gradient(to bottom right, #2a2a2a, #1a1a1a)', border: '1px solid rgba(196, 160, 82, 0.3)', borderRadius: '4px' }} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="w-full h-full object-contain p-2"
    />
  );
}
