import React from 'react';
import Link from 'next/link';
import { Cpu, Shield, Bot, Terminal, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: '64px',
        padding: '48px 0 24px 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '36px',
            marginBottom: '40px',
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--brand-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Cpu size={18} />
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc' }}>
                Agent<span style={{ color: '#60a5fa' }}>Bridge</span>
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              Next-generation e-commerce architecture designed for both human shoppers and autonomous AI agents through the Web Model Context Protocol (WebMCP).
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                fontSize: '0.6875rem',
                color: '#93c5fd',
                fontWeight: 600,
              }}
            >
              <Bot size={12} /> WebMCP 1.0 Compliant Layer
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px' }}>
              Hardware Catalog
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <li><Link href="/products?category=laptops">Gaming & Creator Laptops</Link></li>
              <li><Link href="/products?category=monitors">OLED & Esports Monitors</Link></li>
              <li><Link href="/products?category=smartphones">Flagship Smartphones</Link></li>
              <li><Link href="/products?category=headphones">Noise-Cancelling Headphones</Link></li>
              <li><Link href="/products?category=computer-accessories">Mechanical Keyboards & Peripherals</Link></li>
            </ul>
          </div>

          {/* WebMCP Agent Protocol */}
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px' }}>
              WebMCP Protocol Specs
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={14} color="#60a5fa" />
                <span>18+ Registered Agent Tools</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} color="#10b981" />
                <span>Strict Cookie Auth Security</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#f59e0b" />
                <span>Zero Latency Local State</span>
              </li>
            </ul>
          </div>

          {/* Demo Sandbox Credentials */}
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px' }}>
              Evaluation & Demo Sandbox
            </div>
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                fontSize: '0.75rem',
              }}
            >
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Demo Customer Account:</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8', marginBottom: '2px' }}>
                demo@agentbridge.io
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                password123
              </div>
              <div style={{ marginTop: '8px', color: '#10b981', fontWeight: 600 }}>
                Coupons: TECH20, SAVE10
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            © {new Date().getFullYear()} AgentBridge E-Commerce Platform. Built for WebMCP Demonstration.
          </div>
          <div>
            All tools and e-commerce transactions operate in safe demo mode.
          </div>
        </div>
      </div>
    </footer>
  );
}
