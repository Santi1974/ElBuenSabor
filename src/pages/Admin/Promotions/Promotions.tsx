import React from 'react';
import GenericABM from '../../../components/GenericABM/GenericABM';

const Promotions: React.FC = () => {
  const columns = [
    { field: 'name', headerName: 'Nombre', width: 200 },
    { field: 'description', headerName: 'Descripción', width: 250 },
    { field: 'discount_percentage', headerName: 'Descuento (%)', width: 120, type: 'number' as const },
    { 
      field: 'active', 
      headerName: 'Activa', 
      width: 100,
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Sí' },
        { value: 'false', label: 'No' }
      ]
    }
  ];

  return (
    <div className="container-fluid p-4">
      <GenericABM
        title="Gestión de Promociones"
        columns={columns}
        type="promotion"
      />
    </div>
  );
};

export default Promotions; 