import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import googleIcon from '../../assets/google-icon.svg';
import ChangePasswordModal from '../../components/ChangePasswordModal/ChangePasswordModal';
import PasswordField from '../../components/PasswordField/PasswordField';

// Note: You will need to add a real food image to replace this
const placeholderImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingGoogle, setIsProcessingGoogle] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Check if there's a token in the URL (Google OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('access_token');
      
      if (token && token.trim() !== '') {
        setIsProcessingGoogle(true);
        setError('');
        
        try {
          // Check for token in URL when component mounts
          const hasToken = await authService.checkForTokenInURL();
          if (hasToken) {
            // Pequeña pausa para asegurar que el token se procese correctamente
            setTimeout(() => {
              // Redirigir basándose en el rol del usuario
              const user = authService.getCurrentUser();
              if (user?.role === 'administrador') {
                navigate('/admin', { replace: true });
              } else if (user?.role === 'delivery') {
                navigate('/delivery', { replace: true });
              } else if (user?.role === 'cajero') {
                navigate('/cashier', { replace: true });
              } else if (user?.role === 'cocinero') {
                navigate('/cook', { replace: true });
              } else {
                navigate('/', { replace: true });
              }
            }, 100);
          } else {
            setError('Token de Google inválido. Por favor, intente nuevamente.');
            setIsProcessingGoogle(false);
          }
        } catch (error) {
          setError('Error al procesar el inicio de sesión con Google. Por favor, intente nuevamente.');
          setIsProcessingGoogle(false);
        }
      }
    };

    handleGoogleCallback();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      // Verificar si es el primer login
      if (response.first_login) {
        setShowPasswordModal(true);
      } else {
        // Redirigir basándose en el rol del usuario
        const user = authService.getCurrentUser();
        if (user?.role === 'administrador') {
          navigate('/admin', { replace: true });
        } else if (user?.role === 'delivery') {
          navigate('/delivery', { replace: true });
        } else if (user?.role === 'cajero') {
          navigate('/cashier', { replace: true });
        } else if (user?.role === 'cocinero') {
          navigate('/cook', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.loginWithGoogle();
    } catch (err: any) {
      setError('Error al iniciar sesión con Google. Por favor, intente nuevamente.');
    }
  };

  const handlePasswordChanged = () => {
    setShowPasswordModal(false);
    // Redirigir basándose en el rol del usuario
    const user = authService.getCurrentUser();
    if (user?.role === 'administrador') {
      navigate('/admin', { replace: true });
    } else if (user?.role === 'delivery') {
      navigate('/delivery', { replace: true });
    } else if (user?.role === 'cajero') {
      navigate('/cashier', { replace: true });
    } else if (user?.role === 'cocinero') {
      navigate('/cook', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  if (showPasswordModal) {
    return <ChangePasswordModal onPasswordChanged={handlePasswordChanged} />;
  }

  if (isProcessingGoogle) {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5>Procesando inicio de sesión con Google...</h5>
          <p className="text-muted">Por favor, espere un momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Left side - Image */}
        <div className="col-md-6 d-none d-md-block p-0">
          <img 
            src={placeholderImage} 
            alt="El Buen Sabor dishes" 
            className="img-fluid h-100 w-100 object-fit-cover"
          />
      </div>
      
        {/* Right side - Login Form */}
        <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
          <div className="w-75">
            <h1 className="text-center mb-4">Iniciar Sesión</h1>
          
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
          
            <div className="mb-4">
            <button 
                className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleGoogleLogin}
              type="button"
              disabled={isLoading || isProcessingGoogle}
            >
                <img src={googleIcon} alt="Google" width="24" height="24" />
              <span>Continuar con Google</span>
            </button>

              <div className="text-center my-3">
                <span className="bg-white px-3 text-muted">o</span>
              </div>
          </div>
          
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
              <input
                type="email"
                  className="form-control"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isProcessingGoogle}
                autoComplete="email"
              />
            </div>
            
              <div className="mb-4">
              <PasswordField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required={true}
                className={`form-control ${isLoading || isProcessingGoogle ? 'disabled' : ''}`}
              />
            </div>
            
              <button 
              type="submit" 
                className="btn btn-primary w-100"
              disabled={isLoading || isProcessingGoogle}
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
          </form>
          
            <p className="text-center mt-4">
              ¿No tienes cuenta? <Link to="/register" className="text-decoration-none">Regístrate</Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 