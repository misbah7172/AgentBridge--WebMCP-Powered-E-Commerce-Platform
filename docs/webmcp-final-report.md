# AgentBridge WebMCP validation report

**Validation date:** 2026-09-03
**Scope:** local demo application and existing Neon demo database

## Measured results

| Validation | Result | Evidence |
| --- | --- | --- |
| Deterministic WebMCP tests | 22 passed | `npm test` |
| Database integration tests | 23 passed | `npm run test:webmcp:integration` (previous validated run) |
| Generic evaluation schema | 10/10 passed | `npm run eval:webmcp` |
| Browser E2E commerce journey | 1/1 passed | `npm run test:webmcp:e2e` |
| Browser response headers | Verified | [header capture](evidence/webmcp-response-headers.png) |
| Inspector tool execution | Verified manually | [recorded browser evidence](webmcp-browser-verification.md) |

## Controls validated

- Public and authenticated tool exposure follows login state.
- `create_order` is unavailable with an empty cart, accepts only explicit demo confirmation, and accepts only `DEMO_CARD`.
- Cart mutations update browser/UI state and WebMCP availability.
- Invalid input, authentication failures, unavailable state, API failures, and transport failures return structured error information.

## Known limitations

- LLM metrics are not recorded yet: no `OPENAI_API_KEY` was configured during this validation. The repeatable provider runner is present as `npm run eval:webmcp:llm`; it records no fabricated values when credentials are absent.
- The application is a demo checkout only. It has no production payment provider or production-order safeguards.
- Native WebMCP behavior remains dependent on compatible Chrome support and Inspector verification.

## Reliable demonstration flow

1. Open the local app in compatible Chrome; verify the two document response headers in DevTools.
2. Open Model Context Tool Inspector and verify catalog tools as a guest.
3. Use the demo account, search the catalog, inspect a runtime-returned product, and add it to cart.
4. Inspect the cart, then remove the item. Confirm checkout exposure appears only with a populated cart.
5. If demonstrating orders, use only the explicit demo confirmation and `DEMO_CARD` flow.
