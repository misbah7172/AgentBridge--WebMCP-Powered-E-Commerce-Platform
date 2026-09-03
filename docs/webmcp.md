# WebMCP Specification Alignment

## What is WebMCP?

WebMCP (Web Model Context Protocol) is an emerging browser API that allows web pages to register structured tools that AI agents operating within the browser can discover and invoke. Unlike remote MCP servers, WebMCP tools execute within the browser's same-origin context, sharing the user's session, cookies, and security boundaries.

## Why AgentBridge Uses WebMCP

AgentBridge uses Native WebMCP to expose its e-commerce operations as structured, discoverable tools rather than requiring agents to:
- Parse visual page layout (unreliable for complex commerce operations)
- Reverse-engineer API endpoints from network traffic
- Navigate complex multi-step UI flows

WebMCP provides agents with:
- **Stable tool names** that don't change with UI redesigns
- **Typed schemas** that validate input before execution
- **Structured outputs** that are machine-readable
- **State-aware availability** that prevents invalid operations
- **Existing security boundaries** inherited from the browser session

## Native WebMCP Architecture

AgentBridge is a **Category 1 — Native WebMCP implementation**:

```
           AI Agent
              │
              │ WebMCP (document.modelContext)
              ▼
    ┌──────────────────┐
    │   AgentBridge     │
    │ Native WebMCP     │
    ├──────────────────┤
    │ Discovery         │ ← getTools()
    │ Schemas           │ ← inputSchema per tool
    │ Execution         │ ← executeTool()
    │ State Awareness   │ ← auth + cart state gating
    │ Validation        │ ← required fields, types, enums, constraints
    └────────┬─────────┘
             │
             ▼
       Web Application
             │
    ┌────────┴─────────┐
    │ UI / State / API │ ← Same-origin API routes
    └──────────────────┘
```

Tools are registered on `document.modelContext` via the `WebMCPRegistry` class. The registry bridges to the browser's native WebMCP API when available, using `AbortController`-based signal management for tool lifecycle.

## Tool Registration

Tools are registered imperatively during the React application's initial client-side mount in `AuthContext`. Each tool is defined with:
- `name` — stable, semantic identifier
- `description` — agent-friendly natural language guidance
- `inputSchema` — JSON Schema with types, constraints, and descriptions
- `permission` — PUBLIC, AUTHENTICATED, or TRANSACTIONAL
- `availability` — optional state constraint (e.g., CART_POPULATED)
- `execute` — async function that calls the same-origin API

## Tool Discovery

Agents discover tools via `document.modelContext.getTools()`, which returns each tool's name, description, schema, permission, availability, category, and current status (AVAILABLE, LOGIN_REQUIRED, or STATE_UNAVAILABLE).

When the user logs in or out, or when the cart state changes, the registry re-syncs with the native WebMCP API by aborting stale registrations and creating new ones.

## Tool Schemas

Schemas are JSON Schema objects that validate:
- **Required fields** — missing required parameters are rejected before execution
- **Types** — string, number, integer, boolean, array
- **Enums** — allowed values for constrained fields
- **Constraints** — minimum/maximum for numeric fields
- **Descriptions** — semantic descriptions for each parameter

## Tool Execution

Tools execute via `document.modelContext.executeTool(name, input)`. The registry:
1. Validates the tool exists
2. Checks authentication requirements
3. Checks state availability (e.g., cart populated)
4. Validates input against the schema
5. Executes the tool's async function
6. Updates internal state from the result (e.g., cart item count)
7. Returns the structured result

## Structured Outputs

All tool results follow the `ToolExecutionResponse` interface:
- `success: boolean` — whether the operation succeeded
- `error?: string` — stable error code (e.g., 'PRODUCT_NOT_FOUND')
- `message?: string` — human-readable description
- `errorDetails?: { code, message, retryable, userActionRequired }` — structured error metadata
- `data` / domain-specific fields — the actual result data

## Error Handling

Five registry-level error codes:
| Code | Meaning | Retryable |
|------|---------|-----------|
| TOOL_NOT_FOUND | Tool not registered | No |
| INVALID_INPUT | Schema validation failed | No |
| AUTHENTICATION_REQUIRED | Protected tool called while signed out | No |
| CART_EMPTY | Cart-populated tool called with empty cart | No |
| EXECUTION_ERROR | Network/runtime failure | Yes |

API-level business errors (stock, coupon, ownership, order state) are passed through in the API response.

## State-Aware Exposure

See [state model](webmcp-state-model.md) for the complete state transition table.

## Browser Requirements

- Chrome with WebMCP support enabled
- `Origin-Agent-Cluster: ?1` response header
- `Permissions-Policy: tools=(self)` response header

## Security Considerations

- Tools execute within the browser's same-origin context
- HTTP-only JWT cookies provide session authentication
- Server-side API routes enforce ownership, authorization, and business rules
- `tools=(self)` restricts WebMCP tools to the same origin
- Demo checkout requires explicit confirmation and only accepts DEMO_CARD
- Administrative functions are not exposed through WebMCP

## Current Limitations

- WebMCP requires compatible Chrome configuration (experimental feature)
- Product variants are derived from specifications, not SKU-level inventory
- No production payment integration (demo only)
- LLM evaluation metrics require a configured API provider
