# WebMCP tool contracts

All canonical tools return either `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code", "message", "retryable" } }`. IDs always mean a product UUID or slug returned by a catalog tool; names must be resolved with `search_products` first.

| Tool | Required input | Success data | Error codes |
| --- | --- | --- | --- |
| `search_products` | `query` | `products[]` with `productId`, name, price, currency, stock | `INVALID_INPUT`, `SERVICE_UNAVAILABLE` |
| `get_product_details` | `productId` | product, specs, stock, price | `INVALID_INPUT`, `PRODUCT_NOT_FOUND` |
| `add_to_cart` | `productId`; optional positive `quantity` | updated cart and added line | `AUTHENTICATION_REQUIRED`, `PRODUCT_NOT_FOUND`, `INSUFFICIENT_STOCK`, `INVALID_INPUT` |
| `get_cart` | none | lines, quantities, subtotal, discounts, shipping, tax, total | `AUTHENTICATION_REQUIRED` |
| `update_cart_quantity` | `productId`, positive `quantity` | updated cart | `AUTHENTICATION_REQUIRED`, `ITEM_NOT_IN_CART`, `INSUFFICIENT_STOCK`, `INVALID_INPUT` |
| `remove_from_cart` | `productId` | updated cart and removed product ID | `AUTHENTICATION_REQUIRED`, `ITEM_NOT_IN_CART` |
| `clear_cart` | none | empty cart | `AUTHENTICATION_REQUIRED` |
| `apply_coupon` | `code` | coupon and recalculated cart | `AUTHENTICATION_REQUIRED`, `COUPON_INVALID`, `COUPON_EXPIRED`, `CART_EMPTY` |
| `start_checkout` | none | sandbox checkout session and cart snapshot | `AUTHENTICATION_REQUIRED`, `CART_EMPTY`, `STATE_CONFLICT` |
| `complete_checkout` | checkout session ID and sandbox confirmation | demo order ID and final total | `AUTHENTICATION_REQUIRED`, `CHECKOUT_NOT_STARTED`, `USER_CONFIRMATION_REQUIRED` |

The existing tools retain their current response shape during the initial hardening pass. New and migrated tools must adopt this envelope; adapters should avoid leaking API route, Prisma, or HTTP implementation details.
