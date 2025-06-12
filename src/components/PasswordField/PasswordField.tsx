import React, { useState } from 'react';

interface PasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
  showValidation?: boolean;
}

interface PasswordRequirement {
  label: string;
  isValid: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  value,
  onChange,
  placeholder = '',
  required = false,
  className = 'form-control',
  name,
  id,
  showValidation = false
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Password validation logic
  const validatePassword = (password: string): PasswordRequirement[] => {
    return [
      {
        label: 'Mínimo 8 caracteres',
        isValid: password.length >= 8
      },
      {
        label: 'Al menos una letra mayúscula',
        isValid: /[A-Z]/.test(password)
      },
      {
        label: 'Al menos una letra minúscula',
        isValid: /[a-z]/.test(password)
      },
      {
        label: 'Al menos un símbolo o número',
        isValid: /[^A-Za-z]/.test(password)
      }
    ];
  };

  const requirements = validatePassword(value);
  const isPasswordValid = requirements.every(req => req.isValid);

  // Determine input border color based on validation
  const getInputClasses = () => {
    if (!showValidation || !value) return className;
    return `${className} ${isPasswordValid ? 'is-valid' : 'is-invalid'}`;
  };

  return (
    <div>
      <div className="position-relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={getInputClasses()}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          name={name}
          id={id}
        />
        <button
          type="button"
          className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3"
          onClick={togglePasswordVisibility}
          style={{
            border: 'none',
            background: 'none',
            color: '#6c757d',
            zIndex: 5
          }}
          tabIndex={-1}
        >
          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
        </button>
      </div>

      {/* Password requirements display */}
      {showValidation && value && (
        <div className="mt-2">
          <div className="small text-muted mb-2">Requisitos de contraseña:</div>
          {requirements.map((requirement, index) => (
            <div key={index} className="small d-flex align-items-center mb-1">
              <i
                className={`bi ${requirement.isValid ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}
              ></i>
              <span className={requirement.isValid ? 'text-success' : 'text-danger'}>
                {requirement.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordField; 