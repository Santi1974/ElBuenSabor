import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import reportService from '../../../services/reportService';
import type { ReportParams } from '../../../services/reportService';

// Interfaces para los datos reales que llegan del API
interface RealTopProduct {
  id: number;
  name: string;
  quantity: number;
  revenue: number;
  category: string;
  type: string;
}

interface RealTopCustomer {
  id: number;
  name: string;
  email: string;
  order_count: number;
  total_amount: number;
}

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Rankings: React.FC = () => {
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'customers'>('products');
  const [viewMode, setViewMode] = useState<'table' | 'charts'>('table');
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

  // Datos para gráficos de productos
  const getProductChartData = () => {
    // Filtrar productos válidos y tomar solo los primeros 8
    const validProducts = topProducts.filter(p => p && p.name);
    const topProductsSlice = validProducts.slice(0, 8);
    
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];

    return {
      barData: {
        labels: topProductsSlice.map(p => {
          const name = p.name || 'Producto sin nombre';
          return name.length > 15 ? name.substring(0, 15) + '...' : name;
        }),
        datasets: [
          {
            label: 'Cantidad Vendida',
            data: topProductsSlice.map(p => p.quantity || 0),
            backgroundColor: colors[0],
            borderColor: colors[0],
            borderWidth: 1,
          },
          {
            label: 'Ingresos (ARS)',
            data: topProductsSlice.map(p => p.revenue || 0),
            backgroundColor: colors[1],
            borderColor: colors[1],
            borderWidth: 1,
            yAxisID: 'y1',
          }
        ],
      },
      pieData: {
        labels: topProductsSlice.map(p => {
          const name = p.name || 'Producto sin nombre';
          return name.length > 20 ? name.substring(0, 20) + '...' : name;
        }),
        datasets: [
          {
            label: 'Ingresos por Producto',
            data: topProductsSlice.map(p => p.revenue || 0),
            backgroundColor: colors,
            borderColor: colors.map(c => c + '80'),
            borderWidth: 2,
          },
        ],
      }
    };
  };

  // Datos para gráficos de clientes
  const getCustomerChartData = () => {
    // Filtrar clientes válidos y tomar solo los primeros 8
    const validCustomers = topCustomers.filter(c => c && c.name);
    const topCustomersSlice = validCustomers.slice(0, 8);
    
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];

    return {
      barData: {
        labels: topCustomersSlice.map(c => {
          const name = c.name || 'Cliente sin nombre';
          return name.length > 15 ? name.substring(0, 15) + '...' : name;
        }),
        datasets: [
          {
            label: 'Total Pedidos',
            data: topCustomersSlice.map(c => c.order_count || 0),
            backgroundColor: colors[2],
            borderColor: colors[2],
            borderWidth: 1,
          },
          {
            label: 'Total Gastado (ARS)',
            data: topCustomersSlice.map(c => c.total_amount || 0),
            backgroundColor: colors[3],
            borderColor: colors[3],
            borderWidth: 1,
            yAxisID: 'y1',
          }
        ],
      },
      pieData: {
        labels: topCustomersSlice.map(c => {
          const name = c.name || 'Cliente sin nombre';
          return name.length > 20 ? name.substring(0, 20) + '...' : name;
        }),
        datasets: [
          {
            label: 'Gasto por Cliente',
            data: topCustomersSlice.map(c => c.total_amount || 0),
            backgroundColor: colors,
            borderColor: colors.map(c => c + '80'),
            borderWidth: 2,
          },
        ],
      }
    };
  };

  // Opciones para gráficos de barras
  const barOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: activeTab === 'products' ? 'Ranking de Productos - Gráfico de Barras' : 'Ranking de Clientes - Gráfico de Barras',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (context.dataset.label.includes('ARS') || context.dataset.label.includes('Gastado')) {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: activeTab === 'products' ? 'Productos' : 'Clientes',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: activeTab === 'products' ? 'Cantidad' : 'Pedidos',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Ingresos (ARS)',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      },
    },
  };

  // Opciones para gráficos de torta
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 20,
          padding: 15,
        }
      },
      title: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
          }
        }
      }
    },
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

      {/* View Mode Toggle */}
      <div className="mb-3">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('table')}
          >
            <i className="bi bi-table me-2"></i>
            Tabla
          </button>
          <button
            type="button"
            className={`btn ${viewMode === 'charts' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('charts')}
          >
            <i className="bi bi-bar-chart-fill me-2"></i>
            Gráficos
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="tab-content">
        {viewMode === 'table' ? (
          // Vista de tabla existente
          <>
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
                          {topProducts
                            .filter(product => product && product.name)
                            .map((product, index) => {
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
                                  <span className="badge bg-primary">{product.category || 'Sin categoría'}</span>
                                </td>
                                <td>
                                  <span className="badge bg-success fs-6">
                                    {product.quantity || 0}
                                  </span>
                                </td>
                                <td>
                                  <strong className="text-success fs-6">
                                    {formatCurrency(product.revenue || 0)}
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
                          {topCustomers
                            .filter(customer => customer && customer.name)
                            .map((customer, index) => {
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
                                  <small className="text-muted">{customer.email || 'Sin email'}</small>
                                </td>
                                <td>
                                  <span className="badge bg-info fs-6">
                                    {customer.order_count || 0}
                                  </span>
                                </td>
                                <td>
                                  <strong className="text-success fs-6">
                                    {formatCurrency(customer.total_amount || 0)}
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
          </>
        ) : (
          // Vista de gráficos
          <div className="row">
            {loading ? (
              <div className="col-12 text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Gráfico de Barras */}
                <div className="col-lg-8 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="bi bi-bar-chart-fill me-2"></i>
                        Gráfico de Barras
                      </h5>
                    </div>
                                         <div className="card-body">
                                               {activeTab === 'products' && topProducts.length > 0 && topProducts.some(p => p && p.name) ? (
                         <Bar data={getProductChartData().barData} options={barOptions} />
                       ) : activeTab === 'customers' && topCustomers.length > 0 && topCustomers.some(c => c && c.name) ? (
                         <Bar data={getCustomerChartData().barData} options={barOptions} />
                       ) : (
                         <div className="text-center py-4 text-muted">
                           <i className="bi bi-inbox display-1"></i>
                           <p className="mt-2">No hay datos para mostrar en el gráfico</p>
                         </div>
                       )}
                     </div>
                  </div>
                </div>

                {/* Gráfico de Torta */}
                <div className="col-lg-4 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">
                        <i className="bi bi-pie-chart-fill me-2"></i>
                        Gráfico de Torta
                      </h5>
                    </div>
                                         <div className="card-body">
                                               {activeTab === 'products' && topProducts.length > 0 && topProducts.some(p => p && p.name) ? (
                         <Pie data={getProductChartData().pieData} options={pieOptions} />
                       ) : activeTab === 'customers' && topCustomers.length > 0 && topCustomers.some(c => c && c.name) ? (
                         <Pie data={getCustomerChartData().pieData} options={pieOptions} />
                       ) : (
                         <div className="text-center py-4 text-muted">
                           <i className="bi bi-inbox display-1"></i>
                           <p className="mt-2">No hay datos para mostrar en el gráfico</p>
                         </div>
                       )}
                     </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rankings; 