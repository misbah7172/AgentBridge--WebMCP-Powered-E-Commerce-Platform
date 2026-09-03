# Architectural Decisions

This log records key architectural decisions made during the AgentBridge implementation.

---

## ADR-001: Native WebMCP (Category 1) Only

**Date**: 2026-09-03
**Status**: Accepted

**Context**: The specification describes multiple WebMCP integration categories. Category 1 (Native) registers tools directly on `document.modelContext`. Category 2 (Adapter) uses an external bridge between a website API and a WebMCP proxy.

**Decision**: AgentBridge is strictly Category 1 — Native WebMCP. All tools are registered directly in the browser via the `WebMCPRegistry` class. No external adapter, proxy, or MCP server is introduced.

**Rationale**: The application already has same-origin API routes. Tools call these APIs via `fetch()` within the browser context, sharing the user's session cookies. An adapter would add unnecessary complexity and latency without benefit.

**Consequences**: Tools must be defined in client-side code. Server-side logic remains in API routes and services.

---

## ADR-002: Custom WebMCPRegistry Over `use-webmcp-tool` Package

**Date**: 2026-09-03
**Status**: Accepted

**Context**: The `use-webmcp-tool` npm package provides a React hook abstraction for WebMCP tool registration. The existing `WebMCPRegistry` class provides:
- Singleton management
- Native `document.modelContext` bridge with `AbortController`-based lifecycle
- State-aware tool availability (auth, cart)
- Input validation (types, enums, required fields, min/max constraints)
- Structured error responses with five error codes
- Execution listeners and tracing
- Test-environment polyfill

**Decision**: Do not adopt `use-webmcp-tool`. Continue with the custom `WebMCPRegistry`.

**Rationale**: The custom registry already exceeds the package's capabilities. Adopting it would require abandoning state-aware gating, structured errors, and the test harness. The package would become a thin wrapper adding dependency risk without value.

**Consequences**: Maintenance responsibility stays with the project. The registry is well-tested with 57+ deterministic tests.

---

## ADR-003: No Angular Patterns

**Date**: 2026-09-03
**Status**: Accepted

**Context**: The specification references Angular-specific patterns (`provideExperimentalWebMcpTools`, `declareExperimentalWebMcpTool`, Signal Forms). AgentBridge uses Next.js/React.

**Decision**: Do not adopt Angular-specific APIs or patterns.

**Rationale**: The architectural lessons (route-scoped tools, state-aware exposure) are already implemented via the React context providers and the `WebMCPRegistry`. Angular-specific DI patterns are not transferable.

**Consequences**: None. The architectural principles are applied through React-idiomatic patterns.

---

## ADR-004: Auth Tools Added to WebMCP

**Date**: 2026-09-03
**Status**: Accepted

**Context**: Protected tools return `AUTHENTICATION_REQUIRED` when the user is not logged in, but agents had no way to authenticate through WebMCP. They had to rely on the human clicking the login button in the UI.

**Decision**: Add four auth tools: `login`, `register`, `logout`, `get_account_info`. These call the existing `/api/auth/*` endpoints and dispatch a `webmcp-auth-change` custom event to sync the React `AuthContext`.

**Rationale**: Agents should be able to complete full journeys autonomously. Without auth tools, any journey requiring a login would stall.

**Consequences**: Tool count increased from 25 to 29. Auth tools sync both the registry state and the React UI via custom events. The `logout` tool requires authentication to prevent agents from logging out other users' sessions.

---

## ADR-005: Integer Validation with Constraints

**Date**: 2026-09-03
**Status**: Accepted

**Context**: The `quantity` field in cart tools was typed as `number` in the schema, allowing fractional values like 2.5. The API would accept these but truncate or error unpredictably.

**Decision**: Added `integer` type support and `minimum`/`maximum` constraint validation to the registry's `validateInput` function. Changed `quantity` fields to `type: 'integer', minimum: 1`.

**Rationale**: Validating at the registry level provides clear, structured error messages before the API call is made. This is cheaper and more informative than letting the API reject the request.

**Consequences**: Tools using `type: 'integer'` are validated for `Number.isInteger()`. Minimum/maximum constraints are enforced for all numeric types.

---

## ADR-006: LLM Provider Abstraction

**Date**: 2026-09-03
**Status**: Accepted

**Context**: The LLM evaluation runner was hardcoded to OpenAI's Responses API. This made it impossible to test the evaluator without an API key or compare different model providers.

**Decision**: Introduced an `LLMProvider` interface with `OpenAIProvider` and `MockProvider` implementations. Provider selection is based on environment variables.

**Rationale**: The mock provider enables CI testing of the evaluator pipeline. The abstraction supports future provider additions without modifying the evaluation runner.

**Consequences**: The evaluation runner imports from `llmProviders.ts`. Setting `WEBMCP_EVAL_PROVIDER=mock` runs the evaluator without an API key.

---

## ADR-007: Custom Events for WebMCP-UI Sync

**Date**: 2026-09-03
**Status**: Accepted

**Context**: When an agent logs in via the `login` WebMCP tool, the React `AuthContext` doesn't know about the state change because it happened outside the React component tree.

**Decision**: Auth tools dispatch a `webmcp-auth-change` CustomEvent on `window`. The `AuthContext` listens for this event and updates its state accordingly.

**Rationale**: Custom events are a standard browser API for cross-boundary communication. This approach avoids tight coupling between the WebMCP tools and React components while keeping the UI in sync.

**Consequences**: The `AuthContext` `useEffect` now returns a cleanup function that removes the event listener. This pattern can be extended to other state synchronization needs.
