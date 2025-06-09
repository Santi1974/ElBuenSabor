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
 
function RoleRoute({ children, role }: { children: ReactNode; role: string }) {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    // Si el rol no coincide, redirigir a la ruta correspondiente
    if (user.role === 'administrador') return <Navigate to="/admin" replace />;
    if (user.role === 'delivery') return <Navigate to="/delivery" replace />;
    if (user.role === 'cajero') return <Navigate to="/cashier" replace />;
    return <Navigate to="/" replace />;
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
          {/* Rutas solo para clientes */}
          <Route path="/" element={
            <RoleRoute role="cliente">
              <Home />
            </RoleRoute>
          } />
          <Route path="/product/:id" element={
            <RoleRoute role="cliente">
              <ProductDetail />
            </RoleRoute>
          } />
          <Route path="/cart" element={
            <RoleRoute role="cliente">
              <Cart />
            </RoleRoute>
          } />
          <Route path="/orders" element={
            <RoleRoute role="cliente">
              <Orders />
            </RoleRoute>
          } />
          <Route path="/order/:id" element={
            <RoleRoute role="cliente">
              <OrderDetail />
            </RoleRoute>
          } />
          <Route path="/profile" element={
            <RoleRoute role="cliente">
              <Profile />
            </RoleRoute>
          } />
        </Routes>
      </div>
    </Router>
    </CartProvider>
  );
}

export default App;
