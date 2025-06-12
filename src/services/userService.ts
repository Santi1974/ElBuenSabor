import api from './api';
import type { User, LoginResponse, RegisterData, LoginData } from '../types/user';
import type { PaginatedResponse, ApiPaginatedResponse } from '../types/common';

const API_URL = 'http://localhost:8000';

const userService = {
  login: async (credentials: LoginData): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  register: async (userData: RegisterData): Promise<User> => {
    try {
      const response = await api.post<User>(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  },

  getAll: async (offset: number = 0, limit: number = 10): Promise<PaginatedResponse<User>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<User>>(`${API_URL}/users?offset=${offset}&limit=${limit}`);
      return {
        data: response.data.items,
        total: response.data.total,
        hasNext: (response.data.offset + response.data.limit) < response.data.total
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<User> => {
    try {
      const response = await api.get<User>(`${API_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  update: async (id: number, userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put<User>(`${API_URL}/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_URL}/users/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  changePassword: async (id: number, oldPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.post(`${API_URL}/users/${id}/change-password`, {
        old_password: oldPassword,
        new_password: newPassword
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    try {
      await api.post(`${API_URL}/auth/reset-password`, { email });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  verifyEmail: async (token: string): Promise<void> => {
    try {
      await api.post(`${API_URL}/auth/verify-email`, { token });
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }
};

export default userService; 