import React from 'react';
import { compareProducts, getProducts } from '@/lib/services/productService';
import Link from 'next/link';
import { Layers, ArrowLeft } from 'lucide-react';

export const revalidate = 0;

interface ComparePageProps {
  searchParams: {
    ids?: string;
  };
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  let ids = searchParams.ids ? searchParams.ids.split(',').filter(Boolean) : [];

  if (ids.length === 0) {
    const defaultProds = await getProducts({ limit: 2 });
    ids = defaultProds.products.map((p) => p.id);
  }

  const result = await compareProducts(ids);
  const products = result.products || [];

  const allSpecKeys = Array.from(
    new Set(
      products.flatMap((p) => Object.keys(p.specifications || {}))
    )
  );

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
        <h1 className="h2" style={{ color: '#f8fafc' }}>
          Hardware Comparison ({products.length} models)
        </h1>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          No products selected for comparison.
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-surface)' }}>
                <th style={{ padding: '16px', color: 'var(--text-muted)', width: '200px' }}>Attributes</th>
                {products.map((p) => (
                  <th key={p.id} style={{ padding: '16px', minWidth: '220px' }}>
                    {p.images && p.images.length > 0 && (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '10px' }}
                      />
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-accent)', fontWeight: 600 }}>
                      {p.brand}
                    </div>
                    <Link
                      href={`/products/${p.slug}`}
                      style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}
                    >
                      {p.name}
                    </Link>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                      ${p.price.toFixed(2)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Rating</td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '14px 16px', color: 'var(--text-primary)' }}>
                    ★ {p.rating.toFixed(1)} ({p.reviewCount} reviews)
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '14px 16px', color: 'var(--text-primary)' }}>
                    {p.category?.name}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Stock Availability</td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '14px 16px', color: p.stock > 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>
                    {p.stock > 0 ? `In Stock (${p.stock} units)` : 'Out of Stock'}
                  </td>
                ))}
              </tr>

              {/* Technical Specifications Rows */}
              {allSpecKeys.map((key) => (
                <tr key={key} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>{key}</td>
                  {products.map((p) => (
                    <td key={p.id} style={{ padding: '14px 16px', color: 'var(--text-primary)' }}>
                      {p.specifications?.[key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
