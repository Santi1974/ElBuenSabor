import React from 'react';
import GenericABM from '../../../components/GenericABM/GenericABM';

const Ingredients: React.FC = () => {
  const ingredientsColumns = [
    { field: 'name', headerName: 'Nombre', width: 200 },
    { field: 'current_stock', headerName: 'Stock Actual', width: 120, type: 'number' as const },
    { field: 'minimum_stock', headerName: 'Stock Mínimo', width: 120, type: 'number' as const },
    { field: 'price', headerName: 'Precio', width: 100, type: 'number' as const },
    { field: 'purchase_cost', headerName: 'Costo de Compra', width: 130, type: 'number' as const },
    { field: 'measurement_unit.name', headerName: 'Unidad', width: 100 },
    { field: 'category.name', headerName: 'Categoría', width: 150 },
    { field: 'image_url', headerName: 'Imagen', width: 100 },
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
        title="Gestión de Ingredientes"
        columns={ingredientsColumns}
        type="ingrediente"
      />
    </div>
  );
};

export default Ingredients; 