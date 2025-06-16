import api from './api';
import { handleError } from '../utils/errorHandler';

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

export interface AddStockParams {
  inventory_item_id: number;
  quantity: number;
  unit_cost: number;
  notes: string;
}

const inventoryPurchaseService = {
  create: async (purchase: Omit<InventoryPurchase, 'id_key'>) => {
    try {
      const { inventory_item_id, quantity, unit_cost, notes } = purchase;
      const response = await api.post(
        `${API_URL}/inventory_purchase/add-stock/${inventory_item_id}`,
        {
          quantity,
          unit_cost,
          notes,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating inventory purchase:', error);
      throw new Error(handleError(error, 'create inventory purchase'));
    }
  },

  addStock: async (params: AddStockParams) => {
    try {
      const { inventory_item_id, quantity, unit_cost, notes } = params;
      const response = await api.post(
        `${API_URL}/inventory_purchase/add-stock/${inventory_item_id}`,
        {
          quantity,
          unit_cost,
          notes,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding stock:', error);
      throw new Error(handleError(error, 'add stock'));
    }
  },

  getAll: async (offset: number = 0, limit: number = 10) => {
    try {
      const response = await api.get(`${API_URL}/inventory_purchase/?offset=${offset}&limit=${limit}`);
      
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
      throw new Error(handleError(error, 'fetch inventory purchases'));
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