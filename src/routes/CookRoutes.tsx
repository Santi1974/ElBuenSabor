import { Routes, Route, Navigate } from 'react-router-dom';
import Cook from '../pages/Cook/Cook';
import CookOrders from '../pages/Cook/CookOrders/CookOrders';
import Clients from '../pages/Admin/Clients/Clients';
import Inventory from '../pages/Admin/Inventory/Inventory';
import Categories from '../pages/Admin/Categories/Categories';
import Ingredients from '../pages/Admin/Ingredients/Ingredients';
import { EmployeeSettings } from '../pages';
import { authService } from '../services/api';

function CookRoutes() {
  const user = authService.getCurrentUser();
  
  if (!user || user.role !== 'cocinero') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Cook />}>
        <Route index element={<Navigate to="orders" replace />} />
        <Route path="orders" element={<CookOrders />} />
        
        {/* Productos submenu */}
        <Route path="products">
          <Route path="categories" element={<Categories />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>

        <Route path="ingredients" element={<Ingredients />} />
        <Route path="configuracion" element={<EmployeeSettings />} />
      </Route>
    </Routes>
  );
}

export default CookRoutes; 