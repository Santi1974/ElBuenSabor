import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import reportService from '../../../services/reportService';
import type { TopProduct, TopCustomer, ReportParams } from '../../../services/reportService';

const Rankings: React.FC = () => {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'customers'>('products');
  const limit = 10;

  useEffect(() => {
    loadData();
  }, []);

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
    setTimeout(() => loadData(), 100);
  };

  const getMedalStyle = (position: number) => {
    switch (position) {
      case 1:
        return {
          color: '#FFD700',
          icon: 'bi-award-fill',
          textColor: '#B8860B'
        };
      case 2:
        return {
          color: '#C0C0C0',
          icon: 'bi-award-fill',
          textColor: '#A8A8A8'
        };
      case 3:
        return {
          color: '#CD7F32',
          icon: 'bi-award-fill',
          textColor: '#B5651D'
        };
      default:
        return {
          color: '#6c757d',
          icon: 'bi-circle-fill',
          textColor: '#6c757d'
        };
    }
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
            <div className="col-md-6 d-flex align-items-end gap-2">
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