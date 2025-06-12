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
  type?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  onAddStock,
  type
}) => {
  const renderCellValue = (column: Column, item: any) => {
    if (column.type === 'password') {
      return '••••••••';
    }
    
    if (column.type === 'select' && column.field === 'active') {
      return item[column.field] ? 'Sí' : 'No';
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
    
    if (column.field.includes('.')) {
      return column.field.split('.').reduce((obj, key) => obj?.[key], item);
    }
    
    return item[column.field];
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
            >
              {columns.filter(column => column.type !== 'password').map((column) => (
                <td key={column.field}>
                  {renderCellValue(column, item)}
                </td>
              ))}
              <td>
                {((type === 'inventario' && item.product_type === 'inventory') || type === 'ingrediente') && onAddStock && (
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