'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type BottleType = 'serum' | 'tall' | 'wide' | 'set';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    priceCents: number;
    category: string | null;
    tags: string[];
    isFeatured: boolean;
    images: { url: string; altText: string | null }[];
  };
}

function getBottleType(category: string | null): BottleType {
  switch (category) {
    case 'oils':
      return 'serum';
    case 'shampoo':
    case 'conditioner':
      return 'tall';
    case 'styling':
      return 'wide';
    case 'sets':
      return 'set';
    default:
      return 'tall';
  }
}

function getProductTag(product: { tags: string[]; isFeatured: boolean }): string | null {
  if (product.tags.includes('bestseller')) return 'Bestseller';
  if (product.tags.includes('new')) return 'New';
  if (product.isFeatured) return 'Featured';
  return null;
}

function PlaceholderBottle({ bottleType }: { bottleType: BottleType }) {
  if (bottleType === 'set') {
    return (
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="flex items-end justify-center gap-2">
          <div className="flex flex-col items-center">
            <div className="w-[14px] h-[7px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px] relative">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[3px] h-[8px] bg-gold rounded-[1px]" />
            </div>
            <div className="w-[22px] h-[60px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded transition-all duration-400 group-hover:border-gold" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[14px] h-[7px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px] relative">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[3px] h-[8px] bg-gold rounded-[1px]" />
            </div>
            <div className="w-[22px] h-[60px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded transition-all duration-400 group-hover:border-gold" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[14px] h-[7px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px]" />
            <div className="w-[25px] h-[45px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded transition-all duration-400 group-hover:border-gold" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[16px] h-[7px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px]" />
            <div className="w-[32px] h-[36px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded-md transition-all duration-400 group-hover:border-gold" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10">
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
          className={`bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 transition-all duration-400 group-hover:border-gold group-hover:shadow-[0_0_30px_rgba(201,169,98,0.2)] ${
            bottleType === 'serum'
              ? 'w-[45px] h-[80px] rounded'
              : bottleType === 'tall'
              ? 'w-[40px] h-[110px] rounded'
              : 'w-[60px] h-[65px] rounded-md'
          }`}
        />
      </div>
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const bottleType = getBottleType(product.category);
  const tag = getProductTag(product);
  const price = (product.priceCents / 100).toFixed(0);
  const imageUrl = product.images[0]?.url;
  const imageAlt = product.images[0]?.altText || product.name;

  return (
    <article className="card group">
      {/* Product Image */}
      <div className="relative aspect-square bg-gradient-to-br from-charcoal to-charcoal-light flex items-center justify-center overflow-hidden">
        {tag && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 font-display text-[0.55rem] sm:text-[0.6rem] tracking-[0.1em] uppercase px-2 py-1 sm:px-2.5 sm:py-1 bg-gold text-black">
            {tag}
          </span>
        )}
        {/* Product Image or Placeholder Bottle */}
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-400 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <PlaceholderBottle bottleType={bottleType} />
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 lg:p-5">
        <h3 className="font-display text-sm sm:text-base lg:text-lg font-medium mb-1 sm:mb-2 text-ivory line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray mb-2 sm:mb-3 line-clamp-2 hidden sm:block">
          {product.shortDescription}
        </p>
        <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-white/5">
          <span className="font-display text-base sm:text-lg text-gold">
            ${price}
          </span>
          <Link href={`/products/${product.slug}`} className="btn-small">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
