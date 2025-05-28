import api from './api';

const API_URL = 'http://localhost:8000';

interface Client {
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
  password: string;
  google_sub?: string;
  active: boolean;
}

const clientService = {
  getAll: async () => {
    const response = await api.get(`${API_URL}/user/clients/all`);
    return response.data;
  },

  create: async (client: Client) => {
    const response = await api.post(`${API_URL}/user/`, {
      full_name: client.full_name,
      email: client.email,
      role: client.role,
      phone_number: client.phone_number,
      password: client.password,
      google_sub: client.google_sub || '',
      active: client.active
    });
    return response.data;
  },

  update: async (id: number, client: Client) => {
    const response = await api.put(`${API_URL}/user/${id}`, {
      full_name: client.full_name,
      email: client.email,
      role: client.role,
      phone_number: client.phone_number,
      password: client.password,
      google_sub: client.google_sub || '',
      active: client.active
    });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`${API_URL}/user/${id}`);
    return response.data;
  }
};

export default clientService; 