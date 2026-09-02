# WebMCP audit

Audit date: 2026-09-02

## Classification

**B. Partially correct WebMCP implementation.**

The application has a browser-resident tool registry and, when a native WebMCP implementation is present, forwards registrations to it. It is not a remote MCP server. However, it also installs a custom `document.modelContext` compatibility object, exposes every tool at initial mount regardless of page state, and uses inconsistent error and input-validation contracts. Those choices make it useful in a compatibility client but not yet a production-quality implementation of the current Chrome WebMCP model.

## Current architecture

- **Frontend/backend:** Next.js 14 App Router with React 18. Server routes under `src/app/api` are the API layer.
- **Database:** Prisma ORM with PostgreSQL (Neon in deployed configuration).
- **State:** React Context for authentication, cart, and wishlist. The server is the source of truth for commerce state.
- **Authentication:** a signed `jose` JWT stored in an HTTP cookie; route handlers resolve the current user before protected actions.
- **Commerce:** catalog search/filter/detail/compare, cart, coupons, wishlist, addresses, shipping estimates, and demo order creation/cancellation.
- **Build/tests:** `next build`, Prisma generation, and Vitest. Existing `tests/webmcp.test.ts` is an integration-oriented suite that uses the configured database.

## Existing WebMCP architecture

`AuthProvider` runs `registerAllWebMCPTools()` once after client mount. `WebMCPRegistry` stores application tools in a `Map`, mirrors a native `document.modelContext.registerTool` when one is detected, and tracks authentication state. Tool implementations call same-origin Next API routes with `fetch`; they do not call Prisma directly, manipulate the DOM, or operate a remote MCP transport.

The implementation is an **imperative API-style custom abstraction**, not the Chrome Declarative API. It attempts compatibility by installing `document.modelContext` with `registerTool`, `unregisterTool`, `getTools`, and `executeTool` if it believes the native object is missing.

## Registered tool inventory

### Public catalog and shipping

`search_products`, `get_product_details`, `filter_products`, `sort_products`, `get_product_recommendations`, `compare_products`, `check_product_stock`, `get_current_promotions`, `get_available_product_variants`, and `get_shipping_estimate`.

### Authenticated account and cart

`add_to_cart`, `get_cart`, `update_cart_quantity`, `remove_from_cart`, `apply_coupon`, `add_to_wishlist`, `remove_from_wishlist`, `get_wishlist`, `get_order_history`, `get_order_details`, `cancel_order`, `get_saved_addresses`, and `update_shipping_address`.

### Transactional

`create_order` is marked transactional, but it is registered at the same time as every other tool and is not exposed through a separate confirmation/checkout state.

## Registration and application state

All tools register on initial client mount in `src/context/AuthContext.tsx`. Login only changes the registry status from `LOGIN_REQUIRED` to `AVAILABLE`; it does not register or unregister tools. Logout has the reverse effect. Current page, cart contents, checkout progress, and route are not used to change the visible native tool set.

This is a gap against Chrome's state model: WebMCP should expose tools relevant to the page's current context. Protected tools should not appear as callable to an unauthenticated agent, and a checkout/ordering tool should be limited to an explicit safe demo checkout state.

## Execution and API dependencies

Tools call browser `fetch` against same-origin Next API routes. API routes call service modules; services call Prisma. This is the desired separation from the database, but each tool currently forwards API payloads almost unchanged. Most inputs have schema descriptions but are not validated in the client tool before a request. API error responses use mixed shapes such as string `error` values, messages, and optional authentication flags.

## Compliance and runtime findings

- Chrome's current WebMCP APIs require origin isolation and the `tools` Permissions Policy. The app has no explicit `Origin-Agent-Cluster` or Permissions-Policy headers, so availability cannot be guaranteed until browser verification.
- The registry's attempted `document.modelContext` assignment conflicts with a native read-only object in some environments. The observed local browser runtime emitted a read-only `modelContext` error during hydration. A compatibility layer must never overwrite or redefine a native context.
- The registry has a custom `executeTool`; this is useful for test compatibility but must not be treated as evidence that Chrome's native `document.modelContext.executeTool` is supported or callable.
- Native registration is attempted only when a pre-existing context exposes `registerTool`. Tool unregistration does not mirror to the native registry.
- No dedicated runtime audit confirms native registration, parseable schemas, origin isolation, or permissions policy.
- No canonical contracts define response envelopes, typed error codes, retryability, or user-action requirements.
- `get_available_product_variants` fabricates option values from product specifications instead of returning persisted variants; this should not be exposed as authoritative inventory.
- Existing tests access production-like configured data and mutate it. They are not deterministic isolated tool tests and do not cover direct native WebMCP execution, model selection, tool chains, or failure modes.

## Recommended changes

1. Make the registry native-first: never write to a native `document.modelContext`; use a test-only adapter for direct deterministic execution.
2. Define a small canonical commerce tool set and structured `{ success, data | error }` results with stable error codes and retryability.
3. Validate input at tool boundaries before network calls, and preserve HTTP/API failures as structured tool errors.
4. Register/unregister state-dependent tools rather than merely showing an availability label.
5. Add origin-isolation and permissions-policy headers and document the Chrome flag/origin-trial workflow.
6. Create deterministic fixture data and isolated Vitest tool tests. Keep model-selection and end-to-end evaluations in `evals/` and results in `eval-results/`.
7. Add a direct-execution harness that records calls, inputs, output, latency, and before/after state without claiming it is an LLM evaluation.

## What should not be changed

- Preserve the existing Next API/service/Prisma layering and customer-facing UI.
- Do not create a remote MCP server.
- Do not run tests against the shared Neon dataset; use an isolated test database or mocked services.
- Do not expose a real purchase action. Keep checkout completion demo/sandbox-only and confirmation-gated.
