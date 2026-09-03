import React from 'react';
import Link from 'next/link';
import { getPromotions, getCategories, getRecommendations } from '@/lib/services/productService';
import ProductCard from '@/components/products/ProductCard';
import {
  ArrowRight,
  Shield,
  Bot,
  Truck,
  RotateCw,
  Sparkles,
  Award,
  Layers,
  Columns,
  Heart,
  Scissors,
} from 'lucide-react';

export const revalidate = 0; // Dynamic rendering

const COLOR_PRESETS = [
  { name: 'Crimson & Ruby Red', color: 'Red', hex: '#DC2626', dept: "Women's Tops", count: '10 Models' },
  { name: 'Royal & Navy Blue', color: 'Blue', hex: '#2563EB', dept: 'Tops & T-Shirts', count: '22 Models' },
  { name: 'Emerald & Sage Green', color: 'Green', hex: '#059669', dept: "Women's Tops", count: '9 Models' },
  { name: 'Obsidian & Jet Black', color: 'Black', hex: '#111827', dept: 'Tees & Denim', count: '9 Models' },
  { name: 'Supima & Pearl White', color: 'White', hex: '#F8FAFC', dept: "Men's Luxury Tees", count: '8 Models' },
];

export default async function HomePage() {
  const [promotions, categoriesData, recommendedData] = await Promise.all([
    getPromotions(),
    getCategories(),
    getRecommendations(undefined, undefined, 4),
  ]);

  const categories = categoriesData.categories || [];
  const featured = promotions.featuredProducts || [];
  const discounted = promotions.discountedProducts || [];
  const recommended = recommendedData.recommendations || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '72px 0 54px 0',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.12) 0%, rgba(9, 12, 19, 0) 70%)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '44px',
              alignItems: 'center',
            }}
          >
            {/* Left Hero Text */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 14px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.28)',
                  color: '#d4af37',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  marginBottom: '20px',
                  letterSpacing: '0.04em',
                }}
              >
                <Sparkles size={14} /> AgentBridge Atelier • WebMCP 1.0 Ready
              </div>

              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  marginBottom: '18px',
                  color: '#f8fafc',
                }}
              >
                Curated Luxury &amp; <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #c5a059 40%, #38bdf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Tailored Apparel
                </span>
              </h1>

              <p
                style={{
                  fontSize: '1.0625rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  maxWidth: '520px',
                  marginBottom: '28px',
                }}
              >
                Discover 100% Mulberry silk blouses in red, blue, and green, Supima cotton t-shirts in classic neutrals, and Japanese raw selvedge denim. Built for human elegance and natively driven by AI agents via WebMCP.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link href="/products?category=womens-tops" className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
                  Women&apos;s Tops <ArrowRight size={18} />
                </Link>
                <Link href="/products?category=mens-tshirts" className="btn btn-secondary btn-lg">
                  Men&apos;s Luxury Tees
                </Link>
                <Link href="/compare" className="btn btn-secondary btn-lg" style={{ gap: '6px' }}>
                  <Columns size={16} /> Compare Styles
                </Link>
              </div>

              {/* Badges bar */}
              <div
                style={{
                  display: 'flex',
                  gap: '24px',
                  marginTop: '36px',
                  paddingTop: '24px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} color="#d4af37" /> Complimentary Express Shipping
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} color="#34d399" /> Certified Ethical Sourcing
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCw size={16} color="#38bdf8" /> 30-Day Atelier Guarantee
                </div>
              </div>
            </div>

            {/* Right Hero Spotlight Product */}
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
              }}
            >
              <div style={{ position: 'relative', height: '300px', backgroundColor: 'var(--bg-surface)' }}>
                <img
                  src="https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&q=80"
                  alt="Crimson Silk Charmeuse Blouse"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                  <span
                    style={{
                      background: 'rgba(212, 175, 55, 0.2)',
                      border: '1px solid #d4af37',
                      color: '#d4af37',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Atelier Spotlight
                  </span>
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#d4af37', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Aura Atelier • Women&apos;s Tops
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                  Crimson Silk Charmeuse Blouse
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                  Pure Mulberry silk charmeuse with delicate French seams, luminous ruby red luster, and tailored cuffs.
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '1.375rem', fontWeight: 800, color: '#d4af37' }}>
                      $185.00
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '8px' }}>
                      $205.00
                    </span>
                  </div>

                  <Link
                    href="/products/crimson-silk-charmeuse-blouse"
                    className="btn btn-primary btn-sm"
                    style={{ gap: '6px' }}
                  >
                    View Details <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Color Palettes Section */}
      <section className="container">
        <div style={{ marginBottom: '20px' }}>
          <h2 className="h2" style={{ color: '#f8fafc' }}>Shop by Signature Color</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Curated color palettes matching our hand-dyed silks, Pima cotton tees, and selvedge denim.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {COLOR_PRESETS.map((p) => (
            <Link
              key={p.color}
              href={`/products?color=${p.color}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: p.hex,
                  border: p.color === 'White' ? '1px solid var(--border-medium)' : 'none',
                  boxShadow: `0 0 12px ${p.hex}55`,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {p.color}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {p.count}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 className="h2" style={{ color: '#f8fafc' }}>Atelier Departments</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Explore luxury tops, essential crewnecks, and artisan denim tailored for modern living.
            </p>
          </div>
          <Link
            href="/products"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--brand-primary)',
            }}
          >
            All Apparel ({categories.reduce((acc, c) => acc + (c._count?.products || 0), 0)} pieces) <ArrowRight size={14} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                textDecoration: 'none',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '24px',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
              }}
            >
              {cat.image && (
                <img
                  src={cat.image}
                  alt={cat.name}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.45,
                    transition: 'transform 0.3s ease, opacity 0.3s ease',
                  }}
                />
              )}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to top, rgba(9, 12, 19, 0.95) 15%, rgba(9, 12, 19, 0.3) 70%, transparent 100%)',
                }}
              />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  {cat._count?.products || 0} Products
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Apparel Showcase */}
      {featured.length > 0 && (
        <section className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Award size={18} color="#d4af37" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Hand-Selected
                </span>
              </div>
              <h2 className="h2" style={{ color: '#f8fafc' }}>Featured Atelier Collection</h2>
            </div>
            <Link
              href="/products?featured=true"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-primary)' }}
            >
              View Featured <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {featured.slice(0, 8).map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Discounted / Seasonal Promos */}
      {discounted.length > 0 && (
        <section className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Sparkles size={18} color="#34d399" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Limited Atelier Promotions
                </span>
              </div>
              <h2 className="h2" style={{ color: '#f8fafc' }}>Curated Seasonal Offers</h2>
            </div>
            <Link
              href="/products?discount=true"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-primary)' }}
            >
              All Offers <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {discounted.slice(0, 4).map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* WebMCP Architecture Showcase Banner */}
      <section className="container">
        <div
          style={{
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                fontSize: '0.6875rem',
                color: '#d4af37',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '16px',
              }}
            >
              <Bot size={14} /> AI Shopping Assistant Powered by WebMCP
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '12px' }}>
              Shop via Conversational Agent or Traditional UI
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              AgentBridge exposes 34 registered WebMCP tools directly on <code style={{ color: '#d4af37' }}>document.modelContext</code>. Click the ✦ Ask AI button at bottom-right to ask the assistant to find red tops, suggest denim sizes, compare cuts, or add items to your cart.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/compare" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
                <Columns size={14} /> Compare Cuts &amp; Specs
              </Link>
              <Link href="/products" className="btn btn-secondary btn-sm">
                Browse All Apparel
              </Link>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ color: '#d4af37', marginBottom: '8px', fontWeight: 600 }}>
              // Example Agent Interactions:
            </div>
            <div style={{ color: '#94a3b8', marginBottom: '6px' }}>
              &gt; &quot;Show me red silk tops for women&quot;
            </div>
            <div style={{ color: '#34d399', marginBottom: '12px' }}>
              ✓ filter_apparel({`{ gender: "Women", color: "Red" }`})
            </div>
            <div style={{ color: '#94a3b8', marginBottom: '6px' }}>
              &gt; &quot;Compare the first two blouses on screen&quot;
            </div>
            <div style={{ color: '#38bdf8', marginBottom: '12px' }}>
              ✓ view_comparison_page({`{ productIds: [...], view: "parallel" }`})
            </div>
            <div style={{ color: '#94a3b8', marginBottom: '6px' }}>
              &gt; &quot;What size should I get for a 36-inch bust?&quot;
            </div>
            <div style={{ color: '#fbbf24' }}>
              ✓ get_apparel_size_guide({`{ category: "WomensTops" }`}) → Size M
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
