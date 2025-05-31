import api from './api';

const API_URL = 'http://localhost:8000';

interface Employee {
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
  password: string;
  google_sub?: string;
  active: boolean;
}

const employeeService = {
  getAll: async (offset: number = 0, limit: number = 10) => {
    try {
      const response = await api.get(`${API_URL}/user/employees/all?offset=${offset}&limit=${limit}`);
      
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
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  create: async (employee: Employee) => {
    const response = await api.post(`${API_URL}/user/`, {
      full_name: employee.full_name,
      email: employee.email,
      role: employee.role,
      phone_number: employee.phone_number,
      password: employee.password,
      google_sub: employee.google_sub || '',
      active: employee.active
    });
    return response.data;
  },

  update: async (id: number, employee: Employee) => {
    const response = await api.put(`${API_URL}/user/${id}`, {
      full_name: employee.full_name,
      email: employee.email,
      role: employee.role,
      phone_number: employee.phone_number,
      password: employee.password,
      google_sub: employee.google_sub || '',
      active: employee.active
    });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`${API_URL}/user/${id}`);
    return response.data;
  }
};

export default employeeService; 