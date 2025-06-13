import api from './api';
import type { ManufacturedItem, InventoryItem, ProductResponse } from '../types/product';
import type { PaginatedResponse, ApiPaginatedResponse } from '../types/common';

const API_URL = 'http://localhost:8000';

const inventoryService = {
  getAll: async (offset: number = 0, limit: number = 10): Promise<PaginatedResponse<ManufacturedItem>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<ManufacturedItem> | ManufacturedItem[]>(
        `${API_URL}/manufactured_item/products/all?offset=${offset}&limit=${limit}`
      );
      
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
      console.error('Error fetching manufactured items:', error);
      throw error;
    }
  },

  // Get inventory items that are products (sellable items like Coca Cola)
  getInventoryProducts: async (offset: number = 0, limit: number = 10): Promise<PaginatedResponse<InventoryItem>> => {
    try {
      const response = await api.get<ApiPaginatedResponse<InventoryItem>>(
        `${API_URL}/inventory_item/products/all?offset=${offset}&limit=${limit}`
      );
      return {
        data: response.data.items,
        total: response.data.total,
        hasNext: (response.data.offset + response.data.limit) < response.data.total
      };
    } catch (error) {
      console.error('Error fetching inventory products:', error);
      throw error;
    }
  },

  // Get both manufactured items and inventory products combined
  getAllProducts: async (offset: number = 0, limit: number = 10): Promise<ProductResponse> => {
    try {
      // Fetch both types of products in parallel
      const [manufacturedResponse, inventoryResponse] = await Promise.all([
        api.get<ApiPaginatedResponse<ManufacturedItem>>(`${API_URL}/manufactured_item/products/all?offset=${offset}&limit=${limit}`)
          .catch(() => ({ data: { items: [], total: 0 } })),
        api.get<ApiPaginatedResponse<InventoryItem>>(`${API_URL}/inventory_item/products/all?offset=${offset}&limit=${limit}`)
          .catch(() => ({ data: { items: [], total: 0 } }))
      ]);
      
      let allProducts: (ManufacturedItem | InventoryItem)[] = [];
      let totalCount = 0;
      
      // Process manufactured items
      if (manufacturedResponse.data) {
        let manufacturedItems: ManufacturedItem[] = [];
        if ('items' in manufacturedResponse.data) {
          // New format with pagination
          manufacturedItems = manufacturedResponse.data.items.map(item => ({ 
            ...item, 
            type: 'manufactured' as const
          }));
          totalCount += manufacturedResponse.data.total;
        } else if (Array.isArray(manufacturedResponse.data)) {
          // Old format - direct array (backward compatibility)
          manufacturedItems = (manufacturedResponse.data as ManufacturedItem[]).map(item => ({ 
            ...item, 
            type: 'manufactured' as const
          }));
          totalCount += manufacturedItems.length;
        }
        allProducts = [...allProducts, ...manufacturedItems];
      }
      
      // Process inventory products
      if (inventoryResponse.data && 'items' in inventoryResponse.data) {
        const inventoryItems = inventoryResponse.data.items.map(item => ({ 
          ...item, 
          type: 'inventory' as const
        }));
        allProducts = [...allProducts, ...inventoryItems];
        totalCount += inventoryResponse.data.total;
      }
      
      return {
        data: allProducts,
        total: totalCount,
        hasNext: allProducts.length >= limit
      };
      
    } catch (error) {
      console.error('Error fetching combined products:', error);
      return {
        data: [],
        total: 0,
        hasNext: false
      };
    }
  },

  getIngredients: async (): Promise<InventoryItem[]> => {
    try {
      const response = await api.get<ApiPaginatedResponse<InventoryItem> | InventoryItem[]>(
        `${API_URL}/inventory_item/ingredients/all`
      );
      
      // Handle both old and new response formats
      if ('items' in response.data) {
        // New format with pagination
        return response.data.items;
      } else {
        // Old format - direct array
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      return []; // Return empty array instead of throwing
    }
  },

  create: async (item: Omit<ManufacturedItem, 'id_key'>): Promise<ManufacturedItem> => {
    const response = await api.post<ManufacturedItem>(`${API_URL}/manufactured_item/`, item);
    return response.data;
  },

  update: async (id: number, item: Omit<ManufacturedItem, 'id_key'>): Promise<ManufacturedItem> => {
    const response = await api.put<ManufacturedItem>(`${API_URL}/manufactured_item/${id}`, item);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/manufactured_item/${id}`);
  },

  // CRUD methods for inventory products
  createInventoryProduct: async (productData: Omit<InventoryItem, 'id_key'>): Promise<InventoryItem> => {
    const response = await api.post<InventoryItem>(`${API_URL}/inventory_item/`, productData);
    return response.data;
  },

  updateInventoryProduct: async (id: number, productData: Omit<InventoryItem, 'id_key'>): Promise<InventoryItem> => {
    const response = await api.put<InventoryItem>(`${API_URL}/inventory_item/${id}`, productData);
    return response.data;
  },

  deleteInventoryProduct: async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/inventory_item/${id}`);
  }
};

export default inventoryService; 