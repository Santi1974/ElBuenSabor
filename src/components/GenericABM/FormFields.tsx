import React from 'react';
import type { ABMType } from '../../hooks/useABMData';
import PasswordField from '../PasswordField/PasswordField';

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
  onInputChange: (field: string, value: any) => void;
  type: ABMType;
  isEditing: boolean;
}

const FormFields: React.FC<FormFieldsProps> = ({
  columns,
  formData,
  onInputChange,
  type,
  isEditing
}) => {
  // Filter out createOnly fields when editing
  const filteredColumns = columns.filter(column => {
    if (isEditing && column.createOnly) {
      return false;
    }
    return true;
  });

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
          ) : column.type === 'password' ? (
            <PasswordField
              value={formData[column.field] || ''}
              onChange={(e) => onInputChange(column.field, e.target.value)}
              placeholder="Contraseña temporal que el empleado deberá cambiar"
              required={true}
              showValidation={type === 'employee' && !isEditing}
            />
          ) : (
            <input
              type={column.type || 'text'}
              className="form-control"
              value={formData[column.field] || ''}
              onChange={(e) =>
                onInputChange(column.field, e.target.value)
              }
            />
          )}
        </div>
      ))}
    </>
  );
};

export default FormFields; 