import api from './api';
import type { Order } from '../types/order';
import type { User } from '../types/user';
import type { ManufacturedItem, InventoryItem } from '../types/product';

const API_URL = 'http://localhost:8000';

export interface TopProduct {
  product: ManufacturedItem | InventoryItem;
  total_quantity: number;
  total_revenue: number;
}

export interface TopCustomer {
  user: User;
  total_orders: number;
  total_spent: number;
}

export interface ReportParams {
  start_date?: string;
  end_date?: string;
  category_id?: number;
  user_id?: number;
  payment_method?: string;
  delivery_method?: string;
  status?: string;
}

export interface RevenueReport {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  orders: Order[];
  top_products: TopProduct[];
  top_customers: TopCustomer[];
}

const reportService = {
  getRevenueReport: async (params: ReportParams): Promise<RevenueReport> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      if (params.category_id) queryParams.append('category_id', params.category_id.toString());
      if (params.user_id) queryParams.append('user_id', params.user_id.toString());
      if (params.payment_method) queryParams.append('payment_method', params.payment_method);
      if (params.delivery_method) queryParams.append('delivery_method', params.delivery_method);
      if (params.status) queryParams.append('status', params.status);
      
      const response = await api.get<RevenueReport>(`${API_URL}/reports/revenue?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      throw error;
    }
  },

  getTopProducts: async (params: ReportParams): Promise<TopProduct[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      if (params.category_id) queryParams.append('category_id', params.category_id.toString());
      
      const response = await api.get<TopProduct[]>(`${API_URL}/reports/top-products?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  },

  getTopCustomers: async (params: ReportParams): Promise<TopCustomer[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      
      const response = await api.get<TopCustomer[]>(`${API_URL}/reports/top-customers?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top customers:', error);
      throw error;
    }
  },

  downloadRevenueExcel: async (params: ReportParams = {}): Promise<void> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      
      const response = await api.get(`${API_URL}/reports/revenue/excel?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with date range
      const startDate = params.start_date || 'inicio';
      const endDate = params.end_date || 'fin';
      link.download = `reporte_movimientos_${startDate}_${endDate}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading revenue excel report:', error);
      throw error;
    }
  }
};

export default reportService; 