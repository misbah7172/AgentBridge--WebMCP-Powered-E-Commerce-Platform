# Ask AI — Architecture and Implementation

## Overview

Ask AI is an in-app AI assistant that demonstrates AgentBridge's core thesis: AI agents interact with the application through the same Native WebMCP tools — not through direct API or database access. The assistant uses Google's Gemini API with function calling to dynamically discover and invoke WebMCP tools.

## Architecture

```
              ┌─────────────────────────┐
              │     User (Browser)      │
              └──────────┬──────────────┘
                         │ types message
                         ▼
              ┌─────────────────────────┐
              │    Ask AI Panel (UI)    │
              │                         │
              │  • Chat history         │
              │  • Tool action badges   │
              │  • Confirmation prompts │
              │  • API key settings     │
              └──────────┬──────────────┘
                         │
                         ▼
              ┌─────────────────────────┐
              │   Agent Controller      │
              │                         │
              │  1. Discover tools      │ ← webmcpRegistry.getRegisteredToolsInfo()
              │  2. Format for Gemini   │ ← toolFormatter.ts
              │  3. Call Gemini API     │ → generativelanguage.googleapis.com
              │  4. Parse response      │
              │  5. Tool call?          │
              │     ├─ Yes: Execute     │ ← webmcpRegistry.executeTool()
              │     │  Feed result back │
              │     │  Loop (≤10 iter)  │
              │     └─ No: Return text  │
              └──────────┬──────────────┘
                         │
              ┌──────────▼──────────────┐
              │    WebMCP Registry      │
              │    (29 existing tools)  │
              │                         │
              │  • Schema validation    │
              │  • Auth enforcement     │
              │  • State gating         │
              │  • Same API calls       │
              └──────────┬──────────────┘
                         │ fetch()
              ┌──────────▼──────────────┐
              │   Same-Origin APIs      │
              │   Same Database         │
              │   Same Services         │
              └─────────────────────────┘
```

## Key Design Decisions

### WebMCP-Only Execution

The agent controller **never** calls backend APIs directly. Every action goes through `webmcpRegistry.executeTool()`, which enforces:
- Schema validation (required fields, types, constraints)
- Authentication requirements
- State-aware availability (e.g., `create_order` requires populated cart)
- Structured error responses

This proves that the AI agent uses the exact same tool interface as any external AI agent would through `document.modelContext`.

### Dynamic Tool Discovery

Tools are discovered dynamically at each agent turn:

```typescript
const registeredTools = webmcpRegistry.getRegisteredToolsInfo();
const geminiTools = formatToolsForGemini(registeredTools);
```

Only tools with `status: 'AVAILABLE'` are included. This means:
- **Guest**: Only public tools (search, filter, compare) are available
- **Logged in, empty cart**: All tools except `create_order`
- **Logged in, cart populated**: All tools including `create_order`

The AI does not hardcode tool availability — it discovers it naturally.

### Gemini Function Calling

The agent controller uses Google's Gemini API (`gemini-2.0-flash` by default) with the function calling feature:

1. WebMCP tool schemas are converted to Gemini `functionDeclarations`
2. The model decides whether to call a tool or respond with text
3. If a tool is called, the result is fed back as a `functionResponse`
4. The loop continues until the model produces a text-only response or the 10-iteration safety limit is reached

### Confirmation Gates

Destructive actions require explicit user confirmation before execution:
- `create_order` — order placement
- `cancel_order` — order cancellation
- `clear_cart` — cart emptying
- `logout` — session termination

When the model requests a destructive tool, the controller pauses execution and returns a `requiresConfirmation` response. The UI displays a confirmation card. Only after the user clicks "Confirm" does the tool execute.

### Client-Side API Key

The Gemini API key is entered by the user in the Ask AI settings panel and stored only in React component state (not persisted). The key is sent directly from the browser to Google's API — it never touches the AgentBridge backend.

## File Structure

```
src/
├── lib/askai/
│   ├── types.ts              # TypeScript interfaces
│   ├── toolFormatter.ts      # WebMCP → Gemini function declaration converter
│   └── agentController.ts    # Agentic loop orchestrator
├── components/askai/
│   ├── AskAIPanel.tsx        # Main panel UI (chat, settings, input)
│   ├── ChatMessage.tsx       # Message bubble renderer
│   └── ToolActionBadge.tsx   # Tool execution status badge
└── styles/
    └── askai.css             # Panel styles (glassmorphism, animations)
```

## Tool Execution Flow

### Normal Flow (e.g., "Search for laptops")
```
User: "Search for laptops"
  → Agent discovers 14 available public tools
  → Gemini selects search_products({query: "laptop"})
  → webmcpRegistry.executeTool("search_products", {query: "laptop"})
  → Registry validates input → Tool calls /api/products?q=laptop
  → Result returned to Gemini
  → Gemini summarizes: "I found 5 laptops..."
```

### Multi-Step Chain (e.g., "Find a laptop and add it to my cart")
```
User: "Find a laptop and add it to my cart"
  → Gemini calls search_products({query: "laptop"})
  → Result: [{id: "prod-123", name: "TechPro Laptop", ...}]
  → Fed back to Gemini
  → Gemini calls add_to_cart({productId: "prod-123"})
  → Result: {success: true, cart: {itemCount: 1, ...}}
  → Fed back to Gemini
  → Gemini: "I added the TechPro Laptop to your cart!"
```

### Auth Recovery (e.g., "Show my cart" while logged out)
```
User: "Show my cart" (guest)
  → Only public tools available (get_cart not available)
  → Gemini: "You need to log in first. Would you like me to log you in?"
  → User: "Yes, use demo@agentbridge.io"
  → Gemini calls login({email: "demo@agentbridge.io", password: "..."})
  → Auth state updates → protected tools become available
  → Gemini calls get_cart({})
  → Gemini: "Your cart has 2 items..."
```

### Confirmation Flow (e.g., "Place my order")
```
User: "Place my order to 123 Main St, Springfield"
  → Gemini calls create_order({...})
  → Controller detects destructive action → PAUSES
  → UI shows: "I'm about to place a demo order... Confirm?"
  → User clicks "Confirm"
  → webmcpRegistry.executeTool("create_order", {...})
  → Gemini: "Order ORD-123456 placed successfully!"
```

## State Awareness

The Ask AI panel reflects the same state transitions as the full WebMCP system:

| State | Available Tool Count | Key Changes |
|-------|---------------------|-------------|
| Guest | ~14 public tools | No cart, wishlist, or order tools |
| Logged in, empty cart | ~28 tools | Cart/order tools available except `create_order` |
| Logged in, populated cart | 29 tools | `create_order` now available |
| After checkout | ~28 tools | Cart cleared, `create_order` unavailable again |

## Security

- API key stored only in browser memory (React state), never persisted
- All tool execution goes through WebMCP validation (auth, schema, state)
- Destructive actions require explicit user confirmation
- No admin tools are exposed
- No direct database or service access
- Server-side API routes enforce all business rules regardless of caller

## Limitations

- Requires a valid Gemini API key (free tier available at aistudio.google.com)
- Function calling quality depends on the selected model
- Maximum 10 tool call iterations per turn (safety limit)
- Conversation history is stored in browser memory only (lost on page refresh)
- The Gemini API key is sent from the browser to Google — standard browser CORS applies
