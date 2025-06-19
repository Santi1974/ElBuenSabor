import api from './api';

const API_URL = 'http://localhost:8000';

interface Client {
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
  password: string;
  google_sub?: string;
  active: boolean;
}

const clientService = {
  getAll: async (offset: number = 0, limit: number = 10) => {
    try {
      const response = await api.get(`${API_URL}/user/clients/all?offset=${offset}&limit=${limit}`);
      
      // Handle both old and new response formats
      if (response.data && response.data.items !== undefined) {
        // New format with pagination
        return {
          data: response.data.items,
          total: response.data.total,
          hasNext: (response.data.offset + response.data.limit) < response.data.total
        };
      } else {
        // Old format - direct array
        console.warn('API returned old format, converting to new format');
        return {
          data: response.data,
          total: response.data.length,
          hasNext: false
        };
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  create: async (client: Client) => {
    const response = await api.post(`${API_URL}/user/`, {
      full_name: client.full_name,
      email: client.email,
      role: client.role,
      phone_number: client.phone_number,
      password: client.password,
      google_sub: client.google_sub || '',
      active: client.active
    });
    return response.data;
  },

  update: async (id: number, client: Client) => {
    const response = await api.put(`${API_URL}/user/${id}`, {
      full_name: client.full_name,
      email: client.email,
      role: client.role,
      phone_number: client.phone_number,
      password: client.password,
      google_sub: client.google_sub || '',
      active: client.active
    });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`${API_URL}/user/${id}`);
    return response.data;
  },

  search: async (searchTerm: string, offset: number = 0, limit: number = 10) => {
    try {
      const response = await api.get(`${API_URL}/user/clients/search?search_term=${encodeURIComponent(searchTerm)}&offset=${offset}&limit=${limit}`);
      
      // Handle both old and new response formats
      if (response.data && response.data.items !== undefined) {
        // New format with pagination
        return {
          data: response.data.items,
          total: response.data.total,
          hasNext: (response.data.offset + response.data.limit) < response.data.total
        };
      } else {
        // Old format - direct array
        console.warn('API returned old format, converting to new format');
        return {
          data: response.data,
          total: response.data.length,
          hasNext: false
        };
      }
    } catch (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
  }
};

export default clientService; 