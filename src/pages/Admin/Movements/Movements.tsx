import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import reportService from '../../../services/reportService';
import type { RevenueReport, ReportParams } from '../../../services/reportService';

const Movements: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Filter states - default to today's date
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: ReportParams = {
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      };

      const data = await reportService.getRevenueReport(params);
      setRevenueData(data);
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
    setStartDate(today);
    setEndDate(today);
    // Load data with today's date
    setTimeout(() => loadRevenueData(), 100);
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
          {/* Date Range Info */}
          <div className="alert alert-info mb-4">
            <i className="bi bi-calendar-range me-2"></i>
            <strong>Período de análisis:</strong> {formatDate(revenueData.start_date)} hasta {formatDate(revenueData.end_date)}
          </div>

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
                    <div className="align-self-center">
                      <i className="bi bi-arrow-up-circle fs-1 opacity-75"></i>
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
                    <div className="align-self-center">
                      <i className="bi bi-arrow-down-circle fs-1 opacity-75"></i>
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
                    <div className="align-self-center">
                      <i className="bi bi-trophy fs-1 opacity-75"></i>
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
                    <div className="align-self-center">
                      <i className="bi bi-pie-chart fs-1 opacity-75"></i>
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
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-muted">Ingresos</span>
                      <span className="fw-bold text-success">100%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar bg-success" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-muted">Gastos</span>
                      <span className="fw-bold text-danger">
                        {formatPercentage((revenueData.total_expenses / revenueData.revenue) * 100)}
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-danger" 
                        style={{ width: `${(revenueData.total_expenses / revenueData.revenue) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-muted">Ganancia</span>
                      <span className="fw-bold text-primary">
                        {formatPercentage(revenueData.profit_margin_percentage)}
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        style={{ width: `${revenueData.profit_margin_percentage}%` }}
                      ></div>
                    </div>
                  </div>
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
                        -{formatPercentage((revenueData.total_expenses / revenueData.revenue) * 100)}
                      </td>
                    </tr>
                    <tr className="table-primary">
                      <td>
                        <i className="bi bi-equals me-2 text-primary"></i>
                        <strong>Ganancia Neta</strong>
                      </td>
                      <td className="text-end fw-bold text-primary fs-5">
                        {formatCurrency(revenueData.profit)}
                      </td>
                      <td className="text-end fw-bold fs-5">
                        {formatPercentage(revenueData.profit_margin_percentage)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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