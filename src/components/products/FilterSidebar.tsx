'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Filter, RotateCcw, Check } from 'lucide-react';

interface FilterSidebarProps {
  categories: Array<{ id: string; name: string; slug: string; _count?: { products: number } }>;
}

const BRANDS = ['ApexTech', 'Nexus', 'Vanguard', 'SoundAura', 'SpectraView', 'Keycraft', 'LumixPro', 'Aura', 'Lumina', 'AcousticPure', 'VortexVR'];

export default function FilterSidebar({ categories }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentMinRating = searchParams.get('minRating') || '';
  const currentInStock = searchParams.get('inStock') === 'true';

  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  const applyParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 on filter
    router.push(`/products?${params.toString()}`);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    router.push('/products');
  };

  return (
    <aside
      style={{
        width: '260px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700 }}>
          <Filter size={18} color="#60a5fa" />
          <span>Filters</span>
        </div>
        <button
          onClick={handleReset}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Categories */}
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Categories
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={() => applyParam('category', null)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: !currentCategory ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: !currentCategory ? '#60a5fa' : 'var(--text-secondary)',
              fontWeight: !currentCategory ? 600 : 400,
              fontSize: '0.8125rem',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = currentCategory.toLowerCase() === cat.slug.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => applyParam('category', isSelected ? null : cat.slug)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: isSelected ? '#60a5fa' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <span>{cat.name}</span>
                {cat._count?.products !== undefined && (
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {cat._count.products}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Price Range ($)
        </div>
        <form onSubmit={handlePriceApply} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input"
              style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input"
              style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%', fontSize: '0.75rem' }}>
            Apply Price
          </button>
        </form>
      </div>

      {/* Minimum Rating Filter */}
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Customer Rating
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[4.5, 4.0, 3.5].map((rating) => {
            const isSelected = currentMinRating === String(rating);
            return (
              <button
                key={rating}
                onClick={() => applyParam('minRating', isSelected ? null : String(rating))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: isSelected ? '#60a5fa' : 'var(--text-secondary)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rating}+</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>stars</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Selection */}
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Popular Brands
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {BRANDS.map((b) => {
            const isSelected = currentBrand === b;
            return (
              <button
                key={b}
                onClick={() => applyParam('brand', isSelected ? null : b)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
                  color: isSelected ? '#93c5fd' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      {/* In Stock Only Checkbox */}
      <div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8125rem',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={(e) => applyParam('inStock', e.target.checked ? 'true' : null)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--brand-primary)' }}
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </aside>
  );
}
