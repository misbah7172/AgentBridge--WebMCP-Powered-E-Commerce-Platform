# Architecture

## System Overview

AgentBridge is a Next.js e-commerce application that serves both human shoppers and AI agents through a unified architecture. The same APIs and business logic serve both the React UI and WebMCP tool invocations.

## Architecture Diagram

```
                 AI Agent (Browser)
                     │
                     │ WebMCP
                     ▼
           ┌──────────────────┐
           │   AgentBridge    │
           │ Native WebMCP    │
           ├──────────────────┤
           │ Tool Registry    │ ← WebMCPRegistry class
           │ Tool Discovery   │ ← getTools() / subscribe()
           │ Tool Schemas     │ ← JSON Schema validation
           │ Tool Execution   │ ← executeTool()
           │ State Awareness  │ ← Auth + Cart state gating
           │ Input Validation │ ← Type, enum, constraint checks
           │ Error Handling   │ ← Structured error responses
           └────────┬─────────┘
                    │
                    ▼
           ┌──────────────────┐
           │   Next.js App    │
           ├──────────────────┤
           │ React UI         │ ← Pages, components
           │ Context Providers│ ← Auth, Cart, Wishlist
           │ API Routes       │ ← Same-origin REST endpoints
           └────────┬─────────┘
                    │
                    ▼
           ┌──────────────────┐
           │ Commerce Services│
           ├──────────────────┤
           │ Product Service  │
           │ Cart Service     │
           │ Order Service    │
           │ Wishlist Service │
           │ Coupon Service   │
           │ Auth Utilities   │
           └────────┬─────────┘
                    │
                    ▼
           ┌──────────────────┐
           │ PostgreSQL/Neon  │
           │ via Prisma ORM   │
           └──────────────────┘
```

## Layer Responsibilities

### WebMCP Layer (`src/webmcp/`)
- **Registry** — singleton that manages tool lifecycle, state, and native WebMCP bridge
- **Tools** — 29 tool definitions with schemas and execute functions
- **Types** — TypeScript interfaces for tools, schemas, and responses
- **Testing** — Direct execution harness for deterministic testing

### Application Layer (`src/app/`)
- **Pages** — Next.js pages for home, products, cart, checkout, account, compare
- **API Routes** — 18 REST endpoints handling all commerce operations
- **Layout** — Root layout with auth/cart/wishlist providers and WebMCP indicator

### Service Layer (`src/lib/services/`)
- **productService** — Catalog search, filter, sort, recommendations, comparison, promotions
- **cartService** — Cart CRUD with stock validation and price calculation
- **orderService** — Order creation, history, details, cancellation with authorization
- **wishlistService** — Wishlist management
- **couponService** — Coupon validation

### Context Layer (`src/context/`)
- **AuthContext** — User authentication state, login/logout, WebMCP auth event sync
- **CartContext** — Cart state, UI drawer, WebMCP execution listener
- **WishlistContext** — Wishlist state management

### Data Layer
- **Prisma ORM** — Type-safe database access
- **PostgreSQL/Neon** — Cloud PostgreSQL database
- **Schema** — 11 models: User, Address, Category, Product, Review, Cart, CartItem, Wishlist, WishlistItem, Order, OrderItem, Coupon

## Data Flow

### Human User
```
Browser → React UI → API Route → Service → Prisma → PostgreSQL
```

### AI Agent
```
Agent → document.modelContext.executeTool() → WebMCP Registry
  → Validates auth/state/input
  → Tool.execute() → fetch(/api/...) → API Route → Service → Prisma → PostgreSQL
  → Returns structured result → Agent processes result
```

Both paths share identical API routes, services, and database, ensuring consistent behavior and security enforcement.
