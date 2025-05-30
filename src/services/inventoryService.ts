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
      // Use the endpoint with pagination parameters
      console.log(`Requesting manufactured items: offset=${offset}, limit=${limit}`);
      const response = await api.get(`${API_URL}/manufactured_item/?offset=${offset}&limit=${limit}`);
      console.log(`Received ${response.data.length} manufactured items`);
      return response.data;
    } catch (error) {
      console.error('Error with paginated endpoint, trying without pagination:', error);
      try {
        // Fallback: try without pagination parameters and manually paginate
        const response = await api.get(`${API_URL}/manufactured_item/`);
        console.log(`Fallback: received ${response.data.length} total items, applying manual pagination`);
        // Manually paginate the results if needed
        const data = response.data;
        const start = offset;
        const end = offset + limit;
        const paginatedData = data.slice(start, end);
        console.log(`Manual pagination: returning items ${start} to ${end-1} (${paginatedData.length} items)`);
        return paginatedData;
      } catch (fallbackError) {
        console.error('Error with fallback endpoint:', fallbackError);
        throw fallbackError;
      }
    }
  },

  // Get inventory items that are products (sellable items like Coca Cola)
  getInventoryProducts: async (offset: number = 0, limit: number = 10) => {
    console.log(`Requesting inventory products: offset=${offset}, limit=${limit}`);
    const response = await api.get(`${API_URL}/inventory_item/products/all?offset=${offset}&limit=${limit}`);
    console.log(`Received ${response.data.length} inventory products`);
    return response.data;
  },

  getTotalProductsCount: async () => {
    try {
      let totalCount = 0;
      
      try {
        console.log('Getting total count for manufactured items...');
        const manufacturedResponse = await api.get(`${API_URL}/manufactured_item/?offset=0&limit=1`);
        
        if (manufacturedResponse.headers && manufacturedResponse.headers['x-total-count']) {
          const manufacturedTotal = parseInt(manufacturedResponse.headers['x-total-count']);
          totalCount += manufacturedTotal;
          console.log(`Found ${manufacturedTotal} manufactured items from headers`);
        } else {
          const sampleResponse = await api.get(`${API_URL}/manufactured_item/?offset=0&limit=100`);
          if (sampleResponse.data.length === 100) {
            const largerSampleResponse = await api.get(`${API_URL}/manufactured_item/?offset=0&limit=500`);
            totalCount += largerSampleResponse.data.length;
            console.log(`Estimated ${largerSampleResponse.data.length} manufactured items from sample`);
          } else {
            totalCount += sampleResponse.data.length;
            console.log(`Found ${sampleResponse.data.length} manufactured items (complete set)`);
          }
        }
      } catch (error) {
        console.error('Error counting manufactured items:', error);
      }

      try {
        console.log('Getting total count for inventory products...');
        const inventoryResponse = await api.get(`${API_URL}/inventory_item/products/all?offset=0&limit=1`);
        
        if (inventoryResponse.headers && inventoryResponse.headers['x-total-count']) {
          const inventoryTotal = parseInt(inventoryResponse.headers['x-total-count']);
          totalCount += inventoryTotal;
          console.log(`Found ${inventoryTotal} inventory products from headers`);
        } else {
          const sampleResponse = await api.get(`${API_URL}/inventory_item/products/all?offset=0&limit=100`);
          if (sampleResponse.data.length === 100) {
            // There might be more, get a larger sample
            const largerSampleResponse = await api.get(`${API_URL}/inventory_item/products/all?offset=0&limit=500`);
            totalCount += largerSampleResponse.data.length;
            console.log(`Estimated ${largerSampleResponse.data.length} inventory products from sample`);
          } else {
            totalCount += sampleResponse.data.length;
            console.log(`Found ${sampleResponse.data.length} inventory products (complete set)`);
          }
        }
      } catch (error) {
        console.error('Error counting inventory products:', error);
      }

      console.log(`Total products count: ${totalCount}`);
      return totalCount;
    } catch (error) {
      console.error('Error getting total products count:', error);
      return 0;
    }
  },

  // Get both manufactured items and inventory products combined
  getAllProducts: async (offset: number = 0, limit: number = 10) => {
    try {
      console.log(`=== getAllProducts called with offset=${offset}, limit=${limit} ===`);
      
      const maxFetchPerEndpoint = Math.max(100, limit * 5);
      
      let allItems: any[] = [];
      let manufacturedCount = 0;
      let inventoryCount = 0;
      
      try {
        console.log(`Fetching manufactured items (limit=${maxFetchPerEndpoint})...`);
        const manufacturedResponse = await api.get(`${API_URL}/manufactured_item/?offset=0&limit=${maxFetchPerEndpoint}`);
        const manufacturedItems = manufacturedResponse.data.map((item: any) => ({ 
          ...item, 
          product_type: 'manufactured', 
          type_label: 'Manufacturado' 
        }));
        manufacturedCount = manufacturedItems.length;
        allItems.push(...manufacturedItems);
      } catch (error) {
        console.error('Error fetching manufactured items:', error);
      }

      try {
        console.log(`Fetching inventory products (limit=${maxFetchPerEndpoint})...`);
        const inventoryResponse = await api.get(`${API_URL}/inventory_item/products/all?offset=0&limit=${maxFetchPerEndpoint}`);
        const inventoryProducts = inventoryResponse.data.map((item: any) => ({ 
          ...item, 
          product_type: 'inventory', 
          type_label: 'Producto' 
        }));
        inventoryCount = inventoryProducts.length;
        allItems.push(...inventoryProducts);
      } catch (error) {
        console.error('Error fetching inventory products:', error);
      }

      const totalItemsAvailable = allItems.length;
      console.log(`📊 Total items available: ${totalItemsAvailable} (${manufacturedCount} manufactured + ${inventoryCount} inventory)`);

      const start = offset;
      const end = offset + limit;
      const paginatedItems = allItems.slice(start, end);
      
      console.log(`📄 Pagination applied: requesting items ${start}-${end-1}, got ${paginatedItems.length} items`);
      console.log(`⏭️  Has next page: ${end < totalItemsAvailable}`);
      
      if (totalItemsAvailable === maxFetchPerEndpoint * 2) {
        console.warn(`⚠️  Reached buffer limit (${maxFetchPerEndpoint * 2}). There might be more items available.`);
      }
      
      return {
        data: paginatedItems,
        total: totalItemsAvailable,
        hasNext: end < totalItemsAvailable
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