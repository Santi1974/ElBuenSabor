import { useState, useEffect } from 'react';
import { authService } from '../services/api';

interface User {
  id_key: number;
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
  active: boolean;
  first_login: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser)
        console.log(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Escuchar cambios en el localStorage (para cuando se hace login/logout)
    const handleStorageChange = () => {
      checkAuth();
    };

    // Escuchar eventos personalizados para login/logout
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('auth-change'));
  };

  const refreshAuth = () => {
    checkAuth();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    refreshAuth,
    isClient: user?.role === 'cliente'
  };
}; 