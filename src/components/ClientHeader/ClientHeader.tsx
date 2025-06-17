import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartPreview from '../CartPreview/CartPreview';
import UserProfile from '../UserProfile';
import { useAuth } from '../../hooks/useAuth';
import './ClientHeader.css';

interface ClientHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showSearchBar?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  backButtonPath?: string;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({
  title = "El Buen Sabor",
  showBackButton = true,
  showSearchBar = true,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
  backButtonPath
}) => {
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  const handleGoBack = () => {
    if (backButtonPath) {
      navigate(backButtonPath);
    } else {
      navigate(-1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="client-header sticky-top shadow-sm">
      <nav className="navbar navbar-expand-lg py-3">
        <div className="container-fluid">
          {/* Left Section */}
          <div className="d-flex align-items-center">
            {showBackButton && (
              <button 
                onClick={handleGoBack} 
                className="btn btn-link text-white text-decoration-none p-2 me-3 border-0"
              >
                <i className="bi bi-arrow-left fs-5 me-2"></i>
                <span className="d-none d-md-inline">Volver</span>
              </button>
            )}
            <h1 className="navbar-brand h4 mb-0 text-white fw-bold">{title}</h1>
          </div>

          {/* Center Section - Search Bar (Desktop and Medium screens) */}
          {showSearchBar && (
            <div className="d-none d-md-flex flex-grow-1 justify-content-center px-3 px-lg-4">
              <div className="position-relative w-100" style={{ maxWidth: '450px' }}>
                <input
                  type="text"
                  className="form-control border-0 rounded-pill bg-white bg-opacity-95 pe-5 search-input"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={handleSearchChange}
                  style={{ 
                    fontSize: '0.95rem',
                    padding: '0.75rem 1.25rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                />
                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y pe-3 text-muted"></i>
              </div>
            </div>
          )}

          {/* Right Section */}
          <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Mobile Search Toggle */}
            {showSearchBar && (
              <button 
                className="btn btn-link text-white text-decoration-none p-2 d-md-none border-0 mobile-search-toggle"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                style={{
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className={`bi ${mobileSearchOpen ? 'bi-x' : 'bi-search'} fs-5`}></i>
              </button>
            )}
            
            {/* Solo mostrar carrito si está autenticado */}
            {isAuthenticated && <CartPreview />}
            
            {/* User Menu o Auth Buttons */}
            {isAuthenticated ? (
              <div ref={profileRef} className="dropdown">
                <button
                  className="btn btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  type="button"
                  id="userMenuButton"
                  aria-expanded={userMenuOpen}
                >
                  <i className="bi bi-person fs-5"></i>
                </button>
                {userMenuOpen && (
                  <ul className="dropdown-menu dropdown-menu-end show position-absolute shadow border-0 rounded-3" 
                      style={{ 
                        right: '0',
                        left: 'auto',
                        top: '100%',
                        marginTop: '0.5rem',
                        minWidth: '220px',
                        transform: 'translateX(-10px)'
                      }}>
                    {/* User Info Header */}
                    <li className="px-3 py-2 bg-light border-bottom">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-person-circle fs-4 text-primary me-2"></i>
                        <div className="flex-grow-1">
                          <div className="text-muted">{user?.email || ''}</div>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center py-2 px-3"
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/profile');
                        }}
                      >
                        <i className="bi bi-person-gear me-2 text-info"></i>
                        Configuración
                      </button>
                    </li>
                    <li><hr className="dropdown-divider my-1" /></li>
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center py-2 px-3"
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/orders');
                        }}
                      >
                        <i className="bi bi-bag me-2 text-success"></i>
                        Mis Pedidos
                      </button>
                    </li>
                    <li><hr className="dropdown-divider my-1" /></li>
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center py-2 px-3 text-danger"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              /* Botones de Login/Registro para usuarios no autenticados */
              <div className="d-flex gap-2">
                <button
                  className="btn btn-light btn-sm px-3"
                  onClick={() => navigate('/login')}
                  style={{ 
                    backgroundColor: 'white',
                    color: '#D87D4D',
                    border: '1px solid white',
                    fontWeight: '600'
                  }}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Iniciar Sesión
                </button>
                <button
                  className="btn btn-outline-light btn-sm px-3 btn-login"
                  onClick={() => navigate('/register')}
                  style={{ 
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: '600',
                  }}
                >
                  <i className="bi bi-person-plus me-1"></i>
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {showSearchBar && mobileSearchOpen && (
          <div className="d-md-none mt-3 mobile-search-container">
            <div className="container-fluid px-3">
              <div className="row">
                <div className="col">
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control border-0 rounded-pill bg-white bg-opacity-95 pe-5 mobile-search-input"
                      placeholder={searchPlaceholder}
                      value={searchValue}
                      onChange={handleSearchChange}
                      style={{ 
                        fontSize: '16px', /* Evita zoom en iOS */
                        padding: '0.875rem 1.25rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s ease'
                      }}
                      autoFocus
                    />
                    <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y pe-3 text-muted"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* User Profile Modal */}
      {isAuthenticated && (
        <UserProfile 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </header>
  );
};

export default ClientHeader; 