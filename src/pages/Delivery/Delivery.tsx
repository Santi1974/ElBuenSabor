import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { authService } from '../../services/api';

const Delivery = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: 'pedidos', label: 'Pedidos', icon: 'bi-truck' },
    { path: 'configuracion', label: 'Configuración', icon: 'bi-gear-fill' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const getCurrentTitle = () => {
    const currentPath = location.pathname.split('/').pop();
    const currentItem = menuItems.find(item => item.path === currentPath);
    return currentItem ? currentItem.label : 'Delivery';
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-row p-0">
      {/* Sidebar */}
      <aside className="text-white d-flex flex-column justify-content-start align-items-start p-4" style={{width: 250, backgroundColor: '#747474'}}>
        <nav className="w-100">
          <div className="list-group list-group-flush">
            {menuItems.map((item) => (
              <div key={item.path}>
                <a
                  href="#"
                  className={`list-group-item text-white border-0 py-3 px-2 d-flex align-items-center justify-content-between hover-highlight ${
                    location.pathname.includes(item.path) ? 'active' : ''
                  }`}
                  style={{backgroundColor: '#747474'}}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.path);
                  }}
                >
                  <div className="d-flex align-items-center">
                    <i className={`bi ${item.icon} me-3 fs-5`}></i>
                    <span className="fs-5">{item.label}</span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header */}
          <header className="bg-white p-3 border-bottom d-flex align-items-center justify-content-between">
            <h1 className="h4 mb-0 text-dark fw-bold">
              <i className="bi bi-person-badge me-2"></i>
              Delivery
            </h1>
            <button className="btn btn-link text-dark fs-2 me-3 p-0" style={{textDecoration: 'none'}} onClick={() => authService.logout()}>
              <i className="bi bi-box-arrow-right text-danger"></i>
            </button>
        </header>
        {/* Content */}
        <main className="flex-grow-1 d-flex flex-column w-100 h-100 bg-light overflow-auto">
          <Outlet />
        </main>
      </div>
      <style>{`
        .hover-highlight:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .active {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default Delivery; 