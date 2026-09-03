'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  LogOut,
  Package,
  Layers,
  Columns,
  Sparkles,
  ChevronDown,
  Cpu,
  ArrowRight,
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { user, openAuthModal, logout } = useAuth();
  const { cart, openDrawer } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.products || []);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 800,
        backgroundColor: 'rgba(10, 13, 20, 0.94)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px', gap: '24px' }}>
        {/* Brand Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #d4af37 0%, #c5a059 50%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.35)',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
              Agent<span style={{ color: '#d4af37' }}>Bridge</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, color: '#c5a059', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Atelier & Apparel
            </span>
          </div>
        </Link>

        {/* Search Bar with Live Suggestions */}
        <div ref={searchRef} style={{ flex: 1, maxWidth: '520px', position: 'relative' }}>
          <form onSubmit={handleSearchSubmit}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                color="#64748b"
                style={{ position: 'absolute', left: '14px', top: '12px' }}
              />
              <input
                type="text"
                placeholder="Search silk blouses, pima cotton tees, tailored denim, colors..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="input"
                style={{
                  paddingLeft: '40px',
                  paddingRight: '14px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (suggestions.length > 0 || isSearching) && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                zIndex: 850,
              }}
            >
              {isSearching && (
                <div style={{ padding: '12px 16px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Searching catalog...
                </div>
              )}
              {suggestions.map((p) => {
                const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
                const price = p.discountPercent > 0 ? p.price * (1 - p.discountPercent / 100) : p.price;
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {img && (
                      <img
                        src={img}
                        alt={p.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {p.brand} • ${price.toFixed(2)}
                      </div>
                    </div>
                  </Link>
                );
              })}
              {searchQuery && (
                <Link
                  href={`/products?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setIsSearchOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    backgroundColor: 'var(--bg-card)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--brand-primary)',
                    textDecoration: 'none',
                  }}
                >
                  <span>See all results for &quot;{searchQuery}&quot;</span>
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Women Link */}
          <Link
            href="/products?category=womens-tops"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            <span>Women</span>
          </Link>

          {/* Men Link */}
          <Link
            href="/products?category=mens-tshirts"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            <span>Men</span>
          </Link>

          {/* Denim Link */}
          <Link
            href="/products?q=jeans"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            <span>Denim</span>
          </Link>

          {/* Compare Link */}
          <Link
            href="/compare"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            <Columns size={16} />
            <span>Compare</span>
          </Link>

          {/* Catalog Link */}
          <Link
            href="/products"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            <Layers size={16} />
            <span>Catalog</span>
          </Link>

          {/* Wishlist Link */}
          <Link
            href={user ? '/account?tab=wishlist' : '#'}
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                openAuthModal('login');
              }
            }}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
            title="Wishlist"
          >
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={() => {
              if (!user) {
                openAuthModal('login');
              } else {
                openDrawer();
              }
            }}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            <ShoppingBag size={18} color="#60a5fa" />
            <span>Cart</span>
            {cart.itemCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px',
                }}
              >
                {cart.itemCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Action */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            {user ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} color="#94a3b8" />
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px' }}
              >
                <UserIcon size={14} />
                <span>Sign In</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {isUserMenuOpen && user && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '200px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  overflow: 'hidden',
                  zIndex: 850,
                  padding: '6px 0',
                }}
              >
                <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>

                <Link
                  href="/account"
                  onClick={() => setIsUserMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Package size={14} />
                  <span>My Orders & Profile</span>
                </Link>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    fontSize: '0.8125rem',
                    color: '#f87171',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
