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
      console.log(`Requesting manufactured items: offset=${offset}, limit=${limit}`);
      const response = await api.get(`${API_URL}/manufactured_item/?offset=${offset}&limit=${limit}`);
      
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
      console.log(`Requesting inventory products: offset=${offset}, limit=${limit}`);
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

  // Get both manufactured items and inventory products combined with server-side pagination
  getAllProducts: async (offset: number = 0, limit: number = 10) => {
    try {
      console.log(`=== getAllProducts called with offset=${offset}, limit=${limit} ===`);
      
      // For now, let's just get manufactured items to avoid complexity
      // We can improve this later when the backend supports combined pagination
      try {
        const manufacturedResponse = await api.get(`${API_URL}/manufactured_item/?offset=${offset}&limit=${limit}`);
        
        let manufacturedItems: any[] = [];
        let total = 0;
        let hasNext = false;
        
        // Handle both old and new response formats
        if (manufacturedResponse.data && manufacturedResponse.data.items !== undefined) {
          // New format with pagination
          manufacturedItems = manufacturedResponse.data.items.map((item: any) => ({ 
            ...item, 
            product_type: 'manufactured', 
            type_label: 'Manufacturado' 
          }));
          total = manufacturedResponse.data.total;
          hasNext = (manufacturedResponse.data.offset + manufacturedResponse.data.limit) < manufacturedResponse.data.total;
        } else {
          // Old format - direct array
          console.warn('API returned old format, converting to new format');
          manufacturedItems = manufacturedResponse.data.map((item: any) => ({ 
            ...item, 
            product_type: 'manufactured', 
            type_label: 'Manufacturado' 
          }));
          total = manufacturedItems.length;
          hasNext = false;
        }
        
        console.log(`✓ Fetched ${manufacturedItems.length} manufactured items`);
        
        return {
          data: manufacturedItems,
          total: total,
          hasNext: hasNext
        };
      } catch (error) {
        console.error('Error fetching manufactured items:', error);
        // Return empty result if there's an error
        return {
          data: [],
          total: 0,
          hasNext: false
        };
      }
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