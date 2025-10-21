// Admin API utility functions
export class AdminAPI {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`/api/admin${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Users API
  static async getUsers(params: {
    search?: string;
    plan?: string;
    status?: string;
    admin?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/users?${searchParams}`);
  }

  static async updateUser(userId: string, data: any) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Settings API
  static async getSettings() {
    return this.request('/settings');
  }

  static async updateSetting(settingId: string, data: any) {
    return this.request(`/settings/${settingId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async createSetting(data: any) {
    return this.request('/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Feature Flags API
  static async getFeatureFlags() {
    return this.request('/feature-flags');
  }

  static async updateFeatureFlag(flagId: string, data: any) {
    return this.request(`/feature-flags/${flagId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async createFeatureFlag(data: any) {
    return this.request('/feature-flags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics API
  static async getAnalytics(timeRange: string = '30d') {
    return this.request(`/analytics?timeRange=${timeRange}`);
  }

  // Revenue API
  static async getRevenue(timeRange: string = '30d') {
    return this.request(`/revenue?timeRange=${timeRange}`);
  }

  // Support Tickets API
  static async getSupportTickets(params: {
    search?: string;
    status?: string;
    priority?: string;
    assigned?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/support-tickets?${searchParams}`);
  }

  static async updateSupportTicket(ticketId: string, data: any) {
    return this.request(`/support-tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // API Keys API
  static async getApiKeys(params: {
    user_id?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/api-keys?${searchParams}`);
  }

  static async createApiKey(data: any) {
    return this.request('/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateApiKey(keyId: string, data: any) {
    return this.request(`/api-keys/${keyId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async deleteApiKey(keyId: string) {
    return this.request(`/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  // Ad Banners API
  static async getAdBanners() {
    return this.request('/ad-banners');
  }

  static async createAdBanner(data: any) {
    return this.request('/ad-banners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Code Injections API
  static async getCodeInjections() {
    return this.request('/code-injections');
  }

  static async createCodeInjection(data: any) {
    return this.request('/code-injections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
