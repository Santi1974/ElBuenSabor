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

interface FormFieldsProps {
  columns: Column[];
  formData: any;
  type: ABMType;
  onInputChange: (field: string, value: any) => void;
  selectedItem?: any;
}

const FormFields: React.FC<FormFieldsProps> = ({
  columns,
  formData,
  type,
  onInputChange,
  selectedItem
}) => {
  const filteredColumns = columns.filter(column => 
    column.field !== 'category.name' && 
    column.field !== 'parent_category_name' &&
    column.field !== 'measurement_unit.name' &&
    column.field !== 'type_label' &&
    // Solo mostrar campos marcados como createOnly si estamos creando (no editando)
    (!column.createOnly || !selectedItem) &&
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

  return (
    <>
      {filteredColumns.map((column) => (
        <div className="mb-3" key={column.field}>
          <label className="form-label">{column.headerName}</label>
          {column.type === 'select' ? (
            <select
              className="form-select"
              value={formData[column.field]?.toString() || ''}
              onChange={(e) => {
                const isBooleanField = column.options?.some(opt => opt.value === 'true' || opt.value === 'false');
                if (isBooleanField) {
                  onInputChange(column.field, e.target.value === 'true');
                } else {
                  onInputChange(column.field, e.target.value);
                }
              }}
            >
              <option value="">Seleccione...</option>
              {column.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={column.type === 'password' ? 'password' : column.type || 'text'}
              className="form-control"
              value={formData[column.field] || ''}
              onChange={(e) =>
                onInputChange(column.field, e.target.value)
              }
              placeholder={column.type === 'password' ? 'Contraseña temporal que el empleado deberá cambiar' : ''}
              required={column.type === 'password'}
            />
          )}
        </div>
      ))}
    </>
  );
};

export default FormFields; 