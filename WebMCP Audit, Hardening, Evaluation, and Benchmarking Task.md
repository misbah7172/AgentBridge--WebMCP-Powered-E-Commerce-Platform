# WebMCP Audit, Hardening, Evaluation, and Benchmarking Task

You are working inside an existing ecommerce web application that was previously implemented with WebMCP support.

Your job is NOT to blindly rewrite the application.

Your first responsibility is to inspect the existing implementation, determine whether it is actually compliant with the current Chrome WebMCP model, identify gaps, and then implement a production-quality WebMCP evaluation and testing environment.

Use the current Chrome WebMCP documentation and especially the WebMCP Evals guidance as the reference model:

https://developer.chrome.com/docs/ai/webmcp
https://developer.chrome.com/docs/ai/webmcp/evals

The implementation must distinguish between:
1. WebMCP tool implementation
2. deterministic tool testing
3. LLM/tool-selection evaluation
4. end-to-end user-journey evaluation
5. failure-mode evaluation

Do not confuse WebMCP with a traditional remote MCP server.

---

# PHASE 0 — AUDIT THE EXISTING APPLICATION FIRST

Before changing any code:

1. Inspect the complete repository structure.
2. Identify:
   - frontend framework
   - backend framework
   - API layer
   - database
   - state management
   - authentication
   - ecommerce functionality
   - WebMCP implementation
   - test framework
   - build system
3. Find every existing WebMCP implementation.
4. Determine whether the implementation uses:
   - WebMCP Imperative API
   - WebMCP Declarative API
   - a custom abstraction
   - an incorrect/custom MCP implementation
5. Identify every currently registered WebMCP tool.
6. Identify where tools are registered.
7. Identify when tools are registered/unregistered based on application state.
8. Identify how tools execute application actions.
9. Identify whether tools call:
   - frontend state
   - backend APIs
   - direct database logic
   - browser/UI actions
10. Determine whether the current implementation correctly uses the browser WebMCP API.

DO NOT modify code during this audit unless required to make the application runnable.

Create:

/docs/webmcp-audit.md

Include:

- Current architecture
- Existing WebMCP architecture
- Existing tools
- Tool registration mechanism
- Tool execution mechanism
- Application-state dependencies
- API dependencies
- Current problems
- Compliance gaps
- Recommended changes
- What should NOT be changed

At the end of the audit, explicitly classify the existing implementation as:

A. Correct / mostly correct WebMCP implementation
B. Partially correct WebMCP implementation
C. Not actually WebMCP
D. Cannot determine without runtime testing

Do not assume it is correct simply because it contains `document.modelContext`.

---

# PHASE 1 — DEFINE THE AGENTIC USER JOURNEYS

Create realistic ecommerce user journeys.

At minimum implement these journeys:

## Journey 1 — Product search

User:
"Find me an RTX 3050 laptop."

Expected conceptual flow:

search_products
→ return matching products

## Journey 2 — Product details

User:
"Tell me the price, RAM and storage of the cheapest RTX 3050 laptop."

Expected:

search_products
→ identify product
→ get_product_details

## Journey 3 — Add to cart

User:
"Add the cheapest RTX 3050 laptop to my cart."

Expected:

search_products
→ identify product
→ add_to_cart
→ verify cart state

## Journey 4 — Remove from cart

User:
"Remove the laptop from my cart."

Expected:

get_cart / identify product
→ remove_from_cart
→ verify cart

## Journey 5 — Cart inspection

User:
"What is currently in my cart?"

Expected:

get_cart
→ structured result
→ agent produces correct summary

## Journey 6 — Multi-step purchase preparation

User:
"Find the cheapest RTX 3050 laptop under $700 and add it to my cart."

Expected:

search_products
→ choose correct product
→ add_to_cart
→ verify result

Do NOT perform a real payment.

Use a mock/sandbox checkout if checkout is implemented.

---

# PHASE 2 — AUDIT AND DESIGN THE TOOL SET

Create a canonical WebMCP tool registry.

Recommended tools:

- search_products
- get_product_details
- add_to_cart
- remove_from_cart
- get_cart
- update_cart_quantity
- clear_cart
- start_checkout
- apply_coupon
- complete_checkout (only if safely sandboxed)

For every tool verify:

1. Name is descriptive.
2. Description clearly states the purpose.
3. Description does not overlap confusingly with another tool.
4. Input schema is explicit.
5. Required parameters are actually required.
6. Parameter descriptions explain how user intent maps to structured data.
7. IDs are clearly distinguished from names.
8. Enumerations use enums where appropriate.
9. Invalid parameters are rejected.
10. Tool output contains only useful information.
11. Tool errors are structured and understandable.

Do not expose unnecessary internal implementation details to the agent.

---

# PHASE 3 — TOOL CONTRACTS

For every tool define a contract.

Example:

search_products:

Input:

{
  "query": "RTX 3050 laptop",
  "maxPrice": 700
}

Output:

{
  "success": true,
  "products": [
    {
      "productId": "LAPTOP001",
      "name": "...",
      "price": 649,
      "currency": "USD"
    }
  ]
}

Error:

{
  "success": false,
  "error": {
    "code": "SEARCH_FAILED",
    "message": "...",
    "retryable": true
  }
}

Do the same for every tool.

Create:

/docs/webmcp-tool-contracts.md

---

# PHASE 4 — APPLICATION STATE

WebMCP tools may depend on application state.

Identify states such as:

- product listing
- product details
- empty cart
- populated cart
- checkout started
- checkout completed
- authentication required
- coupon applied
- coupon failed

Make sure the tool list exposed to the agent correctly reflects the relevant application state.

Do not assume every tool should always be exposed.

Document:

State → available tools → expected behavior

Create:

/docs/webmcp-state-model.md

---

# PHASE 5 — DETERMINISTIC TOOL TESTING

Implement deterministic tests for every tool.

Do NOT involve an LLM in these tests.

Test:

1. Tool logic
2. Input validation
3. Backend/API dependency calls
4. State updates
5. UI side effects
6. Returned values
7. Error handling
8. Runtime exceptions
9. Retryable errors
10. Non-retryable errors

Use mocks for external dependencies where appropriate.

Example:

add_to_cart("LAPTOP001", 2)

Verify:

- correct product is selected
- correct quantity is used
- backend API is called correctly
- cart state is updated
- returned result is correct

Also test invalid cases:

- missing product ID
- invalid product ID
- quantity = 0
- negative quantity
- excessive quantity
- unavailable product

Create:

/tests/webmcp/tools/

---

# PHASE 6 — DIRECT WebMCP TOOL EXECUTION TESTING

Use:

document.modelContext.executeTool(...)

where supported by the current WebMCP implementation.

Build a deterministic test harness that can directly invoke WebMCP tools.

The test harness must record:

- tool name
- input arguments
- output
- execution time
- success/failure
- error code
- state before execution
- state after execution

Do not depend on screenshots for these tests.

---

# PHASE 7 — TOOL-SELECTION EVALUATION

Now introduce an LLM.

Create an evaluation dataset containing:

## Direct prompts

Examples:

"Search for RTX 3050 laptops."

"Add laptop LAPTOP001 to my cart."

"Show me my cart."

"Remove LAPTOP001 from my cart."

## Natural language variations

"Can you find me a gaming laptop with an RTX 3050?"

"Put the cheapest one in my cart."

"What did I add?"

"Take the laptop out."

## Ambiguous/open-ended prompts

"I need a gaming machine around $700."

"I want something powerful for gaming."

"Get me the cheapest suitable one."

The evaluation must measure:

- correct tool
- incorrect tool
- missing tool call
- correct arguments
- incorrect arguments
- unnecessary tool calls

Do not judge only the final natural-language answer.

The tool call itself must be evaluated.

---

# PHASE 8 — EXPECTED TOOL CALL DATASET

Create machine-readable evaluation cases.

Example:

{
  "id": "search-001",
  "messages": [
    {
      "role": "user",
      "content": "Find RTX 3050 laptops."
    }
  ],
  "expectedCall": [
    {
      "functionName": "search_products",
      "arguments": {
        "query": "RTX 3050 laptop"
      }
    }
  ]
}

Support:

- exact expected calls
- ordered calls
- unordered calls
- multi-step calls

For multi-step journeys, allow equivalent valid order where order is semantically irrelevant.

---

# PHASE 9 — ORDERED AND UNORDERED TOOL CHAINS

Implement evaluation logic for both:

ORDERED:

search_products
→ get_product_details
→ add_to_cart

and UNORDERED branches where appropriate.

Example:

The user asks for information about both a jacket and jeans.

Valid:

search jacket
→ get jacket details

AND

search jeans
→ get jeans details

The jacket branch and jeans branch can occur in either order.

However:

search
→ get details

must remain ordered within each branch.

Implement an evaluator that understands this distinction.

---

# PHASE 10 — FAILURE MODE TESTING

Implement tests for all major WebMCP failure modes.

## Failure A — Wrong tool

Example:

User:
"Add this laptop to my cart."

Agent:
checkout()

Test:

- tool description
- function name
- tool exposure
- schema ambiguity

Record the reason for failure.

## Failure B — Wrong order

Example:

checkout()
→ add_to_cart()

Test whether state and tool descriptions communicate the correct sequence.

## Failure C — Wrong arguments

Example:

User wants laptop.

Agent:
add_to_cart({
  productId: "SHOE001"
})

Test:

- schema clarity
- required fields
- ID descriptions
- argument validation

## Failure D — Incorrect output

Example:

get_cart()

returns only:

{
  "total": 700
}

when the agent needs:

{
  "items": [...],
  "subtotal": ...,
  "total": ...
}

Verify that outputs contain all information required for the next reasoning step.

## Failure E — Runtime failure

Test:

- API timeout
- API unavailable
- malformed response
- exception
- authentication failure
- invalid state

## Failure F — Mid-chain failure

Example:

search_products
→ add_to_cart
→ start_checkout
→ apply_coupon [FAIL]
→ complete_checkout

The evaluator must determine whether the agent incorrectly continues after a critical failure.

Create tests where the application is deliberately placed into the state immediately before the failure.

---

# PHASE 11 — ERROR CONTRACT

Every tool must return machine-readable errors.

Use:

{
  "success": false,
  "error": {
    "code": "API_TIMEOUT",
    "message": "Product service temporarily unavailable.",
    "retryable": true
  }
}

or:

{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product does not exist.",
    "retryable": false
  }
}

The agent must be able to distinguish:

- retryable
- non-retryable
- user-action-required
- authentication-required
- invalid-input
- state-conflict

---

# PHASE 12 — END-TO-END EVALUATION

Create real user journeys.

Each E2E evaluation must include:

- initial application state
- user prompt
- available tools
- expected tool sequence
- expected arguments
- expected state transitions
- expected final result

Example:

User:

"Find the cheapest RTX 3050 laptop under $700 and add it to my cart."

Expected:

search_products
→ choose correct product
→ add_to_cart
→ verify cart

Check:

- correct product
- correct price constraint
- correct product ID
- correct cart state
- correct final response

---

# PHASE 13 — BROWSER TEST ENVIRONMENT

Create a dedicated test environment.

Do not use production data.

Environment should contain:

- deterministic seed data
- test products
- test users
- test carts
- mocked external services
- predictable product IDs
- predictable prices
- controllable API failures

Example:

LAPTOP001
RTX 3050
$649

LAPTOP002
RTX 3050
$799

LAPTOP003
RTX 4060
$699

This allows deterministic expected results.

---

# PHASE 14 — WEBMCP BROWSER VERIFICATION

Prepare the application for Chrome WebMCP testing.

Verify:

1. WebMCP is actually available.
2. The application is origin-isolated as required.
3. Permissions Policy does not prevent tool registration.
4. Tools register successfully.
5. Tools appear in a WebMCP-compatible inspector/agent.
6. Tool schemas are parseable.
7. Tools can be manually executed.
8. Structured results are readable.
9. Structured errors are readable.

For local development, document the Chrome WebMCP testing configuration.

Do not assume a normal MCP client configuration is equivalent to WebMCP.

---

# PHASE 15 — WEBMCP INSPECTOR VALIDATION

If practical, use the Chrome Model Context Tool Inspector or equivalent WebMCP-compatible inspection environment.

Verify:

- registered tools are visible
- schemas are valid
- tools can be manually called
- outputs are structured
- errors are readable
- tool registration changes correctly with application state

Do not make the project dependent on the inspector for deterministic unit tests.

---

# PHASE 16 — METRICS

Build an evaluation report.

At minimum calculate:

1. Tool Selection Accuracy
2. Argument Accuracy
3. Tool Chain Success Rate
4. User Journey Completion Rate
5. Wrong Tool Rate
6. Wrong Argument Rate
7. Wrong Order Rate
8. Tool Failure Rate
9. Recovery Success Rate
10. Average Tool Execution Latency
11. Average Journey Latency
12. Number of Tool Calls
13. Failed Journey Count

For LLM evaluations, run multiple trials because model outputs are probabilistic.

Report:

successful trials / total trials

rather than relying on one run.

---

# PHASE 17 — BASELINE COMPARISON

Build a benchmark comparing:

A. Normal browser exploration / actuation
B. Native WebMCP
C. External API adapter
D. External UI/browser adapter

Measure:

- completion rate
- number of actions
- latency
- errors
- wrong actions
- recovery
- token usage if available

Do not claim an improvement unless the same user journeys and equivalent conditions are tested.

---

# PHASE 18 — TEST DATASET STRUCTURE

Create:

/evals/

    direct/
    ambiguous/
    tool_selection/
    arguments/
    ordered_chains/
    unordered_chains/
    failure_modes/
    mid_chain/
    e2e/

Each case should contain:

- ID
- user prompt
- initial state
- available tools
- expected calls
- expected arguments
- expected state
- expected final result
- allowed alternatives if any

---

# PHASE 19 — EVALUATION RUNNER

Build a single command to run all tests.

Example:

npm run eval:webmcp

It should execute:

1. deterministic tool tests
2. schema validation
3. direct tool execution
4. tool-selection evals
5. argument evals
6. ordered-chain evals
7. failure-mode evals
8. mid-chain evals
9. E2E evals
10. metrics generation

Produce:

/eval-results/

    summary.json
    detailed-results.json
    report.md

---

# PHASE 20 — HUMAN-READABLE REPORT

Generate a report containing:

## Executive summary

## Existing implementation audit

## Tool inventory

## Tool schema quality

## Deterministic test results

## LLM evaluation results

## Failure-mode results

## E2E journey results

## Performance metrics

## Comparison results

## Known limitations

## Recommended improvements

Include pass/fail status for every evaluation.

---

# PHASE 21 — DO NOT OVER-ENGINEER

Important constraints:

- Do not rewrite the existing application unnecessarily.
- Preserve working ecommerce functionality.
- Preserve existing UI.
- Preserve existing backend unless a change is required.
- Reuse existing APIs/services.
- Do not duplicate business logic unnecessarily.
- Do not create a traditional remote MCP server unless explicitly required.
- Do not confuse WebMCP with ordinary MCP.
- Do not fabricate WebMCP APIs that are not supported by the current Chrome implementation.
- Prefer small, testable modules.
- Keep evaluation code separate from application code.
- Keep test data separate from production data.

---

# PHASE 22 — FINAL VALIDATION

After implementation, run everything.

Then answer these questions in:

/docs/final-validation.md

1. Is the existing application actually WebMCP-enabled?
2. Which WebMCP API is used?
3. Which tools are exposed?
4. Are tool descriptions agent-friendly?
5. Are schemas correct?
6. Are tools state-aware?
7. Can tools be executed directly?
8. Do deterministic tests pass?
9. Does the LLM select the correct tools?
10. Does the LLM generate correct arguments?
11. Do multi-step journeys succeed?
12. Are failures correctly handled?
13. Are mid-chain failures safe?
14. Are tool outputs sufficient for subsequent reasoning?
15. What is the measured success rate?
16. What are the main remaining failure modes?
17. What changes were made to the original application?
18. Which limitations are caused by the model versus the WebMCP implementation?

Finally provide a concise terminal summary:

WEBMCP IMPLEMENTATION STATUS
----------------------------
Implementation:
Tools:
Deterministic tests:
LLM evals:
E2E tests:
Failure tests:
Overall journey success:
Main failures:
Recommended next step:

Do not declare the project successful merely because the website loads or `document.modelContext` exists. Success requires runtime verification and evaluation evidence.