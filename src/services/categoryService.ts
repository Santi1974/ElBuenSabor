import api from './api';
import type { Category } from '../types/category';
import type { PaginatedResponse, ApiPaginatedResponse } from '../types/common';

const API_URL = 'http://localhost:8000';

const categoryService = {
  getAll: async (offset: number = 0, limit: number = 10): Promise<PaginatedResponse<Category>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Category> | Category[]>(`${API_URL}/manufactured_item_category/?offset=${offset}&limit=${limit}`);
      
      // Handle both old and new response formats
      if ('items' in response.data) {
        // New format with pagination
        return {
          data: response.data.items,
          total: response.data.total,
          hasNext: (response.data.offset + response.data.limit) < response.data.total
        };
      } else {
        // Old format - direct array
        console.warn('API returned old format, converting to new format');
        const items = response.data;
        return {
          data: items,
          total: items.length,
          hasNext: false
        };
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getTopLevelAll: async (type: 'manufactured' | 'inventory' = 'manufactured'): Promise<Category[]> => {
    try {
      const endpoint = type === 'inventory' 
        ? `${API_URL}/inventory_item_category/top-level/all`
        : `${API_URL}/manufactured_item_category/top-level/all`;
      const response = await api.get<Category[]>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching top-level categories:', error);
      throw error;
    }
  },

  // Métodos específicos para inventory item categories
  getInventoryCategories: async (offset: number = 0, limit: number = 10): Promise<PaginatedResponse<Category>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<Category> | Category[]>(`${API_URL}/inventory_item_category/?offset=${offset}&limit=${limit}`);
      
      // Handle both old and new response formats
      if ('items' in response.data) {
        // New format with pagination
        return {
          data: response.data.items,
          total: response.data.total,
          hasNext: (response.data.offset + response.data.limit) < response.data.total
        };
      } else {
        // Old format - direct array
        console.warn('API returned old format, converting to new format');
        const items = response.data;
        return {
          data: items,
          total: items.length,
          hasNext: false
        };
      }
    } catch (error) {
      console.error('Error fetching inventory categories:', error);
      throw error;
    }
  },

  getTopLevelInventoryCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get<Category[]>(`${API_URL}/inventory_item_category/top-level/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top-level inventory categories:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Category> => {
    try {
      const response = await api.get<Category>(`${API_URL}/manufactured_item_category/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },

  create: async (categoryData: Omit<Category, 'id_key' | 'subcategories'>): Promise<Category> => {
    try {
      const response = await api.post<Category>(`${API_URL}/manufactured_item_category/`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  update: async (id: number, categoryData: Omit<Category, 'id_key' | 'subcategories'>): Promise<Category> => {
    try {
      if (categoryData.parent_id === undefined) {
        categoryData.parent_id = null;
      }
      const response = await api.put<Category>(`${API_URL}/manufactured_item_category/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_URL}/manufactured_item_category/${id}`);
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  },

  // CRUD methods for inventory item categories
  createInventoryCategory: async (categoryData: Omit<Category, 'id_key' | 'subcategories'>): Promise<Category> => {
    try {
      const response = await api.post<Category>(`${API_URL}/inventory_item_category/`, categoryData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating inventory category:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  updateInventoryCategory: async (id: number, categoryData: Omit<Category, 'id_key' | 'subcategories'>): Promise<Category> => {
    try {
      if (categoryData.parent_id === undefined) {
        categoryData.parent_id = null;
      }
      const response = await api.put<Category>(`${API_URL}/inventory_item_category/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating inventory category ${id}:`, error);
      throw error;
    }
  },

  deleteInventoryCategory: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_URL}/inventory_item_category/${id}`);
    } catch (error) {
      console.error(`Error deleting inventory category ${id}:`, error);
      throw error;
    }
  },

  getPublicSubcategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get<{
        manufactured_item_categories: Category[];
        inventory_item_categories: Category[];
      }>(`${API_URL}/manufactured_item_category/public-subcategories/all`);
      
      // Handle the specific response format
      if (response.data && typeof response.data === 'object') {
        const { manufactured_item_categories = [], inventory_item_categories = [] } = response.data;
        
        manufactured_item_categories.forEach(category => {
          if (category.parent) {
            console.log(`${category.name}: ${category.parent.name}`);
          }
        });
        
        inventory_item_categories.forEach(category => {
          if (category.parent) {
            console.log(`${category.name}: ${category.parent.name}`);
          }
        });
        
        const allCategories = [...manufactured_item_categories, ...inventory_item_categories];
        
        return allCategories;
      } else {
        console.warn('Unexpected response format from public subcategories endpoint:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching public subcategories:', error);
      throw error;
    }
  }
};

export default categoryService; 