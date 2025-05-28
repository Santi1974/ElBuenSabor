import React from 'react';
import GenericABM from '../../../components/GenericABM/GenericABM';

const Categories: React.FC = () => {
  const columns = [
    { field: 'name', headerName: 'Nombre', width: 200 },
    { field: 'description', headerName: 'Descripción', width: 300 },
    { field: 'parent_category_name', headerName: 'Categoría Padre', width: 150 },
    { 
      field: 'active', 
      headerName: 'Habilitado', 
      width: 100,
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Sí' },
        { value: 'false', label: 'No' }
      ]
    }
  ];

  return (
    <GenericABM
      title="Gestión de Rubros"
      columns={columns}
      type="rubro"
    />
  );
};

export default Categories; 