import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { CartItem, CartContextType, CartProduct } from '../types/cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Limpiar carrito cuando el usuario se desloguea
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      localStorage.removeItem('cart');
    }
  }, [isAuthenticated]);

  const addItem = (product: CartProduct, showLoginPrompt = true) => {
    if (!isAuthenticated) {
      if (showLoginPrompt) {
        alert('Debes iniciar sesión para agregar productos al carrito');
      }
      return false;
    }

    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id_key === product.id_key);
      if (existingItem) {
        return currentItems.map(item =>
          item.product.id_key === product.id_key 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...currentItems, { product, quantity: 1 }];
    });
    return true;
  };

  const removeItem = (id: number) => {
    if (!isAuthenticated) return;
    setItems(currentItems => currentItems.filter(item => item.product.id_key !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (!isAuthenticated) return;
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id_key === id ? { ...item, quantity } : item
      )
    );
  };

  const getItemQuantity = (id: number) => {
    if (!isAuthenticated) return 0;
    return items.find(item => item.product.id_key === id)?.quantity || 0;
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = isAuthenticated ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const value = {
    items: isAuthenticated ? items : [],
    addItem,
    removeItem,
    updateQuantity,
    getItemQuantity,
    clearCart,
    totalItems,
    isAuthenticated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext; 