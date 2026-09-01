import { WebMCPTool } from '../types';

export const getOrderHistoryTool: WebMCPTool = {
  name: 'get_order_history',
  description: 'Retrieve the order history for the authenticated user with order numbers, items, status, dates, and order totals.',
  category: 'Orders',
  permission: 'AUTHENTICATED',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    const res = await fetch('/api/orders');
    return await res.json();
  },
};

export const getOrderDetailsTool: WebMCPTool = {
  name: 'get_order_details',
  description: 'Retrieve complete details, tracking status, shipping address, and item breakdown for a specific order belonging to the authenticated user.',
  category: 'Orders',
  permission: 'AUTHENTICATED',
  inputSchema: {
    type: 'object',
    properties: {
      orderId: {
        type: 'string',
        description: 'Order ID or Order Number (e.g. "ORD-882194").',
      },
    },
    required: ['orderId'],
  },
  execute: async ({ orderId }) => {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
    return await res.json();
  },
};

export const cancelOrderTool: WebMCPTool = {
  name: 'cancel_order',
  description: 'Cancel an active, eligible order (orders currently in PENDING or PROCESSING state). Orders that are SHIPPED or DELIVERED cannot be cancelled.',
  category: 'Orders',
  permission: 'AUTHENTICATED',
  inputSchema: {
    type: 'object',
    properties: {
      orderId: {
        type: 'string',
        description: 'Order ID or Order Number to cancel.',
      },
      reason: {
        type: 'string',
        description: 'Optional cancellation reason.',
      },
    },
    required: ['orderId'],
  },
  execute: async ({ orderId, reason }) => {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return await res.json();
  },
};

export const createOrderTool: WebMCPTool = {
  name: 'create_order',
  description: 'Place an order using the items in the current cart with the specified shipping address and demo payment method.',
  category: 'Orders',
  permission: 'TRANSACTIONAL',
  inputSchema: {
    type: 'object',
    properties: {
      fullName: { type: 'string', description: 'Recipient full name' },
      street: { type: 'string', description: 'Street address' },
      city: { type: 'string', description: 'City name' },
      state: { type: 'string', description: 'State or province' },
      zipCode: { type: 'string', description: 'ZIP or postal code' },
      country: { type: 'string', description: 'Country (e.g. "United States")' },
      phone: { type: 'string', description: 'Contact phone number' },
      couponCode: { type: 'string', description: 'Optional coupon code (e.g. TECH20)' },
      paymentMethod: {
        type: 'string',
        description: 'Demo payment method (default: "DEMO_CARD")',
      },
    },
    required: ['fullName', 'street', 'city', 'state', 'zipCode'],
  },
  execute: async (orderInput) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderInput),
    });
    return await res.json();
  },
};
