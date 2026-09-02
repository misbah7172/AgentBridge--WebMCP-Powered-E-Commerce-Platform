import { WebMCPTool } from '../types';

export const addToCartTool: WebMCPTool = {
  name: 'add_to_cart',
  description: 'Add a product and specified quantity to the authenticated user shopping cart.',
  category: 'Cart',
  permission: 'AUTHENTICATED',
  inputSchema: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        description: 'ID of the product to add.',
      },
      quantity: {
        type: 'number',
        description: 'Quantity of items to add (default: 1, minimum: 1).',
      },
    },
    required: ['productId'],
  },
  execute: async ({ productId, quantity = 1 }) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    });
    return await res.json();
  },
};

export const getCartTool: WebMCPTool = {
  name: 'get_cart',
  description: 'Retrieve all items in the authenticated user shopping cart along with item quantities, price calculations, applied discounts, shipping estimates, and order total.',
  category: 'Cart',
  permission: 'AUTHENTICATED',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    const res = await fetch('/api/cart');
    return await res.json();
  },
};

export const updateCartQuantityTool: WebMCPTool = {
  name: 'update_cart_quantity',
  description: 'Update the quantity of a specific item in the authenticated user cart.',
  category: 'Cart',
  permission: 'AUTHENTICATED',
  inputSchema: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        description: 'Product ID in the cart to update.',
      },
      quantity: {
        type: 'number',
        description: 'New quantity desired (set to 0 to remove).',
      },
    },
    required: ['productId', 'quantity'],
  },
  execute: async ({ productId, quantity }) => {
    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    });
    return await res.json();
  },
};

export const removeFromCartTool: WebMCPTool = {
  name: 'remove_from_cart',
  description: 'Remove a product item entirely from the authenticated user cart.',
  category: 'Cart',
  permission: 'AUTHENTICATED',
  inputSchema: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        description: 'Product ID to remove from cart.',
      },
    },
    required: ['productId'],
  },
  execute: async ({ productId }) => {
    const res = await fetch(`/api/cart?productId=${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
    return await res.json();
  },
};

export const clearCartTool: WebMCPTool = {
  name: 'clear_cart',
  description: 'Remove every item from the authenticated user cart. Use only when the user explicitly asks to empty the entire cart.',
  category: 'Cart',
  permission: 'AUTHENTICATED',
  inputSchema: { type: 'object', properties: {} },
  execute: async () => {
    const res = await fetch('/api/cart?clear=true', { method: 'DELETE' });
    return await res.json();
  },
};

export const applyCouponTool: WebMCPTool = {
  name: 'apply_coupon',
  description: 'Apply a promotional coupon code (e.g., TECH20, SAVE10, WELCOME15) to calculate discount on cart items.',
  category: 'Cart',
  permission: 'AUTHENTICATED',
  inputSchema: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: 'Coupon code to apply.',
      },
    },
    required: ['code'],
  },
  execute: async ({ code }) => {
    const res = await fetch('/api/coupons/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    return await res.json();
  },
};
