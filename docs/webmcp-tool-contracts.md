# WebMCP tool contracts

## Contract rules

- Tool inputs are JSON objects and are checked for required fields, primitive types, and declared enums by the registry.
- Product and order identifiers must come from a prior catalog or account result.
- Successful tools return the API’s structured success payload. Failures retain `success: false`, a stable `error` code, a message, and registry-generated `errorDetails` where the failure occurs before the API call.
- `errorDetails` contains `code`, `message`, `retryable`, and, when applicable, `userActionRequired`.

## Tool inventory

| Tool | Permission / state | Required input | Primary outcome |
| --- | --- | --- | --- |
| `search_products` | Public | `query` | Matching catalog products |
| `get_product_details` | Public | `productId` | Product, specifications, price, and stock |
| `filter_products` | Public | None | Filtered catalog products |
| `sort_products` | Public | `sortBy` | Sorted catalog products |
| `get_product_recommendations` | Public | None | Related or category recommendations |
| `compare_products` | Public | `productIds` | Side-by-side products |
| `check_product_stock` | Public | `productId` | Stock count and availability status |
| `get_current_promotions` | Public | None | Active promotions and coupons |
| `get_available_product_variants` | Public | `productId` | Derived presentation options and stock |
| `get_shipping_estimate` | Public | `zipCode` | Shipping options and estimates |
| `add_to_cart` | Authenticated | `productId` | Updated cart |
| `get_cart` | Authenticated | None | Lines, quantities, prices, and totals |
| `update_cart_quantity` | Authenticated | `productId`, `quantity` | Updated cart |
| `remove_from_cart` | Authenticated | `productId` | Updated cart |
| `clear_cart` | Authenticated | None | Empty updated cart |
| `apply_coupon` | Authenticated | `code` | Recalculated cart |
| `add_to_wishlist` | Authenticated | `productId` | Updated wishlist |
| `remove_from_wishlist` | Authenticated | `productId` | Updated wishlist |
| `get_wishlist` | Authenticated | None | Saved products |
| `get_order_history` | Authenticated | None | Caller-owned orders |
| `get_order_details` | Authenticated | `orderId` | Caller-owned order details |
| `cancel_order` | Authenticated | `orderId` | Eligible-order cancellation result |
| `create_order` | Transactional, cart populated | Address fields and `confirmDemoOrder: true` | Demo order; `DEMO_CARD` only |
| `get_saved_addresses` | Authenticated | None | Caller-owned addresses |
| `update_shipping_address` | Authenticated | Address fields | Created or updated address |

## Error semantics

| Code | Meaning | Retryable |
| --- | --- | --- |
| `TOOL_NOT_FOUND` | Tool is not registered on the page | No |
| `INVALID_INPUT` | Input is missing or violates the declared schema | No |
| `AUTHENTICATION_REQUIRED` | A protected tool was called while signed out | No |
| `CART_EMPTY` | A cart-populated tool was called without cart contents | No |
| `EXECUTION_ERROR` | Browser/API transport execution failed | Yes |

API business errors, including stock, coupon, ownership, and order-state failures, are passed through in their API response. Callers should treat `success: false` as authoritative and avoid automatic retries unless the error is explicitly retryable.
