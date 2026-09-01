export type ToolPermission = 'PUBLIC' | 'AUTHENTICATED' | 'TRANSACTIONAL';

export interface JSONSchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  items?: {
    type: string;
    description?: string;
  };
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface JSONSchema {
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface WebMCPTool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  permission: ToolPermission;
  category: 'Products' | 'Cart' | 'Wishlist' | 'Orders' | 'Promotions';
  execute: (input: TInput) => Promise<TOutput>;
}

export interface ToolExecutionResponse<T = any> {
  success: boolean;
  requiresAuthentication?: boolean;
  error?: string;
  message?: string;
  data?: T;
  [key: string]: any;
}

export interface RegisteredToolInfo {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  permission: ToolPermission;
  category: string;
  status: 'AVAILABLE' | 'LOGIN_REQUIRED';
}

export interface ModelContextInterface {
  registerTool: (tool: WebMCPTool) => void;
  unregisterTool: (toolName: string) => void;
  getTools: () => RegisteredToolInfo[];
  executeTool: (name: string, input: any) => Promise<any>;
}

declare global {
  interface Document {
    modelContext?: ModelContextInterface;
  }
}
