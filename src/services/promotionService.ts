import api from './api';

const API_URL = 'http://localhost:8000';

export interface PromotionItemDetail {
  id: number;
  quantity: number;
}

export interface Promotion {
  id_key?: number;
  name: string;
  description: string;
  discount_percentage: number;
  active: boolean;
  is_available: boolean;
  manufactured_item_details: PromotionItemDetail[];
  inventory_item_details: PromotionItemDetail[];
}

export interface PromotionResponse {
  total: number;
  offset: number;
  limit: number;
  items: Promotion[];
}

const promotionService = {
  getAll: async (offset: number = 0, limit: number = 10): Promise<{ data: Promotion[], total: number, hasNext: boolean }> => {
    try {
      const response = await api.get<PromotionResponse>(`${API_URL}/promotion/products/all?offset=${offset}&limit=${limit}`);
      return {
        data: response.data.items,
        total: response.data.total,
        hasNext: (response.data.offset + response.data.limit) < response.data.total
      };
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  },

  create: async (promotion: Omit<Promotion, 'id_key'>): Promise<Promotion> => {
    try {
      const response = await api.post<Promotion>(`${API_URL}/promotion/`, promotion);
      return response.data;
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  },

  update: async (id: number, promotion: Omit<Promotion, 'id_key'>): Promise<Promotion> => {
    try {
      const response = await api.put<Promotion>(`${API_URL}/promotion/${id}`, promotion);
      return response.data;
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_URL}/promotion/${id}`);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  }
};

export default promotionService; 