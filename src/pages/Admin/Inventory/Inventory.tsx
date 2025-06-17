import React, { useState } from 'react';
import GenericABM from '../../../components/GenericABM/GenericABM';

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'manufactured' | 'inventory'>('manufactured');

  // Columnas para productos manufacturados
  const manufacturedColumns = [
    { field: 'name', headerName: 'Nombre', width: 180 },
    { field: 'description', headerName: 'Descripción', width: 200 },
    { field: 'preparation_time', headerName: 'Tiempo Prep.', width: 120, type: 'number' as const },
    { field: 'price', headerName: 'Precio', width: 100, type: 'number' as const },
    { field: 'recipe', headerName: 'Receta', width: 150 },
    { field: 'image_url', headerName: 'Imagen', width: 100 },
    { field: 'category.name', headerName: 'Categoría', width: 130 },
    { 
      field: 'active', 
      headerName: 'Activo', 
      width: 80, 
      type: 'select' as const, 
      options: [
        { value: 'true', label: 'Sí' },
        { value: 'false', label: 'No' }
      ]
    }
  ];

  // Columnas para productos de inventario (igual que ingredientes)
  const inventoryColumns = [
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Inventario</h2>
      </div>
      
      {/* Pestañas de navegación */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'manufactured' ? 'active' : ''}`}
            onClick={() => setActiveTab('manufactured')}
          >
            Productos Manufacturados
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventario
          </button>
        </li>
      </ul>

      {/* Contenido de las pestañas */}
      {activeTab === 'manufactured' && (
        <GenericABM
          title="Productos Manufacturados"
          columns={manufacturedColumns}
          type="inventario"
          filterType="manufactured"
          key="manufactured" // Key para forzar re-render y reset de paginación
        />
      )}

      {activeTab === 'inventory' && (
        <GenericABM
          title="Inventario"
          columns={inventoryColumns}
          type="inventario"
          filterType="inventory"
          key="inventory" // Key para forzar re-render y reset de paginación
        />
      )}
    </div>
  );
};

export default Inventory; 