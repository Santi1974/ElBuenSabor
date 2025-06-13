import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Delivery, DeliveryOrders, EmployeeSettings } from '../pages';

const DeliveryRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Delivery />}>
        <Route index element={<Navigate to="pedidos" replace />} />
        <Route path="pedidos" element={<DeliveryOrders />} />
        <Route path="configuracion" element={<EmployeeSettings />} />
      </Route>
    </Routes>
  );
};

export default DeliveryRoutes; 