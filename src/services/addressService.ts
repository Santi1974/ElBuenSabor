import api from './api';

export interface Address {
  id_key: number;
  street: string;
  street_number: number;
  zip_code: string;
  name: string;
  locality_id: number;
  locality_name?: string;
}

export interface AddressFormData {
  street: string;
  street_number: number;
  zip_code: string;
  name: string;
  locality_id: number;
}

const addressService = {
  // Get user addresses
  getUserAddresses: async (): Promise<Address[]> => {
    try {
      const response = await api.get('/address/user/addresses');
      // Asegurar que siempre retorne un array
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.items)) {
        // En caso de que la API retorne un objeto con paginación
        return data.items;
      } else {
        console.warn('API returned unexpected format for addresses:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      // En caso de error, retornar array vacío para evitar crashes
      return [];
    }
  },

  // Create new address
  create: async (addressData: AddressFormData): Promise<Address> => {
    try {
      const response = await api.post('/address/user/addresses', addressData);
      return response.data;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  },

  // Update address
  update: async (id: number, addressData: AddressFormData): Promise<Address> => {
    try {
      const response = await api.put(`/address/user/addresses/${id}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  // Delete address
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/address/user/addresses/${id}`);
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }
};

export default addressService; 