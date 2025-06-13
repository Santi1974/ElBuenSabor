import api from './api';

const API_URL = 'http://localhost:8000';

interface OrderDetail {
  id_key: number;
  quantity: number;
  subtotal: number;
  manufactured_item: {
    id_key: number;
    name: string;
    price: number;
  };
}

interface InventoryDetail {
  id_key: number;
  quantity: number;
  subtotal: number;
  unit_price: number;
  inventory_item: {
    id_key: number;
    name: string;
    price: number;
  };
}

interface Address {
  street: string;
  street_number: number;
  zip_code: string;
  name: string;
  locality: {
    name: string;
    province_id: number;
    id_key: number;
  };
  id_key: number;
  user_id: number;
}

interface User {
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
  password: string;
  google_sub: string;
  active: boolean;
  id_key: number;
  addresses: Address[];
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

const cashierService = {
  getAllOrders: async (offset: number = 0, limit: number = 10) => {
    try {
      const response = await api.get(`${API_URL}/order/?offset=${offset}&limit=${limit}`);
      
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
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  getOrdersByStatus: async (status: string, offset: number = 0, limit: number = 10) => {
    try {
      const response = await api.get(`${API_URL}/order/status/${status}?offset=${offset}&limit=${limit}`);
      
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
      console.error('Error fetching orders by status:', error);
      throw error;
    }
  },

  moveToKitchen: async (orderId: number) => {
    try {
      const response = await api.put(`${API_URL}/order/${orderId}/status?status=en_cocina`);
      return response.data;
    } catch (error) {
      console.error('Error moving order to kitchen:', error);
      throw error;
    }
  },

  moveToReady: async (orderId: number) => {
    try {
      const response = await api.put(`${API_URL}/order/${orderId}/status?status=listo`);
      return response.data;
    } catch (error) {
      console.error('Error moving order to ready:', error);
      throw error;
    }
  },

  markAsPaid: async (orderId: number) => {
    try {
      const response = await api.put(`${API_URL}/order/${orderId}/cash-payment`);
      return response.data;
    } catch (error) {
      console.error('Error marking order as paid:', error);
      throw error;
    }
  }
};

export { cashierService, type Order, type OrderDetail, type InventoryDetail, type Address, type User };
export default cashierService; 