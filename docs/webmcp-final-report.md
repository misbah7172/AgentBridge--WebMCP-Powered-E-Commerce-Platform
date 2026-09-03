# WebMCP Validation Report

**Validation date:** 2026-09-03
**Scope:** Local demo application with Neon demo database

## Measured Results

| Validation | Result | Command |
|------------|--------|---------|
| Deterministic WebMCP tests | 57 passed (7 test files) | `npm test` |
| Database integration tests | 23 passed | `npm run test:webmcp:integration` |
| Evaluation dataset schema | 16/16 passed | `npm run eval:webmcp` |
| Browser E2E specs | 7 specs | `npm run test:webmcp:e2e` |
| Production build | Compiled successfully (24 routes) | `npx next build` |
| Response headers | Verified | Chrome DevTools |
| Inspector tool execution | Verified | Chrome Model Context Tool Inspector |

## Validated Controls

| Control | Status |
|---------|--------|
| Public and authenticated tool exposure follows authentication state | Implemented and tested |
| Auth tools (`login`, `register`, `logout`, `get_account_info`) enable agent autonomy | Implemented and tested |
| `create_order` gating: unavailable with empty cart, requires `confirmDemoOrder: true`, accepts only `DEMO_CARD` | Implemented and tested |
| Cart mutations update both browser/UI state and WebMCP tool availability | Implemented and tested |
| Integer validation with `minimum`/`maximum` constraints on quantity fields | Implemented and tested |
| Schema validation rejects invalid input before API execution | Implemented and tested |
| Structured error responses for all five registry-level error codes | Implemented and tested |
| Multi-step journey validation (Journeys A through D) | Implemented and tested |
| Failure mode coverage (wrong order, wrong args, missing data, network, mid-chain) | Implemented and tested |

## Known Limitations

- LLM planning metrics have not been recorded. No `OPENAI_API_KEY` was configured during this validation. The repeatable provider runner (`npm run eval:webmcp:llm`) reports no fabricated values when credentials are absent.
- The application is a demo checkout platform. It has no production payment provider or production-order safeguards.
- Native WebMCP behavior remains dependent on compatible Chrome support and its experimental configuration flag.

## Demonstration Protocol

1. Start the application with `npm run dev` and open it in Chrome with WebMCP testing enabled.
2. Verify `Origin-Agent-Cluster: ?1` and `Permissions-Policy: tools=(self)` response headers in DevTools.
3. Open the Model Context Tool Inspector and confirm public catalog tools are available as a guest.
4. Authenticate using the demo account (via UI or the `login` WebMCP tool).
5. Search the catalog, inspect a product returned at runtime, and add it to the cart.
6. Verify the cart contents, then remove the item. Confirm `create_order` availability correlates with cart population.
7. If demonstrating order placement, use the explicit `confirmDemoOrder: true` and `DEMO_CARD` flow.
