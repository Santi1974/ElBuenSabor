import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import googleIcon from '../../assets/google-icon.svg';

// Note: You will need to add a real food image to replace this
const placeholderImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for token in URL when component mounts
    if (authService.checkForTokenInURL()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login({ email, password });
      navigate('/', { replace: true });
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
              disabled={isLoading}
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
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            
              <div className="mb-4">
              <input
                type="password"
                  className="form-control"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            
              <button 
              type="submit" 
                className="btn btn-primary w-100"
              disabled={isLoading}
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