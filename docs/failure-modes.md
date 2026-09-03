# Failure Modes

This document catalogs known failure modes, their causes, and expected agent behavior.

## Registry-Level Failures

| Failure | Error Code | Retryable | Agent Action |
|---------|-----------|-----------|--------------|
| Tool does not exist | `TOOL_NOT_FOUND` | No | Stop. Do not guess tool names. |
| Missing required parameter | `INVALID_INPUT` | No | Gather the missing information from the user or a prior tool result. |
| Wrong parameter type | `INVALID_INPUT` | No | Correct the type and retry. |
| Invalid enum value | `INVALID_INPUT` | No | Use one of the documented enum values. |
| Constraint violation (min/max) | `INVALID_INPUT` | No | Adjust the value to be within bounds. |
| Not authenticated | `AUTHENTICATION_REQUIRED` | No | Use the `login` or `register` tool first. |
| Cart is empty (checkout) | `CART_EMPTY` | No | Add items to the cart first. |
| Network/transport failure | `EXECUTION_ERROR` | Yes | Retry after a brief delay. |

## API-Level Business Failures

| Failure | Error Code | Retryable | Agent Action |
|---------|-----------|-----------|--------------|
| Product not found | `PRODUCT_NOT_FOUND` | No | The product ID is invalid. Search for the correct product. |
| Insufficient stock | `INSUFFICIENT_STOCK` | No | Inform the user. Suggest alternatives or a smaller quantity. |
| Exceeds available stock | `EXCEEDS_STOCK` | No | Reduce the quantity to be within the available stock. |
| Item not in cart | `ITEM_NOT_IN_CART` | No | The product was not added to the cart. Check cart contents. |
| Invalid coupon code | `INVALID_COUPON` | No | Ask the user for a different code. Use `get_current_promotions` to find valid codes. |
| Expired coupon | `COUPON_EXPIRED` | No | Inform the user. Suggest active promotions. |
| Order not found | `ORDER_NOT_FOUND` | No | The order ID is invalid. Use `get_order_history` to find the correct ID. |
| Unauthorized access | `UNAUTHORIZED_ACCESS` | No | The user does not own this resource. Do not retry. |
| Order not cancellable | `NOT_CANCELLABLE` | No | Order is SHIPPED or DELIVERED. Inform user about return process. |
| Already cancelled | `ALREADY_CANCELLED` | No | No action needed. Inform the user. |
| Demo payment only | `DEMO_PAYMENT_ONLY` | No | Use `DEMO_CARD` as the payment method. |
| Confirmation required | `DEMO_ORDER_CONFIRMATION_REQUIRED` | No | Set `confirmDemoOrder: true` after user explicitly confirms. |
| Invalid credentials | (success: false) | No | Check email/password. Do not retry with the same credentials. |
| Duplicate email | (success: false) | No | The email is already registered. Use `login` instead. |

## Execution Order Failures

| Scenario | Expected Agent Behavior |
|----------|------------------------|
| Checkout before adding items | Agent should recognize `create_order` is unavailable and suggest adding items first. |
| Protected operation before login | Agent should detect `AUTHENTICATION_REQUIRED` and use the `login` tool. |
| Get order details without order history | Agent should call `get_order_history` first to obtain valid order IDs. |
| Compare products without search | Agent should search for products first to obtain valid product IDs. |
| Add to cart without product search | Agent should search for or identify a product first. |

## Mid-Chain Failures

| Scenario | Expected Agent Behavior |
|----------|------------------------|
| Search succeeds, add to cart fails (out of stock) | Report the stock issue. Suggest alternatives via `get_product_recommendations`. |
| Add to cart succeeds, checkout fails (coupon invalid) | Report the coupon error. Proceed without coupon or find valid ones via `get_current_promotions`. |
| Login succeeds, cart operation fails (network) | Retry the cart operation (EXECUTION_ERROR is retryable). |
| Multiple operations, one fails mid-chain | Complete successful operations, report the failure, and suggest recovery. |

## Agent Recovery Patterns

1. **Authentication required** → Call `login` → Retry the original operation
2. **Product not found** → Call `search_products` → Use a valid product ID
3. **Out of stock** → Call `get_product_recommendations` → Suggest alternatives
4. **Invalid coupon** → Call `get_current_promotions` → Suggest valid codes
5. **Order not found** → Call `get_order_history` → Use a valid order ID
6. **Network failure** → Wait briefly → Retry (up to 2 retries for EXECUTION_ERROR)
7. **Cart empty for checkout** → Call `add_to_cart` → Then `create_order`
