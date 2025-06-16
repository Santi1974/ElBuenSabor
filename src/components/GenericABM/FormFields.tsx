import React, { useState, useEffect } from 'react';
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
  onValidationChange?: (isValid: boolean) => void;
}

const FormFields: React.FC<FormFieldsProps> = ({
  columns,
  formData,
  onInputChange,
  type,
  isEditing,
  onValidationChange
}) => {
  const [passwordError, setPasswordError] = useState('');

  // Filter out createOnly fields when editing
  const filteredColumns = columns.filter(column => {
    if (isEditing && column.createOnly) {
      return false;
    }
    return true;
  });

  // Check password confirmation for employees
  useEffect(() => {
    if (type === 'employee' && !isEditing) {
      const password = formData.password;
      const confirmPassword = formData.confirmPassword;
      
      if (password && confirmPassword && password !== confirmPassword) {
        setPasswordError('Las contraseñas no coinciden');
        onValidationChange?.(false);
      } else if (password && confirmPassword && password === confirmPassword) {
        setPasswordError('');
        onValidationChange?.(true);
      } else {
        // When passwords are empty or only one is filled, don't validate yet
        setPasswordError('');
        onValidationChange?.(true);
      }
    }
  }, [formData.password, formData.confirmPassword, type, isEditing, onValidationChange]);

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
            <div>
              <PasswordField
                value={formData[column.field] || ''}
                onChange={(e) => onInputChange(column.field, e.target.value)}
                placeholder={column.field === 'confirmPassword' ? 'Repita la contraseña inicial' : 'Contraseña temporal que el empleado deberá cambiar'}
                required={true}
                showValidation={type === 'employee' && !isEditing && column.field === 'password'}
              />
              {/* Show password mismatch error for confirmPassword field */}
              {column.field === 'confirmPassword' && passwordError && (
                <div className="invalid-feedback d-block">
                  {passwordError}
                </div>
              )}
            </div>
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