import React from 'react';
import { notFound } from 'next/navigation';
import { getProductByIdOrSlug, getRecommendations } from '@/lib/services/productService';
import ProductDetailClient from './ProductDetailClient';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const revalidate = 0;

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const result = await getProductByIdOrSlug(params.id);

  if (!result.success || !result.product) {
    notFound();
  }

  const product = result.product;
  const recommendationsResult = await getRecommendations(product.id, product.category?.slug, 4);
  const recommendations = recommendationsResult.recommendations || [];

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link> &gt;{' '}
        <Link href="/products" style={{ color: 'var(--text-secondary)' }}>Catalog</Link> &gt;{' '}
        <Link href={`/products?category=${product.category?.slug}`} style={{ color: 'var(--text-secondary)' }}>
          {product.category?.name}
        </Link>{' '}
        &gt; <span>{product.name}</span>
      </div>

      {/* Interactive Detail Section */}
      <ProductDetailClient product={product} />

      {/* Related Products Recommendations */}
      {recommendations.length > 0 && (
        <div style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Sparkles size={20} color="#38bdf8" />
            <h2 className="h2" style={{ color: '#f8fafc' }}>
              Similar & Complementary Gear
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
            }}
          >
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
