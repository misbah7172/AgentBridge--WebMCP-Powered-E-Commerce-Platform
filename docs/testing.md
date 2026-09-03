# Testing Strategy

## Overview

AgentBridge testing validates that WebMCP tools correctly enforce schemas, respect authentication and state boundaries, execute against the correct API endpoints, and produce structured error responses. Testing is organized in four tiers.

## Tier 1: Deterministic Tool Tests

**Location**: `tests/webmcp/tools/`
**Runner**: `npm test` (Vitest)

### Registry Tests (`registry.test.ts`)
- Unknown tool returns structured TOOL_NOT_FOUND error
- Required parameters validated before execution
- Type checking enforced (string, number, integer, boolean, array)
- Protected tools blocked without authentication
- Direct execution trace records input, output, timing, state
- All 29 tools registered with correct status per auth/cart state
- Required field validation for every tool with required params
- Cart-populated `create_order` gating

### Request Contract Tests (`requestContracts.test.ts`)
- Verifies every tool calls the correct API endpoint with correct method
- Validates query parameters are properly encoded
- Validates POST/PUT/DELETE bodies contain correct fields
- Tests all 29 tools against mock fetch

### Auth Tool Tests (`authTools.test.ts`)
- Login, register, logout, get_account_info request contracts
- Response format validation
- Registry integration (validation, auth barriers)

### State Journey Tests (`stateJourneys.test.ts`)
- Journey A: search → inspect → add to cart → view cart
- Journey B: search → compare → add → update quantity → view cart
- Journey C: auth barrier → login → retry protected operation
- Journey D: search → add → verify cart → create demo order
- Full state transition cycle: guest → login → add → checkout → logout

### Failure Mode Tests (`failureModes.test.ts`)
- Wrong execution order (checkout before cart)
- Protected tool before login
- Negative/zero/non-integer quantities
- Invalid enum values
- Non-object and array inputs
- Missing required parameters
- Unknown tool names
- Network/runtime failures (EXECUTION_ERROR)
- Mid-chain failures (API business errors)

### Checkout Policy Tests (`checkoutPolicy.test.ts`)
- Demo payment method validation
- Order confirmation requirement

## Tier 2: Integration Tests

**Location**: `tests/webmcp/`
**Runner**: `npm run test:webmcp:integration`

Integration tests exercise tools against a real (or isolated test) database to validate end-to-end behavior including stock checks, coupon validation, and order creation.

See [testing environment](webmcp-testing-environment.md) for database setup.

## Tier 3: Browser E2E Tests

**Location**: `tests/browser/`
**Runner**: `npm run test:webmcp:e2e` (Playwright)

### Commerce Journey (`webmcp-commerce.e2e.spec.ts`)
- Search → product detail → add to cart → verify → remove → verify empty

### WebMCP Tool Discovery (`webmcp-tools.e2e.spec.ts`)
- `document.modelContext` availability
- Tool discovery via `getTools()`
- Direct tool execution via `executeTool()`
- Auth barrier enforcement in browser
- Input validation in browser
- Unknown tool error handling
- State-aware tool availability changes on login/logout

## Tier 4: LLM Evaluation

**Location**: `evals/`
**Runner**: `npm run eval:webmcp:llm`

Measures model planning accuracy without executing tools:
- **Tool selection accuracy** — correct tools chosen
- **Argument accuracy** — correct parameters provided
- **Chain accuracy** — correct execution order
- **Recovery accuracy** — graceful handling of edge cases
- **Latency** — response time

See [evaluation](evaluation.md) for methodology.

## Running Tests

```bash
# All deterministic tests
npm test

# Integration tests (requires database)
npm run test:webmcp:integration

# Browser E2E tests (requires running app)
npm run test:webmcp:e2e

# Evaluation dataset schema validation
npm run eval:webmcp

# LLM evaluation (requires API key)
npm run eval:webmcp:llm
```

## Test Counts

| Suite | Tests |
|-------|-------|
| Deterministic (Vitest) | 57 |
| Integration | 23 |
| Browser E2E | 7 |
| Eval dataset cases | 16 |
