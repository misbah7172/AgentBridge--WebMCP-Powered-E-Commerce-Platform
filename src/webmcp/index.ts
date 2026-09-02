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
  getAvailableProductVariantsTool,
} from './tools/productTools';
import {
  addToCartTool,
  getCartTool,
  updateCartQuantityTool,
  removeFromCartTool,
  clearCartTool,
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
import {
  getShippingEstimateTool,
  getSavedAddressesTool,
  updateShippingAddressTool,
} from './tools/shippingTools';

export const webmcpTools = [
  searchProductsTool, getProductDetailsTool, filterProductsTool, sortProductsTool,
  getProductRecommendationsTool, compareProductsTool, checkProductStockTool,
  getCurrentPromotionsTool, getAvailableProductVariantsTool,
  addToCartTool, getCartTool, updateCartQuantityTool, removeFromCartTool,
  clearCartTool, applyCouponTool,
  addToWishlistTool, removeFromWishlistTool, getWishlistTool,
  getOrderHistoryTool, getOrderDetailsTool, cancelOrderTool, createOrderTool,
  getShippingEstimateTool, getSavedAddressesTool, updateShippingAddressTool,
];

export function registerAllWebMCPTools() {
  webmcpTools.forEach((tool) => webmcpRegistry.registerTool(tool));
}

export * from './types';
export * from './registry';
