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

interface ManufacturedItem {
  name: string;
  description: string;
  preparation_time: number;
  price: number;
  image_url: string;
  recipe: string;
  active: boolean;
  category: Category;
  details: any[];
  category_id: number;
  id_key: number;
}

const inventoryService = {
  getAll: async (offset: number = 0, limit: number = 10) => {
    try {
      const response = await api.get(`${API_URL}/manufactured_item/products/all?offset=${offset}&limit=${limit}`);
      
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
      console.error('Error fetching manufactured items:', error);
      throw error;
    }
  },

  // Get inventory items that are products (sellable items like Coca Cola)
  getInventoryProducts: async (offset: number = 0, limit: number = 10) => {
    try {
      const response = await api.get(`${API_URL}/inventory_item/products/all?offset=${offset}&limit=${limit}`);
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
  getAllProducts: async (offset: number = 0, limit: number = 10) => {
    try {
      // Fetch both types of products in parallel
      const [manufacturedResponse, inventoryResponse] = await Promise.all([
        api.get(`${API_URL}/manufactured_item/products/all?offset=${offset}&limit=${limit}`).catch(() => ({ data: { items: [], total: 0 } })),
        api.get(`${API_URL}/inventory_item/products/all?offset=${offset}&limit=${limit}`).catch(() => ({ data: { items: [], total: 0 } }))
      ]);
      
      let allProducts: any[] = [];
      let totalCount = 0;
      
      // Process manufactured items
      if (manufacturedResponse.data) {
        let manufacturedItems: any[] = [];
        if (manufacturedResponse.data.items !== undefined) {
          // New format with pagination
          manufacturedItems = manufacturedResponse.data.items.map((item: any) => ({ 
            ...item, 
            type: 'manufactured'
          }));
        } else if (Array.isArray(manufacturedResponse.data)) {
          // Old format - direct array (backward compatibility)
          manufacturedItems = manufacturedResponse.data.map((item: any) => ({ 
            ...item, 
            type: 'manufactured'
          }));
        }
        allProducts = [...allProducts, ...manufacturedItems];
        totalCount += manufacturedResponse.data.total || manufacturedItems.length;
      }
      
      // Process inventory products
      if (inventoryResponse.data && inventoryResponse.data.items) {
        const inventoryItems: any[] = inventoryResponse.data.items.map((item: any) => ({ 
          ...item, 
          type: 'inventory'
        }));
        allProducts = [...allProducts, ...inventoryItems];
        totalCount += inventoryResponse.data.total || inventoryItems.length;
      }
      
      return {
        data: allProducts,
        total: totalCount,
        hasNext: allProducts.length >= limit // Simple check for next page
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

  getIngredients: async () => {
    try {
      const response = await api.get(`${API_URL}/inventory_item/ingredients/all`);
      
      // Handle both old and new response formats
      if (response.data && response.data.items !== undefined) {
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

  create: async (item: ManufacturedItem) => {
    const response = await api.post(`${API_URL}/manufactured_item/`, item);
    return response.data;
  },

  update: async (id: number, item: ManufacturedItem) => {
    const response = await api.put(`${API_URL}/manufactured_item/${id}`, item);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`${API_URL}/manufactured_item/${id}`);
    return response.data;
  },

  // CRUD methods for inventory products
  createInventoryProduct: async (productData: any) => {
    const response = await api.post(`${API_URL}/inventory_item/`, productData);
    return response.data;
  },

  updateInventoryProduct: async (id: number, productData: any) => {
    const response = await api.put(`${API_URL}/inventory_item/${id}`, productData);
    return response.data;
  },

  deleteInventoryProduct: async (id: number) => {
    const response = await api.delete(`${API_URL}/inventory_item/${id}`);
    return response.data;
  }
};

export default inventoryService; 