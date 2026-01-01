'use client';

import { useState } from 'react';
import Image from 'next/image';

type BottleType = 'serum' | 'tall' | 'wide' | 'set';

interface ProductDetailImageProps {
  src?: string | null;
  alt: string;
  bottleType: BottleType;
  tag?: string | null;
}

function DetailPlaceholderBottle({ bottleType }: { bottleType: BottleType }) {
  if (bottleType === 'set') {
    return (
      <div className="flex items-end justify-center gap-4 scale-[1.5]">
        {/* Bottle 1 - Tall */}
        <div className="flex flex-col items-center">
          <div className="w-[20px] h-[10px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[3px] relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[4px] h-[12px] bg-gold rounded-[2px]" />
          </div>
          <div className="w-[32px] h-[85px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded flex items-center justify-center">
            <span className="font-display text-lg text-gold/60">B</span>
          </div>
        </div>
        {/* Bottle 2 - Tall */}
        <div className="flex flex-col items-center">
          <div className="w-[20px] h-[10px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[3px] relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[4px] h-[12px] bg-gold rounded-[2px]" />
          </div>
          <div className="w-[32px] h-[85px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded flex items-center justify-center">
            <span className="font-display text-lg text-gold/60">B</span>
          </div>
        </div>
        {/* Bottle 3 - Serum */}
        <div className="flex flex-col items-center">
          <div className="w-[20px] h-[10px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[3px]" />
          <div className="w-[36px] h-[65px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded flex items-center justify-center">
            <span className="font-display text-lg text-gold/60">B</span>
          </div>
        </div>
        {/* Bottle 4 - Wide */}
        <div className="flex flex-col items-center">
          <div className="w-[24px] h-[10px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[3px]" />
          <div className="w-[48px] h-[52px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded-md flex items-center justify-center">
            <span className="font-display text-lg text-gold/60">B</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center scale-[2]">
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
        className={`bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 flex items-center justify-center ${
          bottleType === 'serum'
            ? 'w-[45px] h-[80px] rounded'
            : bottleType === 'tall'
            ? 'w-[40px] h-[110px] rounded'
            : 'w-[60px] h-[65px] rounded-md'
        }`}
      >
        <span className="font-display text-2xl text-gold/60">B</span>
      </div>
    </div>
  );
}

export default function ProductDetailImage({ src, alt, bottleType, tag }: ProductDetailImageProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative">
      <div className="aspect-square bg-gradient-to-br from-charcoal to-charcoal-light border border-gold/20 flex items-center justify-center lg:sticky lg:top-28 overflow-hidden">
        {/* Tag */}
        {tag && (
          <span className="absolute top-6 left-6 z-10 font-display text-[0.7rem] tracking-[0.15em] uppercase px-4 py-2 bg-gold text-black">
            {tag}
          </span>
        )}

        {/* Product Image or Placeholder Bottle */}
        {src && !imageError ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain p-4"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <DetailPlaceholderBottle bottleType={bottleType} />
        )}

        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gold/10 rounded-full blur-[80px] -z-10" />
      </div>
    </div>
  );
}
