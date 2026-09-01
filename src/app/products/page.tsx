import React from 'react';
import { getProducts, getCategories } from '@/lib/services/productService';
import ProductCard from '@/components/products/ProductCard';
import FilterSidebar from '@/components/products/FilterSidebar';
import Link from 'next/link';
import { Search, ChevronDown, Layers, ArrowUpDown } from 'lucide-react';

export const revalidate = 0;

interface ProductsPageProps {
  searchParams: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    inStock?: string;
    featured?: string;
    promoted?: string;
    sort?: string;
    page?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const query = searchParams.q;
  const category = searchParams.category;
  const brand = searchParams.brand;
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const minRating = searchParams.minRating ? Number(searchParams.minRating) : undefined;
  const inStockOnly = searchParams.inStock === 'true';
  const isFeatured = searchParams.featured === 'true' ? true : undefined;
  const isPromoted = searchParams.promoted === 'true' ? true : undefined;
  const sort = searchParams.sort || 'popularity';
  const page = searchParams.page ? Number(searchParams.page) : 1;

  const [productsData, categoriesData] = await Promise.all([
    getProducts({
      query,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      isFeatured,
      isPromoted,
      sort,
      page,
      limit: 12,
    }),
    getCategories(),
  ]);

  const { products, total, totalPages } = productsData;
  const categories = categoriesData.categories || [];

  const getSortUrl = (newSort: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    if (minPrice) params.set('minPrice', String(minPrice));
    if (maxPrice) params.set('maxPrice', String(maxPrice));
    if (minRating) params.set('minRating', String(minRating));
    if (inStockOnly) params.set('inStock', 'true');
    params.set('sort', newSort);
    return `/products?${params.toString()}`;
  };

  const getPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    if (minPrice) params.set('minPrice', String(minPrice));
    if (maxPrice) params.set('maxPrice', String(maxPrice));
    if (minRating) params.set('minRating', String(minRating));
    if (inStockOnly) params.set('inStock', 'true');
    if (sort) params.set('sort', sort);
    params.set('page', String(newPage));
    return `/products?${params.toString()}`;
  };

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      {/* Breadcrumb / Title Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link> &gt; <span>Catalog</span>
          {category && <span style={{ textTransform: 'capitalize' }}> &gt; {category}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="h2" style={{ color: '#f8fafc' }}>
              {query ? `Search: "${query}"` : category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'All Hardware & Systems'}
            </h1>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Showing {products.length} of {total} products
            </div>
          </div>

          {/* Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown size={14} /> Sort By:
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { label: 'Popularity', value: 'popularity' },
                { label: 'Price: Low-High', value: 'price_asc' },
                { label: 'Price: High-Low', value: 'price_desc' },
                { label: 'Top Rating', value: 'rating' },
                { label: 'Top Discount', value: 'discount' },
              ].map((s) => {
                const isActive = sort === s.value;
                return (
                  <Link
                    key={s.value}
                    href={getSortUrl(s.value)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: isActive ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                      color: isActive ? '#93c5fd' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    {s.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <FilterSidebar categories={categories} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {products.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '60px 24px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <Search size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                No matching hardware found
              </div>
              <p style={{ fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 20px' }}>
                Try adjusting your search query, clearing filters, or browsing other categories.
              </p>
              <Link href="/products" className="btn btn-primary btn-sm">
                Reset All Filters
              </Link>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '20px',
                  marginBottom: '36px',
                }}
              >
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => {
                    const isCurrent = pNum === page;
                    return (
                      <Link
                        key={pNum}
                        href={getPageUrl(pNum)}
                        style={{
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--radius-md)',
                          border: isCurrent ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                          backgroundColor: isCurrent ? 'var(--brand-primary)' : 'var(--bg-card)',
                          color: isCurrent ? '#ffffff' : 'var(--text-primary)',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                        }}
                      >
                        {pNum}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
