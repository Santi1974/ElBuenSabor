import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { authService } from '../../services/api';

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const menuItems = [
    { path: 'employees', label: 'Empleados', icon: 'bi-people-fill' },
    { path: 'clients', label: 'Clientes', icon: 'bi-person-badge-fill' },
    { path: 'invoices', label: 'Facturas', icon: 'bi-receipt' },
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

    { path: 'rankings', label: 'Rankings', icon: 'bi-graph-up' },
    { path: 'movements', label: 'Movimientos', icon: 'bi-arrow-left-right' },
    { path: 'promotions', label: 'Promociones', icon: 'bi-tag-fill' },
    { path: 'settings', label: 'Configuración', icon: 'bi-gear-fill' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const toggleSubmenu = (path: string) => {
    setExpandedMenu(expandedMenu === path ? null : path);
  };

  const getCurrentTitle = () => {
    const currentPath = location.pathname.split('/').pop();
    const currentItem = menuItems.find(item => item.path === currentPath || 
      (item.submenu && item.submenu.some(subItem => subItem.path === currentPath)));
    return currentItem ? currentItem.label : 'Administración';
  };

  return (
    <div className="container-fluid min-vh-100 min-vw-100 d-flex flex-row p-0">
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
                    <i className={`bi ${expandedMenu === item.path ? 'bi-chevron-up' : 'bi-chevron-down'} fs-5`}></i>
                  )}
                </a>
                {item.submenu && expandedMenu === item.path && (
                  <div className="submenu" style={{marginLeft: '2rem'}}>
                    {item.submenu.map((subItem) => (
                      <a
                        key={subItem.path}
                        href="#"
                        className={`list-group-item text-white border-0 py-2 px-2 d-flex align-items-center hover-highlight ${
                          location.pathname.includes(subItem.path) ? 'active' : ''
                        }`}
                        style={{backgroundColor: '#747474'}}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation(subItem.path);
                        }}
                      >
                        <span className="fs-6">{subItem.label}</span>
                      </a>
                    ))}
                  </div>
                )}
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
             Administrador
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
        .submenu {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default Admin; 