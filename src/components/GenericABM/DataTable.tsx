import React from 'react';

interface Column {
  field: string;
  headerName: string;
  width?: number;
  type?: 'text' | 'number' | 'date' | 'select' | 'password';
  options?: { value: string; label: string }[];
  createOnly?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  onView: (item: any) => void;
  onAddStock?: (item: any) => void;
  onViewOrders?: (item: any) => void;
  type?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  onAddStock,
  onViewOrders,
  type
}) => {
  const renderCellValue = (column: Column, item: any) => {
    if (column.type === 'password') {
      return '••••••••';
    }
    
    if (column.type === 'select' && column.options) {
      const value = item[column.field];
      
      // Handle special cases for null and undefined
      if (value === undefined) {
        return 'N/A';
      }
      if (value === null) {
        return 'No';
      }
      
      // Convert value to string for comparison with options
      const stringValue = value.toString();
      const option = column.options.find(opt => opt.value === stringValue);
      return option ? option.label : value;
    }
    
    if (column.field === 'image_url' && item[column.field]) {
      return (
        <img 
          src={item[column.field]} 
          alt="Product" 
          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          className="img-thumbnail"
        />
      );
    }
    
    if (column.field === 'description' || column.field === 'recipe') {
      const value = item[column.field];
      if (!value) return '';
      return value.length > 50 ? value.substring(0, 50) + '...' : value;
    }
    
    // Special handling for stock fields with color indicators
    if (column.field === 'current_stock' && (type === 'ingrediente' || (type === 'inventario' && (item.product_type === 'inventory' || item.type === 'inventory')))) {
      const currentStock = item.current_stock || 0;
      const minimumStock = item.minimum_stock || 0;
      const isLow = currentStock <= minimumStock;
      const isApproachingMinimum = currentStock > minimumStock && currentStock <= minimumStock * 1.2;
      
      let badgeClass = 'bg-success';
      let icon = null;
      let title = 'Stock normal';
      
      if (isLow) {
        badgeClass = 'bg-danger';
        icon = <i className="bi bi-exclamation-triangle ms-1" title="Stock bajo"></i>;
        title = 'Stock bajo - Por debajo del stock mínimo';
      } else if (isApproachingMinimum) {
        badgeClass = 'bg-warning';
        icon = <i className="bi bi-exclamation-circle ms-1" title="Stock próximo al mínimo"></i>;
        title = 'Stock próximo al mínimo - 20% sobre el stock mínimo';
      }
      
      return (
        <span className={`badge ${badgeClass}`} title={title}>
          {currentStock}
          {icon}
        </span>
      );
    }
    
    if (column.field === 'minimum_stock') {
      return (
        <span className="badge bg-info">
          {item.minimum_stock || 0}
        </span>
      );
    }
    
    if (column.field.includes('.')) {
      return column.field.split('.').reduce((obj, key) => obj?.[key], item);
    }
    
    return item[column.field];
  };

  // Function to determine if an item has low stock
  const isLowStock = (item: any) => {
    // Check if it's an ingredient or inventory item with stock information
    if (type === 'ingrediente' || (type === 'inventario' && (item.product_type === 'inventory' || item.type === 'inventory'))) {
      const currentStock = item.current_stock || 0;
      const minimumStock = item.minimum_stock || 0;
      return currentStock <= minimumStock;
    }
    return false;
  };

  // Function to determine if an item is approaching minimum stock (20% above minimum)
  const isApproachingMinimumStock = (item: any) => {
    // Check if it's an ingredient or inventory item with stock information
    if (type === 'ingrediente' || (type === 'inventario' && (item.product_type === 'inventory' || item.type === 'inventory'))) {
      const currentStock = item.current_stock || 0;
      const minimumStock = item.minimum_stock || 0;
      return currentStock > minimumStock && currentStock <= minimumStock * 1.2;
    }
    return false;
  };

  // Function to get row class based on stock status
  const getRowClasses = (item: any) => {
    let classes = '';
    if (isLowStock(item)) {
      classes += 'table-danger'; // Red background for critical low stock
    } else if (isApproachingMinimumStock(item)) {
      classes += 'table-warning'; // Yellow background for approaching minimum
    }
    return classes;
  };

  // Function to get the appropriate tooltip message
  const getRowTooltip = (item: any) => {
    if (isLowStock(item)) {
      return 'Stock bajo - Por debajo del stock mínimo';
    } else if (isApproachingMinimumStock(item)) {
      return 'Stock próximo al mínimo - 20% sobre el stock mínimo';
    }
    return '';
  };

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            {columns.filter(column => column.type !== 'password').map((column) => (
              <th key={column.field} style={{ width: column.width }}>
                {column.headerName}
              </th>
            ))}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={index}
              onClick={() => onView(item)}
              style={{ cursor: 'pointer' }}
              className={getRowClasses(item)}
              title={getRowTooltip(item)}
            >
              {columns.filter(column => column.type !== 'password').map((column) => (
                <td key={column.field}>
                  {renderCellValue(column, item)}
                </td>
              ))}
              <td>
                {((type === 'inventario' && (item.product_type === 'inventory' || item.type === 'inventory')) || type === 'ingrediente') && onAddStock && (
                  <button
                    className="btn btn-sm btn-outline-success me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddStock(item);
                    }}
                    title="Agregar Stock"
                  >
                    <i className="bi bi-box-arrow-in-down"></i>
                  </button>
                )}
                {type === 'client' && onViewOrders && (
                  <button
                    className="btn btn-sm btn-outline-info me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewOrders(item);
                    }}
                    title="Ver Pedidos"
                  >
                    <i className="bi bi-receipt"></i>
                  </button>
                )}
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item);
                  }}
                >
                  <i className="bi bi-pencil"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id_key);
                  }}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable; 