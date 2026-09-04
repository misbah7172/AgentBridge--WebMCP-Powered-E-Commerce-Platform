/**
 * Response Redactor — strips PII from tool results before they reach the LLM.
 *
 * This is the privacy boundary between WebMCP tool execution (which operates
 * on real user data) and the Gemini API (which should only see anonymized
 * summaries). All tool results pass through redactForLLM() before being
 * included in a functionResponse sent to the LLM.
 */

/** Fields that should always be redacted from any tool result, at any depth. */
const GLOBAL_PII_FIELDS = new Set([
  'passwordHash',
  'password',
  'token',
  'sessionToken',
  'creditCard',
  'cardNumber',
  'cvv',
  'ssn',
]);

/** Fields containing address/contact PII that are redacted by default. */
const CONTACT_PII_FIELDS = new Set([
  'phone',
  'street',
  'zipCode',
]);

/**
 * Redact sensitive fields from a tool result before it is sent to the LLM.
 *
 * @param toolName - The name of the tool that produced the result
 * @param result   - The raw tool result (will be deep-cloned, not mutated)
 * @returns A redacted copy safe for LLM consumption
 */
export function redactForLLM(toolName: string, result: unknown): unknown {
  if (result === null || result === undefined) return result;
  if (typeof result !== 'object') return result;

  // Deep clone to avoid mutating the original
  const redacted = JSON.parse(JSON.stringify(result));

  // Always strip global PII fields at every depth
  redactFieldsRecursive(redacted, GLOBAL_PII_FIELDS, '[redacted]');

  // Apply tool-specific redaction rules
  applyToolSpecificRedactions(toolName, redacted);

  return redacted;
}

/**
 * Recursively walk an object and replace matching field values.
 */
function redactFieldsRecursive(
  obj: Record<string, unknown>,
  fields: Set<string>,
  replacement: string,
): void {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (item && typeof item === 'object') {
        redactFieldsRecursive(item as Record<string, unknown>, fields, replacement);
      }
    }
    return;
  }

  for (const key of Object.keys(obj)) {
    if (fields.has(key) && obj[key] !== undefined && obj[key] !== null) {
      obj[key] = replacement;
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      redactFieldsRecursive(obj[key] as Record<string, unknown>, fields, replacement);
    }
  }
}

/**
 * Mask an email address: "john.doe@example.com" → "j***@example.com"
 */
function maskEmail(email: string): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) return '[redacted]';
  const [local, domain] = email.split('@');
  if (!local || !domain) return '[redacted]';
  return `${local[0]}***@${domain}`;
}

/**
 * Apply tool-specific redaction logic.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyToolSpecificRedactions(toolName: string, data: any): void {
  switch (toolName) {
    case 'get_account_info':
      if (data?.user?.email) {
        data.user.email = maskEmail(data.user.email);
      }
      break;

    case 'get_saved_addresses':
      if (Array.isArray(data?.addresses)) {
        data.addresses.forEach((addr: any, i: number) => {
          if (addr.street) addr.street = `[Saved Address #${i + 1}]`;
          if (addr.phone) addr.phone = '[redacted]';
          if (addr.zipCode) addr.zipCode = '[redacted]';
        });
      }
      break;

    case 'get_order_details':
      // Redact shipping address details from order
      if (data?.order?.shippingAddress || data?.shippingAddress) {
        const addr = data.order?.shippingAddress || data.shippingAddress;
        if (addr.street) addr.street = '[redacted]';
        if (addr.phone) addr.phone = '[redacted]';
        if (addr.zipCode) addr.zipCode = '[redacted]';
      }
      break;

    case 'get_order_history':
      // Redact any embedded address data from order summaries
      if (Array.isArray(data?.orders)) {
        data.orders.forEach((order: any) => {
          if (order.shippingAddress) {
            redactFieldsRecursive(order.shippingAddress, CONTACT_PII_FIELDS, '[redacted]');
          }
        });
      }
      break;

    case 'create_order':
      // The result of placing an order — keep order number but redact address
      if (data?.order?.shippingAddress) {
        redactFieldsRecursive(data.order.shippingAddress, CONTACT_PII_FIELDS, '[redacted]');
      }
      break;

    default:
      // For all other tools, apply contact PII redaction recursively as a safety net
      redactFieldsRecursive(data, CONTACT_PII_FIELDS, '[redacted]');
      break;
  }
}
