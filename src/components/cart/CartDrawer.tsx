'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, removeFromCart, applyCoupon, loading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!isDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponMsg(null);
    const res = await applyCoupon(couponCode.trim());
    setCouponMsg({ text: res.message || '', success: res.success });
    setApplyingCoupon(false);
  };

  return (
    <div className="modal-overlay" onClick={closeDrawer} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '420px',
          maxWidth: '100vw',
          height: '100vh',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        <style jsx>{`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="#60a5fa" />
            <div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>Your Shopping Cart</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <ShoppingBag size={48} color="#475569" style={{ margin: '0 auto 16px' }} />
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Your cart is empty
              </div>
              <p style={{ fontSize: '0.875rem', marginBottom: '24px' }}>
                Discover innovative hardware and gear in our catalog.
              </p>
              <Link href="/products" onClick={closeDrawer} className="btn btn-primary btn-sm">
                Explore Catalog
              </Link>
            </div>
          ) : (
            cart.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '12px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {item.product.image && (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{
                      width: '72px',
                      height: '72px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.product.brand}</div>
                  <Link
                    href={`/products/${item.product.slug}`}
                    onClick={closeDrawer}
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '4px',
                    }}
                  >
                    {item.product.name}
                  </Link>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    ${item.product.discountedPrice.toFixed(2)}
                    {item.product.discountPercent > 0 && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          textDecoration: 'line-through',
                          marginLeft: '6px',
                        }}
                      >
                        ${item.product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Quantity and Remove */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '2px',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, minWidth: '18px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Remove from cart"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.items.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Tag size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Coupon (e.g. TECH20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '32px', paddingBlock: '8px', fontSize: '0.8125rem', textTransform: 'uppercase' }}
                />
              </div>
              <button
                type="submit"
                disabled={applyingCoupon || !couponCode}
                className="btn btn-secondary btn-sm"
              >
                Apply
              </button>
            </form>

            {couponMsg && (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: couponMsg.success ? '#34d399' : '#f87171',
                  fontWeight: 500,
                }}
              >
                {couponMsg.text}
              </div>
            )}

            {/* Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Estimated Shipping</span>
                <span>{cart.shippingFee === 0 ? 'FREE' : `$${cart.shippingFee.toFixed(2)}`}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  paddingTop: '6px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span>Estimated Total</span>
                <span style={{ color: 'var(--brand-primary)' }}>${cart.estimatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.875rem' }}
              >
                View Full Cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="btn btn-primary"
                style={{ flex: 1, fontSize: '0.875rem' }}
              >
                Checkout <ArrowRight size={14} />
              </Link>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
              }}
            >
              <ShieldCheck size={12} color="#10b981" /> Safe Demo Checkout Mode Active
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
