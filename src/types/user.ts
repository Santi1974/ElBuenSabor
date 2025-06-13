export interface User {
  id_key: number;
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
  password?: string;
  google_sub?: string | null;
  active: boolean;
  image_url?: string | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  phone_number: string;
  role?: string;
}

export interface LoginResponse {
  access_token: string;
  first_login?: boolean;
  user: User;
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