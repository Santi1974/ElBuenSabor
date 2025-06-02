import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import reportService from '../../../services/reportService';
import type { TopProduct, TopCustomer, ReportParams } from '../../../services/reportService';

const Rankings: React.FC = () => {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState<'products' | 'customers'>('products');

  useEffect(() => {
    // Load mock data by default for testing
    // TODO: Replace with loadData() when real API data is available
    loadMockData();
  }, [limit]); // Reload when limit changes

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: ReportParams = {
        limit,
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      };

      const [productsData, customersData] = await Promise.all([
        reportService.getTopProducts(params),
        reportService.getTopCustomers(params)
      ]);

      setTopProducts(productsData);
      setTopCustomers(customersData);
    } catch (err) {
      setError('Error al cargar los datos de ranking');
      console.error('Error loading ranking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    loadData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setLimit(10);
    // Reload data after clearing filters
    setTimeout(() => loadData(), 100);
  };

  // Helper function to get medal style and icon
  const getMedalStyle = (position: number) => {
    switch (position) {
      case 1:
        return {
          color: '#FFD700', // Gold
          icon: 'bi-award-fill',
          textColor: '#B8860B' // Darker gold for text
        };
      case 2:
        return {
          color: '#C0C0C0', // Silver
          icon: 'bi-award-fill',
          textColor: '#A8A8A8' // Darker silver for text
        };
      case 3:
        return {
          color: '#CD7F32', // Bronze
          icon: 'bi-award-fill',
          textColor: '#B5651D' // Darker bronze for text
        };
      default:
        return {
          color: '#6c757d',
          icon: 'bi-circle-fill',
          textColor: '#6c757d'
        };
    }
  };

  // Mock data for testing
  const loadMockData = () => {
    const mockProducts: TopProduct[] = [
      {
        id: 1,
        name: "Pizza Margherita",
        quantity: 45,
        revenue: 22500,
        category: "Pizzas"
      },
      {
        id: 2,
        name: "Hamburguesa Clásica",
        quantity: 38,
        revenue: 19000,
        category: "Hamburguesas"
      },
      {
        id: 3,
        name: "Pasta Carbonara",
        quantity: 32,
        revenue: 16000,
        category: "Pastas"
      },
      {
        id: 4,
        name: "Empanadas de Carne",
        quantity: 67,
        revenue: 13400,
        category: "Empanadas"
      },
      {
        id: 5,
        name: "Pizza Pepperoni",
        quantity: 25,
        revenue: 12500,
        category: "Pizzas"
      },
      {
        id: 6,
        name: "Milanesa Napolitana",
        quantity: 22,
        revenue: 11000,
        category: "Carnes"
      },
      {
        id: 7,
        name: "Ensalada César",
        quantity: 28,
        revenue: 8400,
        category: "Ensaladas"
      },
      {
        id: 8,
        name: "Lomito Completo",
        quantity: 15,
        revenue: 7500,
        category: "Sandwiches"
      }
    ];

    const mockCustomers: TopCustomer[] = [
      {
        id: 93,
        name: "Juan Carlos Pérez",
        email: "juan.perez@example.com",
        order_count: 12,
        total_amount: 35600
      },
      {
        id: 98,
        name: "María González",
        email: "maria.gonzalez@example.com",
        order_count: 10,
        total_amount: 28900
      },
      {
        id: 45,
        name: "Carlos Rodríguez",
        email: "carlos.rodriguez@example.com",
        order_count: 8,
        total_amount: 24500
      },
      {
        id: 67,
        name: "Ana Martínez",
        email: "ana.martinez@example.com",
        order_count: 9,
        total_amount: 21800
      },
      {
        id: 123,
        name: "Luis Fernández",
        email: "luis.fernandez@example.com",
        order_count: 7,
        total_amount: 19200
      },
      {
        id: 89,
        name: "Patricia López",
        email: "patricia.lopez@example.com",
        order_count: 6,
        total_amount: 16500
      },
      {
        id: 156,
        name: "Roberto Silva",
        email: "roberto.silva@example.com",
        order_count: 5,
        total_amount: 14300
      },
      {
        id: 78,
        name: "Carmen Ruiz",
        email: "carmen.ruiz@example.com",
        order_count: 4,
        total_amount: 12100
      }
    ];

    // Apply limit to mock data
    setTopProducts(mockProducts.slice(0, limit));
    setTopCustomers(mockCustomers.slice(0, limit));
    setError(null);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-graph-up me-2"></i>
          Rankings y Reportes
        </h2>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-funnel me-2"></i>
            Filtros
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Fecha Inicio</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Fecha Fin</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Límite</label>
              <select
                className="form-select"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end gap-2">
              <button
                className="btn btn-primary"
                onClick={handleFilterChange}
                disabled={loading}
              >
                <i className="bi bi-search me-2"></i>
                {loading ? 'Cargando...' : 'Aplicar Filtros'}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={clearFilters}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Limpiar
              </button>
              <button
                className="btn btn-outline-info"
                onClick={loadMockData}
                disabled={loading}
                title="Cargar datos de prueba"
              >
                <i className="bi bi-database me-2"></i>
                Mock Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
            type="button"
          >
            <i className="bi bi-box-seam me-2"></i>
            Top Productos
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
            type="button"
          >
            <i className="bi bi-people me-2"></i>
            Top Clientes
          </button>
        </li>
      </ul>

      {/* Content */}
      <div className="tab-content">
        {activeTab === 'products' && (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-trophy me-2"></i>
                Top {limit} Productos Más Vendidos
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : topProducts.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox display-1"></i>
                  <p className="mt-2">No hay datos de productos para mostrar</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Cantidad Vendida</th>
                        <th>Ingresos Totales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, index) => {
                        const position = index + 1;
                        const medalStyle = getMedalStyle(position);
                        return (
                          <tr key={product.id} className={position <= 3 ? 'table-warning' : ''}>
                            <td>
                              <div className="d-flex align-items-center">
                                <i 
                                  className={`${medalStyle.icon} me-2 fs-4`}
                                  style={{ color: medalStyle.color }}
                                ></i>
                                <span 
                                  className="fw-bold fs-5"
                                  style={{ color: medalStyle.textColor }}
                                >
                                  {position}
                                </span>
                              </div>
                            </td>
                            <td>
                              <strong className={position <= 3 ? 'text-dark' : ''}>
                                {product.name}
                              </strong>
                            </td>
                            <td>
                              <span className="badge bg-primary">{product.category}</span>
                            </td>
                            <td>
                              <span className="badge bg-success fs-6">
                                {product.quantity}
                              </span>
                            </td>
                            <td>
                              <strong className="text-success fs-6">
                                {formatCurrency(product.revenue)}
                              </strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-star me-2"></i>
                Top {limit} Mejores Clientes
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : topCustomers.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox display-1"></i>
                  <p className="mt-2">No hay datos de clientes para mostrar</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Cliente</th>
                        <th>Email</th>
                        <th>Total Pedidos</th>
                        <th>Total Gastado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCustomers.map((customer, index) => {
                        const position = index + 1;
                        const medalStyle = getMedalStyle(position);
                        return (
                          <tr key={customer.id} className={position <= 3 ? 'table-warning' : ''}>
                            <td>
                              <div className="d-flex align-items-center">
                                <i 
                                  className={`${medalStyle.icon} me-2 fs-4`}
                                  style={{ color: medalStyle.color }}
                                ></i>
                                <span 
                                  className="fw-bold fs-5"
                                  style={{ color: medalStyle.textColor }}
                                >
                                  {position}
                                </span>
                              </div>
                            </td>
                            <td>
                              <strong className={position <= 3 ? 'text-dark' : ''}>
                                {customer.name}
                              </strong>
                            </td>
                            <td>
                              <small className="text-muted">{customer.email}</small>
                            </td>
                            <td>
                              <span className="badge bg-info fs-6">
                                {customer.order_count}
                              </span>
                            </td>
                            <td>
                              <strong className="text-success fs-6">
                                {formatCurrency(customer.total_amount)}
                              </strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rankings; 