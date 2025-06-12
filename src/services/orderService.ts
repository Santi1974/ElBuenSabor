import api from './api';
import type { Order, OrderItem, OrderStatus, OrderFilters } from '../types/order';
import type { PaginatedResponse, ApiPaginatedResponse } from '../types/common';

const API_URL = 'http://localhost:8000';

const orderService = {
  getAll: async (offset: number = 0, limit: number = 10, filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('offset', offset.toString());
      queryParams.append('limit', limit.toString());

      if (filters) {
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.userId) queryParams.append('user_id', filters.userId.toString());
        if (filters.startDate) queryParams.append('start_date', filters.startDate);
        if (filters.endDate) queryParams.append('end_date', filters.endDate);
        if (filters.search) queryParams.append('search', filters.search);
      }

      const response = await api.get<ApiPaginatedResponse<Order>>(`${API_URL}/orders?${queryParams.toString()}`);
      return {
        data: response.data.items,
        total: response.data.total,
        hasNext: (response.data.offset + response.data.limit) < response.data.total
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Order> => {
    try {
      const response = await api.get<Order>(`${API_URL}/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  create: async (orderData: Omit<Order, 'id_key' | 'status' | 'created_at' | 'updated_at'>): Promise<Order> => {
    try {
      const response = await api.post<Order>(`${API_URL}/orders`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  update: async (id: number, orderData: Partial<Order>): Promise<Order> => {
    try {
      const response = await api.put<Order>(`${API_URL}/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_URL}/orders/${id}`);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  updateStatus: async (id: number, status: OrderStatus): Promise<Order> => {
    try {
      const response = await api.patch<Order>(`${API_URL}/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  addItem: async (orderId: number, item: Omit<OrderItem, 'id_key'>): Promise<Order> => {
    try {
      const response = await api.post<Order>(`${API_URL}/orders/${orderId}/items`, item);
      return response.data;
    } catch (error) {
      console.error('Error adding order item:', error);
      throw error;
    }
  },

  updateItem: async (orderId: number, itemId: number, item: Partial<OrderItem>): Promise<Order> => {
    try {
      const response = await api.put<Order>(`${API_URL}/orders/${orderId}/items/${itemId}`, item);
      return response.data;
    } catch (error) {
      console.error('Error updating order item:', error);
      throw error;
    }
  },

  removeItem: async (orderId: number, itemId: number): Promise<Order> => {
    try {
      const response = await api.delete<Order>(`${API_URL}/orders/${orderId}/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing order item:', error);
      throw error;
    }
  }
};

export default orderService; 