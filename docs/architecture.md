# System Architecture

## Overview

AgentBridge is a Next.js 14 full-stack e-commerce application that serves both human shoppers and AI agents through a unified, server-authoritative architecture. The same API routes, service layer, and database serve both the React UI and WebMCP tool invocations, ensuring consistent behavior, security enforcement, and state management regardless of the caller.

## Architecture Diagram

```
                         ┌──────────────────────┐
                         │       AI Agent       │
                         │   (Browser Context)  │
                         └──────────┬───────────┘
                                    │
                          document.modelContext
                        getTools() / executeTool()
                                    │
                         ┌──────────▼───────────┐
                         │   WebMCP Registry    │
                         │                      │
                         │  • Tool Registration │
                         │  • Schema Validation │
                         │  • State Gating      │
                         │  • Error Structuring │
                         │  • Native Bridge     │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                   │
      ┌──────────▼──────────┐ ┌────▼────────┐ ┌───────▼──────────┐
      │     React UI        │ │ API Routes  │ │  Context Layer   │
      │     (Next.js)       │ │ (18 routes) │ │ (Auth/Cart/WL)   │
      └──────────┬──────────┘ └─────┬───────┘ └──────────────────┘
                 │                  │
                 └────────┬─────────┘
                 ┌────────▼─────────┐
                 │ Commerce Services│
                 │                  │
                 │  productService  │
                 │  cartService     │
                 │  orderService    │
                 │  wishlistService │
                 │  couponService   │
                 └────────┬─────────┘
                 ┌────────▼─────────┐
                 │   PostgreSQL     │
                 │  (Neon / Prisma) │
                 └──────────────────┘
```

## Layer Responsibilities

### WebMCP Layer (`src/webmcp/`)

The WebMCP layer is responsible for tool lifecycle management and agent-facing interfaces.

| Component | Responsibility |
|-----------|---------------|
| `registry.ts` | Singleton orchestrator managing tool registration, native `document.modelContext` bridge, `AbortController`-based lifecycle, state tracking, input validation, error structuring, and execution listeners |
| `tools/*.ts` | 29 tool definitions organized by domain (auth, product, cart, wishlist, order, shipping), each with semantic descriptions, JSON schemas, and async execute functions |
| `types.ts` | TypeScript interfaces for `WebMCPTool`, `JSONSchema`, `RegisteredToolInfo`, and response contracts |
| `testing/` | Direct execution trace harness for deterministic testing without browser context |

### Application Layer (`src/app/`)

| Component | Responsibility |
|-----------|---------------|
| Pages | Next.js route handlers for home, products, product detail, cart, checkout, compare, and account |
| API Routes | 18 REST endpoints handling authentication, products, cart, orders, wishlist, coupons, shipping, and addresses |
| Layout | Root layout providing auth, cart, and wishlist context providers plus the WebMCP status indicator |

### Service Layer (`src/lib/services/`)

| Service | Responsibility |
|---------|---------------|
| `productService` | Catalog search, filtering, sorting, recommendations, comparison, and promotions |
| `cartService` | Cart CRUD operations with stock validation, discount calculation, and price aggregation |
| `orderService` | Order creation, history retrieval, detail inspection, and cancellation with ownership verification |
| `wishlistService` | Wishlist item management |
| `couponService` | Coupon code validation and discount resolution |

### Context Layer (`src/context/`)

| Provider | Responsibility |
|----------|---------------|
| `AuthContext` | User authentication state, login/logout handlers, WebMCP auth event synchronization |
| `CartContext` | Cart state management, UI drawer control, WebMCP execution listener for cart count updates |
| `WishlistContext` | Wishlist state management |

### Data Layer

| Component | Technology |
|-----------|-----------|
| ORM | Prisma 5 with type-safe client generation |
| Database | PostgreSQL hosted on Neon |
| Models | User, Address, Category, Product, Review, Cart, CartItem, Wishlist, WishlistItem, Order, OrderItem, Coupon |

## Data Flow

### Human User Path

```
Browser → React Component → fetch(/api/...) → API Route Handler
  → Authentication Check → Service Layer → Prisma Client → PostgreSQL
  → Response → React State Update → UI Re-render
```

### AI Agent Path

```
Agent → document.modelContext.executeTool(name, input)
  → WebMCP Registry: validate schema, check auth, check state
  → Tool.execute() → fetch(/api/...) → API Route Handler
  → Authentication Check → Service Layer → Prisma Client → PostgreSQL
  → Response → Registry: update state, notify listeners
  → Structured Result → Agent
```

Both paths share identical API routes, service logic, database operations, and security enforcement. The WebMCP registry adds a validation and state-gating layer before the API call, ensuring agents receive structured error responses for invalid inputs, missing authentication, or unavailable state before any server communication occurs.

## Cross-Boundary State Synchronization

When an AI agent modifies application state through WebMCP tools (e.g., logging in, adding to cart), the changes must be reflected in both the WebMCP registry and the React UI:

- **Authentication**: Auth tools dispatch a `webmcp-auth-change` `CustomEvent` on `window`. The `AuthContext` listens for this event and updates its state, ensuring the UI reflects agent-initiated login/logout.
- **Cart state**: The `CartContext` subscribes to WebMCP execution events. Cart-modifying tool results update the cart item count, which the registry uses to gate `create_order` availability.
- **Tool availability**: The registry re-syncs with the native `document.modelContext` API on every state change, aborting stale registrations and creating new ones via `AbortController` signals.
