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
  }
};

export default reportService;
export type { TopProduct, TopCustomer, ReportParams }; 