import api from './api';
import { authService } from './api';

export interface UserProfile {
  id_key?: number;
  full_name: string;
  email: string;
  phone_number: string;
  password?: string;
  google_sub?: string;
  image_url?: string;
  role?: string;
  active?: boolean;
}

export interface UpdateProfileData {
  full_name: string;
  email: string;
  phone_number: string;
  password?: string;
  image_url?: string;
}

// Helper function to get current user ID
const getCurrentUserId = (): number => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    throw new Error('Usuario no autenticado');
  }
  
  const userId = user.id_key || user.id || user.sub || user.user_id;
  
  if (!userId) {
    console.error('No se encontró ID en el token. Datos disponibles:', Object.keys(user));
    throw new Error('ID de usuario no disponible en el token');
  }
  
  return Number(userId);
};

const userProfileService = {
  // Obtener perfil del usuario actual
  getCurrentProfile: async (): Promise<UserProfile> => {
    try {
      const userId = getCurrentUserId();
      const response = await api.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Actualizar todo el perfil del usuario
  updateProfile: async (profileData: UpdateProfileData): Promise<UserProfile> => {
    try {
      const response = await api.put('/user/update/token', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
};

export default userProfileService; 