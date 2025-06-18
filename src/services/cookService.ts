import api from './api';

const API_URL = 'http://localhost:8000';

interface User {
  full_name: string;
  email: string;
  phone_number: string;
  id_key: number;
}

interface Address {
  locality: any;
  street_number: ReactNode;
  street: string;
  number: string;
  city: string;
  state: string;
  zip_code: string;
  id_key: number;
}

interface Category {
  name: string;
  description: string;
  active: boolean;
  parent_id: number;
  id_key: number;
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
  id_key: number;
}

interface InventoryItem {
  name: string;
  current_stock: number;
  minimum_stock: number;
  price: number;
  purchase_cost: number;
  image_url: string;
  active: boolean;
  id_key: number;
}

interface OrderDetail {
  quantity: number;
  subtotal: number;
  manufactured_item: ManufacturedItem;
  id_key: number;
}

interface InventoryDetail {
  quantity: number;
  subtotal: number;
  unit_price: number;
  inventory_item: InventoryItem;
  id_key: number;
}

interface Order {
  date: string;
  total: number;
  discount: number;
  final_total: number;
  status: string;
  estimated_time: number;
  delivery_method: string;
  payment_method: string;
  payment_id: string;
  is_paid: boolean;
  notes: string;
  user: User;
  address: Address | null;
  details: OrderDetail[];
  inventory_details: InventoryDetail[];
  id_key: number;
}

const cookService = {
  // Get orders with status "en_cocina"
  getKitchenOrders: async (offset: number = 0, limit: number = 10) => {
    try {
      const response = await api.get(`${API_URL}/order/status/en_cocina?offset=${offset}&limit=${limit}`);
      
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
      console.error('Error fetching kitchen orders:', error);
      throw error;
    }
  },

  // Move order to "listo" status
  moveToReady: async (orderId: number) => {
    try {
      const response = await api.put(`${API_URL}/order/${orderId}/status?status=listo`);
      return response.data;
    } catch (error) {
      console.error('Error moving order to ready:', error);
      throw error;
    }
  },

  // Add delay to order using the add-delay endpoint
  addDelay: async (orderId: number, additionalMinutes: number) => {
    try {
      const response = await api.put(`${API_URL}/order/${orderId}/add-delay?delay_minutes=${additionalMinutes}`);
      return response.data;
    } catch (error) {
      console.error('Error adding delay to order:', error);
      throw error;
    }
  }
};

export default cookService;
export type { Order, OrderDetail, InventoryDetail, ManufacturedItem, InventoryItem, Address, User }; 