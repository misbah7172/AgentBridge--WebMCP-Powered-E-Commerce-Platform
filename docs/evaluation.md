# Evaluation Methodology

## Overview

AgentBridge evaluations measure how well AI agents can discover, select, and invoke WebMCP tools to complete e-commerce tasks. Evaluations are organized in two categories: deterministic (schema + contract validation) and probabilistic (LLM planning accuracy).

## Deterministic Evaluations

### Schema Validation (`npm run eval:webmcp`)

Validates that all evaluation case JSON files conform to the expected structure:
- Each case has `id`, `userPrompt`, `initialState`, `availableTools`, and `expectedCalls`
- Tool names in `availableTools` and `expectedCalls` are valid registered tools
- Expected call arguments use runtime placeholders (`${...}`) rather than hardcoded values

**Result**: Pass/fail per case. All 16 cases must pass.

### Tool Contract Tests (`npm test`)

Validates that every tool:
- Calls the correct API endpoint with the correct HTTP method
- Encodes query parameters properly
- Sends correct request bodies
- Returns structured responses
- Handles API failures gracefully

**Result**: 57 deterministic tests must pass.

## Probabilistic Evaluations

### LLM Tool Planning (`npm run eval:webmcp:llm`)

Sends each evaluation case to an LLM provider and measures planning accuracy. The LLM receives the user prompt, available tools, and initial state, and returns a planned sequence of tool calls.

#### Metrics

| Metric | Definition |
|--------|-----------|
| **Tool Selection Accuracy** | Did the model select the correct set of tools (order-independent)? |
| **Argument Accuracy** | Did the model provide correct arguments for each tool call? |
| **Chain Accuracy** | Did the model produce the correct sequence of calls (order-dependent)? |
| **Recovery Accuracy** | Did the model correctly avoid calling unavailable tools? |
| **Average Latency** | Mean response time per evaluation case |

#### Provider Abstraction

The evaluation framework supports multiple LLM providers via the `LLMProvider` interface:

```typescript
interface LLMProvider {
  name: string;
  planCase(evaluation: EvalCase): Promise<PlanResult>;
}
```

Supported providers:
- **OpenAI** (`OPENAI_API_KEY` required) — uses the Responses API
- **Mock** (default when no API key) — deterministic responses for testing the evaluator

Provider selection: Set `WEBMCP_EVAL_PROVIDER` to `openai` or `mock`, or let it auto-detect based on `OPENAI_API_KEY` presence.

#### Configuration

| Variable | Purpose | Default |
|----------|---------|---------|
| `OPENAI_API_KEY` | OpenAI API key for LLM evaluation | — |
| `WEBMCP_EVAL_MODEL` | Model identifier | `gpt-5.6-luna` |
| `WEBMCP_EVAL_RUNS` | Repetitions per case (for variance reduction) | 3 |
| `WEBMCP_EVAL_PROVIDER` | Provider type override | auto-detect |

## Evaluation Cases

### Categories

| Category | Cases | Purpose |
|----------|-------|---------|
| `direct/` | 1 | Single-tool invocations |
| `tool_selection/` | 1 | Correct tool identification |
| `arguments/` | 2 | Correct parameter generation |
| `e2e/` | 5 | Multi-step journey completion |
| `ordered_chains/` | 1 | Correct execution ordering |
| `unordered_chains/` | 1 | Parallel-safe tool selection |
| `mid_chain/` | 1 | Mid-journey failure handling |
| `failure_modes/` | 3 | Edge case and error recovery |
| `ambiguous/` | 1 | Ambiguous user intent handling |

### Case Structure

```json
{
  "id": "unique-case-identifier",
  "userPrompt": "Natural language customer request",
  "initialState": "Description of starting conditions",
  "availableTools": ["tool_name_1", "tool_name_2"],
  "expectedCalls": [
    { "functionName": "tool_name", "arguments": { "key": "${placeholder}" } }
  ],
  "expectNoToolCall": false
}
```

### Runtime Placeholders

Evaluation cases use `${...}` placeholders for values that depend on runtime data:
- `${criteria}` — search terms
- `${resolvedProductId}` — product ID from a prior search result
- `${cartItemProductId}` — product ID from cart contents
- `${userEmail}`, `${userPassword}` — credentials
- `${fullName}`, `${street}`, `${city}`, `${state}`, `${zipCode}` — address fields

Cases must never contain production SKUs, prices, brands, or categories.

## Running Evaluations

```bash
# Schema validation only
npm run eval:webmcp

# Full evaluation with LLM provider
OPENAI_API_KEY=sk-... npm run eval:webmcp:llm

# With custom model and repetitions
WEBMCP_EVAL_MODEL=gpt-4o WEBMCP_EVAL_RUNS=5 npm run eval:webmcp:llm
```

## Results

Results are written to `eval-results/`:
- `summary.json` — schema validation results
- `llm-results.json` — LLM planning metrics
- `detailed-results.json` — combined deterministic + evaluation report
- `report.md` — human-readable summary
