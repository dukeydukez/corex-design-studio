import {
  User,
  AuthResponse,
  RefreshTokenResponse,
  Project,
  Design,
  DesignWithRelations,
  Export,
  ExportFormat,
  BrandKit,
  Template,
  ApiResponse,
  ApiListResponse,
  ApiError,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const TIMEOUT = 30000; // 30 seconds

// Utility function to handle API errors
const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Response) {
    return {
      success: false,
      message: `API Error: ${error.statusText}`,
      code: `HTTP_${error.status}`,
    };
  }
  if (error instanceof Error) {
    return {
      success: false,
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }
  return {
    success: false,
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
  };
};

// API Client class
export class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokens();
  }

  // Token management
  private loadTokens(): void {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  private saveTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  // HTTP request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized - refresh token
      if (response.status === 401 && this.refreshToken) {
        await this.refreshAccessToken();
        return this.request<T>(endpoint, options);
      }

      if (!response.ok) {
        const error = (await response.json()) as ApiError;
        throw new Error(error.message || response.statusText);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw handleApiError(error);
    }
  }

  // Authentication endpoints
  async register(email: string, password: string, firstName: string, lastName: string) {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    if (response.data) {
      this.saveTokens(response.data.accessToken, response.data.refreshToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      this.saveTokens(response.data.accessToken, response.data.refreshToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken() {
    const response = await this.request<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (response.data) {
      this.saveTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request<ApiResponse<User>>('/auth/me', { method: 'GET' });
  }

  // Project endpoints
  async getProjects(orgId: string, limit = 20, offset = 0) {
    return this.request<ApiListResponse<Project>>(
      `/orgs/${orgId}/projects?limit=${limit}&offset=${offset}`,
      { method: 'GET' }
    );
  }

  async createProject(orgId: string, name: string, description?: string) {
    return this.request<ApiResponse<Project>>(`/orgs/${orgId}/projects`, {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async getProject(projectId: string) {
    return this.request<ApiResponse<Project>>(`/projects/${projectId}`, {
      method: 'GET',
    });
  }

  async updateProject(projectId: string, updates: Partial<Project>) {
    return this.request<ApiResponse<Project>>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string) {
    return this.request<ApiResponse<{ id: string }>>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Design endpoints
  async getDesigns(projectId: string, limit = 20, offset = 0) {
    return this.request<ApiListResponse<Design>>(
      `/projects/${projectId}/designs?limit=${limit}&offset=${offset}`,
      { method: 'GET' }
    );
  }

  async createDesign(
    projectId: string,
    name: string,
    format: string
  ) {
    return this.request<ApiResponse<Design>>(`/projects/${projectId}/designs`, {
      method: 'POST',
      body: JSON.stringify({ name, format }),
    });
  }

  async getDesign(designId: string) {
    return this.request<ApiResponse<DesignWithRelations>>(`/designs/${designId}`, {
      method: 'GET',
    });
  }

  async updateDesign(designId: string, updates: Partial<Design>) {
    return this.request<ApiResponse<Design>>(`/designs/${designId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updateDesignCanvas(designId: string, canvasConfig: any) {
    return this.request<ApiResponse<Design>>(`/designs/${designId}/canvas`, {
      method: 'PUT',
      body: JSON.stringify({ canvasConfig }),
    });
  }

  async duplicateDesign(designId: string, newName: string) {
    return this.request<ApiResponse<Design>>(`/designs/${designId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ newName }),
    });
  }

  async deleteDesign(designId: string) {
    return this.request<ApiResponse<{ id: string }>>(`/designs/${designId}`, {
      method: 'DELETE',
    });
  }

  // Export endpoints
  async requestExport(designId: string, format: ExportFormat, quality: 'low' | 'medium' | 'high' = 'high') {
    return this.request<ApiResponse<Export>>(`/designs/${designId}/exports`, {
      method: 'POST',
      body: JSON.stringify({ format, quality }),
    });
  }

  async getExport(exportId: string) {
    return this.request<ApiResponse<Export>>(`/exports/${exportId}`, {
      method: 'GET',
    });
  }

  async getDesignExports(designId: string) {
    return this.request<ApiListResponse<Export>>(`/designs/${designId}/exports`, {
      method: 'GET',
    });
  }

  async getExportDownload(token: string) {
    return this.request<ApiResponse<{ downloadUrl: string }>>(`/exports/download/${token}`, {
      method: 'GET',
    });
  }

  async getSupportedExportFormats() {
    return this.request<ApiResponse<Array<{ format: ExportFormat; mimeType: string }>>>('/exports/formats/supported', {
      method: 'GET',
    });
  }

  // Agent endpoints
  async getAvailableAgents() {
    return this.request<ApiListResponse<{
      id: string;
      name: string;
      description: string;
      category: 'strategy' | 'generation' | 'adaptation' | 'optimization' | 'analysis';
    }>>('/agents', {
      method: 'GET',
    });
  }

  async getAgent(agentId: string) {
    return this.request<ApiResponse<{
      id: string;
      name: string;
      description: string;
      category: string;
    }>>(`/agents/${agentId}`, {
      method: 'GET',
    });
  }

  async executeAgent(designId: string, agentId: string, prompt?: string) {
    return this.request<ApiResponse<{
      executionId: string;
      agentId: string;
      designId: string;
      result: any;
    }>>(`/designs/${designId}/agents/${agentId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async getAgentExecutionHistory(designId: string) {
    return this.request<ApiListResponse<{
      id: string;
      designId: string;
      agentType: string;
      status: string;
      result: any;
      createdAt: string;
    }>>(`/designs/${designId}/agent-executions`, {
      method: 'GET',
    });
  }

  async batchExecuteAgents(designId: string, agentIds: string[]) {
    return this.request<ApiResponse<{
      designId: string;
      executions: Record<string, { success: boolean; result?: any; error?: string }>;
      total: number;
      successful: number;
    }>>(`/designs/${designId}/agents/batch-execute`, {
      method: 'POST',
      body: JSON.stringify({ agentIds }),
    });
  }

  // Helper: Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Helper: Get stored user
  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
