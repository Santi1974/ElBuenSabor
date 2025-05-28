import api from './api';

const API_URL = 'http://localhost:8000';

interface Category {
  name: string;
  description: string;
  active: boolean;
  parent_id: number;
  id_key: number;
  subcategories: Category[];
}

const categoryService = {
  getAll: async () => {
    try {
      const response = await api.get(`${API_URL}/manufactured_item_category/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getTopLevelAll: async () => {
    try {
      const response = await api.get(`${API_URL}/manufactured_item_category/top-level/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top-level categories:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await api.get(`${API_URL}/manufactured_item_category/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },

  create: async (categoryData: Omit<Category, 'id_key' | 'subcategories'>) => {
    try {
      const response = await api.post(`${API_URL}/manufactured_item_category/`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  update: async (id: number, categoryData: Omit<Category, 'id_key' | 'subcategories'>) => {
    try {
      const response = await api.put(`${API_URL}/manufactured_item_category/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await api.delete(`${API_URL}/manufactured_item_category/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
};

export default categoryService; 