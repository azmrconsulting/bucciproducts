'use client';

import { useState } from 'react';
import Image from 'next/image';

type BottleType = 'serum' | 'tall' | 'wide' | 'set';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  bottleType?: BottleType;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

function PlaceholderBottle({ bottleType, isHoverable = true }: { bottleType: BottleType; isHoverable?: boolean }) {
  const hoverClass = isHoverable ? 'group-hover:border-gold' : '';

  if (bottleType === 'set') {
    return (
      <div className="flex items-end justify-center gap-2">
        <div className="flex flex-col items-center">
          <div className="w-[14px] h-[7px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px] relative">
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[3px] h-[8px] bg-gold rounded-[1px]" />
          </div>
          <div className={`w-[22px] h-[60px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded transition-all duration-400 ${hoverClass}`} />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[14px] h-[7px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px] relative">
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[3px] h-[8px] bg-gold rounded-[1px]" />
          </div>
          <div className={`w-[22px] h-[60px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded transition-all duration-400 ${hoverClass}`} />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[14px] h-[7px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px]" />
          <div className={`w-[25px] h-[45px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded transition-all duration-400 ${hoverClass}`} />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[16px] h-[7px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px]" />
          <div className={`w-[32px] h-[36px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded-md transition-all duration-400 ${hoverClass}`} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-[25px] h-[12px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[3px] ${
          bottleType === 'tall' ? 'relative' : ''
        }`}
      >
        {bottleType === 'tall' && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[5px] h-[15px] bg-gold rounded-[2px]" />
        )}
      </div>
      <div
        className={`bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 transition-all duration-400 ${hoverClass} ${
          isHoverable ? 'group-hover:shadow-[0_0_30px_rgba(201,169,98,0.2)]' : ''
        } ${
          bottleType === 'serum'
            ? 'w-[45px] h-[80px] rounded'
            : bottleType === 'tall'
            ? 'w-[40px] h-[110px] rounded'
            : 'w-[60px] h-[65px] rounded-md'
        }`}
      />
    </div>
  );
}

export default function ProductImage({
  src,
  alt,
  bottleType = 'tall',
  priority = false,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  className = '',
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 w-full h-full flex items-center justify-center">
        <PlaceholderBottle bottleType={bottleType} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover transition-transform duration-400 group-hover:scale-105 ${className}`}
      sizes={sizes}
      priority={priority}
      onError={() => setHasError(true)}
    />
  );
}
