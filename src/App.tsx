import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Register, Home, Orders, OrderDetail, Cart, ProductDetail, Profile } from './pages';
import { CartProvider } from './context/CartContext';
import { authService } from './services/api';
import './index.css';
import './App.css';
import AdminRoutes from './routes/AdminRoutes';
import DeliveryRoutes from './routes/DeliveryRoutes';
import CashierRoutes from './routes/CashierRoutes';
import CookRoutes from './routes/CookRoutes';

// Nueva función para rutas públicas que redirige usuarios autenticados según su rol
function PublicRoute({ children }: { children: ReactNode }) {
  const user = authService.getCurrentUser();
  
  // Si el usuario está autenticado, redirigir según su rol
  if (user) {
    if (user.role === 'administrador') return <Navigate to="/admin" replace />;
    if (user.role === 'delivery') return <Navigate to="/delivery" replace />;
    if (user.role === 'cajero') return <Navigate to="/cashier" replace />;
    if (user.role === 'cocinero') return <Navigate to="/cook" replace />;
 
    if (user.role !== 'cliente') return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Función para rutas que requieren autenticación obligatoria
function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'cliente') {
    // Si no es cliente, redirigir según su rol
    if (user.role === 'administrador') return <Navigate to="/admin" replace />;
    if (user.role === 'delivery') return <Navigate to="/delivery" replace />;
    if (user.role === 'cajero') return <Navigate to="/cashier" replace />;
    if (user.role === 'cocinero') return <Navigate to="/cook" replace />;
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <CartProvider>
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/delivery/*" element={<DeliveryRoutes />} />
          <Route path="/cashier/*" element={<CashierRoutes />} />
          <Route path="/cook/*" element={<CookRoutes />} />
          
          {/* Rutas públicas - se pueden ver sin autenticación */}
          <Route path="/" element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          } />
          <Route path="/product/:id" element={
            <PublicRoute>
              <ProductDetail />
            </PublicRoute>
          } />
          
          {/* Rutas que requieren autenticación */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/order/:id" element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
    </CartProvider>
  );
}

export default App;
