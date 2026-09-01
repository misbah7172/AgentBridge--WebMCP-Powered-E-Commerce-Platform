import { webmcpRegistry } from './registry';
import {
  searchProductsTool,
  getProductDetailsTool,
  filterProductsTool,
  sortProductsTool,
  getProductRecommendationsTool,
  compareProductsTool,
  checkProductStockTool,
  getCurrentPromotionsTool,
} from './tools/productTools';
import {
  addToCartTool,
  getCartTool,
  updateCartQuantityTool,
  removeFromCartTool,
  applyCouponTool,
} from './tools/cartTools';
import {
  addToWishlistTool,
  removeFromWishlistTool,
  getWishlistTool,
} from './tools/wishlistTools';
import {
  getOrderHistoryTool,
  getOrderDetailsTool,
  cancelOrderTool,
  createOrderTool,
} from './tools/orderTools';

export function registerAllWebMCPTools() {
  // Product & Catalog Tools (Public)
  webmcpRegistry.registerTool(searchProductsTool);
  webmcpRegistry.registerTool(getProductDetailsTool);
  webmcpRegistry.registerTool(filterProductsTool);
  webmcpRegistry.registerTool(sortProductsTool);
  webmcpRegistry.registerTool(getProductRecommendationsTool);
  webmcpRegistry.registerTool(compareProductsTool);
  webmcpRegistry.registerTool(checkProductStockTool);
  webmcpRegistry.registerTool(getCurrentPromotionsTool);

  // Cart & Promotions Tools (Auth required)
  webmcpRegistry.registerTool(addToCartTool);
  webmcpRegistry.registerTool(getCartTool);
  webmcpRegistry.registerTool(updateCartQuantityTool);
  webmcpRegistry.registerTool(removeFromCartTool);
  webmcpRegistry.registerTool(applyCouponTool);

  // Wishlist Tools (Auth required)
  webmcpRegistry.registerTool(addToWishlistTool);
  webmcpRegistry.registerTool(removeFromWishlistTool);
  webmcpRegistry.registerTool(getWishlistTool);

  // Order & Checkout Tools (Auth required)
  webmcpRegistry.registerTool(getOrderHistoryTool);
  webmcpRegistry.registerTool(getOrderDetailsTool);
  webmcpRegistry.registerTool(cancelOrderTool);
  webmcpRegistry.registerTool(createOrderTool);
}

export * from './types';
export * from './registry';
