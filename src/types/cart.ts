export interface CartProduct {
  id_key: number;
  name: string;
  price: number;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: CartProduct) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  getItemQuantity: (id: number) => number;
  totalItems: number;
} 