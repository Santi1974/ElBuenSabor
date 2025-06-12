import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  role: string;
  active: boolean;
}

export interface AuthResponse {
  access_token: string;
  first_login?: boolean;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    telefono: string;
    role: string;
  };
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
   
    if ((error.response?.status === 401 || error.response?.status === 403) && 
        localStorage.getItem('token') && 
        !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        window.dispatchEvent(new CustomEvent('auth-change'));
      }
      return response.data;
    } catch (error: any) {
      // Si el error viene con detail como string
      if (typeof error.response?.data?.detail === 'string') {
        throw new Error(error.response.data.detail);
      }
      
      // Si el error viene con detail como array de mensajes
      if (Array.isArray(error.response?.data?.detail)) {
        const errorMessage = error.response.data.detail[0]?.msg || error.response.data.detail[0] || 'Error de validación en los datos ingresados';
        throw new Error(errorMessage);
      }
      
      // Si el error viene con detail como objeto
      if (error.response?.data?.detail && typeof error.response.data.detail === 'object') {
        const errorMessage = error.response.data.detail.message || 'Error de validación en los datos ingresados';
        throw new Error(errorMessage);
      }
      
      // Error genérico
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  },

  async loginWithGoogle(): Promise<void> {
    window.location.href = `${API_URL}/auth/google/login`;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      window.location.href = '/login';
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errorMessage = error.response.data?.detail[0].msg || 'Error de validación en los datos de registro';
        throw new Error(errorMessage);
      }
      
      // Manejar otros errores HTTP
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail[0].msg);
      }
      
      // Error genérico
      throw new Error(error.message || 'Error al registrar usuario');
    }
  },

  logout() {
    localStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('auth-change'));
    window.location.href = '/login';
  },

  getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      localStorage.removeItem('token');
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  async changeEmployeePassword(newPassword: string): Promise<void> {
    try {
      await api.put('/user/employee/password', { password: newPassword });
    } catch (error: any) {
      throw error;
    }
  },

  async checkForTokenInURL(): Promise<boolean> {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    
    if (token && token.trim() !== '') {
      localStorage.setItem('token', token);
      window.dispatchEvent(new CustomEvent('auth-change'));
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
    return false;
  }
};

export default api; 