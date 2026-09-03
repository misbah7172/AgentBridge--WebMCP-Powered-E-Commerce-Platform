# Architectural Decisions

This document records key architectural decisions made during the AgentBridge WebMCP implementation, their rationale, and their consequences.

---

## ADR-001: Native WebMCP Implementation (Category 1)

**Date:** 2026-09-03
**Status:** Accepted

**Context:** WebMCP integration can be implemented as Category 1 (Native), where tools are registered directly on `document.modelContext`, or as Category 2 (Adapter), where an external bridge mediates between the website API and a WebMCP proxy.

**Decision:** AgentBridge implements exclusively Category 1 — Native WebMCP. All 29 tools are registered directly in the browser via the `WebMCPRegistry` class. No external adapter, proxy, or MCP server is introduced.

**Rationale:** The application already exposes same-origin API routes. Tools invoke these APIs via `fetch()` within the browser context, sharing the user's session cookies and security boundaries. An adapter would introduce unnecessary latency, complexity, and an additional failure surface without providing material benefit.

**Consequences:** All tool definitions reside in client-side code. Server-side business logic remains exclusively in API routes and service modules.

---

## ADR-002: Custom WebMCPRegistry

**Date:** 2026-09-03
**Status:** Accepted

**Context:** The `use-webmcp-tool` npm package provides a React hook abstraction for WebMCP tool registration. The existing `WebMCPRegistry` class implements:

- Singleton lifecycle management
- Native `document.modelContext` bridge with `AbortController`-based registration
- Three-tier state-aware tool availability (public, authenticated, transactional)
- Input validation covering types, enums, required fields, integer checks, and min/max constraints
- Five structured error codes with retryability and user-action metadata
- Execution listeners, subscriber notifications, and tracing
- Test-environment polyfill for Node.js

**Decision:** The project uses the custom `WebMCPRegistry` class. The `use-webmcp-tool` package is not adopted.

**Rationale:** The custom registry exceeds the package's capabilities across every dimension. Adopting the package would require abandoning state-aware gating, structured error responses, and the deterministic test harness — capabilities that are central to the project's testing and evaluation framework.

**Consequences:** Maintenance responsibility for the registry remains with the project. The registry is validated through 57 deterministic tests.

---

## ADR-003: Framework-Agnostic Tool Definitions

**Date:** 2026-09-03
**Status:** Accepted

**Context:** The specification references Angular-specific patterns (`provideExperimentalWebMcpTools`, `declareExperimentalWebMcpTool`, Signal Forms). AgentBridge uses Next.js and React.

**Decision:** Angular-specific APIs and patterns are not adopted. Tool definitions are framework-agnostic TypeScript objects.

**Rationale:** The architectural principles embodied by the Angular patterns — route-scoped tool exposure, state-aware availability, schema validation — are already implemented through the `WebMCPRegistry` and React context providers using idiomatic Next.js/React patterns.

**Consequences:** Tool definitions are plain TypeScript objects with no framework coupling, making them testable in both browser and Node.js environments.

---

## ADR-004: Authentication Tools

**Date:** 2026-09-03
**Status:** Accepted

**Context:** When protected tools returned `AUTHENTICATION_REQUIRED`, agents had no mechanism to authenticate through WebMCP. They were dependent on a human user clicking the login button in the React UI.

**Decision:** Four authentication tools were added: `login`, `register`, `logout`, and `get_account_info`. These tools invoke the existing `/api/auth/*` endpoints and dispatch a `webmcp-auth-change` `CustomEvent` to synchronize the React `AuthContext`.

**Rationale:** Agent autonomy requires the ability to complete full journeys — including authentication — without relying on human UI interaction. This is particularly important for Journey C (auth barrier detection and recovery).

**Consequences:** The tool count increased from 25 to 29. The `AuthContext` `useEffect` now includes an event listener for WebMCP-initiated auth state changes. The `logout` tool requires authentication to prevent unauthorized session termination.

---

## ADR-005: Integer Validation with Range Constraints

**Date:** 2026-09-03
**Status:** Accepted

**Context:** Quantity fields in cart tools were originally typed as `number` in the JSON schema, permitting fractional values (e.g., `2.5`) and negative values (e.g., `-3`). These values would reach the API and produce inconsistent behavior.

**Decision:** The registry's `validateInput` function was enhanced to support `integer` type validation (via `Number.isInteger()`) and `minimum`/`maximum` range constraints. Cart tool schemas were updated to use `type: 'integer', minimum: 1` for quantity fields.

**Rationale:** Validating at the registry level produces clear, structured error messages before any API call is made. This is more efficient and informative than allowing invalid values to reach the server.

**Consequences:** Tools specifying `type: 'integer'` are validated with `Number.isInteger()`. Numeric fields with `minimum` or `maximum` constraints are bounds-checked prior to execution.

---

## ADR-006: LLM Provider Abstraction

**Date:** 2026-09-03
**Status:** Accepted

**Context:** The LLM evaluation runner was hardcoded to the OpenAI Responses API. This prevented evaluator testing without an API key and precluded future provider comparisons.

**Decision:** An `LLMProvider` interface was introduced with `OpenAIProvider` and `MockProvider` implementations. Provider selection is determined by environment variables, with automatic fallback to the mock provider when no API key is configured.

**Rationale:** The mock provider enables CI/CD testing of the evaluator pipeline without API credentials. The abstraction supports future additions (Anthropic, Google, local models) without modifying the evaluation runner.

**Consequences:** The evaluation runner imports from `scripts/llmProviders.ts`. Setting `WEBMCP_EVAL_PROVIDER=mock` executes the evaluator with deterministic responses.

---

## ADR-007: Custom Events for Cross-Boundary State Synchronization

**Date:** 2026-09-03
**Status:** Accepted

**Context:** When an AI agent authenticates via the `login` WebMCP tool, the React `AuthContext` is unaware of the state change because the operation occurred outside the React component tree.

**Decision:** Authentication tools dispatch a `webmcp-auth-change` `CustomEvent` on `window`. The `AuthContext` listens for this event and updates its internal state to reflect the change.

**Rationale:** `CustomEvent` is a standard browser API for cross-boundary communication that avoids tight coupling between WebMCP tools and React components. The event-driven approach ensures the UI reflects agent-initiated state changes without requiring direct dependency injection.

**Consequences:** The `AuthContext` `useEffect` registers an event listener and returns a cleanup function for proper unmount handling. This pattern is extensible to other state synchronization requirements.
