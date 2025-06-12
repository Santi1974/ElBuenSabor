import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { authService } from '../../services/api';

const Cashier = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: 'orders', label: 'Pedidos', icon: 'bi-receipt' },
    { path: 'settings', label: 'Configuración', icon: 'bi-gear-fill' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const getCurrentTitle = () => {
    const currentPath = location.pathname.split('/').pop();
    const currentItem = menuItems.find(item => item.path === currentPath);
    return currentItem ? currentItem.label : 'Cajero';
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-row p-0" style={{ width: '100vw', height: '100vh' }}>
      {/* Sidebar */}
      <aside className="text-white d-flex flex-column justify-content-start align-items-start p-4" style={{width: 250, backgroundColor: '#747474', minHeight: '100vh', flexShrink: 0}}>
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
      <div className="flex-grow-1 d-flex flex-column" style={{ width: 'calc(100vw - 250px)', height: '100vh' }}>
        {/* Header */}
        <header className="d-flex align-items-center bg-white px-5" style={{height: 90, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flexShrink: 0}}>
          <button 
            className="btn btn-link text-dark fs-2 me-3 p-0" 
            style={{textDecoration: 'none'}}
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left"></i>
          </button>
          <span className="fs-2 fw-bold flex-grow-1 text-dark">{getCurrentTitle()}</span>
          <div className="d-flex align-items-center">
            <button className="btn btn-link text-dark fs-2 me-3 p-0" style={{textDecoration: 'none'}} onClick={() => authService.logout()}>
              <i className="bi bi-box-arrow-right text-danger"></i>
            </button>
          </div>
        </header>
        {/* Content */}
        <main className="flex-grow-1 d-flex flex-column w-100 h-100 bg-light overflow-auto" style={{ height: 'calc(100vh - 90px)' }}>
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

export default Cashier; 