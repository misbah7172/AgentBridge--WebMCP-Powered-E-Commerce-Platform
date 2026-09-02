import { describe, expect, it } from 'vitest';
import { WebMCPRegistry } from '../../../src/webmcp/registry';
import { WebMCPTool } from '../../../src/webmcp/types';
import { executeWithTrace } from '../../../src/webmcp/testing/directExecution';

const publicTool: WebMCPTool<{ query: string }> = {
  name: 'search_products', description: 'Search products using a customer-provided query.', category: 'Products', permission: 'PUBLIC',
  inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'Search terms.' } }, required: ['query'] },
  execute: async ({ query }) => ({ success: true, data: { query } }),
};

const protectedTool: WebMCPTool<{ productId: string; quantity: number }> = {
  name: 'add_to_cart', description: 'Add a resolved product ID and quantity to the current cart.', category: 'Cart', permission: 'AUTHENTICATED',
  inputSchema: { type: 'object', properties: { productId: { type: 'string' }, quantity: { type: 'number' } }, required: ['productId', 'quantity'] },
  execute: async ({ productId, quantity }) => ({ success: true, data: { productId, quantity } }),
};

describe('WebMCP registry deterministic contracts', () => {
  it('rejects unknown tools with a structured non-retryable error', async () => {
    const registry = new WebMCPRegistry();
    const result = await registry.executeTool('missing_tool', {});
    expect(result.errorDetails).toMatchObject({ code: 'TOOL_NOT_FOUND', retryable: false });
  });

  it('validates required parameters and types before execution', async () => {
    const registry = new WebMCPRegistry();
    registry.registerTool(publicTool);
    expect((await registry.executeTool('search_products', {})).error).toBe('INVALID_INPUT');
    expect((await registry.executeTool('search_products', { query: 5 })).error).toBe('INVALID_INPUT');
    await expect(registry.executeTool('search_products', { query: 'headphones' })).resolves.toMatchObject({ success: true });
  });

  it('does not execute protected tools before authentication', async () => {
    const registry = new WebMCPRegistry();
    registry.registerTool(protectedTool);
    const result = await registry.executeTool('add_to_cart', { productId: 'resolved-at-runtime', quantity: 1 });
    expect(result.errorDetails).toMatchObject({ code: 'AUTHENTICATION_REQUIRED', userActionRequired: true });
  });

  it('records direct execution input, result, timing, and state transitions', async () => {
    const registry = new WebMCPRegistry();
    registry.registerTool(publicTool);
    const trace = await executeWithTrace(registry, 'search_products', { query: 'wireless' });
    expect(trace).toMatchObject({ toolName: 'search_products', stateBefore: 'guest', stateAfter: 'guest', output: { success: true } });
    expect(trace.durationMs).toBeGreaterThanOrEqual(0);
  });
});
