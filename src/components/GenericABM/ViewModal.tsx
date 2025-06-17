import React from 'react';
import type { ABMType } from '../../hooks/useABMData';

interface Column {
  field: string;
  headerName: string;
  width?: number;
  type?: 'text' | 'number' | 'date' | 'select' | 'password';
  options?: { value: string; label: string }[];
  createOnly?: boolean;
}

interface ViewModalProps {
  title: string;
  type: ABMType;
  columns: Column[];
  viewItem: any;
  onClose: () => void;
}

const ViewModal: React.FC<ViewModalProps> = ({
  title,
  type,
  columns,
  viewItem,
  onClose
}) => {
  const filteredColumns = columns.filter(column => 
    column.field !== 'category.name' && 
    column.field !== 'parent_category_name' &&
    column.field !== 'measurement_unit.name' &&
    column.field !== 'type_label' &&
    column.field !== 'password' && // Nunca mostrar contraseñas
    (type !== 'inventario' || (
      column.field !== 'description' && 
      column.field !== 'recipe' && 
      column.field !== 'image_url' &&
      column.field !== 'preparation_time' &&
      column.field !== 'current_stock' &&
      column.field !== 'minimum_stock' &&
      column.field !== 'purchase_cost'
    )) &&
    (type !== 'ingrediente' || (
      column.field !== 'image_url'
    ))
  );

  const renderFieldValue = (column: Column, value: any) => {
    if (column.type === 'select' && column.field === 'active') {
      return (
        <span className={`badge ${value ? 'bg-success' : 'bg-danger'}`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      );
    }
    
    if (column.field === 'description' || column.field === 'recipe') {
      return (
        <div className="p-2 bg-light rounded">
          {value || 'No especificado'}
        </div>
      );
    }
    
    if (column.field === 'price') {
      return `$${value || 0}`;
    }
    
    if (column.field === 'preparation_time') {
      return `${value || 0} minutos`;
    }
    
    if (column.field.includes('.')) {
      return column.field.split('.').reduce((obj, key) => obj?.[key], viewItem) || 'No especificado';
    }
    
    if(column.field === 'public'){
      if(value === null){
        return 'No';
      }
      if(value === undefined){
        return 'No aplicable';
      }
      return value ? 'Sí' : 'No';
    }
    return value || 'No especificado';
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-eye me-2"></i>
              Detalles de {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-12">
                {/* Basic Information */}
                <div className="card mb-3">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      Información Básica
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {filteredColumns.map((column) => (
                        <div key={column.field} className="col-md-6 mb-3">
                          <label className="fw-bold text-muted small">{column.headerName}:</label>
                          <div className="ms-2">
                            {renderFieldValue(column, viewItem[column.field])}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image section for inventory items and ingredients */}
                {(type === 'inventario' || type === 'ingrediente') && viewItem.image_url && (
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="mb-0">
                        <i className="bi bi-image me-2"></i>
                        Imagen del {type === 'inventario' ? 'Producto' : 'Ingrediente'}
                      </h6>
                    </div>
                    <div className="card-body text-center">
                      <img 
                        src={viewItem.image_url} 
                        alt={viewItem.name} 
                        style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'cover' }}
                        className="img-thumbnail"
                      />
                    </div>
                  </div>
                )}

                {/* Category information */}
                {(type === 'inventario' || type === 'rubro' || type === 'ingrediente') && (
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="mb-0">
                        <i className="bi bi-bookmark me-2"></i>
                        Información de Categoría
                      </h6>
                    </div>
                    <div className="card-body">
                      {(type === 'inventario' || type === 'ingrediente') && viewItem.category && (
                        <div>
                          {type === 'inventario' && viewItem.product_type && (
                            <div className="mb-3">
                              <label className="fw-bold text-muted small">Tipo de Producto:</label>
                              <div className="ms-2">
                                <span className={`badge ${viewItem.product_type === 'manufactured' ? 'bg-primary' : 'bg-success'}`}>
                                  {viewItem.type_label}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <label className="fw-bold text-muted small">Categoría:</label>
                          <div className="ms-2">
                            <span className="badge bg-primary">{viewItem.category.name}</span>
                          </div>
                          
                          {viewItem.measurement_unit && (
                            <div className="mt-2">
                              <label className="fw-bold text-muted small">Unidad de Medida:</label>
                              <div className="ms-2">
                                <span className="badge bg-info">{viewItem.measurement_unit.name}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {type === 'rubro' && (
                        <div>
                          <label className="fw-bold text-muted small">Tipo de Categoría:</label>
                          <div className="ms-2 mb-3">
                            <span className={`badge ${viewItem.category_type === 'manufactured' ? 'bg-primary' : 'bg-success'}`}>
                              {viewItem.type_label}
                            </span>
                          </div>
                          
                          <label className="fw-bold text-muted small">Categoría Padre:</label>
                          <div className="ms-2">
                            {viewItem.parent_category_name === 'Sin categoría padre' ? (
                              <span className="badge bg-secondary">Sin categoría padre</span>
                            ) : (
                              <span className="badge bg-info">{viewItem.parent_category_name}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional information sections can be added here */}
                {type === 'inventario' && viewItem.product_type === 'inventory' && (
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="mb-0">
                        <i className="bi bi-box-seam me-2"></i>
                        Información de Inventario
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="fw-bold text-muted small">Stock Actual:</label>
                          <div className="ms-2">
                            <span className={`badge ${(viewItem.current_stock || 0) > (viewItem.minimum_stock || 0) ? 'bg-success' : 'bg-warning'}`}>
                              {viewItem.current_stock || 0} {viewItem.measurement_unit?.name || 'unidades'}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="fw-bold text-muted small">Stock Mínimo:</label>
                          <div className="ms-2">
                            <span className="badge bg-info">
                              {viewItem.minimum_stock || 0} {viewItem.measurement_unit?.name || 'unidades'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              <i className="bi bi-x-lg me-2"></i>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewModal; 