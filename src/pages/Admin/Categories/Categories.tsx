import React, { useState } from 'react';
import GenericABM from '../../../components/GenericABM/GenericABM';

const Categories: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'manufactured' | 'inventory'>('manufactured');

  const columns = [
    { field: 'name', headerName: 'Nombre', width: 200 },
    { field: 'description', headerName: 'Descripción', width: 250 },
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
    },
    { 
      field: 'public', 
      headerName: 'Visible en Home', 
      width: 130,
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
        <h2>Gestión de Rubros</h2>
      </div>
      
      {/* Pestañas de navegación */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'manufactured' ? 'active' : ''}`}
            onClick={() => setActiveTab('manufactured')}
          >
            Rubros de Productos
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Rubros de Ingredientes
          </button>
        </li>
      </ul>

      {/* Contenido de las pestañas */}
      {activeTab === 'manufactured' && (
        <GenericABM
          title="Rubros de Productos"
          columns={columns}
          type="rubro"
          filterType="manufactured"
          key="manufactured" // Key para forzar re-render y reset de paginación
        />
      )}

      {activeTab === 'inventory' && (
        <GenericABM
          title="Rubros de Ingredientes"
          columns={columns}
          type="rubro"
          filterType="inventory"
          key="inventory" // Key para forzar re-render y reset de paginación
        />
      )}
    </div>
  );
};

export default Categories; 