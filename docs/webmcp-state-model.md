# WebMCP state model

| Application state | Native tools exposed | Expected behavior |
| --- | --- | --- |
| Guest/catalog | Public catalog and shipping tools | Search, filter, inspect products, compare products, and calculate shipping only. |
| Authenticated, cart empty | Public and authenticated account, cart, wishlist, and order-management tools; no `create_order` | Cart reads return an empty structured cart; mutation tools validate product ID and quantity. |
| Authenticated, cart populated | Public and authenticated tools plus `create_order` | The checkout tool is registered only while the current cart contains an item. |
| Demo checkout confirmation | `create_order` | The caller must provide `confirmDemoOrder: true`; the API accepts only `DEMO_CARD` and records an order only in this demo database. |
| Checkout completed | Public and authenticated tools; no `create_order` | No duplicate checkout completion tool remains active. |
| Logged out | Public tools only | Protected tools are unregistered from native WebMCP. The UI may show login affordances separately. |

The current code implements all listed registration boundaries. `create_order` is a demo-only transactional tool: it is unavailable for an empty cart, requires an explicit confirmation field, and the API rejects non-demo payment methods. There is no production payment integration.

## State transitions

`login` registers protected tools. `logout` aborts their native registrations and resets cart state. Cart mutation responses return an updated cart summary, which updates WebMCP availability and the page cart state. The registry aborts the native `create_order` registration when the cart becomes empty, including after an order is created.

Evaluation cases are inventory-agnostic. They express intent and use runtime placeholders such as `${criteria}`, `${resolvedProductId}`, and `${cartItemProductId}`. Fixture providers resolve those values at execution time; the cases must never contain a production/demo SKU, price, brand, or category.
