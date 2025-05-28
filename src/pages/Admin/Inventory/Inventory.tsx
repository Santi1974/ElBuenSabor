import React from 'react';
import GenericABM from '../../../components/GenericABM/GenericABM';

const Inventory: React.FC = () => {
  const inventarioColumns = [
    { field: 'name', headerName: 'Nombre', width: 200 },
    { field: 'description', headerName: 'Descripción', width: 250 },
    { field: 'preparation_time', headerName: 'Tiempo de Preparación', width: 150, type: 'number' as const },
    { field: 'price', headerName: 'Precio', width: 100, type: 'number' as const },
    { field: 'recipe', headerName: 'Receta', width: 200 },
    { field: 'image_url', headerName: 'Imagen', width: 100 },
    { field: 'category.name', headerName: 'Categoría', width: 150 },
    { 
      field: 'active', 
      headerName: 'Activo', 
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
        title="Gestión de Inventario"
        columns={inventarioColumns}
        type="inventario"
      />
    </div>
  );
};

export default Inventory; 