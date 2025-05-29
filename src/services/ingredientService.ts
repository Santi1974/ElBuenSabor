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
    const response = await api.get(`${API_URL}/inventory_item/ingredients/all?offset=${offset}&limit=${limit}`);
    return response.data;
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