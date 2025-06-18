import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { authService } from '../../services/api';

const Cook = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: 'orders', label: 'Pedidos en Cocina', icon: 'bi-receipt' },
    { path: 'ingredients', label: 'Ingredientes', icon: 'bi-box-seam' },
    { 
      path: 'products/inventory',
      label: 'Productos',
      icon: 'bi-cart-fill',
      submenu: [
        { path: 'products/categories', label: 'Rubros' },
        { path: 'products/inventory', label: 'Inventario' }
      ]
    },
    { path: 'configuracion', label: 'Configuración', icon: 'bi-gear-fill' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const toggleSubmenu = (path: string) => {
    setExpandedMenu(expandedMenu === path ? null : path);
  };

  const getCurrentTitle = () => {
    const currentPath = location.pathname.split('/').pop();
    const currentItem = menuItems.find(item => item.path === currentPath || 
      (item.submenu && item.submenu.some(subItem => subItem.path === currentPath)));
    return currentItem ? currentItem.label : 'Cocinero';
  };

  const SidebarContent = () => (
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
                if (item.submenu) {
                  toggleSubmenu(item.path);
                } else {
                  handleNavigation(item.path);
                }
              }}
            >
              <div className="d-flex align-items-center">
                <i className={`bi ${item.icon} me-3 fs-5`}></i>
                <span className="fs-5">{item.label}</span>
              </div>
              {item.submenu && (
                <i className={`bi ${expandedMenu === item.path ? 'bi-chevron-up' : 'bi-chevron-down'} fs-6`}></i>
              )}
            </a>
            
            {/* Submenu */}
            {item.submenu && expandedMenu === item.path && (
              <div className="ms-4">
                {item.submenu.map((subItem) => (
                  <a
                    key={subItem.path}
                    href="#"
                    className={`list-group-item text-white border-0 py-2 px-2 d-flex align-items-center hover-highlight ${
                      location.pathname.includes(subItem.path) ? 'active' : ''
                    }`}
                    style={{backgroundColor: '#636363', fontSize: '0.9rem'}}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(subItem.path);
                    }}
                  >
                    <span className="ms-3">{subItem.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );

  return (
    <div className="container-fluid min-vh-100 d-flex flex-row p-0 min-vw-100" style={{ width: '100vw', height: '100vh' }}>
      {/* Desktop Sidebar */}
      <aside className="text-white d-flex flex-column justify-content-start align-items-start p-4 d-none d-lg-flex" style={{width: 250, backgroundColor: '#747474', minHeight: '100vh', flexShrink: 0}}>
        <SidebarContent />
      </aside>

      {/* Mobile Offcanvas Sidebar */}
      <div className={`offcanvas offcanvas-start text-white ${sidebarOpen ? 'show' : ''}`} 
           style={{backgroundColor: '#747474', visibility: sidebarOpen ? 'visible' : 'hidden'}} 
           tabIndex={-1} 
           id="sidebarOffcanvas">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title text-white">Menú</h5>
          <button type="button" className="btn-close btn-close-white" onClick={() => setSidebarOpen(false)}></button>
        </div>
        <div className="offcanvas-body p-0">
          <div className="d-flex flex-column h-100 p-3">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && <div className="offcanvas-backdrop fade show d-lg-none" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main content */}
      <main className="flex-grow-1 d-flex flex-column" style={{backgroundColor: '#f8f9fa', minHeight: '100vh'}}>
        <header className="bg-white p-3 border-bottom d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            {/* Mobile menu button */}
            <button 
              className="btn btn-outline-secondary d-lg-none me-3"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="bi bi-list"></i>
            </button>
            <h1 className="h4 mb-0 text-dark fw-bold">
              <i className="bi bi-person-badge me-2"></i>
               Cocinero
            </h1>
          </div>
          <button className="btn btn-link text-dark fs-2 me-3 p-0" style={{textDecoration: 'none'}} onClick={() => authService.logout()}>
            <i className="bi bi-box-arrow-right text-danger"></i>
          </button>
        </header>
        
        <div className="flex-grow-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Cook; 