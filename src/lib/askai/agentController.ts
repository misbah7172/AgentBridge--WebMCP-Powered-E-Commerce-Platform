/**
 * Agent Controller — the orchestration layer between the Ask AI UI and WebMCP tools.
 *
 * Architecture:
 *   User → Ask AI UI → Agent Controller → Gemini API → WebMCP Registry → Application State
 *
 * This module NEVER calls backend APIs directly. All actions go through
 * webmcpRegistry.executeTool(), which enforces schemas, auth, and state gating.
 */

import { webmcpRegistry } from '@/webmcp/registry';
import { formatToolsForGemini, buildSystemInstruction } from './toolFormatter';
import type {
  AgentConfig,
  AgentResponse,
  ToolAction,
  ConfirmationRequest,
  GeminiContent,
  GeminiPart,
} from './types';

/** Tools that require user confirmation before execution. */
const DESTRUCTIVE_TOOLS = new Set([
  'create_order',
  'cancel_order',
  'clear_cart',
  'logout',
]);

const MAX_TOOL_ITERATIONS = 10;

/**
 * Run one agent turn: send the conversation to Gemini and execute tool calls.
 *
 * @param userMessage - The user's latest message
 * @param conversationHistory - Prior Gemini-formatted conversation
 * @param config - Gemini API configuration (key, model, baseUrl)
 * @param onToolAction - Callback fired for each tool action (for live UI updates)
 * @returns The agent's response with tool actions
 */
export async function runAgentTurn(
  userMessage: string,
  conversationHistory: GeminiContent[],
  config: AgentConfig,
  onToolAction?: (action: ToolAction) => void,
): Promise<AgentResponse> {
  const toolActions: ToolAction[] = [];

  // 1. Discover currently available tools (state-aware — changes with auth/cart)
  const registeredTools = webmcpRegistry.getRegisteredToolsInfo();
  const geminiTools = formatToolsForGemini(registeredTools);
  const authState = webmcpRegistry.getAuthState();

  // 2. Build the conversation with the new user message
  const contents: GeminiContent[] = [
    ...conversationHistory,
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  // 3. Agentic loop: call model → execute tools → feed results → repeat
  let iterations = 0;

  while (iterations < MAX_TOOL_ITERATIONS) {
    iterations++;

    // Call Gemini API
    const response = await callGeminiAPI(contents, geminiTools, config, authState.isAuthenticated, registeredTools.length);

    // Check for function calls in the response
    const functionCalls = response.parts.filter((p: GeminiPart) => p.functionCall);

    if (functionCalls.length === 0) {
      // No tool calls — model is done, return the text response
      const textParts = response.parts.filter((p: GeminiPart) => p.text).map((p: GeminiPart) => p.text).join('');
      return {
        message: textParts || 'I completed the requested actions.',
        toolActions,
      };
    }

    // Process each function call
    for (const part of functionCalls) {
      const call = part.functionCall!;
      const actionId = `action-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      // Check if this is a destructive action requiring confirmation
      if (DESTRUCTIVE_TOOLS.has(call.name)) {
        const action: ToolAction = {
          id: actionId,
          name: call.name,
          arguments: call.args,
          status: 'awaiting-confirmation',
        };
        toolActions.push(action);
        onToolAction?.(action);

        return {
          message: getConfirmationMessage(call.name, call.args),
          toolActions,
          requiresConfirmation: {
            toolName: call.name,
            toolArgs: call.args,
            description: getConfirmationMessage(call.name, call.args),
          },
        };
      }

      // Execute the tool via WebMCP registry
      const action: ToolAction = {
        id: actionId,
        name: call.name,
        arguments: call.args,
        status: 'executing',
      };
      toolActions.push(action);
      onToolAction?.(action);

      try {
        const result = await webmcpRegistry.executeTool(call.name, call.args);
        action.status = result.success ? 'success' : 'failed';
        action.result = result;
        if (!result.success) action.error = result.message || result.error;
        onToolAction?.(action);
      } catch (err: any) {
        action.status = 'failed';
        action.error = err?.message || 'Tool execution failed';
        onToolAction?.(action);
      }
    }

    // Add the model's response (with function calls) to the conversation
    contents.push({ role: 'model', parts: response.parts });

    // Add tool results back as user messages with functionResponse parts
    const resultParts: GeminiPart[] = functionCalls.map((part: GeminiPart) => {
      const call = part.functionCall!;
      const matchingAction = toolActions.find(
        (a) => a.name === call.name && a.status !== 'awaiting-confirmation',
      );
      return {
        functionResponse: {
          name: call.name,
          response: matchingAction?.result
            ? (typeof matchingAction.result === 'object' ? matchingAction.result as Record<string, unknown> : { value: matchingAction.result })
            : { error: matchingAction?.error || 'Unknown error' },
        },
      };
    });

    contents.push({ role: 'user', parts: resultParts });
  }

  // Safety limit reached
  return {
    message: 'I reached the maximum number of steps for this request. Here\'s what I accomplished so far.',
    toolActions,
  };
}

/**
 * Execute a confirmed destructive action.
 * Called after the user confirms a pending action.
 */
export async function executeConfirmedAction(
  confirmation: ConfirmationRequest,
  conversationHistory: GeminiContent[],
  config: AgentConfig,
  onToolAction?: (action: ToolAction) => void,
): Promise<AgentResponse> {
  const actionId = `action-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const action: ToolAction = {
    id: actionId,
    name: confirmation.toolName,
    arguments: confirmation.toolArgs,
    status: 'executing',
  };
  onToolAction?.(action);

  try {
    const result = await webmcpRegistry.executeTool(confirmation.toolName, confirmation.toolArgs);
    action.status = result.success ? 'success' : 'failed';
    action.result = result;
    if (!result.success) action.error = result.message || result.error;
    onToolAction?.(action);

    // Build context and ask the model to summarize the result
    const resultSummary = result.success
      ? `The action ${confirmation.toolName} was confirmed and executed successfully. Result: ${JSON.stringify(result)}`
      : `The action ${confirmation.toolName} failed: ${result.message || result.error}`;

    const contents: GeminiContent[] = [
      ...conversationHistory,
      { role: 'user', parts: [{ text: `[System: User confirmed the action. ${resultSummary}. Please summarize the outcome for the user.]` }] },
    ];

    const registeredTools = webmcpRegistry.getRegisteredToolsInfo();
    const geminiTools = formatToolsForGemini(registeredTools);
    const authState = webmcpRegistry.getAuthState();
    const response = await callGeminiAPI(contents, geminiTools, config, authState.isAuthenticated, registeredTools.length);
    const text = response.parts.filter((p: GeminiPart) => p.text).map((p: GeminiPart) => p.text).join('');

    return {
      message: text || (result.success ? 'Action completed successfully.' : `Action failed: ${action.error}`),
      toolActions: [action],
    };
  } catch (err: any) {
    action.status = 'failed';
    action.error = err?.message || 'Execution failed';
    onToolAction?.(action);
    return {
      message: `Failed to execute ${confirmation.toolName}: ${action.error}`,
      toolActions: [action],
    };
  }
}

/**
 * Call the Gemini API with function calling support.
 */
async function callGeminiAPI(
  contents: GeminiContent[],
  tools: ReturnType<typeof formatToolsForGemini>,
  config: AgentConfig,
  isAuthenticated: boolean,
  toolCount: number,
): Promise<{ parts: GeminiPart[] }> {
  const url = `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;

  const body: Record<string, unknown> = {
    contents,
    systemInstruction: {
      parts: [{ text: buildSystemInstruction(toolCount, isAuthenticated) }],
    },
  };

  if (tools.length > 0) {
    body.tools = [{ functionDeclarations: tools }];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    // Check for blocking
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Request blocked by Gemini: ${data.promptFeedback.blockReason}`);
    }
    throw new Error('No response from Gemini API.');
  }

  return data.candidates[0].content;
}

/**
 * Generate a human-readable confirmation message for destructive actions.
 */
function getConfirmationMessage(toolName: string, args: Record<string, unknown>): string {
  switch (toolName) {
    case 'create_order':
      return `I'm about to place a demo order${args.fullName ? ` for **${args.fullName}**` : ''} to **${args.street || ''}, ${args.city || ''}, ${args.state || ''} ${args.zipCode || ''}**. This will use DEMO_CARD payment. Would you like to proceed?`;
    case 'cancel_order':
      return `I'm about to cancel order **${args.orderId || ''}**${args.reason ? ` (reason: ${args.reason})` : ''}. This cannot be undone. Should I proceed?`;
    case 'clear_cart':
      return 'I\'m about to remove **all items** from your cart. This cannot be undone. Should I proceed?';
    case 'logout':
      return 'I\'m about to sign you out. You\'ll need to log in again to access cart and order features. Should I proceed?';
    default:
      return `I'm about to execute **${toolName}**. Should I proceed?`;
  }
}

/**
 * Convert our ChatMessage[] to Gemini conversation format.
 * This is used to build the conversation history for the API call.
 */
export function chatMessagesToGeminiContents(
  messages: Array<{ role: string; content: string; toolActions?: ToolAction[] }>,
): GeminiContent[] {
  const contents: GeminiContent[] = [];

  for (const msg of messages) {
    if (msg.role === 'user') {
      contents.push({ role: 'user', parts: [{ text: msg.content }] });
    } else if (msg.role === 'model') {
      const parts: GeminiPart[] = [];
      if (msg.content) parts.push({ text: msg.content });
      // If there were tool actions, we don't need to re-add them — they were already
      // processed in the agent loop. The text summary is sufficient for conversation context.
      if (parts.length > 0) {
        contents.push({ role: 'model', parts });
      }
    }
  }

  return contents;
}
