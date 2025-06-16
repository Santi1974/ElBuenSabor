export interface CartProduct {
  id_key: number;
  name: string;
  price: number;
  type: 'manufactured' | 'inventory' | 'promotion'; // Distinguir entre productos manufacturados, inventario y promociones
  discount_percentage?: number; // Para promociones
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: CartProduct, showLoginPrompt?: boolean) => boolean;
  removeItem: (id: number, type?: 'manufactured' | 'inventory' | 'promotion') => void;
  updateQuantity: (id: number, quantity: number, type?: 'manufactured' | 'inventory' | 'promotion') => void;
  getItemQuantity: (id: number, type?: 'manufactured' | 'inventory' | 'promotion') => number;
  clearCart: () => void;
  totalItems: number;
  isAuthenticated: boolean;
} 