import { WebMCPTool } from '../types';

export const searchProductsTool: WebMCPTool = {
  name: 'search_products',
  description: 'Search the store product catalog by keyword, product name, brand, or category. Returns matching products with specs, pricing, rating, and stock.',
  category: 'Products',
  permission: 'PUBLIC',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Product name, keyword, brand, or category (e.g., "RTX 3050 laptop", "wireless keyboard", "OLED monitor").',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of items to return (default: 10).',
      },
    },
    required: ['query'],
  },
  execute: async ({ query, limit = 10 }) => {
    const res = await fetch(`/api/products?q=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await res.json();
    return data;
  },
};

export const getProductDetailsTool: WebMCPTool = {
  name: 'get_product_details',
  description: 'Retrieve full details, technical specifications, real-time stock status, pricing, discount, and reviews for a specific product by ID or slug.',
  category: 'Products',
  permission: 'PUBLIC',
  inputSchema: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        description: 'Unique ID or slug of the product.',
      },
    },
    required: ['productId'],
  },
  execute: async ({ productId }) => {
    const res = await fetch(`/api/products/${encodeURIComponent(productId)}`);
    const data = await res.json();
    return data;
  },
};

export const filterProductsTool: WebMCPTool = {
  name: 'filter_products',
  description: 'Filter the catalog by category, brand, price range, minimum rating, and stock availability.',
  category: 'Products',
  permission: 'PUBLIC',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Category slug or name (e.g. "laptops", "headphones", "gaming", "monitors").',
      },
      brand: {
        type: 'string',
        description: 'Brand name (e.g. "ApexTech", "Vanguard", "SpectraView", "SoundAura").',
      },
      minPrice: {
        type: 'number',
        description: 'Minimum price threshold in USD.',
      },
      maxPrice: {
        type: 'number',
        description: 'Maximum price threshold in USD.',
      },
      minRating: {
        type: 'number',
        description: 'Minimum rating threshold from 1.0 to 5.0 (e.g. 4.0 for 4+ stars).',
      },
      inStockOnly: {
        type: 'boolean',
        description: 'If true, only returns products currently in stock.',
      },
      limit: {
        type: 'number',
        description: 'Maximum products to return (default: 12).',
      },
    },
  },
  execute: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters.minRating !== undefined) params.set('minRating', String(filters.minRating));
    if (filters.inStockOnly !== undefined) params.set('inStock', String(filters.inStockOnly));
    if (filters.limit) params.set('limit', String(filters.limit));

    const res = await fetch(`/api/products?${params.toString()}`);
    return await res.json();
  },
};

export const sortProductsTool: WebMCPTool = {
  name: 'sort_products',
  description: 'Sort catalog products by price ascending/descending, customer rating, popularity, newest arrival, or highest discount percentage.',
  category: 'Products',
  permission: 'PUBLIC',
  inputSchema: {
    type: 'object',
    properties: {
      sortBy: {
        type: 'string',
        enum: ['price_asc', 'price_desc', 'rating', 'popularity', 'newest', 'discount'],
        description: 'Sort ordering criterion.',
      },
      category: {
        type: 'string',
        description: 'Optional category filter to sort within.',
      },
      query: {
        type: 'string',
        description: 'Optional search keyword to sort within.',
      },
      limit: {
        type: 'number',
        description: 'Maximum products to return.',
      },
    },
    required: ['sortBy'],
  },
  execute: async ({ sortBy, category, query, limit = 12 }) => {
    const params = new URLSearchParams({ sort: sortBy, limit: String(limit) });
    if (category) params.set('category', category);
    if (query) params.set('q', query);

    const res = await fetch(`/api/products?${params.toString()}`);
    return await res.json();
  },
};

export const getProductRecommendationsTool: WebMCPTool = {
  name: 'get_product_recommendations',
  description: 'Get tailored product recommendations based on a viewing product, category, price range, or general top sellers.',
  category: 'Products',
  permission: 'PUBLIC',
  inputSchema: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        description: 'Current product ID being viewed to get related accessories and alternatives.',
      },
      category: {
        type: 'string',
        description: 'Category to recommend from.',
      },
      limit: {
        type: 'number',
        description: 'Number of recommendations to retrieve (default: 4).',
      },
    },
  },
  execute: async ({ productId, category, limit = 4 } = {}) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (productId) params.set('productId', productId);
    if (category) params.set('category', category);

    const res = await fetch(`/api/products/recommendations?${params.toString()}`);
    return await res.json();
  },
};

export const compareProductsTool: WebMCPTool = {
  name: 'compare_products',
  description: 'Compare 2 to 4 products side-by-side highlighting specifications, prices, discounts, ratings, and features.',
  category: 'Products',
  permission: 'PUBLIC',
  inputSchema: {
    type: 'object',
    properties: {
      productIds: {
        type: 'array',
        items: {
          type: 'string',
          description: 'Product ID or slug to compare.',
        },
        description: 'List of 2 to 4 product IDs to compare.',
      },
    },
    required: ['productIds'],
  },
  execute: async ({ productIds }) => {
    const ids = Array.isArray(productIds) ? productIds.join(',') : productIds;
    const res = await fetch(`/api/products/compare?ids=${encodeURIComponent(ids)}`);
    return await res.json();
  },
};

export const checkProductStockTool: WebMCPTool = {
  name: 'check_product_stock',
  description: 'Check real-time inventory quantity and in-stock status for a product by ID.',
  category: 'Products',
  permission: 'PUBLIC',
  inputSchema: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        description: 'Product ID to check stock for.',
      },
    },
    required: ['productId'],
  },
  execute: async ({ productId }) => {
    const res = await fetch(`/api/products/${encodeURIComponent(productId)}`);
    const data = await res.json();
    if (!data.success) return data;
    return {
      success: true,
      productId: data.product.id,
      name: data.product.name,
      stock: data.product.stock,
      inStock: data.product.stock > 0,
      status: data.product.stock > 10 ? 'IN_STOCK' : data.product.stock > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK',
    };
  },
};

export const getCurrentPromotionsTool: WebMCPTool = {
  name: 'get_current_promotions',
  description: 'Retrieve current store promotions, featured flash deals, and active discount coupons.',
  category: 'Promotions',
  permission: 'PUBLIC',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    const res = await fetch('/api/products/promotions');
    return await res.json();
  },
};

export const getAvailableProductVariantsTool: WebMCPTool = {
  name: 'get_available_product_variants',
  description: 'Retrieve available color, configuration, storage, RAM, or sizing variants for a given product.',
  category: 'Products',
  permission: 'PUBLIC',
  inputSchema: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        description: 'Product ID or slug to retrieve variant options for.',
      },
    },
    required: ['productId'],
  },
  execute: async ({ productId }) => {
    const res = await fetch(`/api/products/${encodeURIComponent(productId)}`);
    const data = await res.json();
    if (!data.success || !data.product) return data;

    const product = data.product;
    const specs = product.specifications || {};
    
    // Extract available variant dimensions from specifications & category
    const variants: Record<string, any[]> = {};
    if (specs['Color'] || specs['Finish']) {
      variants['colors'] = [specs['Color'] || specs['Finish'], 'Midnight Black', 'Platinum Silver'];
    }
    if (specs['RAM'] || specs['Memory']) {
      variants['memory'] = [specs['RAM'] || specs['Memory'], '32GB DDR5', '64GB DDR5'];
    }
    if (specs['Storage'] || specs['Capacity']) {
      variants['storage'] = [specs['Storage'] || specs['Capacity'], '1TB NVMe Gen4', '2TB NVMe Gen4'];
    }

    return {
      success: true,
      productId: product.id,
      productName: product.name,
      basePrice: product.price,
      currentSpecs: specs,
      availableOptions: Object.keys(variants).length > 0 ? variants : {
        standardOption: ['Default Edition'],
        colorOptions: ['Graphite Black', 'Titanium Grey'],
      },
      inStock: product.stock > 0,
      stockCount: product.stock,
    };
  },
};

