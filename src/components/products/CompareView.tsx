'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Columns,
  List,
  Check,
  X,
  ShoppingCart,
  Star,
  Zap,
  Award,
  Plus,
  Search,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import '@/styles/compare.css';

interface ProductSpec {
  [key: string]: string;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  images?: string[];
  description?: string;
  category?: {
    name: string;
    slug: string;
  };
  specifications?: ProductSpec;
}

interface CompareViewProps {
  initialProducts: ProductItem[];
  initialView?: 'auto' | 'parallel' | 'serial';
}

export default function CompareView({ initialProducts, initialView = 'auto' }: CompareViewProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<ProductItem[]>(initialProducts);

  // Automatic view selection: <= 3 products default to parallel, > 3 default to serial
  const defaultMode = useMemo(() => {
    if (initialView === 'parallel' || initialView === 'serial') {
      return initialView;
    }
    return products.length <= 3 ? 'parallel' : 'serial';
  }, [initialView, products.length]);

  const [viewMode, setViewMode] = useState<'parallel' | 'serial'>(defaultMode);
  const [highlightDiffs, setHighlightDiffs] = useState<boolean>(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Live product search to add to comparison
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Identify Best Value (lowest price) & Top Rated
  const bestPriceId = useMemo(() => {
    if (products.length < 2) return null;
    return [...products].sort((a, b) => a.price - b.price)[0]?.id;
  }, [products]);

  const topRatedId = useMemo(() => {
    if (products.length < 2) return null;
    return [...products].sort((a, b) => b.rating - a.rating)[0]?.id;
  }, [products]);

  // Aggregate all unique specification keys across all compared products
  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    products.forEach((p) => {
      if (p.specifications) {
        Object.keys(p.specifications).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [products]);

  const handleAddToCart = async (productId: string) => {
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
    } finally {
      setAddingId(null);
    }
  };

  const handleRemove = (productId: string) => {
    const next = products.filter((p) => p.id !== productId);
    setProducts(next);
    const newIds = next.map((p) => p.id).join(',');
    router.replace(`/compare?ids=${newIds}&view=${viewMode}`, { scroll: false });
  };

  const handleSearchAdd = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        // Exclude products already in comparison
        const existingIds = new Set(products.map((p) => p.id));
        setSearchResults(data.products.filter((p: ProductItem) => !existingIds.has(p.id)));
      }
    } catch {
      // Ignore
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProductToAdd = (product: ProductItem) => {
    const next = [...products, product];
    setProducts(next);
    setSearchQuery('');
    setSearchResults([]);
    const newIds = next.map((p) => p.id).join(',');
    router.replace(`/compare?ids=${newIds}&view=${viewMode}`, { scroll: false });
  };

  // Helper to check if an attribute or spec differs across products
  const isDifferent = (getter: (p: ProductItem) => any) => {
    if (products.length < 2) return false;
    const firstVal = String(getter(products[0]) || '').trim().toLowerCase();
    return products.some((p) => String(getter(p) || '').trim().toLowerCase() !== firstVal);
  };

  return (
    <div className="compare-page">
      {/* Header */}
      <div className="compare-header">
        <Link href="/products" className="compare-breadcrumb">
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
        <div className="compare-title-row">
          <h1 className="compare-title">
            Hardware & Spec Comparison
            <span className="compare-badge-count">{products.length} models</span>
          </h1>
        </div>
      </div>

      {/* Control Bar: View Toggle, Filters, Search */}
      <div className="compare-controls-bar">
        <div className="compare-view-toggle">
          <button
            className={`compare-toggle-btn ${viewMode === 'parallel' ? 'active' : ''}`}
            onClick={() => setViewMode('parallel')}
            title="Side-by-side parallel columns (ideal for 2-3 products)"
          >
            <Columns size={15} /> Parallel View
          </button>
          <button
            className={`compare-toggle-btn ${viewMode === 'serial' ? 'active' : ''}`}
            onClick={() => setViewMode('serial')}
            title="Stacked serial cards (ideal for 4+ products or mobile)"
          >
            <List size={15} /> Serial View
          </button>
        </div>

        <div className="compare-filter-toggles">
          <label className="compare-checkbox-label">
            <input
              type="checkbox"
              checked={highlightDiffs}
              onChange={(e) => setHighlightDiffs(e.target.checked)}
            />
            Highlight Differences
          </label>
        </div>
      </div>

      {products.length === 0 ? (
        /* Empty State */
        <div className="compare-empty-box">
          <div className="compare-empty-title">No products selected for comparison</div>
          <p className="compare-empty-desc">
            Ask the AI assistant to compare products (e.g. &quot;compare top laptops&quot;), or choose from our featured comparisons below:
          </p>
          <div className="compare-suggestions-row">
            <Link href="/compare?ids=prod-1,prod-2&view=parallel" className="compare-suggest-btn">
              Compare Featured Laptops
            </Link>
            <Link href="/compare?ids=prod-3,prod-4&view=parallel" className="compare-suggest-btn">
              Compare Flagship Smartphones
            </Link>
            <Link href="/compare?ids=prod-5,prod-6&view=parallel" className="compare-suggest-btn">
              Compare Wireless Headphones
            </Link>
          </div>
        </div>
      ) : viewMode === 'parallel' ? (
        /* ==========================================================================
           PARALLEL VIEW (Side-by-side Columns)
           ========================================================================== */
        <div className="compare-parallel-container">
          <table className="compare-table">
            <thead className="compare-table-head">
              <tr>
                <th className="compare-attribute-col-header">
                  <div>Attributes & Specs</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'none' }}>
                    Comparing {products.length} models side-by-side
                  </div>
                </th>
                {products.map((p) => {
                  const imageSrc = p.images && p.images.length > 0 ? p.images[0] : '/placeholder.png';
                  const isBestPrice = p.id === bestPriceId;
                  const isTopRated = p.id === topRatedId;

                  return (
                    <th key={p.id} className="compare-product-col-header">
                      <div className="compare-card-top">
                        <button
                          className="compare-remove-btn"
                          onClick={() => handleRemove(p.id)}
                          title="Remove from comparison"
                          aria-label={`Remove ${p.name}`}
                        >
                          <X size={14} />
                        </button>

                        <div className="compare-img-box">
                          <img src={imageSrc} alt={p.name} />
                        </div>

                        {/* Winner Badges */}
                        <div>
                          {isBestPrice && (
                            <span className="badge-winner badge-best-price">
                              <Zap size={10} /> Best Value
                            </span>
                          )}
                          {isTopRated && (
                            <span className="badge-winner badge-top-rated">
                              <Award size={10} /> Top Rated
                            </span>
                          )}
                        </div>

                        <div className="compare-prod-brand">{p.brand}</div>
                        <Link href={`/products/${p.slug || p.id}`} className="compare-prod-name">
                          {p.name}
                        </Link>

                        <div className="compare-price-box">
                          <span className="compare-price-final">${p.price.toFixed(2)}</span>
                          {p.discountPercent && p.discountPercent > 0 && (
                            <span className="compare-price-save">{p.discountPercent}% OFF</span>
                          )}
                        </div>

                        <button
                          className="compare-btn-add"
                          onClick={() => handleAddToCart(p.id)}
                          disabled={p.stock <= 0 || addingId === p.id}
                        >
                          <ShoppingCart size={14} />
                          {addingId === p.id ? 'Adding...' : p.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* --- Overview Section --- */}
              <tr className="compare-section-header">
                <td colSpan={products.length + 1}>Overview & Key Metrics</td>
              </tr>

              <tr className={`compare-row ${highlightDiffs && isDifferent((p) => p.rating) ? 'diff-highlight' : ''}`}>
                <td className="compare-attr-label">Rating & Reviews</td>
                {products.map((p) => (
                  <td key={p.id}>
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>★ {p.rating.toFixed(1)}</span>{' '}
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      ({p.reviewCount} reviews)
                    </span>
                  </td>
                ))}
              </tr>

              <tr className={`compare-row ${highlightDiffs && isDifferent((p) => p.category?.name) ? 'diff-highlight' : ''}`}>
                <td className="compare-attr-label">Category</td>
                {products.map((p) => (
                  <td key={p.id}>{p.category?.name || 'Hardware'}</td>
                ))}
              </tr>

              <tr className={`compare-row ${highlightDiffs && isDifferent((p) => p.stock > 0) ? 'diff-highlight' : ''}`}>
                <td className="compare-attr-label">Inventory Status</td>
                {products.map((p) => (
                  <td key={p.id}>
                    {p.stock > 0 ? (
                      <span style={{ color: '#34d399', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> In Stock ({p.stock} units)
                      </span>
                    ) : (
                      <span style={{ color: '#f87171', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <X size={14} /> Out of Stock
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* --- Technical Specifications Section --- */}
              {allSpecKeys.length > 0 && (
                <>
                  <tr className="compare-section-header">
                    <td colSpan={products.length + 1}>Technical Specifications</td>
                  </tr>

                  {allSpecKeys.map((key) => {
                    const diff = isDifferent((p) => p.specifications?.[key]);
                    return (
                      <tr key={key} className={`compare-row ${highlightDiffs && diff ? 'diff-highlight' : ''}`}>
                        <td className="compare-attr-label">{key}</td>
                        {products.map((p) => (
                          <td key={p.id} style={{ color: p.specifications?.[key] ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {p.specifications?.[key] || '—'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* ==========================================================================
           SERIAL VIEW (Stacked Cards)
           ========================================================================== */
        <div className="compare-serial-container">
          {products.map((p, idx) => {
            const imageSrc = p.images && p.images.length > 0 ? p.images[0] : '/placeholder.png';
            const isBestPrice = p.id === bestPriceId;
            const isTopRated = p.id === topRatedId;

            return (
              <div key={p.id} className="compare-serial-card">
                {/* Media Column */}
                <div className="compare-serial-media">
                  <div className="compare-serial-img-wrap">
                    <img src={imageSrc} alt={p.name} />
                  </div>
                  <div>
                    {isBestPrice && (
                      <span className="badge-winner badge-best-price">
                        <Zap size={10} /> Best Value
                      </span>
                    )}
                    {isTopRated && (
                      <span className="badge-winner badge-top-rated">
                        <Award size={10} /> Top Rated
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    ★ <strong style={{ color: '#fbbf24' }}>{p.rating.toFixed(1)}</strong> ({p.reviewCount} customer reviews)
                  </div>
                  <div>
                    {p.stock > 0 ? (
                      <span style={{ color: '#34d399', fontSize: '0.8125rem', fontWeight: 600 }}>
                        ✓ In Stock ({p.stock} available)
                      </span>
                    ) : (
                      <span style={{ color: '#f87171', fontSize: '0.8125rem', fontWeight: 600 }}>
                        ✗ Currently Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Details & Specifications Column */}
                <div className="compare-serial-details">
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-accent)', textTransform: 'uppercase' }}>
                      Model #{idx + 1} • {p.brand}
                    </span>
                    <Link href={`/products/${p.slug || p.id}`} className="compare-serial-title" style={{ display: 'block', marginTop: '2px' }}>
                      {p.name}
                    </Link>
                  </div>

                  {p.description && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {p.description}
                    </p>
                  )}

                  {/* Key Specifications Grid */}
                  {p.specifications && Object.keys(p.specifications).length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Technical Specifications
                      </div>
                      <div className="compare-specs-grid">
                        {Object.entries(p.specifications).map(([k, v]) => (
                          <div key={k} className="compare-spec-item">
                            <div className="compare-spec-label">{k}</div>
                            <div className="compare-spec-val">{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing & Actions Column */}
                <div className="compare-serial-actions">
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price</div>
                    <div className="compare-price-final">${p.price.toFixed(2)}</div>
                    {p.discountPercent && p.discountPercent > 0 && (
                      <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 700, marginTop: '2px' }}>
                        Save {p.discountPercent}%
                      </div>
                    )}
                  </div>

                  <button
                    className="compare-btn-add"
                    onClick={() => handleAddToCart(p.id)}
                    disabled={p.stock <= 0 || addingId === p.id}
                  >
                    <ShoppingCart size={14} />
                    {addingId === p.id ? 'Adding...' : p.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>

                  <Link
                    href={`/products/${p.slug || p.id}`}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '8px',
                      fontSize: '0.8125rem',
                      color: 'var(--brand-primary)',
                      fontWeight: 600,
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    View Full Details
                  </Link>

                  <button
                    onClick={() => handleRemove(p.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    Remove from comparison
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Selector Bar */}
      <div className="compare-add-bar">
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="compare-add-input"
          placeholder="Search and add another product to this comparison..."
          value={searchQuery}
          onChange={(e) => handleSearchAdd(e.target.value)}
        />
        {isSearching && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Searching...</span>}
      </div>

      {/* Search results popup */}
      {searchResults.length > 0 && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            marginTop: '8px',
            padding: '8px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {searchResults.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectProductToAdd(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{item.name}</span>{' '}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({item.brand})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.875rem' }}>
                  ${item.price.toFixed(2)}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--brand-accent)',
                    fontWeight: 600,
                  }}
                >
                  <Plus size={12} /> Add
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
