'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { cart, fetchCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: user?.name || 'Alex Rivera',
    street: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    zipCode: '97477',
    country: 'United States',
    phone: '+1 (555) 234-5678',
    paymentMethod: 'DEMO_CARD',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <ShoppingBag size={56} color="#60a5fa" style={{ margin: '0 auto 20px' }} />
        <h1 className="h2" style={{ color: '#f8fafc', marginBottom: '12px' }}>
          Authentication Required for Checkout
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 24px', fontSize: '0.9375rem' }}>
          Please sign in to your account to complete checkout and create your order.
        </p>
        <button onClick={() => openAuthModal('login')} className="btn btn-primary btn-lg">
          Sign In to Continue
        </button>
      </div>
    );
  }

  if (completedOrder) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '680px' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle size={36} />
          </div>

          <h1 className="h2" style={{ color: '#f8fafc', marginBottom: '8px' }}>
            Order Placed Successfully!
          </h1>
          <div style={{ fontSize: '1rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '16px' }}>
            {completedOrder.orderNumber}
          </div>

          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            Thank you for your order, <strong>{completedOrder.shippingAddress?.fullName || user.name}</strong>. A demo confirmation email has been logged. You can track or cancel this order in your account dashboard.
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '28px',
              fontSize: '0.8125rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <span className="badge badge-stock">{completedOrder.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Billed:</span>
              <span style={{ fontWeight: 700, color: '#f8fafc' }}>${completedOrder.total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shipping To:</span>
              <span>{completedOrder.shippingAddress?.city}, {completedOrder.shippingAddress?.state}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/account" className="btn btn-primary">
              View Order History
            </Link>
            <Link href="/products" className="btn btn-secondary">
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h1 className="h2" style={{ color: '#f8fafc', marginBottom: '12px' }}>
          Your Cart is Empty
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Please add products to your cart before proceeding to checkout.
        </p>
        <Link href="/products" className="btn btn-primary">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setCompletedOrder(data);
        fetchCart();
      } else {
        setError(data.message || 'Could not place order');
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected checkout error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="h2" style={{ color: '#f8fafc', marginBottom: '6px' }}>
          Demo Checkout
        </h1>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Review your items and enter demo shipping credentials.
        </div>
      </div>

      {/* Warning Alert: Demo Mode */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 18px',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#fbbf24',
          fontSize: '0.8125rem',
          marginBottom: '28px',
        }}
      >
        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Safe Demo Mode:</strong> No real payment cards or personal information are processed. You can test order placement and subsequent cancellation freely.
        </span>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.875rem',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
          {/* Left Column: Shipping & Payment Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Shipping Address Section */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Truck size={20} color="#60a5fa" />
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>
                  Shipping Details
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input"
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    State / Province
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CreditCard size={20} color="#60a5fa" />
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>
                  Demo Payment Method
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--brand-primary)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="DEMO_CARD"
                    checked={formData.paymentMethod === 'DEMO_CARD'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'DEMO_CARD' })}
                    style={{ accentColor: 'var(--brand-primary)' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Instant Demo Card (Pre-Approved Sandbox)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Card ending in 4242 • Auto-verified simulation
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review */}
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
              gap: '18px',
            }}
          >
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>
              Items in Order ({cart.itemCount})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
              {cart.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Qty {item.quantity} × ${item.product.discountedPrice.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ${item.itemTotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
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
                <span>Shipping</span>
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
                  paddingTop: '10px',
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', gap: '8px' }}
            >
              {isSubmitting ? 'Placing Order...' : 'Confirm Demo Order'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
