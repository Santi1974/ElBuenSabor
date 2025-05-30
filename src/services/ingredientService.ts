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
      // First get all items to calculate total
      const allResponse = await api.get(`${API_URL}/inventory_item/ingredients/all?offset=0&limit=1000`);
      const allItems = allResponse.data;
      
      // Apply pagination
      const start = offset;
      const end = offset + limit;
      const paginatedItems = allItems.slice(start, end);
      
      console.log(`Ingredients Pagination: offset=${offset}, limit=${limit}, total=${allItems.length}, returned=${paginatedItems.length}`);
      
      // Return both the paginated items and total count
      return {
        data: paginatedItems,
        total: allItems.length,
        hasNext: end < allItems.length
      };
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      // Fallback to original method
      const response = await api.get(`${API_URL}/inventory_item/ingredients/all?offset=${offset}&limit=${limit}`);
      return {
        data: response.data,
        total: response.data.length, // We don't know the real total
        hasNext: response.data.length === limit
      };
    }
  },

  getById: async (id: number) => {
    const response = await api.get(`${API_URL}/inventory_item/${id}`);
    return response.data;
  },

  create: async (ingredient: Omit<Ingredient, 'id_key'>) => {
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

  getMeasurementUnits: async () => {
    const response = await api.get(`${API_URL}/measurement_unit/`);
    return response.data;
  }
};

export default ingredientService; 