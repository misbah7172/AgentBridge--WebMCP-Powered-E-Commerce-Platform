/**
 * Converts WebMCP RegisteredToolInfo[] into Gemini function declarations.
 * Only includes tools with AVAILABLE status — state-aware by design.
 */

import type { RegisteredToolInfo } from '@/webmcp/types';
import type { GeminiFunctionDeclaration } from './types';

/**
 * Strip fields that Gemini doesn't understand from JSON Schema properties.
 * Gemini expects a subset of JSON Schema: type, description, enum, items, properties, required.
 */
function cleanSchemaProperty(prop: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  if (prop.type) cleaned.type = prop.type === 'integer' ? 'number' : prop.type;
  if (prop.description) cleaned.description = prop.description;
  if (prop.enum) cleaned.enum = prop.enum;
  if (prop.items) cleaned.items = cleanSchemaProperty(prop.items as Record<string, unknown>);
  if (prop.properties) {
    const nested: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(prop.properties as Record<string, unknown>)) {
      nested[k] = cleanSchemaProperty(v as Record<string, unknown>);
    }
    cleaned.properties = nested;
  }
  if (prop.required) cleaned.required = prop.required;
  return cleaned;
}

export function formatToolsForGemini(tools: RegisteredToolInfo[]): GeminiFunctionDeclaration[] {
  return tools
    .filter((tool) => tool.status === 'AVAILABLE')
    .map((tool) => {
      const properties: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(tool.inputSchema.properties || {})) {
        properties[key] = cleanSchemaProperty(value as unknown as Record<string, unknown>);
      }

      return {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties,
          required: tool.inputSchema.required || [],
        },
      };
    });
}

/**
 * Build the system instruction for the agent.
 * Tells the model it's an e-commerce assistant that uses WebMCP tools.
 */
export function buildSystemInstruction(toolCount: number, isAuthenticated: boolean): string {
  return [
    'You are an AI shopping assistant for AgentBridge, an e-commerce platform.',
    `You have access to ${toolCount} tools to help users browse products, manage their cart, wishlist, orders, and account.`,
    '',
    'RULES:',
    '1. Use the available tools to fulfill user requests. Do NOT make up product data, prices, or IDs.',
    '2. Product IDs, order IDs, and other identifiers must come from tool results — never invent them.',
    '3. When a tool returns results, summarize them naturally for the user.',
    '4. If a tool fails, explain the error clearly and suggest what the user can do.',
    `5. The user is currently ${isAuthenticated ? 'logged in' : 'NOT logged in (guest)'}. ` +
      (isAuthenticated
        ? 'You can use all available tools including cart and order management.'
        : 'Some tools require login. If a user wants to use cart/order features, tell them to log in first or use the login tool.'),
    '6. For search queries, use the search_products tool. For browsing by category, use filter_products.',
    '7. When showing products, include name, price, rating, and stock status.',
    '8. When the user says "add to cart" and a product was recently discussed, use that product\'s ID.',
    '9. Be concise but helpful. Use bullet points for product lists.',
    '10. NEVER bypass WebMCP tools. All actions must go through the tool system.',
    '11. VIEWING A SPECIFIC PRODUCT: When the user asks to see, open, inspect, or view a specific product (e.g., "show me the MacBook", "open this phone", "take me to this product page"), resolve its productId first (using search_products if needed), then call view_product_page to open the product in the browser for the user.',
    '12. COMPARING PRODUCTS: When the user asks to compare 2 or more products (e.g., "compare these laptops", "show me a comparison between X and Y", "compare products"), resolve the product IDs, then call view_comparison_page with the productIds to open the comparison page on screen. You can set view to "parallel" (side-by-side) or "serial" (stacked detailed cards) or leave it as "auto". You can also call compare_products to analyze and summarize their specs.',
    '13. STORE NAVIGATION: When the user asks to visit or open a store section (e.g., "go to cart", "open checkout", "show catalog", "my orders", "view wishlist"), use navigate_to_page with the target page.',
  ].join('\n');
}
