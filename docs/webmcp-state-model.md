# WebMCP state model

| Application state | Native tools exposed | Expected behavior |
| --- | --- | --- |
| Guest/catalog | Public catalog and shipping tools | Search, filter, inspect products, compare products, and calculate shipping only. |
| Authenticated, cart empty | Public tools plus `get_cart`, `add_to_cart`, `update_cart_quantity`, `remove_from_cart`, `clear_cart`, and `apply_coupon` | Cart reads return an empty structured cart; mutation tools validate product ID and quantity. |
| Authenticated, cart populated | Cart tools plus `start_checkout` | Cart output supplies product IDs and totals for follow-up steps. |
| Demo checkout started | `get_cart`, `apply_coupon`, `complete_checkout`, and address tools | `complete_checkout` is explicitly sandbox-only and requires a user confirmation in the human UI. |
| Checkout completed | `get_order_history`, `get_order_details` | No duplicate checkout completion tool remains active. |
| Logged out | Public tools only | Protected tools are unregistered from native WebMCP. The UI may show login affordances separately. |

The current code implements the first, guest, and authenticated registration boundary. `clear_cart`, `start_checkout`, and a sandbox-only `complete_checkout` remain planned canonical tools; they are not yet registered as native tools.

## State transitions

`login` registers protected tools. `logout` aborts their native registrations. Cart mutation responses must return an updated cart summary. A future checkout state controller must use `AbortController` registrations so tool availability follows the active UI route and transaction phase.

Evaluation cases are inventory-agnostic. They express intent and use runtime placeholders such as `${criteria}`, `${resolvedProductId}`, and `${cartItemProductId}`. Fixture providers resolve those values at execution time; the cases must never contain a production/demo SKU, price, brand, or category.
