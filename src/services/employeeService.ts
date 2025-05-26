import axios from 'axios';

const API_URL = 'http://localhost:8000';

const employeeService = {
  getAll: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/user/employees/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  create: async (employee: any) => {
    const response = await axios.post(`${API_URL}/user/employees`, employee);
    return response.data;
  },

  update: async (id: number, employee: any) => {
    const response = await axios.put(`${API_URL}/user/employees/${id}`, employee);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axios.delete(`${API_URL}/user/employees/${id}`);
    return response.data;
  }
};

export default employeeService; 