import api from './api';

const API_URL = 'http://localhost:8000';

interface MeasurementUnit {
  name: string;
  active: boolean;
  id_key: number;
}

interface Category {
  name: string;
  description: string;
  active: boolean;
  parent_id: number;
  id_key: number;
  subcategories: Category[];
}

interface Ingredient {
  name: string;
  current_stock: number;
  minimum_stock: number;
  price: number;
  purchase_cost: number;
  image_url: string;
  active: boolean;
  is_ingredient: boolean;
  measurement_unit: MeasurementUnit;
  category: Category;
  id_key: number;
}

const ingredientService = {
  getAll: async (offset: number = 0, limit: number = 10) => {
    try {
      const response = await api.get(`${API_URL}/inventory_item/ingredients/all?offset=${offset}&limit=${limit}`);
      
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
      console.error('Error fetching ingredients:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    const response = await api.get(`${API_URL}/inventory_item/${id}`);
    return response.data;
  },

  create: async (ingredient: Omit<Ingredient, 'id_key'>) => {
    ingredient.current_stock = 0;
    const response = await api.post(`${API_URL}/inventory_item/`, ingredient);
    return response.data;
  },

  update: async (id: number, ingredient: Omit<Ingredient, 'id_key'>) => {
    const response = await api.put(`${API_URL}/inventory_item/${id}`, ingredient);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`${API_URL}/inventory_item/${id}`);
    return response.data;
  },

  search: async (searchTerm: string, offset: number = 0, limit: number = 10) => {
    try {
      const response = await api.get(`${API_URL}/inventory_item/ingredients/search?search_term=${encodeURIComponent(searchTerm)}&offset=${offset}&limit=${limit}`);
      
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
      console.error('Error searching ingredients:', error);
      throw error;
    }
  },

  getMeasurementUnits: async () => {
    try {
      const response = await api.get(`${API_URL}/measurement_unit/`);
      
      // Handle both old and new response formats
      if (response.data && response.data.items !== undefined) {
        // New format with pagination
        return response.data;
      } else {
        // Old format - direct array
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching measurement units:', error);
      throw error;
    }
  }
};

export default ingredientService; 