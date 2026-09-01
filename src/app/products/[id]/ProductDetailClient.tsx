'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import {
  Star,
  ShoppingBag,
  Heart,
  Shield,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  CheckCircle,
  Tag,
  Cpu,
  Layers,
} from 'lucide-react';

interface ProductDetailClientProps {
  product: any;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images)
    : [];

  const [selectedImage, setSelectedImage] = useState<string>(images[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const specs = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications || {};

  const discountedPrice = product.discountPercent > 0
    ? product.price * (1 - product.discountPercent / 100)
    : product.price;

  const handleAddToCart = async () => {
    setIsAdding(true);
    const res = await addToCart(product.id, quantity);
    setIsAdding(false);
    if (res.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {/* Upper Grid: Gallery + Purchasing Options */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '40px',
        }}
      >
        {/* Left: Images Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '80%',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            <img
              src={selectedImage || images[0]}
              alt={product.name}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '12px' }}>
              {images.map((img: string, idx: number) => {
                const isSelected = selectedImage === img || (!selectedImage && idx === 0);
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-card)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <img src={img} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-accent)', textTransform: 'uppercase' }}>
                {product.brand}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {product.category?.name}
              </span>
            </div>

            <h1 className="h2" style={{ color: '#f8fafc', marginBottom: '12px' }}>
              {product.name}
            </h1>

            {/* Rating and Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                <Star size={16} fill="#f59e0b" />
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
                  {product.rating.toFixed(1)}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  ({product.reviewCount} customer reviews)
                </span>
              </div>

              <span
                className={
                  product.stock > 10
                    ? 'badge badge-stock'
                    : product.stock > 0
                    ? 'badge badge-low-stock'
                    : 'badge badge-out-stock'
                }
              >
                {product.stock > 10 ? `IN STOCK (${product.stock} units)` : product.stock > 0 ? `LOW STOCK (${product.stock} left)` : 'OUT OF STOCK'}
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                ${discountedPrice.toFixed(2)}
              </span>
              {product.discountPercent > 0 && (
                <>
                  <span style={{ fontSize: '1.125rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="badge badge-discount">
                    SAVE ${(product.price - discountedPrice).toFixed(2)} ({product.discountPercent}% OFF)
                  </span>
                </>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Eligible for promotional discount with coupons <code style={{ color: '#38bdf8' }}>TECH20</code> and <code style={{ color: '#38bdf8' }}>SAVE10</code>
            </div>
          </div>

          {/* Description */}
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {product.description}
          </p>

          {/* Action Row: Quantity + Add to Cart + Wishlist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              {/* Quantity Selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 12px',
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
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
                  <Minus size={16} />
                </button>
                <span style={{ fontSize: '1rem', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
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
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAdding}
                className="btn btn-primary btn-lg"
                style={{ flex: 1, gap: '8px' }}
              >
                {addedSuccess ? <Check size={18} /> : <ShoppingBag size={18} />}
                {isAdding ? 'Adding...' : addedSuccess ? 'Added to Cart!' : `Add to Cart • $${(discountedPrice * quantity).toFixed(2)}`}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="btn btn-secondary btn-lg"
                style={{
                  padding: '14px',
                  color: inWishlist ? '#ef4444' : 'var(--text-primary)',
                  borderColor: inWishlist ? 'rgba(239, 68, 68, 0.4)' : undefined,
                }}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={20} fill={inWishlist ? '#ef4444' : 'none'} />
              </button>
            </div>

            {addedSuccess && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  color: '#34d399',
                  fontWeight: 600,
                }}
              >
                <CheckCircle size={14} /> Item successfully added to your shopping cart!
              </div>
            )}
          </div>

          {/* Value Props Guarantee */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={16} color="#60a5fa" /> Free Express Shipping
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color="#10b981" /> 2-Year Manufacturer Warranty
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={16} color="#f59e0b" /> 30-Day Hassle-Free Returns
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={16} color="#38bdf8" /> 100% Genuine Certified Gear
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {Object.keys(specs).length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Layers size={20} color="#60a5fa" />
            <h3 className="h3" style={{ color: '#f8fafc' }}>Technical Specifications</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {Object.entries(specs).map(([key, val]) => (
              <div
                key={key}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {key}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {String(val)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Reviews Section */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 className="h3" style={{ color: '#f8fafc' }}>Verified Customer Reviews</h3>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Overall Rating: {product.rating.toFixed(1)} / 5.0 ({product.reviews?.length || 0} reviews)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((r: any) => (
              <div
                key={r.id}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--brand-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#ffffff',
                      }}
                    >
                      {r.userName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {r.userName}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={10} /> Verified Buyer
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < Math.round(r.rating) ? '#f59e0b' : 'none'}
                        color="#f59e0b"
                      />
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {r.comment}
                </p>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              No written reviews yet. Be the first to review!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
