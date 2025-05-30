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

  // Get total count of all products (manufactured + inventory)
  getTotalProductsCount: async () => {
    try {
      let totalCount = 0;
      
      try {
        const manufacturedResponse = await api.get(`${API_URL}/manufactured_item/?offset=0&limit=1`);
        // If there's no total count in response, we'll get all to count
        if (manufacturedResponse.data && Array.isArray(manufacturedResponse.data)) {
          const allManufacturedResponse = await api.get(`${API_URL}/manufactured_item/?offset=0&limit=1000`);
          totalCount += allManufacturedResponse.data.length;
        }
      } catch (error) {
        console.error('Error counting manufactured items:', error);
      }

      try {
        const inventoryResponse = await api.get(`${API_URL}/inventory_item/products/all?offset=0&limit=1`);
        // If there's no total count in response, we'll get all to count
        if (inventoryResponse.data && Array.isArray(inventoryResponse.data)) {
          const allInventoryResponse = await api.get(`${API_URL}/inventory_item/products/all?offset=0&limit=1000`);
          totalCount += allInventoryResponse.data.length;
        }
      } catch (error) {
        console.error('Error counting inventory products:', error);
      }

      return totalCount;
    } catch (error) {
      console.error('Error getting total products count:', error);
      return 0;
    }
  },

  // Get both manufactured items and inventory products combined
  getAllProducts: async (offset: number = 0, limit: number = 10) => {
    try {
      // Try to get manufactured items first
      let allItems: any[] = [];
      
      try {
        const manufacturedResponse = await api.get(`${API_URL}/manufactured_item/?offset=0&limit=1000`);
        const manufacturedItems = manufacturedResponse.data.map((item: any) => ({ 
          ...item, 
          product_type: 'manufactured', 
          type_label: 'Manufacturado' 
        }));
        allItems.push(...manufacturedItems);
      } catch (error) {
        console.error('Error fetching manufactured items:', error);
      }

      // Then get inventory products
      try {
        const inventoryResponse = await api.get(`${API_URL}/inventory_item/products/all?offset=0&limit=1000`);
        const inventoryProducts = inventoryResponse.data.map((item: any) => ({ 
          ...item, 
          product_type: 'inventory', 
          type_label: 'Producto' 
        }));
        allItems.push(...inventoryProducts);
      } catch (error) {
        console.error('Error fetching inventory products:', error);
      }

      // Apply pagination to the combined results
      const start = offset;
      const end = offset + limit;
      const paginatedItems = allItems.slice(start, end);
      
      console.log(`Pagination: offset=${offset}, limit=${limit}, total=${allItems.length}, returned=${paginatedItems.length}`);
      
      // Return both the paginated items and total count
      return {
        data: paginatedItems,
        total: allItems.length,
        hasNext: end < allItems.length
      };
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