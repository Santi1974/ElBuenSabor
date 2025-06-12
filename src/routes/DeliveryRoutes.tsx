import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Delivery, DeliveryOrders } from '../pages';
import Settings from '../pages/Employee/Settings/Settings';

const DeliveryRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Delivery />}>
        <Route index element={<Navigate to="pedidos" replace />} />
        <Route path="pedidos" element={<DeliveryOrders />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default DeliveryRoutes; 