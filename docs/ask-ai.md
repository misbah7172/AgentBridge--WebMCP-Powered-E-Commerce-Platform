# Ask AI — Architecture and Implementation

## Overview

Ask AI is an in-app AI stylist and commerce assistant that demonstrates AgentBridge's core thesis: AI agents interact with the storefront exclusively through native WebMCP tools — not through direct API or database access. The assistant uses Google's Gemini API with native function calling to dynamically discover and invoke WebMCP tools, supplemented by browser-native Web Speech API capabilities for hands-free voice input and speech synthesis audio replies.

## Architecture

```
              ┌─────────────────────────┐
              │     User (Browser)      │
              └──────────┬──────────────┘
                         │ types message or speaks via mic
                         ▼
              ┌─────────────────────────┐
              │    Ask AI Panel (UI)    │
              │                         │
              │  • Chat history         │
              │  • Web Speech voice mic │
              │  • TTS audio playback   │
              │  • Mute / Stop controls │
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
              │    (34 Native Tools)    │
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
- State-aware availability (e.g., `create_order` requires a populated cart)
- Structured error responses

This proves that the AI assistant uses the exact same tool interface as an external AI agent operating through `document.modelContext`.

### Dynamic Tool Discovery

Tools are discovered dynamically at each agent turn:

```typescript
const registeredTools = webmcpRegistry.getRegisteredToolsInfo();
const geminiTools = formatToolsForGemini(registeredTools);
```

Only tools with `status: 'AVAILABLE'` are presented to Gemini:
- **Guest (Logged Out)**: 18 public tools (apparel discovery, sizing guides, catalog search, comparison, shipping estimates, auth).
- **Logged in, empty cart**: 33 tools (cart reads, mutations, wishlist, addresses, order history).
- **Logged in, cart populated**: All 34 tools active (including `create_order`).

The AI does not hardcode tool availability — it discovers it reactively as user and session state changes.

### Voice & Speech Synthesis Engine

Ask AI features a full-duplex conversational voice system:
1. **Voice Input (Speech Recognition)**:
   - Uses native browser `SpeechRecognition` / `webkitSpeechRecognition`.
   - Real-time interim transcript display in the input box.
   - Optional `autoSendVoice` toggle: automatically submits the prompt upon speech completion.
2. **Audio Replies (Text-to-Speech)**:
   - Converts Gemini markdown responses into natural speech via `window.speechSynthesis`.
   - Markdown syntax, URLs, bullet points, and brackets are stripped prior to synthesis.
3. **Mute, Silence, and Safety Controls**:
   - **Instant Cancellation**: Toggling the Mute button immediately calls `window.speechSynthesis.cancel()` to silence playing audio on the spot.
   - **Synchronous `voiceReplyRef`**: A React ref guarantees async agent turns read the real-time mute state when responses arrive, preventing stale closure speech.
   - **Active Sound Wave Indicator**: When audio is playing, an animated sound wave banner displays above the input with a 1-click `[■ Stop Audio]` button.
   - **Auto-Silence on Close**: Closing the drawer (via click, button, or Escape key) immediately stops all audio.

### Confirmation Gates

Destructive or transactional actions require explicit user confirmation before execution:
- `create_order` — demo order placement
- `cancel_order` — order cancellation
- `clear_cart` — cart emptying
- `logout` — session termination

When Gemini attempts to call a gated tool, the controller pauses execution and yields a `requiresConfirmation` prompt. The UI renders a dedicated confirmation card with "✓ Confirm" and "✗ Cancel" buttons. Only after the user confirms does the tool execute.

### Client-Side API Key Configuration

The Gemini API key is configured by the user in the Ask AI settings panel and saved securely in browser `localStorage`. The key is sent directly from the browser to Google's API endpoint — it never touches an intermediary server.

## File Structure

```
src/
├── lib/askai/
│   ├── types.ts              # TypeScript interfaces (ChatMessages, ToolAction, AgentConfig)
│   ├── toolFormatter.ts      # WebMCP → Gemini function declaration converter
│   └── agentController.ts    # Multi-turn agentic loop orchestrator
├── components/askai/
│   ├── AskAIPanel.tsx        # Main drawer UI (chat, voice controls, audio banner, settings)
│   ├── ChatMessage.tsx       # Message bubble and confirmation card renderer
│   └── ToolActionBadge.tsx   # Visual status badge for WebMCP tool execution
└── styles/
    └── askai.css             # Luxury styling, sound wave animations, voice badges
```

## Tool Execution Flows

### 1. Apparel Discovery Flow (e.g., "Show red tops for women")
```
User: "Show red tops for women"
  → Agent discovers available public tools
  → Gemini selects filter_apparel({ gender: "female", color: "red", category: "tops" })
  → webmcpRegistry.executeTool("filter_apparel", { gender: "female", color: "red", category: "tops" })
  → Registry validates input → Calls /api/products?category=womens-tops&color=red
  → 10 matching luxury red tops returned to Gemini
  → Gemini summarizes: "I found 10 exquisite red tops in our women's collection, including the Crimson Silk Charmeuse Blouse..."
  → If voice replies are enabled: Text-to-Speech plays the summary aloud.
```

### 2. Sizing Reconciliation Flow (e.g., "What size fits a 36-inch bust?")
```
User: "What size fits a 36-inch bust in women's tops?"
  → Gemini selects get_apparel_size_guide({ department: "women", category: "tops" })
  → WebMCP registry returns the verified atelier sizing chart
  → Gemini determines: "For a 36-inch bust, size Medium (36-37 in) provides an elegant tailored fit..."
```

### 3. Visual Comparison Navigation Flow (e.g., "Compare these two shirts")
```
User: "Compare the Classic White Tee and the Midnight Blue Tee"
  → Gemini calls search_products({ query: "White Tee" }) → ID: "prod-tee-white"
  → Gemini calls search_products({ query: "Blue Tee" }) → ID: "prod-tee-blue"
  → Gemini calls view_comparison_page({ productIds: ["prod-tee-white", "prod-tee-blue"], view: "parallel" })
  → Tool dispatches "webmcp-navigation" event
  → Navigation listener executes router.push("/compare?ids=prod-tee-white,prod-tee-blue&view=parallel")
  → Storefront navigates to the side-by-side comparison matrix while Ask AI remains open
  → Gemini: "I've opened the parallel comparison matrix on your screen."
```

### 4. Authenticated Cart Addition Flow
```
User: "Add the Crimson Silk Blouse to my cart" (authenticated)
  → Gemini calls search_products({ query: "Crimson Silk Blouse" })
  → Resolves productId: "prod-top-red-1"
  → Gemini calls add_to_cart({ productId: "prod-top-red-1", quantity: 1 })
  → Registry validates session → Calls POST /api/cart
  → CartContext updates, cart drawer count updates, and create_order becomes available
  → Gemini: "Added the Crimson Silk Charmeuse Blouse to your bag."
```

### 5. Transactional Confirmation Flow (e.g., "Place my order")
```
User: "Place my demo order to 742 Evergreen Terrace"
  → Gemini calls create_order({ shippingAddress: { ... }, paymentMethod: "DEMO_CARD", confirmDemoOrder: true })
  → Controller pauses execution: triggers requiresConfirmation
  → UI displays: "I'm about to place a demo order for 1 item ($280.00)... Confirm?"
  → User clicks "✓ Confirm"
  → webmcpRegistry.executeTool("create_order", { ... })
  → Order placed in DB → Cart cleared → Gemini confirms order number ORD-XXXXXX
```

## State Awareness

The Ask AI assistant dynamically adapts its tool set based on the user's session:

| Session State | Available Tool Count | Capabilities |
|---------------|---------------------|--------------|
| Guest (Logged Out) | 18 public tools | Browse apparel, filter by color/gender, consult size charts, compare items, view shipping rates, log in |
| Authenticated, empty cart | 33 tools | All public tools + view cart, update wishlist, edit shipping addresses, inspect order history |
| Authenticated, cart populated | 34 tools | All tools active, including checkout order placement (`create_order`) |
| After order completion | 33 tools | Cart empties, `create_order` automatically gates until a new item is added |

## Security & Privacy

- **Zero Intermediary Leakage**: Gemini API keys are kept in browser memory and `localStorage`. They are never transmitted to the AgentBridge backend.
- **Strict WebMCP Validation**: Tool inputs are strictly validated prior to dispatch.
- **Server Enforcement**: API routes enforce authentication and database constraints regardless of whether invoked via UI or agent.
- **Controlled Audio Playback**: Audio speech synthesis can be stopped at any moment with zero latency.
