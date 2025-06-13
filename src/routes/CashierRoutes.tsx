import { Routes, Route, Navigate } from 'react-router-dom';
import Cashier from '../pages/Cashier/Cashier';
import CashierOrders from '../pages/Cashier/CashierOrders/CashierOrders';
import { EmployeeSettings } from '../pages';
import { authService } from '../services/api';

function CashierRoutes() {
  const user = authService.getCurrentUser();
  
  if (!user || user.role !== 'cajero') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Cashier />}>
        <Route index element={<Navigate to="orders" replace />} />
        <Route path="orders" element={<CashierOrders />} />
        <Route path="configuracion" element={<EmployeeSettings />} />
      </Route>
    </Routes>
  );
}

export default CashierRoutes; 