import React from 'react';
import GenericABM from '../../../components/GenericABM/GenericABM';

export const Employees: React.FC = () => {
  const columns = [
    { field: 'full_name', headerName: 'Nombre', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { 
      field: 'role', 
      headerName: 'Rol',
      width: 150,
      type: 'select' as const,
      options: [
        { value: 'administrador', label: 'Administrador' },
        { value: 'delivery', label: 'Delivery' },
        { value: 'cocinero', label: 'Cocinero' },
        { value: 'cajero', label: 'Cajero'}
      ]
    },
    { field: 'phone_number', headerName: 'Teléfono', width: 150 },
    { field: 'password', headerName: 'Contraseña Inicial', width: 200, type: 'password' as const, createOnly: true },
    { field: 'confirmPassword', headerName: 'Confirmar Contraseña', width: 200, type: 'password' as const, createOnly: true }
  ];

  return (
    <div className="container-fluid p-4">
      <GenericABM
        title="Empleados"
        columns={columns}
        type="employee"
      />
    </div>
  );
};

export default Employees; 