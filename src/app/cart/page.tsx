'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';

export default function CartPage() {
  const { user, openAuthModal } = useAuth();
  const { cart, updateQuantity, removeFromCart, applyCoupon, loading } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [applying, setApplying] = useState(false);

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <ShoppingBag size={56} color="#60a5fa" style={{ margin: '0 auto 20px' }} />
        <h1 className="h2" style={{ color: '#f8fafc', marginBottom: '12px' }}>
          Please Sign In to View Your Cart
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 24px', fontSize: '0.9375rem' }}>
          Sign in or create an account to view and manage your shopping cart items across devices.
        </p>
        <button onClick={() => openAuthModal('login')} className="btn btn-primary btn-lg">
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponMsg(null);
    const res = await applyCoupon(couponInput.trim());
    setCouponMsg({ text: res.message || '', success: res.success });
    setApplying(false);
  };

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="h2" style={{ color: '#f8fafc' }}>
          Shopping Cart ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
        </h1>
      </div>

      {cart.items.length === 0 ? (
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
          <ShoppingBag size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            Your shopping cart is currently empty
          </div>
          <p style={{ fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 24px' }}>
            Browse our hardware catalog and add laptops, accessories, monitors, and audio gear.
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Product Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
          {/* Left: Items Table */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}
            >
              {cart.items.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px',
                    borderBottom: idx < cart.items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    gap: '20px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Thumbnail & Product Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '220px', flex: 1 }}>
                    {item.product.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface)',
                        }}
                      />
                    )}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.product.brand}</div>
                      <Link
                        href={`/products/${item.product.slug}`}
                        style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}
                      >
                        {item.product.name}
                      </Link>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                        ${item.product.discountedPrice.toFixed(2)}
                        {item.product.discountPercent > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>
                            ${item.product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Adjuster */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '4px 8px',
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Total & Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: '80px', textAlign: 'right' }}>
                      ${item.itemTotal.toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
              <Link href="/products" className="btn btn-outline btn-sm">
                &larr; Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div
            style={{
              width: '380px',
              maxWidth: '100%',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Order Summary
            </h2>

            {/* Coupon Application */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Promo / Coupon Code
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Tag size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                  <input
                    type="text"
                    placeholder="e.g. TECH20"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '32px', fontSize: '0.8125rem', textTransform: 'uppercase' }}
                  />
                </div>
                <button type="submit" disabled={applying || !couponInput} className="btn btn-secondary btn-sm">
                  Apply
                </button>
              </div>
              {couponMsg && (
                <div style={{ fontSize: '0.75rem', color: couponMsg.success ? '#34d399' : '#f87171', fontWeight: 500 }}>
                  {couponMsg.text}
                </div>
              )}
            </form>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                  <span>Coupon Discount</span>
                  <span>-${cart.couponDiscount.toFixed(2)}</span>
                </div>
              )}
              {cart.productSavings > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                  <span>Product Savings</span>
                  <span>-${cart.productSavings.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Estimated Shipping</span>
                <span>{cart.shippingFee === 0 ? 'FREE' : `$${cart.shippingFee.toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Estimated Tax (8%)</span>
                <span>${cart.estimatedTax.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: 'var(--text-primary)',
                }}
              >
                <span>Total</span>
                <span style={{ color: 'var(--brand-primary)' }}>${cart.estimatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link href="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', gap: '8px' }}>
              Proceed to Demo Checkout <ArrowRight size={18} />
            </Link>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <ShieldCheck size={14} color="#10b981" /> Safe demonstration environment
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
