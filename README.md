# AgentBridge — WebMCP-Powered E-Commerce Platform

AgentBridge is a full-stack e-commerce application that implements browser-native WebMCP (Web Model Context Protocol) to expose structured commerce operations as discoverable, schema-validated tools for AI agents — while preserving a conventional shopping experience for human users.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution](#3-solution)
4. [What is WebMCP?](#4-what-is-webmcp)
5. [System Architecture](#5-system-architecture)
6. [Agent–Browser–WebMCP Flow](#6-agentbrowserwebmcp-flow)
7. [Tool Inventory](#7-tool-inventory)
8. [Tool Discovery and State-Aware Exposure](#8-tool-discovery-and-state-aware-exposure)
9. [Schema Validation and Contracts](#9-schema-validation-and-contracts)
10. [Error Handling and Safety](#10-error-handling-and-safety)
11. [Agent Journeys](#11-agent-journeys)
12. [Testing Strategy](#12-testing-strategy)
13. [Evaluation Framework](#13-evaluation-framework)
14. [Browser Verification](#14-browser-verification)
15. [Metrics Summary](#15-metrics-summary)
16. [Technology Stack](#16-technology-stack)
17. [Project Structure](#17-project-structure)
18. [Setup and Installation](#18-setup-and-installation)
19. [Running the Application](#19-running-the-application)
20. [Running Tests](#20-running-tests)
21. [Running Evaluations](#21-running-evaluations)
22. [Environment Variables](#22-environment-variables)
23. [Security Model](#23-security-model)
24. [Architectural Decisions](#24-architectural-decisions)
25. [Limitations](#25-limitations)
26. [References](#26-references)
27. [License](#27-license)

---

## 1. Overview

AgentBridge is a Next.js 14 storefront backed by Prisma 5 and PostgreSQL (Neon). It registers **32 WebMCP tools** on `document.modelContext`, enabling AI agents operating within the browser to search products, compare products side-by-side or serially, manage carts, handle wishlists, navigate pages, place demo orders, and authenticate — all through the same server-authoritative API routes used by the React UI.

Human shoppers and AI agents share identical business logic, database, authentication, and authorization. No separate API surface or external adapter exists.

## 2. Problem Statement

Visual inference is unreliable for authenticated commerce operations that require validated identifiers, ownership verification, stock checks, and safe state mutations. Agents that parse page layout cannot reliably execute multi-step workflows such as cart management, coupon application, or order placement.

## 3. Solution

AgentBridge exposes typed, schema-validated browser tools that invoke the same same-origin API routes as the UI. The server enforces all business rules — authentication, authorization, stock availability, coupon validity, and order-state transitions — regardless of whether the caller is a human or an agent.

## 4. What is WebMCP?

WebMCP (Web Model Context Protocol) is an emerging browser API that allows web pages to register structured tools for AI agents operating within the active browser context. Unlike remote MCP servers, WebMCP tools execute within the browser's same-origin security boundary, inheriting the user's session, cookies, and permissions.

For detailed specification alignment, see [docs/webmcp.md](docs/webmcp.md).

## 5. System Architecture

```
                    ┌─────────────────────┐
                    │      AI Agent       │
                    │  (Browser Context)  │
                    └──────────┬──────────┘
                               │ document.modelContext
                               │ getTools() / executeTool()
                    ┌──────────▼──────────┐
                    │   WebMCP Registry   │
                    │  ┌───────────────┐  │
                    │  │ 32 Tools      │  │
                    │  │ Schema Valid. │  │
                    │  │ State Gating  │  │
                    │  │ Error Struct. │  │
                    │  └───────┬───────┘  │
                    └──────────┼──────────┘
            ┌──────────────────┼──────────────────┐
            │                  │                  │
   ┌────────▼────────┐ ┌──────▼──────┐ ┌────────▼────────┐
   │   React UI      │ │  API Routes │ │  Context Layer  │
   │   (Next.js)     │ │ (18 routes) │ │ (Auth/Cart/WL)  │
   └────────┬────────┘ └──────┬──────┘ └─────────────────┘
            │                 │
            └────────┬────────┘
            ┌────────▼────────┐
            │ Commerce Services│
            │ (Product, Cart, │
            │  Order, Coupon) │
            └────────┬────────┘
            ┌────────▼────────┐
            │  PostgreSQL     │
            │  (Neon / Prisma)│
            └─────────────────┘
```

Both entry points — the React UI and the WebMCP tool layer — converge on the same API routes and service layer. For detailed diagrams, see [docs/architecture.md](docs/architecture.md).

## 6. Agent–Browser–WebMCP Flow

1. The browser loads the application. Next.js responds with `Origin-Agent-Cluster: ?1` and `Permissions-Policy: tools=(self)`.
2. The `WebMCPRegistry` registers public tools on `document.modelContext`. Protected tools are registered but marked as requiring authentication.
3. The agent discovers available tools via `document.modelContext.getTools()`, receiving each tool's name, description, schema, and current availability status.
4. The agent invokes a tool via `document.modelContext.executeTool(name, input)`. The registry validates the input, checks auth and state requirements, then executes the tool.
5. The tool calls the same-origin API via `fetch()` or performs validated in-browser navigation. The server validates the request, executes the business logic, and returns a structured response.
6. Cart and authentication state changes propagate to both the WebMCP registry (updating tool availability) and the React UI (updating visual state).

## 7. Tool Inventory

AgentBridge registers **32 tools** across seven categories:

| Category | Tools | Permission |
|----------|-------|-----------|
| **Navigation** | `navigate_to_page`, `view_product_page`, `view_comparison_page` | Public |
| **Authentication** | `login`, `register`, `logout`, `get_account_info` | Public / Authenticated |
| **Product Catalog** | `search_products`, `get_product_details`, `filter_products`, `sort_products`, `get_product_recommendations`, `compare_products`, `check_product_stock`, `get_current_promotions`, `get_available_product_variants` | Public |
| **Cart Management** | `add_to_cart`, `get_cart`, `update_cart_quantity`, `remove_from_cart`, `clear_cart`, `apply_coupon` | Authenticated |
| **Wishlist** | `add_to_wishlist`, `remove_from_wishlist`, `get_wishlist` | Authenticated |
| **Order Management** | `get_order_history`, `get_order_details`, `cancel_order`, `create_order` | Authenticated / Transactional |
| **Shipping & Address** | `get_shipping_estimate`, `get_saved_addresses`, `update_shipping_address` | Public / Authenticated |

For complete schemas, parameters, and API mappings, see the [tool inventory](tools/tool-inventory.md) and [tool contracts](docs/webmcp-tool-contracts.md).

## 8. Tool Discovery and State-Aware Exposure

Tool availability is governed by a three-tier state model:

| Application State | Available Tools | Restrictions |
|-------------------|----------------|--------------|
| Guest (not authenticated) | Public tools + `login`, `register`, `get_account_info` | Protected tools return `AUTHENTICATION_REQUIRED` |
| Authenticated, cart empty | Public + all authenticated tools | `create_order` returns `CART_EMPTY` |
| Authenticated, cart populated | All tools including `create_order` | `create_order` requires `confirmDemoOrder: true` |

State transitions are reactive. Login exposes protected tools immediately. Cart mutations update `create_order` availability. Logout revokes all protected tool registrations. See [docs/webmcp-state-model.md](docs/webmcp-state-model.md).

## 9. Schema Validation and Contracts

The registry validates every tool invocation before execution:

- **Required fields** — missing parameters produce `INVALID_INPUT` with the field name
- **Type checking** — `string`, `number`, `integer`, `boolean`, `array` with strict enforcement
- **Integer validation** — `Number.isInteger()` check for quantity and count fields
- **Enum constraints** — `sortBy` values restricted to documented options
- **Range constraints** — `minimum` / `maximum` bounds on numeric parameters
- **Identifier provenance** — tool descriptions specify that IDs must come from prior catalog results

## 10. Error Handling and Safety

### Registry-Level Errors

| Code | Condition | Retryable |
|------|-----------|-----------|
| `TOOL_NOT_FOUND` | Tool name not registered | No |
| `INVALID_INPUT` | Schema validation failure | No |
| `AUTHENTICATION_REQUIRED` | Protected tool called while unauthenticated | No |
| `CART_EMPTY` | Cart-dependent tool called with empty cart | No |
| `EXECUTION_ERROR` | Network or runtime failure | Yes |

### API-Level Business Errors

API responses retain their structured error payloads (`PRODUCT_NOT_FOUND`, `INSUFFICIENT_STOCK`, `UNAUTHORIZED_ACCESS`, `NOT_CANCELLABLE`, etc.). The registry does not mask or transform these. For the complete error catalog and recovery patterns, see [docs/failure-modes.md](docs/failure-modes.md).

## 11. Agent Journeys

The following multi-step journeys are validated through both deterministic tests and evaluation cases:

| Journey | Steps |
|---------|-------|
| **A — Product Discovery** | `search_products` → `get_product_details` → `add_to_cart` → `get_cart` |
| **B — Comparison Shopping** | `search_products` → `compare_products` → `add_to_cart` → `update_cart_quantity` → `get_cart` |
| **C — Authentication Recovery** | Detect `AUTHENTICATION_REQUIRED` → `login` → retry protected operation |
| **D — Demo Checkout** | `search_products` → `add_to_cart` → `get_cart` → `create_order` |

## 12. Testing Strategy

Testing is organized in four tiers:

| Tier | Scope | Runner | Count |
|------|-------|--------|-------|
| **Deterministic** | Registry, schemas, contracts, navigation, state journeys, failure modes | `npm test` (Vitest) | 67 tests |
| **Integration** | End-to-end service execution against database | `npm run test:webmcp:integration` | 23 tests |
| **Browser E2E** | UI flows + `document.modelContext` verification | `npm run test:webmcp:e2e` (Playwright) | 7 specs |
| **LLM Evaluation** | Model planning accuracy (tool selection, arguments, chains) | `npm run eval:webmcp:llm` | 16 cases |

For detailed coverage breakdown, see [docs/testing.md](docs/testing.md).

## 13. Evaluation Framework

The LLM evaluation framework measures AI agent planning accuracy without executing tools or mutating application state:

- **Tool Selection Accuracy** — correct tool set identified (order-independent)
- **Argument Accuracy** — correct parameters provided for each call
- **Chain Accuracy** — correct execution sequence (order-dependent)
- **Recovery Accuracy** — graceful handling of edge cases and unavailable tools
- **Latency** — mean response time per case

The framework supports pluggable providers via the `LLMProvider` interface, with built-in support for OpenAI and a mock provider for CI environments. For methodology details, see [docs/evaluation.md](docs/evaluation.md).

## 14. Browser Verification

WebMCP compliance is verified through:

- **Response headers**: `Origin-Agent-Cluster: ?1` and `Permissions-Policy: tools=(self)` confirmed via Chrome DevTools
- **Native tool registration**: Verified via Chrome Model Context Tool Inspector
- **Automated E2E**: Playwright specs validate `document.modelContext` availability, tool discovery, execution, and state transitions

See [docs/webmcp-browser-verification.md](docs/webmcp-browser-verification.md) for the verification protocol.

## 15. Metrics Summary

| Metric | Result |
|--------|--------|
| Registered tools | 32 |
| Deterministic tests | 67 passed |
| Integration tests | 23 passed |
| Evaluation dataset | 16/16 schema valid |
| Browser E2E | 7 specs |
| Response headers | Verified |
| Inspector verification | Manually verified |
| LLM planning metrics | Pending (no provider key configured) |

## 16. Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14, React 18 |
| Language | TypeScript 5 |
| Database | PostgreSQL (Neon), Prisma 5 ORM |
| Authentication | JWT (jose), HTTP-only cookies |
| WebMCP | Chrome Imperative API (`document.modelContext`) |
| Testing | Vitest 2, Playwright |
| Deployment | Netlify (Node.js 20) |

## 17. Project Structure

```
├── src/
│   ├── app/                    # Next.js pages and API routes (18 endpoints)
│   ├── webmcp/
│   │   ├── registry.ts         # WebMCPRegistry — singleton orchestrator
│   │   ├── types.ts            # Tool, schema, and response interfaces
│   │   ├── index.ts            # Tool registration entry point
│   │   ├── tools/
│   │   │   ├── authTools.ts    # login, register, logout, get_account_info
│   │   │   ├── productTools.ts # 9 catalog tools
│   │   │   ├── cartTools.ts    # 6 cart management tools
│   │   │   ├── orderTools.ts   # 4 order management tools
│   │   │   ├── wishlistTools.ts# 3 wishlist tools
│   │   │   └── shippingTools.ts# 3 shipping/address tools
│   │   └── testing/            # Direct execution trace harness
│   ├── lib/                    # Auth, checkout policy, commerce services
│   ├── context/                # React context providers (Auth, Cart, Wishlist)
│   └── components/             # UI components including WebMCP Indicator
├── tests/
│   ├── webmcp/tools/           # 7 deterministic test files (57 tests)
│   └── browser/                # Playwright E2E specs
├── evals/                      # 16 LLM evaluation cases (JSON)
├── scripts/                    # Eval runners and provider abstraction
├── docs/                       # Architecture, testing, evaluation, decisions
├── tools/                      # Machine-readable tool inventory
└── prisma/                     # Schema and migrations
```

## 18. Setup and Installation

**Prerequisites**: Node.js 20+, PostgreSQL instance (Neon recommended).

```bash
git clone https://github.com/misbah7172/AgentBridge--WebMCP-Powered-E-Commerce-Platform.git
cd AgentBridge--WebMCP-Powered-E-Commerce-Platform
npm install
cp .env.example .env        # Configure DATABASE_URL and JWT_SECRET
npm run db:push
npm run db:seed
```

## 19. Running the Application

```bash
npm run dev
```

Open `http://localhost:3000`. For WebMCP tool inspection, enable `chrome://flags/#enable-webmcp-testing` in Chrome and use the Model Context Tool Inspector extension.

## 20. Running Tests

```bash
# Deterministic tests (57 tests, no database required)
npm test

# Database integration tests (requires TEST_DATABASE_URL)
npm run test:webmcp:integration

# Browser E2E tests (requires running application)
npm run test:webmcp:e2e
```

Refer to [docs/webmcp-testing-environment.md](docs/webmcp-testing-environment.md) for database configuration.

## 21. Running Evaluations

```bash
# Schema validation (database-free)
npm run eval:webmcp

# LLM planning evaluation (requires OPENAI_API_KEY)
npm run eval:webmcp:llm
```

## 22. Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Session token signing key |
| `TEST_DATABASE_URL` | For integration tests | Isolated test database URL |
| `WEBMCP_TEST_DATABASE` | For integration tests | Acknowledgement flag (`true`) |
| `WEBMCP_ALLOW_SHARED_DATABASE` | Optional | Permit integration tests on application database |
| `OPENAI_API_KEY` | For LLM evals | OpenAI API key |
| `WEBMCP_EVAL_MODEL` | Optional | Model identifier (default: `gpt-5.6-luna`) |
| `WEBMCP_EVAL_PROVIDER` | Optional | Provider override: `openai` or `mock` |

Configuration templates: [`.env.example`](.env.example), [`.env.test.example`](.env.test.example).

## 23. Security Model

| Control | Implementation |
|---------|---------------|
| Session authentication | JWT signed with HS256, HTTP-only cookies, 7-day expiry |
| API authorization | Server-side ownership verification on orders, addresses |
| WebMCP origin restriction | `Permissions-Policy: tools=(self)` |
| Agent isolation | `Origin-Agent-Cluster: ?1` |
| Input validation | Registry-level schema validation before API execution |
| Demo checkout gating | Requires populated cart, `confirmDemoOrder: true`, `DEMO_CARD` only |
| Tool scope | Administrative functions are not exposed through WebMCP |

## 24. Architectural Decisions

Key design decisions are documented in [docs/decisions.md](docs/decisions.md):

| Decision | Rationale |
|----------|-----------|
| Native WebMCP only (no adapter/proxy) | Same-origin APIs already exist; an adapter adds latency without benefit |
| Custom `WebMCPRegistry` over `use-webmcp-tool` | The custom registry provides state gating, structured errors, and test harness capabilities that the package does not |
| Auth tools for agent autonomy | Agents must complete full journeys without relying on human UI interaction |
| Integer validation with min/max constraints | Prevents invalid quantities from reaching the API |
| LLM provider abstraction | Enables CI testing without API keys and supports future provider comparisons |

## 25. Limitations

- WebMCP requires Chrome with experimental flag `chrome://flags/#enable-webmcp-testing` enabled.
- Product variants are derived from stored specifications, not SKU-level inventory.
- LLM evaluation metrics require a configured API provider; no results are fabricated when absent.
- This is a demonstration platform with a simulated checkout flow. It does not integrate with production payment processors.

## 26. References

- [Chrome WebMCP Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [Chrome WebMCP Security Guidance](https://developer.chrome.google.cn/docs/ai/webmcp/secure-tools)
- [Prisma ORM Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 27. License

Distributed under the [MIT License](LICENSE).
