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