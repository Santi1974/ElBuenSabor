import React from 'react';
import GenericABM from '../../../components/GenericABM/GenericABM';

const Clients: React.FC = () => {
  const columns = [
    { field: 'full_name', headerName: 'Nombre', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { 
      field: 'role', 
      headerName: 'Rol', 
      width: 150,
      type: 'select' as const,
      options: [
        { value: 'cliente', label: 'Cliente' }
      ]
    },
    { field: 'phone_number', headerName: 'Teléfono', width: 150 },
    //{ 
    //  field: 'active', 
    //  headerName: 'Estado', 
    //  width: 100,
    //  type: 'select' as const,
    //  options: [
    //    { value: 'true', label: 'Activo' },
    //    { value: 'false', label: 'Inactivo' }
    //  ]
    //}
  ];

  return (
    <GenericABM
      title="Gestión de Clientes"
      columns={columns}
      type="client"
    />
  );
};

export default Clients; 