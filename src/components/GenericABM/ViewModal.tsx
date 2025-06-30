import React from 'react';
import type { ABMType } from '../../hooks/useABMData';

interface Column {
  field: string;
  headerName: string;
  width?: number;
  type?: 'text' | 'number' | 'date' | 'select' | 'password' | 'calculated';
  options?: { value: string; label: string }[];
  createOnly?: boolean;
  renderCell?: (item: any) => string;
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
  // Helper function to format numbers with limited decimals
  const formatNumber = (value: number, decimals: number = 2): string => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Number(value).toFixed(decimals);
  };

  // Helper function to detect if an item is manufactured
  const isManufacturedProduct = (item: any): boolean => {
    return (
      item && 
      (item.product_type === 'manufactured' || 
       item.type === 'manufactured' || 
       'preparation_time' in item || 
       'recipe' in item)
    );
  };

  const filteredColumns = columns.filter(column => 
    column.field !== 'category.name' && 
    column.field !== 'parent_category_name' &&
    column.field !== 'measurement_unit.name' &&
    column.field !== 'type_label' &&
    column.field !== 'password' && // Nunca mostrar contraseñas
    column.type !== 'calculated' && // Campos calculados se muestran solo en tablas
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
      return `$${formatNumber(value || 0, 2)}`;
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
                              {formatNumber(viewItem.current_stock || 0, 2)} {viewItem.measurement_unit?.name || 'unidades'}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="fw-bold text-muted small">Stock Mínimo:</label>
                          <div className="ms-2">
                            <span className="badge bg-info">
                              {formatNumber(viewItem.minimum_stock || 0, 2)} {viewItem.measurement_unit?.name || 'unidades'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manufactured Product Information */}
                {type === 'inventario' && isManufacturedProduct(viewItem) && (
                  <>
                    <div className="card mb-3">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="bi bi-gear me-2"></i>
                          Información de Producto Manufacturado
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-12 mb-3">
                            <label className="fw-bold text-muted small">Descripción:</label>
                            <div className="ms-2">
                              <div className="p-2 bg-light rounded">
                                {viewItem.description || 'No especificado'}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="fw-bold text-muted small">Tiempo de Preparación:</label>
                            <div className="ms-2">
                              <span className="badge bg-info">
                                {viewItem.preparation_time || 0} minutos
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="fw-bold text-muted small">Precio:</label>
                            <div className="ms-2">
                              <span className="badge bg-success">
                                ${formatNumber(viewItem.price || 0, 2)}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-12 mb-3">
                            <label className="fw-bold text-muted small">Receta:</label>
                            <div className="ms-2">
                              <div className="p-2 bg-light rounded">
                                {viewItem.recipe || 'No especificado'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients Section */}
                    {viewItem.details && Array.isArray(viewItem.details) && viewItem.details.length > 0 && (
                      <div className="card mb-3">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="bi bi-list-ul me-2"></i>
                            Ingredientes del Producto
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="table-responsive">
                            <table className="table table-sm table-striped">
                              <thead>
                                <tr>
                                  <th>Ingrediente</th>
                                  <th className="text-center">Cantidad</th>
                                  <th className="text-center">Unidad</th>
                                </tr>
                              </thead>
                              <tbody>
                                {viewItem.details.map((detail: any, index: number) => (
                                  <tr key={index}>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <i className="bi bi-box me-2 text-muted"></i>
                                        <span>{detail.inventory_item?.name || detail.name || 'Ingrediente desconocido'}</span>
                                      </div>
                                    </td>
                                    <td className="text-center">
                                      <span className="badge bg-primary">
                                        {detail.quantity || 0}
                                      </span>
                                    </td>
                                    <td className="text-center">
                                      <span className="badge bg-info">
                                        {detail.inventory_item?.measurement_unit?.name || detail.unit || 'unidad'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {viewItem.details.length === 0 && (
                            <div className="alert alert-info mb-0">
                              <i className="bi bi-info-circle me-2"></i>
                              No hay ingredientes registrados para este producto.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Promotion Items Information */}
                {type === 'promotion' && (
                  <>
                    {/* Manufactured Items */}
                    {viewItem.manufactured_item_details && viewItem.manufactured_item_details.length > 0 && (
                      <div className="card mb-3">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="bi bi-gear-fill me-2"></i>
                            Productos Manufacturados Incluidos
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="table-responsive">
                            <table className="table table-sm table-striped">
                              <thead>
                                <tr>
                                  <th>Producto</th>
                                  <th className="text-center">Cantidad</th>
                                  <th className="text-center">Precio Original</th>
                                  <th className="text-center">Precio con Descuento</th>
                                  <th className="text-center">Subtotal Original</th>
                                  <th className="text-center">Subtotal con Descuento</th>
                                </tr>
                              </thead>
                              <tbody>
                                {viewItem.manufactured_item_details.map((detail: any, index: number) => {
                                  const originalPrice = detail.manufactured_item?.price || 0;
                                  const discountedPrice = originalPrice * (1 - (viewItem.discount_percentage || 0) / 100);
                                  const quantity = detail.quantity || 0;
                                  const originalSubtotal = originalPrice * quantity;
                                  const discountedSubtotal = discountedPrice * quantity;
                                  
                                  return (
                                    <tr key={index}>
                                      <td>
                                        <div className="d-flex align-items-center">
                                          <i className="bi bi-gear me-2 text-primary"></i>
                                          <div>
                                            <div className="fw-bold">{detail.manufactured_item?.name || 'Producto desconocido'}</div>
                                            {detail.manufactured_item?.description && (
                                              <small className="text-muted">{detail.manufactured_item.description}</small>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="text-center">
                                        <span className="badge bg-primary">
                                          {quantity}
                                        </span>
                                      </td>
                                      <td className="text-center">
                                        <span className="badge bg-secondary text-decoration-line-through">
                                          ${formatNumber(originalPrice, 2)}
                                        </span>
                                      </td>
                                      <td className="text-center">
                                        <span className="badge bg-success">
                                          ${formatNumber(discountedPrice, 2)}
                                        </span>
                                      </td>
                                      <td className="text-center">
                                        <span className="badge bg-secondary text-decoration-line-through">
                                          ${formatNumber(originalSubtotal, 2)}
                                        </span>
                                      </td>
                                      <td className="text-center">
                                        <span className="badge bg-warning">
                                          ${formatNumber(discountedSubtotal, 2)}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Inventory Items */}
                    {viewItem.inventory_item_details && viewItem.inventory_item_details.length > 0 && (
                      <div className="card mb-3">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="bi bi-box-seam-fill me-2"></i>
                            Productos de Inventario Incluidos
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="table-responsive">
                            <table className="table table-sm table-striped">
                              <thead>
                                <tr>
                                  <th>Producto</th>
                                  <th className="text-center">Cantidad</th>
                                  <th className="text-center">Precio Original</th>
                                  <th className="text-center">Precio con Descuento</th>
                                  <th className="text-center">Subtotal Original</th>
                                  <th className="text-center">Subtotal con Descuento</th>
                                </tr>
                              </thead>
                              <tbody>
                                {viewItem.inventory_item_details.map((detail: any, index: number) => {
                                  const originalPrice = detail.inventory_item?.price || 0;
                                  const discountedPrice = originalPrice * (1 - (viewItem.discount_percentage || 0) / 100);
                                  const quantity = detail.quantity || 0;
                                  const originalSubtotal = originalPrice * quantity;
                                  const discountedSubtotal = discountedPrice * quantity;
                                  
                                  return (
                                    <tr key={index}>
                                      <td>
                                        <div className="d-flex align-items-center">
                                          <i className="bi bi-box me-2 text-success"></i>
                                          <div>
                                            <div className="fw-bold">{detail.inventory_item?.name || 'Producto desconocido'}</div>
                                            <small className="text-muted">
                                              Stock: {detail.inventory_item?.current_stock || 0} {detail.inventory_item?.measurement_unit?.name || 'unidades'}
                                            </small>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="text-center">
                                        <span className="badge bg-primary">
                                          {quantity}
                                        </span>
                                      </td>
                                      <td className="text-center">
                                        <span className="badge bg-secondary text-decoration-line-through">
                                          ${formatNumber(originalPrice, 2)}
                                        </span>
                                      </td>
                                      <td className="text-center">
                                        <span className="badge bg-success">
                                          ${formatNumber(discountedPrice, 2)}
                                        </span>
                                      </td>
                                      <td className="text-center">
                                        <span className="badge bg-secondary text-decoration-line-through">
                                          ${formatNumber(originalSubtotal, 2)}
                                        </span>
                                      </td>
                                      <td className="text-center">
                                        <span className="badge bg-warning">
                                          ${formatNumber(discountedSubtotal, 2)}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Promotion Summary */}
                    <div className="card mb-3">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="bi bi-calculator me-2"></i>
                          Resumen de la Promoción
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted">Precio sin descuento:</span>
                              <span className="fw-bold">
                                ${formatNumber(
                                  ((viewItem.manufactured_item_details || []).reduce((total: number, detail: any) => 
                                    total + ((detail.manufactured_item?.price || 0) * (detail.quantity || 0)), 0) +
                                  (viewItem.inventory_item_details || []).reduce((total: number, detail: any) => 
                                    total + ((detail.inventory_item?.price || 0) * (detail.quantity || 0)), 0)), 2
                                )}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted">Descuento ({viewItem.discount_percentage || 0}%):</span>
                              <span className="text-danger fw-bold">
                                -${formatNumber(
                                  ((viewItem.manufactured_item_details || []).reduce((total: number, detail: any) => 
                                    total + ((detail.manufactured_item?.price || 0) * (detail.quantity || 0)), 0) +
                                  (viewItem.inventory_item_details || []).reduce((total: number, detail: any) => 
                                    total + ((detail.inventory_item?.price || 0) * (detail.quantity || 0)), 0)) *
                                  (viewItem.discount_percentage || 0) / 100, 2
                                )}
                              </span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bold text-primary">Precio Final:</span>
                              <span className="fw-bold text-primary fs-5">
                                ${formatNumber(
                                  ((viewItem.manufactured_item_details || []).reduce((total: number, detail: any) => 
                                    total + ((detail.manufactured_item?.price || 0) * (detail.quantity || 0)), 0) +
                                  (viewItem.inventory_item_details || []).reduce((total: number, detail: any) => 
                                    total + ((detail.inventory_item?.price || 0) * (detail.quantity || 0)), 0)) *
                                  (1 - (viewItem.discount_percentage || 0) / 100), 2
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted">Estado:</span>
                              <span className={`badge ${viewItem.active ? 'bg-success' : 'bg-danger'}`}>
                                {viewItem.active ? 'Activa' : 'Inactiva'}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted">Disponibilidad:</span>
                              <span className={`badge ${viewItem.is_available ? 'bg-success' : 'bg-warning'}`}>
                                {viewItem.is_available ? 'Disponible' : 'No Disponible'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
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