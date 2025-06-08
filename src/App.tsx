import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Register, Home, Orders, OrderDetail, Cart, ProductDetail } from './pages';
import { CartProvider } from './context/CartContext';
import { authService } from './services/api';
import './index.css';
import './App.css';
import AdminRoutes from './routes/AdminRoutes';

// Keeping for future use
// function PrivateRoute({ children }: { children: ReactNode }) {
//   const token = localStorage.getItem('token');
//   return token ? <>{children}</> : <Navigate to="/login" replace />;
// }
 
function RoleRoute({ children, role }: { children: ReactNode; role: string }) {
  const user = authService.getCurrentUser();
  console.log(user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    // Si el rol no coincide, redirigir a la ruta correspondiente
    return <Navigate to={user.role === 'administrador' ? '/admin' : '/'} replace />;
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
        </Routes>
      </div>
    </Router>
    </CartProvider>
  );
}

export default App;
