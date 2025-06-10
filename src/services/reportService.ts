import api from './api';

const API_URL = 'http://localhost:8000';

interface TopProduct {
  id: number;
  name: string;
  quantity: number;
  revenue: number;
  category: string;
}

interface TopCustomer {
  id: number;
  name: string;
  email: string;
  order_count: number;
  total_amount: number;
}

interface ReportParams {
  start_date?: string;
  end_date?: string;
  limit?: number;
}

interface RevenueReport {
  revenue: number;
  total_expenses: number;
  profit: number;
  profit_margin_percentage: number;
  total_invoices: number;
  total_inventory_purchases: number;
  start_date: string;
  end_date: string;
}

const reportService = {
  getTopProducts: async (params: ReportParams = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await api.get(`${API_URL}/reports/top-products?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  },

  getTopCustomers: async (params: ReportParams = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await api.get(`${API_URL}/reports/top-customers?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top customers:', error);
      throw error;
    }
  },

  getRevenue: async (params: ReportParams = {}): Promise<RevenueReport> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      
      const response = await api.get(`${API_URL}/reports/revenue?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue report:', error);
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
export type { TopProduct, TopCustomer, ReportParams, RevenueReport }; 