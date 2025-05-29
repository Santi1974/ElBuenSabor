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
      // Try the endpoint with pagination parameters first
      const response = await api.get(`${API_URL}/manufactured_item/?offset=${offset}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error with paginated endpoint, trying without pagination:', error);
      try {
        // Fallback: try without pagination parameters
        const response = await api.get(`${API_URL}/manufactured_item/`);
        // Manually paginate the results if needed
        const data = response.data;
        const start = offset;
        const end = offset + limit;
        return data.slice(start, end);
      } catch (fallbackError) {
        console.error('Error with fallback endpoint:', fallbackError);
        throw fallbackError;
      }
    }
  },

  // Get inventory items that are products (sellable items like Coca Cola)
  getInventoryProducts: async (offset: number = 0, limit: number = 10) => {
    const response = await api.get(`${API_URL}/inventory_item/products/all?offset=${offset}&limit=${limit}`);
    return response.data;
  },

  // Get both manufactured items and inventory products combined
  getAllProducts: async (offset: number = 0, limit: number = 10) => {
    try {
      // Calculate how many items to get from each endpoint
      const halfLimit = Math.ceil(limit / 2);
      
      // Try to get data from both endpoints, but handle errors gracefully
      const results = await Promise.allSettled([
        inventoryService.getAll(Math.floor(offset / 2), halfLimit),
        api.get(`${API_URL}/inventory_item/products/all?offset=${Math.floor(offset / 2)}&limit=${halfLimit}`)
      ]);

      let combinedItems: any[] = [];

      // Handle manufactured items result
      if (results[0].status === 'fulfilled') {
        const manufacturedItems = results[0].value.map((item: any) => ({ 
          ...item, 
          product_type: 'manufactured', 
          type_label: 'Manufacturado' 
        }));
        combinedItems.push(...manufacturedItems);
      } else {
        console.error('Error fetching manufactured items:', results[0].reason);
      }

      // Handle inventory products result  
      if (results[1].status === 'fulfilled') {
        const inventoryProducts = results[1].value.data.map((item: any) => ({ 
          ...item, 
          product_type: 'inventory', 
          type_label: 'Producto' 
        }));
        combinedItems.push(...inventoryProducts);
      } else {
        console.error('Error fetching inventory products:', results[1].reason);
      }

      return combinedItems;
    } catch (error) {
      console.error('Error fetching combined products:', error);
      throw error;
    }
  },

  getIngredients: async () => {
    const response = await api.get(`${API_URL}/inventory_item/ingredients/all`);
    return response.data;
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