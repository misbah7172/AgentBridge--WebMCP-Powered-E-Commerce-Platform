# Chrome WebMCP verification

## Local setup

1. Run the app with `npm run dev`.
2. In Chrome, enable `chrome://flags/#enable-webmcp-testing`, then relaunch.
3. Open the app directly on its local origin. Do not use a traditional MCP client as a substitute.
4. Confirm the response headers include `Origin-Agent-Cluster: ?1` and `Permissions-Policy: tools=(self)`.
5. Open the Chrome Model Context Tool Inspector extension.

## Manual acceptance checklist

- Confirm `document.modelContext` is browser-provided and no console error reports an attempted overwrite.
- Verify public tools appear before login.
- Log in and verify protected tools appear; log out and verify they are removed.
- Manually invoke `search_products` with valid and invalid input. Confirm structured success/error output is readable.
- Manually invoke `get_cart` before and after adding a product in a demo account.
- Confirm a cart tool can be cancelled and state-dependent registrations emit a browser `toolchange` event.

## Limits of automated verification

Native WebMCP currently requires a compatible Chrome runtime and is aimed at local, human-in-the-loop browsing. The deterministic direct-execution harness exercises the application registry; it does not claim that a Node test is a substitute for `document.modelContext.executeTool(tool, json)` in Chrome. Record Inspector results in `eval-results/` before declaring browser-native verification complete.
