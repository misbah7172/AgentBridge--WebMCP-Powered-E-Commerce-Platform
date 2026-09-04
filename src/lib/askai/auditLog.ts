/**
 * Audit Logger — records all tool executions for security monitoring.
 *
 * Provides a client-side audit trail of every WebMCP tool call made by the
 * AI agent. In a production deployment, entries should be forwarded to a
 * server-side logging endpoint or external SIEM service.
 */

export interface AuditEntry {
  timestamp: string;
  toolName: string;
  /** Input with sensitive fields stripped (never log raw credentials). */
  inputSummary: Record<string, unknown>;
  resultSuccess: boolean;
  errorCode?: string;
  /** Duration of tool execution in milliseconds. */
  durationMs: number;
}

/** In-memory audit buffer (capped to prevent memory leaks). */
const MAX_ENTRIES = 500;
const auditBuffer: AuditEntry[] = [];

/** Fields that must never appear in audit logs. */
const AUDIT_REDACT_FIELDS = new Set([
  'password',
  'passwordHash',
  'token',
  'sessionToken',
  'creditCard',
  'cardNumber',
  'cvv',
  'ssn',
  'apiKey',
]);

/**
 * Redact sensitive fields from tool input before logging.
 */
function redactInput(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (AUDIT_REDACT_FIELDS.has(key)) {
      safe[key] = '[redacted]';
    } else {
      safe[key] = value;
    }
  }
  return safe;
}

/**
 * Log a tool execution event.
 */
export function logToolExecution(
  toolName: string,
  input: unknown,
  result: unknown,
  durationMs: number,
): void {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    toolName,
    inputSummary: redactInput(input),
    resultSuccess: !!(result && typeof result === 'object' && (result as any).success),
    errorCode: result && typeof result === 'object' && !(result as any).success
      ? (result as any).error || undefined
      : undefined,
    durationMs: Math.round(durationMs),
  };

  // Cap buffer size
  if (auditBuffer.length >= MAX_ENTRIES) {
    auditBuffer.shift();
  }
  auditBuffer.push(entry);

  // Console output for development — in production, POST to /api/audit
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[AUDIT] ${entry.timestamp} | ${entry.toolName} | success=${entry.resultSuccess} | ${entry.durationMs}ms`,
    );
  }
}

/**
 * Retrieve the current audit log (most recent entries).
 */
export function getAuditLog(): readonly AuditEntry[] {
  return [...auditBuffer];
}

/**
 * Clear the audit buffer (for testing).
 */
export function clearAuditLog(): void {
  auditBuffer.length = 0;
}
