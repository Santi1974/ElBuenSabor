import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../../services/api';
import googleIcon from '../../../assets/google-icon.svg';
import PasswordField from '../../../components/PasswordField/PasswordField';
import { handleError } from '../../../utils/errorHandler';

const placeholderImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    role: 'cliente',
    active: true
  });
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Verificar coincidencia de contraseñas en tiempo real
    if (name === 'password' || name === 'confirmPassword') {
      const otherField = name === 'password' ? formData.confirmPassword : formData.password;
      if (value && otherField && value !== otherField) {
        setPasswordError('Las contraseñas no coinciden');
      } else {
        setPasswordError('');
      }
    }
  };

  // Password validation function
  const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSymbolOrNumber = /[^A-Za-z]/.test(password);
    
    return minLength && hasUppercase && hasLowercase && hasSymbolOrNumber;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password before submission
    if (!validatePassword(formData.password)) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      await authService.register(registrationData);
      // Redirigir basándose en el rol del usuario
      const user = authService.getCurrentUser();
      if (user?.role === 'administrador') {
        navigate('/admin');
      } else if (user?.role === 'delivery') {
        navigate('/delivery');
      } else if (user?.role === 'cajero') {
        navigate('/cashier');
      } else if (user?.role === 'cocinero') {
        navigate('/cook');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(handleError(err, 'register'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await authService.loginWithGoogle();
    } catch (err: any) {
      setError(handleError(err, 'Google register'));
    }
  };

  return (
    <div className="container-fluid vh-100 overflow-auto">
      <div className="row h-100">
        {/* Left side - Image */}
        <div className="col-md-6 d-none d-md-block p-0">
          <img 
            src={placeholderImage} 
            alt="El Buen Sabor dishes" 
            className="img-fluid h-100 w-100 object-fit-cover"
          />
        </div>

        {/* Right side - Register Form */}
        <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
          <div className="w-75">
            <h1 className="text-center mb-4">Crear Cuenta</h1>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <button 
                className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={handleGoogleRegister}
                type="button"
                disabled={isLoading}
              >
                <img src={googleIcon} alt="Google" width="24" height="24" />
                <span>Registrarse con Google</span>
              </button>

              <div className="text-center my-3 position-relative">
                <hr className="position-absolute w-100 top-50 start-0" style={{ zIndex: 1 }} />
                <span className="bg-white px-3 position-relative" style={{ zIndex: 2 }}>o</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  name="full_name"
                  placeholder="Nombre completo"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mb-3">
                <input
                  type="tel"
                  className="form-control"
                  name="phone_number"
                  placeholder="Teléfono"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="mb-3">
                <PasswordField
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  required={true}
                  name="password"
                  className={`form-control ${isLoading ? 'disabled' : ''}`}
                  showValidation={true}
                />
              </div>

              <div className="mb-4">
                <PasswordField
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmar contraseña"
                  required={true}
                  name="confirmPassword"
                  className={`form-control ${isLoading ? 'disabled' : ''}`}
                  showValidation={false}
                />
                {passwordError && (
                  <div className="text-danger mt-1 small">
                    {passwordError}
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={isLoading}
              >
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
            
            <p className="text-center mt-4">
              ¿Ya tienes cuenta? <Link to="/login" className="text-decoration-none">Iniciar Sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 