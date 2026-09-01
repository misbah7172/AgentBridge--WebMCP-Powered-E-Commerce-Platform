import { WebMCPTool } from '../types';

export const addToWishlistTool: WebMCPTool = {
  name: 'add_to_wishlist',
  description: 'Add a product to the authenticated user saved wishlist.',
  category: 'Wishlist',
  permission: 'AUTHENTICATED',
  inputSchema: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        description: 'Product ID to add to wishlist.',
      },
    },
    required: ['productId'],
  },
  execute: async ({ productId }) => {
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    return await res.json();
  },
};

export const removeFromWishlistTool: WebMCPTool = {
  name: 'remove_from_wishlist',
  description: 'Remove a product from the authenticated user wishlist.',
  category: 'Wishlist',
  permission: 'AUTHENTICATED',
  inputSchema: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        description: 'Product ID to remove from wishlist.',
      },
    },
    required: ['productId'],
  },
  execute: async ({ productId }) => {
    const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
    return await res.json();
  },
};

export const getWishlistTool: WebMCPTool = {
  name: 'get_wishlist',
  description: 'Retrieve the list of products in the authenticated user saved wishlist.',
  category: 'Wishlist',
  permission: 'AUTHENTICATED',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    const res = await fetch('/api/wishlist');
    return await res.json();
  },
};
