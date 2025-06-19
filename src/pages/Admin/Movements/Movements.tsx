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
import { Bar, Doughnut } from 'react-chartjs-2';
import reportService from '../../../services/reportService';
import type { ReportParams } from '../../../services/reportService';

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

// Tipo específico para la respuesta de movimientos
interface MovementsReport {
  revenue: number;
  total_expenses: number;
  profit: number;
  profit_margin_percentage: number;
  total_invoices: number;
  total_inventory_purchases: number;
  start_date: string;
  end_date: string;
}

const Movements: React.FC = () => {
  const [revenueData, setRevenueData] = useState<MovementsReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Filter states - no default dates for initial load
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState<'dashboard' | 'charts'>('dashboard');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load data without any date filters for initial load
      const data = await reportService.getRevenueReport({});
      setRevenueData(data as unknown as MovementsReport);
    } catch (err) {
      setError('Error al cargar los datos de movimientos');
      console.error('Error loading revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: ReportParams = {
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      };

      const data = await reportService.getRevenueReport(params);
      setRevenueData(data as unknown as MovementsReport);
    } catch (err) {
      setError('Error al cargar los datos de movimientos');
      console.error('Error loading revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    loadRevenueData();
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    // Load data without date filters
    setTimeout(() => loadInitialData(), 100);
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    setError(null);

    try {
      const params: ReportParams = {
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      };

      await reportService.downloadRevenueExcel(params);
    } catch (err) {
      setError('Error al descargar el reporte de Excel');
      console.error('Error downloading excel report:', err);
    } finally {
      setDownloading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  // Check if there's actual data to display
  const hasData = revenueData && (
    revenueData.revenue > 0 || 
    revenueData.total_expenses > 0 || 
    revenueData.total_invoices > 0 || 
    revenueData.total_inventory_purchases > 0
  );

  // Datos para gráfico de dona (Ingresos vs Gastos)
  const getFinancialDonutData = () => {
    if (!revenueData) return null;

    return {
      labels: ['Ingresos', 'Gastos'],
      datasets: [
        {
          label: 'Distribución Financiera',
          data: [revenueData.revenue, revenueData.total_expenses],
          backgroundColor: ['#28a745', '#dc3545'],
          borderColor: ['#28a745', '#dc3545'],
          borderWidth: 2,
          hoverBackgroundColor: ['#34ce57', '#e85a5a'],
        },
      ],
    };
  };

  // Datos para gráfico de barras (Métricas principales)
  const getFinancialBarData = () => {
    if (!revenueData) return null;

    return {
      labels: ['Ingresos', 'Gastos', 'Ganancia Neta'],
      datasets: [
        {
          label: 'Monto (ARS)',
          data: [revenueData.revenue, revenueData.total_expenses, Math.abs(revenueData.profit)],
          backgroundColor: [
            '#28a745', // Verde para ingresos
            '#dc3545', // Rojo para gastos
            revenueData.profit >= 0 ? '#007bff' : '#ffc107' // Azul para ganancia, amarillo para pérdida
          ],
          borderColor: [
            '#28a745',
            '#dc3545', 
            revenueData.profit >= 0 ? '#007bff' : '#ffc107'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Datos para gráfico de transacciones
  const getTransactionsBarData = () => {
    if (!revenueData) return null;

    return {
      labels: ['Facturas Emitidas', 'Compras de Inventario'],
      datasets: [
        {
          label: 'Cantidad de Transacciones',
          data: [revenueData.total_invoices, revenueData.total_inventory_purchases],
          backgroundColor: ['#17a2b8', '#fd7e14'],
          borderColor: ['#17a2b8', '#fd7e14'],
          borderWidth: 1,
        },
      ],
    };
  };

  // Opciones para gráfico de dona
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      title: {
        display: true,
        text: 'Distribución de Ingresos vs Gastos',
        font: {
          size: 16,
        }
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

  // Opciones para gráfico de barras financieras
  const financialBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Resumen Financiero',
        font: {
          size: 16,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    },
  };

  // Opciones para gráfico de transacciones
  const transactionsBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Volumen de Transacciones',
        font: {
          size: 16,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        }
      }
    },
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-arrow-left-right me-2"></i>
          Movimientos Financieros
        </h2>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-funnel me-2"></i>
            Filtros de Período
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="form-label">Fecha Inicio</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Fecha Fin</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-primary me-2"
                onClick={handleFilterChange}
                disabled={loading}
              >
                <i className="bi bi-search me-2"></i>
                Aplicar
              </button>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary me-2"
                onClick={clearFilters}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Limpiar
              </button>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-success"
                onClick={handleDownloadExcel}
                disabled={loading || downloading || !hasData}
                title={!hasData ? "No hay datos para descargar" : "Descargar reporte en Excel"}
              >
                {downloading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    <span className="d-none d-lg-inline">Descargando...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-excel me-1"></i>
                    <span className="d-none d-lg-inline">Excel</span>
                    <span className="d-lg-none">Excel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* View Mode Toggle */}
      {hasData && !loading && (
        <div className="mb-4">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${viewMode === 'dashboard' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('dashboard')}
            >
              <i className="bi bi-grid-3x3-gap me-2"></i>
              Dashboard
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
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando datos...</span>
          </div>
          <p className="mt-2 text-muted">Cargando información financiera...</p>
        </div>
      )}

      {/* Revenue Data */}
      {hasData && !loading && (
        <>
        {startDate && endDate && (
          <div className="alert alert-info mb-4">
            <i className="bi bi-calendar-range me-2"></i>
            <strong>Período de análisis:</strong> {formatDate(revenueData.start_date)} hasta {formatDate(revenueData.end_date)}
          </div>
        )}

        {viewMode === 'dashboard' ? (
          // Vista de Dashboard (existente)
          <>

          {/* Main Financial Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card text-white bg-success">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">
                        <i className="bi bi-cash-coin me-2"></i>
                        Ingresos Totales
                      </h6>
                      <h4 className="mb-0">{formatCurrency(revenueData.revenue)}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-white bg-danger">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">
                        <i className="bi bi-cash-stack me-2"></i>
                        Gastos Totales
                      </h6>
                      <h4 className="mb-0">{formatCurrency(revenueData.total_expenses)}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-white bg-primary">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">
                        <i className="bi bi-graph-up me-2"></i>
                        Ganancia Neta
                      </h6>
                      <h4 className="mb-0">{formatCurrency(revenueData.profit)}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-white bg-info">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">
                        <i className="bi bi-percent me-2"></i>
                        Margen de Ganancia
                      </h6>
                      <h4 className="mb-0">{formatPercentage(revenueData.profit_margin_percentage)}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-receipt me-2"></i>
                    Resumen de Transacciones
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="border-end">
                        <h3 className="text-success mb-1">{revenueData.total_invoices}</h3>
                        <p className="text-muted mb-0">
                          <i className="bi bi-file-earmark-text me-1"></i>
                          Facturas Emitidas
                        </p>
                      </div>
                    </div>
                    <div className="col-6">
                      <h3 className="text-warning mb-1">{revenueData.total_inventory_purchases}</h3>
                      <p className="text-muted mb-0">
                        <i className="bi bi-cart-fill me-1"></i>
                        Compras de Inventario
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Análisis de Rentabilidad
                  </h5>
                </div>
                <div className="card-body">
                  {revenueData.revenue > 0 ? (
                    <>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-muted">Gastos</span>
                          <span className="fw-bold text-danger">
                            {formatPercentage(Math.min((revenueData.total_expenses / revenueData.revenue) * 100, 999))}
                          </span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-danger" 
                            style={{ width: `${Math.min((revenueData.total_expenses / revenueData.revenue) * 100, 100)}%` }}
                          ></div>
                        </div>
                        {revenueData.total_expenses > revenueData.revenue && (
                          <small className="text-danger">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Los gastos superan los ingresos
                          </small>
                        )}
                      </div>

                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-muted">
                            {revenueData.profit_margin_percentage >= 0 ? 'Ganancia' : 'Pérdida'}
                          </span>
                          <span className={`fw-bold ${revenueData.profit_margin_percentage >= 0 ? 'text-primary' : 'text-danger'}`}>
                            {formatPercentage(Math.abs(revenueData.profit_margin_percentage))}
                          </span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className={`progress-bar ${revenueData.profit_margin_percentage >= 0 ? 'bg-primary' : 'bg-danger'}`}
                            style={{ width: `${Math.min(Math.abs(revenueData.profit_margin_percentage), 100)}%` }}
                          ></div>
                        </div>
                        {revenueData.profit_margin_percentage < 0 && (
                          <small className="text-danger">
                            <i className="bi bi-trend-down me-1"></i>
                            Operación con pérdidas
                          </small>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted py-3">
                      <i className="bi bi-calculator me-2"></i>
                      No hay ingresos para calcular rentabilidad
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-table me-2"></i>
                Desglose Financiero
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th className="text-end">Monto</th>
                      <th className="text-end">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="table-success">
                      <td>
                        <i className="bi bi-plus-circle me-2 text-success"></i>
                        <strong>Ingresos por Ventas</strong>
                      </td>
                      <td className="text-end fw-bold text-success">
                        {formatCurrency(revenueData.revenue)}
                      </td>
                      <td className="text-end">100.00%</td>
                    </tr>
                    <tr className="table-danger">
                      <td>
                        <i className="bi bi-dash-circle me-2 text-danger"></i>
                        <strong>Gastos en Inventario</strong>
                      </td>
                      <td className="text-end fw-bold text-danger">
                        -{formatCurrency(revenueData.total_expenses)}
                      </td>
                      <td className="text-end">
                        {revenueData.revenue > 0 
                          ? `-${formatPercentage(Math.min((revenueData.total_expenses / revenueData.revenue) * 100, 999))}`
                          : 'N/A'
                        }
                      </td>
                    </tr>
                    <tr className={revenueData.profit >= 0 ? "table-primary" : "table-danger"}>
                      <td>
                        <i className={`bi ${revenueData.profit >= 0 ? 'bi-equals' : 'bi-dash-square'} me-2 ${revenueData.profit >= 0 ? 'text-primary' : 'text-danger'}`}></i>
                        <strong>{revenueData.profit >= 0 ? 'Ganancia Neta' : 'Pérdida Neta'}</strong>
                      </td>
                      <td className={`text-end fw-bold fs-5 ${revenueData.profit >= 0 ? 'text-primary' : 'text-danger'}`}>
                        {formatCurrency(revenueData.profit)}
                      </td>
                      <td className={`text-end fw-bold fs-5 ${revenueData.profit >= 0 ? 'text-primary' : 'text-danger'}`}>
                        {formatPercentage(revenueData.profit_margin_percentage)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </>
        ) : (
          // Vista de Gráficos
          <div className="row">
            {/* Gráfico de Dona - Distribución Financiera */}
            <div className="col-lg-6 mb-4">
              <div className="card">
                <div className="card-body" style={{ height: '400px' }}>
                  {getFinancialDonutData() && (
                    <Doughnut data={getFinancialDonutData()!} options={donutOptions} />
                  )}
                </div>
              </div>
            </div>

            {/* Gráfico de Barras - Resumen Financiero */}
            <div className="col-lg-6 mb-4">
              <div className="card">
                <div className="card-body" style={{ height: '400px' }}>
                  {getFinancialBarData() && (
                    <Bar data={getFinancialBarData()!} options={financialBarOptions} />
                  )}
                </div>
              </div>
            </div>

            {/* Gráfico de Transacciones - Ancho completo */}
            <div className="col-12 mb-4">
              <div className="card">
                <div className="card-body" style={{ height: '300px' }}>
                  {getTransactionsBarData() && (
                    <Bar data={getTransactionsBarData()!} options={transactionsBarOptions} />
                  )}
                </div>
              </div>
            </div>

            {/* Resumen Numérico en Vista de Gráficos */}
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-calculator me-2"></i>
                    Resumen Numérico
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-3">
                      <h4 className="text-success">{formatCurrency(revenueData.revenue)}</h4>
                      <p className="text-muted mb-0">Ingresos Totales</p>
                    </div>
                    <div className="col-md-3">
                      <h4 className="text-danger">{formatCurrency(revenueData.total_expenses)}</h4>
                      <p className="text-muted mb-0">Gastos Totales</p>
                    </div>
                    <div className="col-md-3">
                      <h4 className={revenueData.profit >= 0 ? 'text-primary' : 'text-danger'}>
                        {formatCurrency(revenueData.profit)}
                      </h4>
                      <p className="text-muted mb-0">
                        {revenueData.profit >= 0 ? 'Ganancia Neta' : 'Pérdida Neta'}
                      </p>
                    </div>
                    <div className="col-md-3">
                      <h4 className={revenueData.profit_margin_percentage >= 0 ? 'text-info' : 'text-warning'}>
                        {formatPercentage(revenueData.profit_margin_percentage)}
                      </h4>
                      <p className="text-muted mb-0">Margen de Ganancia</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
      )}

      {/* No Data for Selected Period */}
      {revenueData && !hasData && !loading && (
        <div className="text-center">
          <div className="card">
            <div className="card-body">
              <i className="bi bi-calendar-x display-1 text-primary"></i>
              <h4 className="mt-3 text-primary">Sin movimientos en el período seleccionado</h4>
              <p className="text-primary">
                No se encontraron datos financieros para el período del {formatDate(revenueData.start_date)} al {formatDate(revenueData.end_date)}.
              </p>
              <div className="mt-1">
                <button className="btn btn-outline-secondary" onClick={loadRevenueData}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Recargar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Data State - Initial */}
      {!revenueData && !loading && !error && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-graph-down display-1"></i>
          <p className="mt-3">No hay datos financieros disponibles</p>
          <button className="btn btn-primary" onClick={loadRevenueData}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Recargar Datos
          </button>
        </div>
      )}
    </div>
  );
};

export default Movements; 