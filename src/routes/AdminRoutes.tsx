import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Admin } from '../pages';
import { Employees } from '../pages/Admin/Employees/Employees';


const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Admin />}>
        <Route index element={<Navigate to="employees" replace />} />
        <Route path="employees" element={<Employees />} />
        {/* <Route path="clients" element={<Clients />} />
        <Route path="products" element={<Products />} />
        <Route path="ingredients" element={<Ingredients />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="rankings" element={<Rankings />} />
        <Route path="movements" element={<Movements />} /> */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes; 