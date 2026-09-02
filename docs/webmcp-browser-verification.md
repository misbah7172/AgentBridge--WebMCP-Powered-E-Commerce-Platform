# Chrome WebMCP verification

## Recorded evidence

Validation was performed on the local document request for `http://localhost:3000/` using Chrome DevTools and the Model Context Tool Inspector.

- Inspector result: the user verified that all exposed tools executed successfully.
- Network result: the document response returned `Origin-Agent-Cluster: ?1` and `Permissions-Policy: tools=(self)`.
- Stored captures: [Network overview](evidence/webmcp-network-overview.png) and [document response headers](evidence/webmcp-response-headers.png).

The screenshots are evidence of browser configuration and headers, not a substitute for the automated application tests below.

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

## Automated browser E2E

`npm run test:webmcp:e2e` uses Chrome through Playwright and the existing demo database. The journey resolves a product from live search results at runtime, opens its detail page, adds it through the UI, verifies the cart UI, removes it through the UI, and verifies the empty-cart state. The suite clears the demo cart before the journey and ends with an empty cart.

Measured on 2026-09-03: **1/1 passed**.

## Limits of automated verification

Native WebMCP requires a compatible Chrome runtime and is aimed at local, human-in-the-loop browsing. The deterministic harness and browser E2E suite exercise the application, but neither substitutes for direct native inspection through Chrome's Model Context Tool Inspector.
