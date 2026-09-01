import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getPromotions, getCategories, getRecommendations } from '@/lib/services/productService';
import ProductCard from '@/components/products/ProductCard';
import {
  ArrowRight,
  Shield,
  Zap,
  Bot,
  Truck,
  RotateCw,
  Cpu,
  Monitor,
  Laptop,
  Smartphone,
  Headphones,
  Gamepad2,
  Camera,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';

export const revalidate = 0; // Dynamic rendering

const CATEGORY_ICONS: Record<string, any> = {
  laptops: Laptop,
  smartphones: Smartphone,
  'computer-accessories': Cpu,
  gaming: Gamepad2,
  headphones: Headphones,
  monitors: Monitor,
  cameras: Camera,
  'smart-devices': Zap,
  audio: Headphones,
};

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
          padding: '64px 0 48px 0',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.15) 0%, rgba(10, 13, 20, 0) 70%)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
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
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#93c5fd',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  marginBottom: '20px',
                }}
              >
                <Bot size={14} /> WebMCP 1.0 Agent-Ready Store
              </div>

              <h1 className="h1" style={{ marginBottom: '18px', color: '#f8fafc' }}>
                Next-Gen Computing & <br />
                <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Hardware Systems
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
                Explore precision-engineered laptops, QD-OLED displays, studio acoustics, and esports peripherals. Built for human creators and accessible via WebMCP tools.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link href="/products" className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
                  Explore Catalog <ArrowRight size={18} />
                </Link>
                <Link href="/products?category=laptops" className="btn btn-secondary btn-lg">
                  View RTX Laptops
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
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} color="#60a5fa" /> Free Worldwide Delivery
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} color="#10b981" /> 2-Year Direct Warranty
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
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{ position: 'relative', height: '280px', backgroundColor: 'var(--bg-surface)' }}>
                <img
                  src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80"
                  alt="ApexPro 16 Gaming Laptop"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                  <span className="badge badge-featured">FLAGSHIP SPOTLIGHT</span>
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-accent)', marginBottom: '4px' }}>
                  ApexTech • Gaming Hardware
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                  ApexPro 16 - Intel i9 + RTX 4080
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                  240Hz Mini-LED QHD+ display, 32GB DDR5, 2TB Gen4 SSD, and vapor chamber cooling.
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f8fafc' }}>
                      $2,159.99
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '8px' }}>
                      $2,399.99
                    </span>
                  </div>

                  <Link
                    href="/products/apexpro-16-gaming-laptop-rtx-4080"
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

      {/* Featured Categories Grid */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 className="h2" style={{ color: '#f8fafc' }}>Browse by Category</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Engineered categories covering everyday productivity to high-end creator workflows.
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
            All Products <ArrowRight size={14} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          {categories.map((cat) => {
            const IconComponent = CATEGORY_ICONS[cat.slug] || Layers;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="card"
                style={{
                  padding: '20px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  textDecoration: 'none',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-primary)',
                  }}
                >
                  <IconComponent size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {cat._count?.products || 0} Models
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Deals & Promotions Section */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Zap size={14} /> Limited Time Offers
            </div>
            <h2 className="h2" style={{ color: '#f8fafc' }}>Promotions & Discounts</h2>
          </div>
          <Link
            href="/products?sort=discount"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--brand-primary)',
            }}
          >
            View All Deals <ArrowRight size={14} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {discounted.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Flagship Gear & Best Sellers */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Award size={14} /> Top Rated Hardware
            </div>
            <h2 className="h2" style={{ color: '#f8fafc' }}>Featured Recommendations</h2>
          </div>
          <Link
            href="/products?featured=true"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--brand-primary)',
            }}
          >
            View All Featured <ArrowRight size={14} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {featured.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* WebMCP Architectural Callout Banner */}
      <section className="container">
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
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
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '12px',
              }}
            >
              <Bot size={14} /> Dual-Interaction Architecture
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
              Human UI & Autonomous AI Agent Protocol
            </h3>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              This platform naturally exposes 18+ semantic e-commerce tools through <code style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>document.modelContext</code>. AI agents discover and execute search, cart mutations, recommendations, and order cancellations with full authentication security.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/products" className="btn btn-outline btn-sm">
                Browse as Human Shopper
              </Link>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#38bdf8',
              overflowX: 'auto',
            }}
          >
            <div style={{ color: '#64748b', marginBottom: '8px' }}>// WebMCP Tool Discovery Example</div>
            <div style={{ color: '#f8fafc' }}>
              await <span style={{ color: '#60a5fa' }}>document.modelContext</span>.<span style={{ color: '#34d399' }}>executeTool</span>(<span style={{ color: '#fcd34d' }}>&quot;search_products&quot;</span>, &#123;
            </div>
            <div style={{ paddingLeft: '16px', color: '#f8fafc' }}>
              query: <span style={{ color: '#fcd34d' }}>&quot;RTX 4080 laptop&quot;</span>,
            </div>
            <div style={{ paddingLeft: '16px', color: '#f8fafc' }}>
              limit: <span style={{ color: '#f43f5e' }}>5</span>
            </div>
            <div style={{ color: '#f8fafc' }}>&#125;);</div>
            <div style={{ color: '#64748b', marginTop: '12px' }}>// Protected action (requires auth)</div>
            <div style={{ color: '#f8fafc' }}>
              await <span style={{ color: '#60a5fa' }}>document.modelContext</span>.<span style={{ color: '#34d399' }}>executeTool</span>(<span style={{ color: '#fcd34d' }}>&quot;add_to_cart&quot;</span>, &#123;
            </div>
            <div style={{ paddingLeft: '16px', color: '#f8fafc' }}>
              productId: <span style={{ color: '#fcd34d' }}>&quot;p101&quot;</span>,
            </div>
            <div style={{ paddingLeft: '16px', color: '#f8fafc' }}>
              quantity: <span style={{ color: '#f43f5e' }}>1</span>
            </div>
            <div style={{ color: '#f8fafc' }}>&#125;);</div>
          </div>
        </div>
      </section>

      {/* AI Smart Recommendations */}
      {recommended.length > 0 && (
        <section className="container" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Sparkles size={18} color="#38bdf8" />
            <h2 className="h2" style={{ color: '#f8fafc' }}>AI-Curated Recommendations</h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px',
            }}
          >
            {recommended.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
