import React, { useState } from 'react';

interface PasswordFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  value,
  onChange,
  placeholder = '',
  required = false,
  className = 'form-control',
  name,
  id
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="position-relative">
      <input
        type={showPassword ? 'text' : 'password'}
        className={className}
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
  );
};

export default PasswordField; 