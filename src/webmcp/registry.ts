import { WebMCPTool, RegisteredToolInfo, ModelContextInterface, ToolExecutionResponse } from './types';

class WebMCPRegistry {
  private tools: Map<string, WebMCPTool> = new Map();
  private isAuthenticated: boolean = false;
  private currentUser: any = null;
  private listeners: Set<(tools: RegisteredToolInfo[]) => void> = new Set();
  private executionListeners: Set<(event: { toolName: string; input: any; result: any; timestamp: number }) => void> = new Set();
  private nativeRegisterToolFn: ((tool: any) => void) | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.safeInit();
  }

  public safeInit() {
    if (this.isInitialized || typeof document === 'undefined') return;

    try {
      const self = this;

      // Check if native document.modelContext exists
      const existingContext = (document as any).modelContext;
      if (existingContext && typeof existingContext.registerTool === 'function' && !(existingContext as any).__isAgentBridgeWebMCP) {
        // Native or existing WebMCP provider detected
        this.nativeRegisterToolFn = existingContext.registerTool.bind(existingContext);
      }

      const modelContextImpl: ModelContextInterface & { __isAgentBridgeWebMCP?: boolean } = {
        __isAgentBridgeWebMCP: true,
        registerTool: (tool: WebMCPTool) => {
          self.registerTool(tool);
        },
        unregisterTool: (toolName: string) => {
          self.unregisterTool(toolName);
        },
        getTools: () => {
          return self.getRegisteredToolsInfo();
        },
        executeTool: (name: string, input: any) => {
          return self.executeTool(name, input);
        },
      };

      // Safely attach to document.modelContext if not already present or configurable
      if (!('modelContext' in document) || !(document as any).modelContext) {
        try {
          Object.defineProperty(document, 'modelContext', {
            value: modelContextImpl,
            writable: true,
            configurable: true,
          });
        } catch {
          try {
            (document as any).modelContext = modelContextImpl;
          } catch {
            // Document is sealed or non-writable in some browser sandbox
          }
        }
      }

      this.isInitialized = true;
    } catch (err) {
      console.warn('[WebMCP] Safe initialization warning:', err);
    }
  }

  public initDocumentModelContext() {
    this.safeInit();
  }

  public registerTool(tool: WebMCPTool) {
    if (!tool || !tool.name) return;

    try {
      this.safeInit();
      this.tools.set(tool.name, tool);

      // If a native browser WebMCP registry exists, also register with the native agent runtime
      if (this.nativeRegisterToolFn) {
        try {
          this.nativeRegisterToolFn({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
            execute: async (input: any) => {
              return await this.executeTool(tool.name, input);
            },
          });
        } catch (nativeErr) {
          console.warn(`[WebMCP] Native tool registration for ${tool.name}:`, nativeErr);
        }
      }

      this.notifyListeners();
    } catch (err) {
      console.warn(`[WebMCP] Failed to register tool "${tool?.name}":`, err);
    }
  }

  public unregisterTool(toolName: string) {
    this.tools.delete(toolName);
    this.notifyListeners();
  }

  public setAuthState(isAuthenticated: boolean, user: any = null) {
    this.isAuthenticated = isAuthenticated;
    this.currentUser = user;
    this.notifyListeners();
  }

  public getAuthState(): { isAuthenticated: boolean; user: any } {
    return {
      isAuthenticated: this.isAuthenticated,
      user: this.currentUser,
    };
  }

  public getRegisteredToolsInfo(): RegisteredToolInfo[] {
    const list: RegisteredToolInfo[] = [];
    const toolsArray = Array.from(this.tools.values());
    for (const tool of toolsArray) {
      const isPublic = tool.permission === 'PUBLIC';
      const status = isPublic || this.isAuthenticated ? 'AVAILABLE' : 'LOGIN_REQUIRED';
      list.push({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        permission: tool.permission,
        category: tool.category,
        status,
      });
    }
    return list;
  }

  public async executeTool(name: string, input: any): Promise<ToolExecutionResponse> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        error: 'TOOL_NOT_FOUND',
        message: `WebMCP tool "${name}" is not registered on this page.`,
      };
    }

    // Check Authentication
    if (tool.permission !== 'PUBLIC' && !this.isAuthenticated) {
      const authErrorResponse: ToolExecutionResponse = {
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        requiresAuthentication: true,
        message: `Authentication is required to execute "${name}". Please log in to your account.`,
      };
      this.notifyExecution(name, input, authErrorResponse);
      return authErrorResponse;
    }

    try {
      const result = await tool.execute(input);
      this.notifyExecution(name, input, result);
      return result;
    } catch (err: any) {
      const errorResult: ToolExecutionResponse = {
        success: false,
        error: 'EXECUTION_ERROR',
        message: err?.message || 'An unexpected error occurred during tool execution.',
      };
      this.notifyExecution(name, input, errorResult);
      return errorResult;
    }
  }

  public subscribe(listener: (tools: RegisteredToolInfo[]) => void): () => void {
    this.listeners.add(listener);
    try {
      listener(this.getRegisteredToolsInfo());
    } catch (err) {
      console.error('Error executing initial WebMCP listener:', err);
    }
    return () => this.listeners.delete(listener);
  }

  public onExecution(listener: (event: { toolName: string; input: any; result: any; timestamp: number }) => void): () => void {
    this.executionListeners.add(listener);
    return () => this.executionListeners.delete(listener);
  }

  private notifyListeners() {
    const tools = this.getRegisteredToolsInfo();
    this.listeners.forEach((listener) => {
      try {
        listener(tools);
      } catch (err) {
        console.error('Error in WebMCP tool listener:', err);
      }
    });
  }

  private notifyExecution(toolName: string, input: any, result: any) {
    const event = { toolName, input, result, timestamp: Date.now() };
    this.executionListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in WebMCP execution listener:', err);
      }
    });
  }
}

export const webmcpRegistry = new WebMCPRegistry();
