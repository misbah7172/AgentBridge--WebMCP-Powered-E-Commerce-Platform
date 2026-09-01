'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Star, ShoppingBag, Heart, Check, Zap } from 'lucide-react';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    brand: string;
    price: number;
    discountPercent: number;
    rating: number;
    reviewCount: number;
    stock: number;
    images: string[] | string;
    category?: { name: string; slug: string } | string;
    isFeatured?: boolean;
    isPromoted?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const inWishlist = isInWishlist(product.id);

  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images)
    : [];

  const mainImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80';
  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;

  const discountedPrice = product.discountPercent > 0
    ? product.price * (1 - product.discountPercent / 100)
    : product.price;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Image Container */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '70%', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
        <Link href={`/products/${product.slug}`} style={{ position: 'absolute', inset: 0 }}>
          <img
            src={mainImage}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </Link>

        {/* Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
          {product.discountPercent > 0 && (
            <span className="badge badge-discount">
              -{product.discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="badge badge-featured">
              FEATURED
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: inWishlist ? '#ef4444' : '#f8fafc',
            cursor: 'pointer',
            zIndex: 2,
            transition: 'all 0.15s ease',
          }}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={inWishlist ? '#ef4444' : 'none'} />
        </button>
      </div>

      {/* Body Info */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {product.brand}
          </span>
          {categoryName && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {categoryName}
            </span>
          )}
        </div>

        <Link
          href={`/products/${product.slug}`}
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.35,
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b' }}>
            <Star size={13} fill="#f59e0b" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, marginLeft: '3px', color: '#f8fafc' }}>
              {product.rating.toFixed(1)}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ({product.reviewCount})
          </span>
        </div>

        {/* Pricing and Action Row */}
        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              ${discountedPrice.toFixed(2)}
            </div>
            {product.discountPercent > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                ${product.price.toFixed(2)}
              </div>
            )}
          </div>

          <button
            onClick={() => addToCart(product.id, 1)}
            disabled={product.stock === 0}
            className="btn btn-primary btn-sm"
            style={{ padding: '8px 12px', gap: '6px' }}
          >
            <ShoppingBag size={14} />
            {product.stock > 0 ? 'Add' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
