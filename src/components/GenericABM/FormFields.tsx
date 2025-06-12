import React, { useState } from 'react';
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
  onPasswordConfirmChange?: (value: string) => void;
  passwordError?: string;
}

const FormFields: React.FC<FormFieldsProps> = ({
  columns,
  formData,
  onInputChange,
  type,
  isEditing,
  onPasswordConfirmChange,
  passwordError: externalPasswordError
}) => {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [internalPasswordError, setInternalPasswordError] = useState('');

  // Filter out createOnly fields when editing
  const filteredColumns = columns.filter(column => {
    if (isEditing && column.createOnly) {
      return false;
    }
    return true;
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    onInputChange('password', newPassword);
    
    // Verificar coincidencia de contraseñas
    if (confirmPassword && newPassword !== confirmPassword) {
      setInternalPasswordError('Las contraseñas no coinciden');
    } else {
      setInternalPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    
    // Verificar coincidencia de contraseñas
    if (formData.password && newConfirmPassword !== formData.password) {
      setInternalPasswordError('Las contraseñas no coinciden');
    } else {
      setInternalPasswordError('');
    }

    // Notificar al componente padre
    if (onPasswordConfirmChange) {
      onPasswordConfirmChange(newConfirmPassword);
    }
  };

  // Usar el error externo si está disponible, sino usar el interno
  const displayPasswordError = externalPasswordError || internalPasswordError;

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
            <>
              <PasswordField
                value={formData[column.field] || ''}
                onChange={handlePasswordChange}
                placeholder="Contraseña temporal que el empleado deberá cambiar"
                required={true}
                showValidation={type === 'employee' && !isEditing}
              />
              {type === 'employee' && !isEditing && (
                <div className="mt-3">
                  <label className="form-label">Confirmar Contraseña</label>
                  <PasswordField
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Repetir contraseña"
                    required={true}
                  />
                  {displayPasswordError && (
                    <div className="text-danger mt-1 small">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {displayPasswordError}
                    </div>
                  )}
                </div>
              )}
            </>
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