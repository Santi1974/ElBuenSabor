import api from './api';
import type { Invoice, InvoiceFilters } from '../types/invoice';
import type { PaginatedResponse, ApiPaginatedResponse } from '../types/common';

// Interfaces for invoice data structure
export interface User {
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
  password: string;
  google_sub: string | null;
  active: boolean;
  image_url: string | null;
  id_key: number;
}

export interface Category {
  name: string;
  description: string;
  active: boolean;
  parent_id: number | null;
  id_key: number;
  subcategories: Category[];
}

export interface ManufacturedItem {
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

export interface OrderDetail {
  quantity: number;
  unit_price: number;
  subtotal: number;
  order_id: number;
  manufactured_item: ManufacturedItem;
  id_key: number;
}

export interface InventoryDetail {
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

export interface Order {
  delivery_method: string;
  payment_method: string;
  notes: string;
  date: string;
  payment_id: string;
  estimated_time: number;
  final_total: number;
  discount: number;
  total: number;
  is_paid: boolean;
  status: string;
  user: User;
  address: any | null;
  details: OrderDetail[];
  inventory_details: InventoryDetail[];
  id_key: number;
}

const API_URL = 'http://localhost:8000';

const invoiceService = {
  getAll: async (offset: number = 0, limit: number = 10, filters?: InvoiceFilters): Promise<PaginatedResponse<Invoice>> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('offset', offset.toString());
      queryParams.append('limit', limit.toString());

      if (filters) {
        if (filters.orderId) queryParams.append('order_id', filters.orderId.toString());
        if (filters.userId) queryParams.append('user_id', filters.userId.toString());
        if (filters.startDate) queryParams.append('start_date', filters.startDate);
        if (filters.endDate) queryParams.append('end_date', filters.endDate);
        if (filters.search) queryParams.append('search', filters.search);
      }

      const response = await api.get<ApiPaginatedResponse<Invoice>>(`${API_URL}/invoices?${queryParams.toString()}`);
      return {
        data: response.data.items,
        total: response.data.total,
        hasNext: (response.data.offset + response.data.limit) < response.data.total
      };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Invoice> => {
    try {
      const response = await api.get<Invoice>(`${API_URL}/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  },

  create: async (orderId: number): Promise<Invoice> => {
    try {
      const response = await api.post<Invoice>(`${API_URL}/invoices`, { order_id: orderId });
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_URL}/invoices/${id}`);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  },

  downloadPdf: async (id: number): Promise<Blob> => {
    try {
      const response = await api.get(`${API_URL}/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      throw error;
    }
  },

  sendByEmail: async (id: number, email: string): Promise<void> => {
    try {
      await api.post(`${API_URL}/invoices/${id}/send-email`, { email });
    } catch (error) {
      console.error('Error sending invoice by email:', error);
      throw error;
    }
  },

  getStatusColor: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'entregado':
        return 'success';
      case 'en_cocina':
        return 'warning';
      case 'listo':
        return 'success';
      case 'en_delivery':
        return 'info';
      case 'a_confirmar':
        return 'secondary';
      case 'facturado':
        return 'primary';
      default:
        return 'secondary';
    }
  }
};

export default invoiceService; 