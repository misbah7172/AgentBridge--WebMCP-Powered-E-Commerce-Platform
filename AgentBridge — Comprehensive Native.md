AgentBridge — Comprehensive Native WebMCP Integration & Evaluation Prompt

ROLE

You are a senior web platform engineer, WebMCP engineer, browser-agent engineer, and test/evaluation engineer.

You are working on my existing AgentBridge project.

Your task is to improve and complete the existing Native WebMCP implementation using the WebMCP standard and relevant implementation patterns from:

1. WebMCP specification/reference:
    https://github.com/webmachinelearning/webmcp
2. Angular WebMCP documentation/patterns:
    https://angular.dev/ai/webmcp
3. use-webmcp-tool npm package:
    https://www.npmjs.com/package/use-webmcp-tool

These resources are references and implementation aids. Do not blindly copy them or redesign the project around them.

⸻

1. MOST IMPORTANT ARCHITECTURAL REQUIREMENT

The project must remain a Category 1 — Native WebMCP implementation.

The target architecture is:

┌──────────────────────────────┐
│          AI Agent            │
└──────────────┬───────────────┘
               │
               │ WebMCP
               ▼
┌──────────────────────────────┐
│        AgentBridge           │
│                              │
│  Native WebMCP Tool Layer    │
│  ├── Tool Registration       │
│  ├── Tool Discovery          │
│  ├── Tool Schemas            │
│  ├── State Awareness         │
│  ├── Tool Execution          │
│  ├── Validation              │
│  └── Error Handling          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Existing Website       │
│                              │
│ UI + Application State       │
│ Existing APIs/Services       │
│ Authentication               │
│ Cart                         │
│ Checkout                     │
└──────────────────────────────┘

Do NOT introduce:

Website API → External Adapter → WebMCP

or:

Website UI → External Automation Adapter → WebMCP

unless the existing project already contains such functionality and it is clearly isolated from the Native WebMCP implementation.

The primary implementation must be:

Website → Native WebMCP → Agent

⸻

2. FIRST: AUDIT THE EXISTING PROJECT

Before changing any code, inspect the entire repository.

Identify:

* framework
* frontend architecture
* backend architecture
* package manager
* existing WebMCP implementation
* existing tool registration
* existing tool names
* existing schemas
* existing application state
* authentication implementation
* cart implementation
* checkout implementation
* API/service layer
* tests
* browser/E2E tests
* evaluation infrastructure
* documentation
* environment variables
* database/test database
* existing AgentBridge architecture

Do NOT assume that the project matches Angular’s implementation.

Do NOT assume that use-webmcp-tool is required.

Do NOT assume that WebMCP tools need to be recreated.

Create an internal implementation map before making modifications.

⸻

3. ESTABLISH THE CURRENT TOOL INVENTORY

Find every currently exposed WebMCP tool.

For every tool document:

Tool name
Purpose
Description
Input schema
Required parameters
Optional parameters
Output
Errors
Current application state requirements
Side effects
Underlying application function/API

Create a machine-readable or documented inventory such as:

tools/
  tool-inventory.md

or an equivalent location appropriate for the existing project.

Do not invent tool names.

Use the tools actually present in AgentBridge.

⸻

4. WEBMCP STANDARD ALIGNMENT

Study the WebMCP reference implementation and ensure AgentBridge follows the current WebMCP model.

Pay particular attention to:

* tool registration
* tool discovery
* tool descriptions
* structured input schemas
* structured outputs
* tool invocation
* validation
* errors
* browser-side execution
* origin/security boundaries
* application state
* agent interaction

The implementation should expose tools in a way that an agent can understand without requiring knowledge of internal JavaScript variable names.

For example, prefer semantic descriptions such as:

Search the product catalog using a natural-language or structured query.

rather than:

Call fetchProducts() with parameter q.

Schemas should clearly describe:

* parameter meaning
* type
* constraints
* allowed values
* required/optional status
* examples where useful

⸻

5. TOOL DESIGN PRINCIPLES

Review every WebMCP tool using these principles.

Tool names

Names should be:

* unique
* stable
* semantic
* easy for an LLM to understand
* action-oriented where appropriate

Avoid ambiguous names.

Bad:

doAction
process
execute
handle

Better:

search_products
add_product_to_cart
remove_product_from_cart
view_cart
start_checkout

Use the project’s existing naming convention if one already exists.

Do NOT rename tools unnecessarily because tool names may already be part of the evaluation.

⸻

6. TOOL DESCRIPTIONS

Every tool must have an agent-friendly description.

The description should explain:

1. What the tool does
2. When the agent should use it
3. What information it needs
4. What it returns
5. Important restrictions

Example:

Searches the product catalog for products matching the user's query.
Use this when the user asks to find, compare, or locate products.
Returns matching products with their identifiers, names, prices, and availability.

Avoid implementation-specific descriptions.

⸻

7. INPUT SCHEMAS

Audit all tool schemas.

Make sure schemas:

* use correct types
* identify required fields
* reject invalid values
* describe fields semantically
* avoid unnecessary fields
* expose constraints
* match actual application behavior

Example:

{
  "type": "object",
  "properties": {
    "productId": {
      "type": "string",
      "description": "Unique identifier of the product to add to the cart."
    },
    "quantity": {
      "type": "integer",
      "minimum": 1,
      "description": "Number of units to add."
    }
  },
  "required": ["productId", "quantity"]
}

Do not create fake schema validation that differs from the actual application.

⸻

8. STATE-AWARE WEBMCP

This is one of the highest-priority improvements.

Tools should reflect the actual state of the website.

Examples:

Logged out
Logged in
Cart empty
Cart populated
Checkout not started
Checkout started
Checkout completed

Do not expose tools that are invalid in the current state unless there is a clear reason and the tool can safely return a meaningful error.

For example:

Logged out:
  login
  register
  search_products
  browse_products
Logged in:
  logout
  account-related tools
  cart tools
Cart empty:
  search_products
  add_to_cart
Cart populated:
  view_cart
  update_cart
  remove_from_cart
  checkout

However, derive the actual state machine from the existing AgentBridge application.

Do not invent unsupported states.

⸻

9. AUTHENTICATION STATE

Audit the existing login/logout WebMCP implementation.

Verify:

* login tool
* logout tool
* authentication state
* session persistence
* error handling
* invalid credentials
* already-authenticated state
* logged-out state

Ensure the tool list reflects authentication state correctly.

Test:

Logged out → login
Logged in → logout
Logged in → protected operation
Logged out → protected operation

Protected operations should fail safely when unauthenticated.

⸻

10. CART STATE

Implement or complete state-aware cart behavior.

Test at minimum:

Cart empty
Cart populated
Product added
Product removed
Quantity changed
Cart emptied

Ensure WebMCP tool results reflect the actual UI/application state.

For example:

add_to_cart
    ↓
application state changes
    ↓
cart UI updates
    ↓
WebMCP result reports updated cart

Do not return stale or fabricated state.

⸻

11. CHECKOUT STATE

Audit the existing checkout lifecycle.

Only expose checkout-related tools that are genuinely supported by the application.

Possible lifecycle:

Cart ready
   ↓
Checkout started
   ↓
Information entered
   ↓
Order submitted
   ↓
Order confirmation

Do NOT create fake checkout functionality merely to demonstrate WebMCP.

If checkout is not implemented, document that limitation clearly.

⸻

12. TOOL OUTPUTS

Audit all tool outputs.

Outputs should be:

* structured
* concise
* machine-readable
* useful for the next tool call
* consistent
* free from unnecessary UI markup

When a tool returns an entity required by a later action, return the identifier clearly.

Example:

{
  "product": {
    "id": "prod_123",
    "name": "Example Product",
    "price": 49.99
  }
}

This allows the agent to perform:

search_products
        ↓
extract product ID
        ↓
add_product_to_cart

⸻

13. MULTI-STEP AGENT WORKFLOWS

Design and test realistic workflows.

At minimum test several journeys similar to:

Journey A

Find a product
→ inspect product
→ add product to cart
→ view cart

Journey B

Search for product
→ compare results
→ select product
→ add to cart
→ change quantity
→ view cart

Journey C

User is logged out
→ agent determines login is required
→ login
→ perform protected operation

Journey D

Cart empty
→ search product
→ add product
→ verify cart
→ continue toward checkout

Use the application’s actual capabilities.

⸻

14. LLM TOOL-SELECTION EVALUATION

Because WebMCP is designed for generative agents, deterministic unit tests alone are insufficient.

Create an evaluation system that tests whether an LLM can correctly understand and use the tools.

Evaluate:

Tool understanding

Can the model identify the purpose of the tool?

Tool selection

Does the model choose the correct tool?

Parameter selection

Does it provide correct arguments?

Multi-step reasoning

Can it use information returned by one tool in a subsequent tool call?

Output interpretation

Can it correctly interpret tool results?

User journey completion

Can it complete realistic tasks?

⸻

15. PROBABILISTIC EVALUATION

Run multiple trials for each LLM scenario.

Do NOT report a single successful run as proof of reliability.

For each scenario run N trials.

Record:

Scenario
Model
Trial
Expected tool
Actual tool
Expected arguments
Actual arguments
Tool success
Journey success
Output quality
Failure category
Latency

Calculate metrics such as:

Tool Selection Accuracy
Argument Accuracy
Journey Completion Rate
Tool Execution Success Rate
Failure Recovery Rate
Output Correctness

If practical, calculate:

mean
median
standard deviation
success percentage
confidence interval

Do not fabricate results.

⸻

16. TEST FAILURE MODES

Explicitly test the following.

Wrong tool

The agent selects a tool that does not satisfy the request.

Expected behavior:

* detect failure
* recover if possible
* avoid harmful side effects

Wrong order

Example:

checkout

before:

add product to cart

The system should respond appropriately.

Wrong arguments

Examples:

quantity = -5
invalid product ID
missing required parameter
invalid enum

Missing information

The agent lacks a required identifier.

The system should not invent one.

Tool runtime failure

Underlying API/service fails.

WebMCP should return a meaningful structured error.

Mid-chain failure

Example:

search
→ add to cart
→ update quantity
→ update fails

The system should expose the failure clearly and allow recovery where possible.

⸻

17. DETERMINISTIC TEST SUITE

Create deterministic tests for:

* tool registration
* tool discovery
* schemas
* parameter validation
* tool execution
* underlying application logic
* state changes
* UI changes
* returned values
* errors
* authentication state
* cart state
* checkout state

These tests must not depend on an LLM.

⸻

18. WEBMCP TOOL ISOLATION

Where supported by the project’s environment, use direct WebMCP execution mechanisms such as:

document.modelContext.executeTool(...)

or the equivalent supported WebMCP testing API.

This allows individual tools to be tested independently from LLM behavior.

Create tests that verify:

tool input
→ WebMCP execution
→ application operation
→ state mutation
→ returned result

⸻

19. BROWSER / E2E TESTING

Create browser-level tests using the project’s existing E2E framework.

Test the real browser environment.

Verify:

Open website
→ WebMCP tools become available
→ inspect tools
→ invoke tool
→ website state changes
→ result is returned

Test realistic multi-step journeys.

Use isolated test fixtures where possible.

⸻

20. TEST DATABASE / ISOLATED FIXTURES

Do not run destructive evaluation tests against production or shared development data.

Create isolated fixtures for:

* users
* products
* carts
* orders
* authentication
* checkout

The fixture system should be:

repeatable
deterministic
resettable
isolated

Tests should not depend on whatever state happens to exist in the developer’s browser.

⸻

21. WEBMCP INSPECTOR VALIDATION

Use the Chrome WebMCP Inspector/testing environment where available.

Document evidence for:

1. Website loaded
2. Tools discovered
3. Tool schemas inspected
4. Tool manually executed
5. Structured result returned
6. Error behavior
7. State-dependent tool availability

Capture screenshots or other evidence where appropriate.

Do not fake screenshots or claim inspector validation without actually performing it.

⸻

22. BROWSER COMPATIBILITY

Document how to enable/test WebMCP in Chrome if required.

Verify the project in the actual browser environment used for the hackathon.

Document:

Chrome version
WebMCP feature/flag configuration
Test URL
Test procedure
Observed behavior

If a feature is experimental, clearly state that.

⸻

23. SECURITY REVIEW

Review the WebMCP implementation for:

* authentication boundaries
* authorization
* cross-origin access
* sensitive operations
* unintended tool exposure
* dangerous state changes
* input validation
* session handling
* CSRF considerations where relevant
* permission boundaries

Do not expose administrative or sensitive functionality simply because an internal API exists.

⸻

24. DO NOT EXPOSE INTERNAL IMPLEMENTATION DETAILS

The agent should interact with semantic tools.

Avoid requiring knowledge of:

React component names
Angular component names
internal variable names
database table names
private API implementation
internal function names

The WebMCP interface should be an intentional public agent-facing contract.

⸻

25. ANGULAR RESOURCE

If AgentBridge uses Angular:

Study:

provideExperimentalWebMcpTools
declareExperimentalWebMcpTool
route-scoped tools
Signal Forms tool generation

Determine whether these patterns improve the existing implementation.

If AgentBridge does NOT use Angular:

Do NOT migrate the project to Angular merely because Angular provides WebMCP documentation.

Instead, extract only the architectural lessons that are framework-independent.

⸻

26. use-webmcp-tool

Investigate whether the package is useful for the existing frontend.

Before installing it, answer:

What problem does it solve?
Does AgentBridge already solve this problem?
Does it follow the current WebMCP API?
Does it introduce unnecessary abstraction?
Is it stable enough for this project?
Will it make testing easier?

Only adopt it if it genuinely improves the implementation.

Avoid unnecessary dependencies.

If the existing implementation is better without it, do not install it.

Document the decision.

⸻

27. WEBMCP SPECIFICATION ALIGNMENT DOCUMENT

Create:

docs/webmcp.md

Include:

* What WebMCP is
* Why AgentBridge uses it
* Native WebMCP architecture
* Tool registration
* Tool discovery
* Tool schemas
* Tool execution
* Structured outputs
* Error handling
* State-aware exposure
* Browser requirements
* Security considerations
* Current limitations

Explain why AgentBridge is a Native WebMCP implementation.

⸻

28. ARCHITECTURE DOCUMENT

Create or update:

docs/architecture.md

Include a diagram similar to:

                 AI Agent
                    │
                    │ WebMCP
                    ▼
          ┌──────────────────┐
          │   AgentBridge    │
          │ Native WebMCP    │
          ├──────────────────┤
          │ Discovery        │
          │ Schemas          │
          │ Execution        │
          │ State Awareness  │
          │ Validation       │
          └────────┬─────────┘
                   │
                   ▼
             Web Application
                   │
          ┌────────┴─────────┐
          │ UI / State / API │
          └──────────────────┘

⸻

29. TESTING DOCUMENT

Create:

docs/testing.md

Document:

* deterministic tests
* isolated tool tests
* browser E2E
* state testing
* LLM evaluations
* multi-step workflows
* failure testing
* fixtures
* test database
* reproducibility

⸻

30. EVALUATION DOCUMENT

Create:

docs/evaluation.md

Include:

Deterministic evaluation

Tool correctness
Schema correctness
State mutation
Output correctness
Error handling

Probabilistic evaluation

Tool selection
Argument accuracy
Multi-step execution
Output interpretation
Journey completion
Recovery

Explain why both are required.

⸻

31. FAILURE-MODE DOCUMENT

Create:

docs/failure-modes.md

Include a table:

Failure	Example	Expected behavior	Test
Wrong tool	Search → checkout	Reject/recover	Yes
Wrong order	Checkout before cart	Clear error	Yes
Wrong args	quantity=-1	Validation error	Yes
Missing data	Missing product ID	Ask/recover	Yes
Runtime failure	API unavailable	Structured error	Yes
Mid-chain failure	Add → update fails	Recover	Yes

Only include capabilities actually implemented.

⸻

32. BASELINE COMPARISON

If AgentBridge has an existing non-WebMCP or traditional interaction path, document the baseline.

Compare:

Traditional interaction
vs
Native WebMCP interaction

Potential dimensions:

* number of interaction steps
* agent tool discoverability
* tool selection accuracy
* argument accuracy
* task completion
* robustness
* error recovery
* reproducibility

Do not claim WebMCP is better unless the evaluation supports the claim.

⸻

33. METRICS DASHBOARD / REPORT

Create a reproducible evaluation report containing metrics such as:

Tool Discovery Success Rate
Tool Selection Accuracy
Argument Accuracy
Tool Execution Success Rate
Multi-Step Journey Completion
Failure Recovery Rate
Output Correctness
Average Latency

Separate:

Deterministic metrics

from:

LLM/probabilistic metrics

⸻

34. LLM PROVIDER ABSTRACTION

If practical, create a provider abstraction:

LLMProvider
 ├── OpenAI
 ├── another provider
 └── mock provider

The evaluation framework should not hardcode the entire evaluation around one provider.

The mock provider should allow deterministic testing of the evaluator itself.

Do not expose API keys in source code.

Use environment variables.

⸻

35. REPEATABILITY

Every evaluation should be reproducible.

Provide commands such as:

npm test

or the appropriate project commands.

For LLM evaluation:

npm run eval

or the project’s appropriate equivalent.

Document:

setup
environment variables
database setup
fixtures
browser setup
test commands
evaluation commands

⸻

36. NO FAKE RESULTS

This is critical.

Never:

* fabricate evaluation metrics
* fabricate successful agent runs
* fabricate screenshots
* fabricate browser evidence
* claim a tool works without testing it
* claim an API works without testing it
* create fake checkout behavior
* create fake WebMCP Inspector output

If something cannot be tested, clearly label it:

Not yet validated

or:

Known limitation

⸻

37. CODE QUALITY

Follow the existing project’s:

* formatting
* linting
* TypeScript/JavaScript conventions
* component conventions
* testing framework
* package manager
* directory structure

Avoid large rewrites.

Prefer small, reviewable changes.

Do not introduce a new framework unless absolutely necessary.

Do not duplicate existing application logic.

Reuse existing domain functions/services.

⸻

38. DOCUMENT ALL ARCHITECTURAL DECISIONS

Create an implementation decision log if useful:

docs/decisions.md

Document decisions such as:

Why native WebMCP?
Why this tool structure?
Why state-aware exposure?
Why/why not use-webmcp-tool?
Why/why not Angular patterns?
Why direct WebMCP execution tests?
Why isolated fixtures?

⸻

39. FINAL HACKATHON DEMO FLOW

Ensure the finished application can demonstrate the following.

Step 1 — Website

Open the real application.

Step 2 — Tool discovery

Show that the browser/agent can discover the WebMCP tools.

Step 3 — Natural language request

Give an agent a realistic request.

Example:

Find a suitable product, add it to my cart, and show me the updated cart.

Step 4 — Agent tool selection

Show:

search
→ select product
→ add to cart
→ view cart

Step 5 — Real state change

Show that the website actually changes.

Step 6 — Structured result

Show the WebMCP result.

Step 7 — Failure/recovery

Demonstrate at least one realistic failure and recovery scenario.

Step 8 — Evaluation

Show measurable results from the test/evaluation framework.

⸻

40. README UPDATE

Update the root README with:

# AgentBridge
## Overview
## Problem
## Solution
## Native WebMCP Architecture
## Why WebMCP
## How It Works
## Available Tools
## State-Aware Tools
## Example Agent Workflows
## Installation
## Environment Variables
## Running the Application
## Testing
## LLM Evaluation
## Browser/WebMCP Testing
## Evaluation Results
## Failure Modes
## Architecture
## Limitations
## Future Work
## Hackathon Demo
## License

Make the README useful to a judge who has never seen the project.

⸻

41. HACKATHON REQUIREMENT CHECK

Before declaring the work complete, verify:

[ ] Live application works
[ ] WebMCP tools are actually exposed
[ ] Agent can discover tools
[ ] Agent can execute tools
[ ] Tools modify real application state
[ ] Tool schemas are clear
[ ] State-aware behavior works
[ ] Deterministic tests exist
[ ] Browser/E2E tests exist
[ ] LLM evaluation exists
[ ] Multi-step journeys tested
[ ] Failure modes tested
[ ] Isolated fixtures exist
[ ] Documentation exists
[ ] README is complete
[ ] Open-source license exists
[ ] No secrets committed
[ ] No fake results

⸻

42. IMPLEMENTATION ORDER

Follow this order:

Phase 1 — Audit

Inspect repository and existing architecture.

Phase 2 — WebMCP compliance

Fix registration, schemas, descriptions, outputs, and errors.

Phase 3 — State awareness

Complete authentication, cart, and supported checkout lifecycle.

Phase 4 — Deterministic tests

Build reliable isolated tests.

Phase 5 — Browser validation

Validate real WebMCP discovery and execution.

Phase 6 — LLM evaluation

Test tool understanding, selection, arguments, multi-step workflows, and recovery.

Phase 7 — Metrics

Generate reproducible evaluation results.

Phase 8 — Documentation

Update README and docs.

Phase 9 — Final audit

Run the complete test/evaluation suite.

⸻

43. IMPORTANT: DO NOT PORT VERCEL SHOP

Vercel Shop, Angular WebMCP, the WebMCP repository, and use-webmcp-tool are references.

Do NOT:

* replace AgentBridge with Vercel Shop
* copy Vercel Shop’s architecture wholesale
* rename AgentBridge tools to match another project
* create unrelated ecommerce functionality
* port assumptions from another application
* rewrite the entire application

Use external projects only to improve implementation quality, standards alignment, testing methodology, and WebMCP design.

⸻

44. FINAL DELIVERABLE

At the end, provide a concise implementation report containing:

Changed

List actual files/features modified.

Added

List new tools/tests/docs.

WebMCP architecture

Explain how the final system works.

Tool inventory

List actual tools.

State model

Explain state-aware exposure.

Testing

Report deterministic test results.

Browser validation

Report actual WebMCP browser validation.

LLM evaluation

Report actual trial counts and metrics.

Failure testing

Report tested failure modes.

Limitations

Clearly identify anything unfinished.

Recommended next steps

Only recommend work that is genuinely necessary.

⸻

45. FINAL QUALITY GATE

Do not stop after implementing code.

Run:

1. Build
2. Lint
3. Unit tests
4. Integration tests
5. WebMCP tool tests
6. State tests
7. Browser E2E
8. WebMCP Inspector validation
9. LLM evaluations
10. Failure-mode tests
11. Documentation verification

Fix failures where practical.

Then verify that:

AI Agent
   ↓
discovers Native WebMCP tools
   ↓
understands tool descriptions/schemas
   ↓
selects correct tool
   ↓
provides correct arguments
   ↓
executes tool
   ↓
changes real application state
   ↓
receives structured result
   ↓
uses result in next step
   ↓
completes multi-step task

The final system must demonstrate that AgentBridge is a genuine Native WebMCP application, not merely a website with an AI chatbot or a collection of mocked tools.

Do not claim completion until the implementation and tests provide evidence.