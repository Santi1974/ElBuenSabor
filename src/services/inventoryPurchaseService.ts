import api from './api';

const API_URL = 'http://localhost:8000';

export interface InventoryPurchase {
  inventory_item_id: number;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  notes: string;
  purchase_date: string;
  id_key?: number;
}

const inventoryPurchaseService = {
  create: async (purchase: Omit<InventoryPurchase, 'id_key'>) => {
    try {
      // Asegurar que la fecha esté en formato ISO
      const formattedPurchase = {
        ...purchase,
        purchase_date: purchase.purchase_date.includes('T') ? 
          purchase.purchase_date : 
          `${purchase.purchase_date}T00:00:00.000Z`
      };
      
      const response = await api.post(`${API_URL}/inventory_purchase/`, formattedPurchase);
      return response.data;
    } catch (error) {
      console.error('Error creating inventory purchase:', error);
      throw error;
    }
  },

  getAll: async (offset: number = 0, limit: number = 10) => {
    try {
      const response = await api.get(`${API_URL}/inventory_purchase/?offset=${offset}&limit=${limit}`);
      
      // Handle both old and new response formats
      if (response.data && response.data.items !== undefined) {
        return {
          data: response.data.items,
          total: response.data.total,
          hasNext: (response.data.offset + response.data.limit) < response.data.total
        };
      } else {
        return {
          data: response.data,
          total: response.data.length,
          hasNext: false
        };
      }
    } catch (error) {
      console.error('Error fetching inventory purchases:', error);
      throw error;
    }
  },

  getById: async (id: number) => {
    try {
      const response = await api.get(`${API_URL}/inventory_purchase/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory purchase:', error);
      throw error;
    }
  },

  update: async (id: number, purchase: Omit<InventoryPurchase, 'id_key'>) => {
    try {
      // Asegurar que la fecha esté en formato ISO
      const formattedPurchase = {
        ...purchase,
        purchase_date: purchase.purchase_date.includes('T') ? 
          purchase.purchase_date : 
          `${purchase.purchase_date}T00:00:00.000Z`
      };
      
      const response = await api.put(`${API_URL}/inventory_purchase/${id}`, formattedPurchase);
      return response.data;
    } catch (error) {
      console.error('Error updating inventory purchase:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      const response = await api.delete(`${API_URL}/inventory_purchase/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting inventory purchase:', error);
      throw error;
    }
  }
};

export default inventoryPurchaseService; 