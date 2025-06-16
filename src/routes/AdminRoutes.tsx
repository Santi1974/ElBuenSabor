import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Admin, EmployeeSettings } from '../pages';
import { Employees } from '../pages/Admin/Employees/Employees';
import Clients from '../pages/Admin/Clients/Clients';
import Inventory from '../pages/Admin/Inventory/Inventory';
import Categories from '../pages/Admin/Categories/Categories';
import Ingredients from '../pages/Admin/Ingredients/Ingredients';
import Rankings from '../pages/Admin/Rankings/Rankings';
import Invoices from '../pages/Admin/Invoices/Invoices';
import Movements from '../pages/Admin/Movements/Movements';
import Promotions from '../pages/Admin/Promotions/Promotions';



const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Admin />}>
        <Route index element={<Navigate to="employees" replace />} />
        <Route path="employees" element={<Employees />} />
        <Route path="clients" element={<Clients />} />
        
        {/* Productos submenu */}
        <Route path="products">
          <Route path="categories" element={<Categories />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>

        <Route path="ingredients" element={<Ingredients />} />
        <Route path="rankings" element={<Rankings />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="movements" element={<Movements />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="settings" element={<EmployeeSettings />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes; 