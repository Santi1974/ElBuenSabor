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
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    telefono: string;
    rol: string;
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
    if (error.response?.status === 401) {
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
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async loginWithGoogle(): Promise<void> {
    // First check if we have a token in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    
    if (token) {
      // If we have a token, store it and clean the URL
      localStorage.setItem('token', token);
      // Clean the URL without reloading the page
      window.history.replaceState({}, document.title, window.location.pathname);
      // Redirect to home
      window.location.href = '/';
    } else {
      // If no token, redirect to Google login
      window.location.href = `${API_URL}/auth/google/login`;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      localStorage.removeItem('token');
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  // Helper function to check for token in URL
  checkForTokenInURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    
    if (token) {
      localStorage.setItem('token', token);
      // Clean the URL without reloading the page
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
    return false;
  }
};

export default api; 