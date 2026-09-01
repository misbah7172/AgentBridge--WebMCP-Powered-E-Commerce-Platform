'use client';

import React, { useState, useEffect, useRef } from 'react';
import { webmcpRegistry } from '@/webmcp/registry';
import { RegisteredToolInfo } from '@/webmcp/types';
import { useAuth } from '@/context/AuthContext';
import { Bot, CheckCircle, Lock, ChevronRight, X, Play, Code, Sparkles, Terminal } from 'lucide-react';

export default function WebMCPIndicator() {
  const { user } = useAuth();
  const [tools, setTools] = useState<RegisteredToolInfo[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTool, setSelectedTool] = useState<RegisteredToolInfo | null>(null);
  const [testInput, setTestInput] = useState<string>('{}');
  const [testResult, setTestResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastActivity, setLastActivity] = useState<{ toolName: string; time: string; success: boolean } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Subscribe to registry updates
    const unsubscribe = webmcpRegistry.subscribe((registeredTools) => {
      setTools(registeredTools);
    });

    const unsubscribeExec = webmcpRegistry.onExecution((event) => {
      setLastActivity({
        toolName: event.toolName,
        time: new Date(event.timestamp).toLocaleTimeString(),
        success: event.result?.success !== false,
      });
    });

    return () => {
      unsubscribe();
      unsubscribeExec();
    };
  }, []);

  // When selected tool changes, populate sample input
  useEffect(() => {
    if (selectedTool) {
      const sample: Record<string, any> = {};
      const properties = selectedTool.inputSchema?.properties || {};
      for (const [key, prop] of Object.entries(properties)) {
        if (prop.type === 'string') {
          if (key === 'query') sample[key] = 'laptop';
          else if (key === 'productId') sample[key] = 'apexpro-16-gaming-laptop-rtx-4080';
          else if (key === 'orderId') sample[key] = 'ORD-882194';
          else if (key === 'code') sample[key] = 'TECH20';
          else if (key === 'sortBy') sample[key] = 'rating';
          else sample[key] = 'sample';
        } else if (prop.type === 'number') {
          if (key === 'quantity') sample[key] = 1;
          else if (key === 'minPrice') sample[key] = 500;
          else if (key === 'maxPrice') sample[key] = 1500;
          else sample[key] = 1;
        } else if (prop.type === 'array') {
          sample[key] = ['apexpro-16-gaming-laptop-rtx-4080', 'ultrablade-14-stealth-laptop'];
        } else if (prop.type === 'boolean') {
          sample[key] = true;
        }
      }
      setTestInput(JSON.stringify(sample, null, 2));
      setTestResult(null);
    }
  }, [selectedTool]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (selectedTool) return; // Keep open while testing a tool
    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 300);
  };

  const handleRunTool = async () => {
    if (!selectedTool) return;
    setIsExecuting(true);
    setTestResult(null);
    try {
      let parsedInput = {};
      try {
        parsedInput = JSON.parse(testInput);
      } catch {
        parsedInput = {};
      }
      const res = await webmcpRegistry.executeTool(selectedTool.name, parsedInput);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, error: err?.message || 'Execution error' });
    } finally {
      setIsExecuting(false);
    }
  };

  if (tools.length === 0) return null;

  const publicCount = tools.filter((t) => t.status === 'AVAILABLE').length;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 900,
        fontFamily: 'var(--font-sans)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Collapsed Badge Indicator */}
      {!isExpanded && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 14px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(59, 130, 246, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: user ? '#10b981' : '#3b82f6',
              boxShadow: user ? '0 0 8px #10b981' : '0 0 8px #3b82f6',
            }}
          />
          <Bot size={16} color="#60a5fa" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc', letterSpacing: '0.02em' }}>
            WebMCP
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#93c5fd',
              padding: '1px 6px',
              borderRadius: '10px',
              fontWeight: 600,
            }}
          >
            {publicCount}/{tools.length}
          </span>
        </div>
      )}

      {/* Expanded Tool Panel */}
      {isExpanded && (
        <div
          style={{
            width: selectedTool ? '680px' : '360px',
            maxWidth: '92vw',
            backgroundColor: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(59, 130, 246, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.25s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} color="#60a5fa" />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                  WebMCP Protocol Layer
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {tools.length} Tools Registered • {user ? `Active (${user.name})` : 'Guest Session'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setIsExpanded(false);
                setSelectedTool(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body: Split View if Tool Selected */}
          <div style={{ display: 'flex', maxHeight: '460px', overflow: 'hidden' }}>
            {/* Tool List Column */}
            <div
              style={{
                width: selectedTool ? '320px' : '100%',
                flexShrink: 0,
                overflowY: 'auto',
                padding: '10px 12px',
                borderRight: selectedTool ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 8px' }}>
                Exposed Agent Tools ({tools.length})
              </div>

              {tools.map((t) => {
                const isSelected = selectedTool?.name === t.name;
                const isAvailable = t.status === 'AVAILABLE';

                return (
                  <div
                    key={t.name}
                    onClick={() => setSelectedTool(t)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      marginBottom: '4px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
                      border: isSelected ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ overflow: 'hidden', paddingRight: '8px' }}>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          color: isAvailable ? '#f1f5f9' : '#94a3b8',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                        }}
                      >
                        {t.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.6875rem',
                          color: '#64748b',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                        }}
                      >
                        {t.category}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isAvailable ? (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: '#34d399',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <CheckCircle size={10} />
                          ON
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: '#94a3b8',
                            backgroundColor: 'rgba(148, 163, 184, 0.12)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Lock size={10} />
                          LOGIN
                        </span>
                      )}
                      <ChevronRight size={14} color="#64748b" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tool Detail & Test Inspector Column */}
            {selectedTool && (
              <div
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#60a5fa' }}>
                      {selectedTool.name}
                    </div>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: selectedTool.status === 'AVAILABLE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: selectedTool.status === 'AVAILABLE' ? '#34d399' : '#fbbf24',
                      }}
                    >
                      {selectedTool.status === 'AVAILABLE' ? 'Available' : 'Login Required'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
                    {selectedTool.description}
                  </div>
                </div>

                {/* Input Schema & Live Test */}
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Code size={12} /> Tool Input (JSON)
                  </div>
                  <textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    style={{
                      width: '100%',
                      height: '80px',
                      backgroundColor: '#090d16',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#38bdf8',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      padding: '8px',
                      resize: 'vertical',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleRunTool}
                    disabled={isExecuting}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, gap: '6px' }}
                  >
                    <Play size={12} />
                    {isExecuting ? 'Executing...' : 'Invoke Tool'}
                  </button>
                  <button
                    onClick={() => setSelectedTool(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Close
                  </button>
                </div>

                {/* Result output */}
                {testResult && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Terminal size={12} /> Tool Response
                    </div>
                    <pre
                      style={{
                        backgroundColor: '#090d16',
                        border: testResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px',
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                        color: testResult.success ? '#86efac' : '#fca5a5',
                        maxHeight: '130px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          {lastActivity && (
            <div
              style={{
                padding: '6px 14px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.6875rem',
                color: '#94a3b8',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={12} color="#38bdf8" />
                <span>Last execution: <strong style={{ color: '#f8fafc' }}>{lastActivity.toolName}</strong> at {lastActivity.time}</span>
              </div>
              <span style={{ color: lastActivity.success ? '#34d399' : '#f87171' }}>
                {lastActivity.success ? 'SUCCESS' : 'AUTH / ERR'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
