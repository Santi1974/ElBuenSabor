import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import invoiceService from '../../../services/invoiceService';
import type { Invoice } from '../../../services/invoiceService';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  
  // Search states
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filter states
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadData();
  }, [currentPage, itemsPerPage, searchTerm]);

  // Sincronizar searchInput con searchTerm cuando se limpia externamente
  useEffect(() => {
    if (!searchTerm) {
      setSearchInput('');
    }
  }, [searchTerm]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      let result;
      
      if (searchTerm && searchTerm.trim() !== '') {
        result = await invoiceService.search(searchTerm.trim(), offset, itemsPerPage);
      } else {
        result = await invoiceService.getAll(offset, itemsPerPage);
      }
      
      // Ensure invoices is always an array
      const invoicesData = Array.isArray(result.data) ? result.data : [];
      setInvoices(invoicesData);
      setTotalItems(result.total);
      setHasNext(result.hasNext);
    } catch (err) {
      setError('Error al cargar las facturas');
      console.error('Error loading invoices:', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (!Array.isArray(invoices)) return [];
    
    const matchesType = filterType === '' || invoice.type === filterType;
    const matchesStatus = filterStatus === '' || invoice.order?.status === filterStatus;
    
    const matchesDateFrom = dateFrom === '' || new Date(invoice.date) >= new Date(dateFrom);
    const matchesDateTo = dateTo === '' || new Date(invoice.date) <= new Date(dateTo);
    
    return matchesType && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      await invoiceService.downloadPDF(invoice);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar el PDF');
    }
  };

  const handleCancelInvoice = async (invoice: Invoice) => {
    if (invoice.type !== 'factura') {
      setError('Solo se pueden anular facturas, no notas de crédito');
      return;
    }

    const confirmCancel = window.confirm(
      `¿Está seguro que desea anular la factura ${invoice.number}?\n\n` +
      `Esta acción generará automáticamente una nota de crédito y no se puede deshacer.`
    );

    if (!confirmCancel) return;

    try {
      setLoading(true);
      setError(null);
      const creditNote = await invoiceService.cancelInvoice(invoice.id_key);
      
      // Reload data to show the new credit note
      await loadData();
      
      // Show success message
      setSuccess(`Factura anulada correctamente. Se generó la nota de crédito: ${creditNote.number}`);
    } catch (error: any) {
      console.error('Error canceling invoice:', error);
      const errorMessage = error.response?.data?.message || 'Error al anular la factura. Inténtelo nuevamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterType('');
    setFilterStatus('');
    setDateFrom('');
    setDateTo('');
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <li key="1" className="page-item">
          <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
        </li>
      );
      if (startPage > 2) {
        pages.push(
          <li key="ellipsis1" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>{i}</button>
        </li>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <li key="ellipsis2" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
      pages.push(
        <li key={totalPages} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
        </li>
      );
    }

    return (
      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>
          {pages}
          <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-receipt me-2"></i>
          Gestión de Facturas
        </h2>
      </div>

      {/* Search Bar */}
      <div className="row mb-3">
        <div className="col-md-6">
          <form onSubmit={handleSearchSubmit} className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Buscar facturas..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button 
              type="submit" 
              className="btn btn-outline-primary me-2"
              disabled={!searchInput.trim()}
            >
              <i className="bi bi-search"></i>
            </button>
            {searchTerm && (
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={handleClearSearch}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </form>
        </div>
        {searchTerm && (
          <div className="col-md-6">
            <div className="alert alert-info mb-0 py-2">
              <small>Buscando: "{searchTerm}" - {totalItems} resultado(s) encontrado(s)</small>
            </div>
          </div>
        )}
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
              <label className="form-label">Tipo</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="factura">Factura</option>
                <option value="nota_credito">Nota de Crédito</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="a_confirmar">A confirmar</option>
                <option value="en_cocina">En cocina</option>
                <option value="listo">Listo</option>
                <option value="en_delivery">En delivery</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Desde</label>
              <input
                type="date"
                className="form-control"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Hasta</label>
              <input
                type="date"
                className="form-control"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
                title="Limpiar filtros"
              >
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          {success}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccess(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Invoice List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list me-2"></i>
            Lista de Facturas ({totalItems} total)
          </h5>
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 me-2">Mostrar:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox display-1"></i>
              <p className="mt-2">No hay facturas para mostrar</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Total</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th>Método de Pago</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id_key}>
                        <td>
                          <code className="text-primary">{invoice.number}</code>
                        </td>
                        <td>{invoiceService.formatDate(invoice.date)}</td>
                        <td>
                          <div>
                            <strong>{invoice.order?.user?.full_name || 'N/A'}</strong>
                            <br />
                            <small className="text-muted">{invoice.order?.user?.email || 'N/A'}</small>
                          </div>
                        </td>
                        <td>
                          <strong className="text-success">
                            {invoiceService.formatCurrency(invoice.total)}
                          </strong>
                        </td>
                        <td>
                          <span className={`badge ${invoice.type === 'factura' ? 'bg-primary' : 'bg-warning'}`}>
                            {invoiceService.getInvoiceTypeDisplay(invoice.type)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${invoiceService.getStatusColor(invoice.order?.status || '')}`}>
                            {invoiceService.getStatusDisplay(invoice.order?.status || '')}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {invoiceService.getPaymentMethodDisplay(invoice.order?.payment_method || '')}
                          </small>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleViewDetails(invoice)}
                              title="Ver detalles"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              className="btn btn-outline-success"
                              onClick={() => handleDownloadPDF(invoice)}
                              title={`Descargar ${invoice.type === 'factura' ? 'factura' : 'nota de crédito'} PDF`}
                            >
                              <i className="bi bi-file-pdf"></i>
                            </button>
                            {invoice.type === 'factura' && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleCancelInvoice(invoice)}
                                title="Anular factura"
                              >
                                <i className="bi bi-x-circle"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {renderPagination()}
            </>
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      {showModal && selectedInvoice && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-receipt me-2"></i>
                  Detalles de {invoiceService.getInvoiceTypeDisplay(selectedInvoice.type)}: {selectedInvoice.number}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Invoice Information */}
                  <div className="col-md-6">
                    <h6 className="text-primary">Información de la Factura</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Número:</strong></td>
                          <td><code>{selectedInvoice.number}</code></td>
                        </tr>
                        <tr>
                          <td><strong>Fecha:</strong></td>
                          <td>{invoiceService.formatDate(selectedInvoice.date)}</td>
                        </tr>
                        <tr>
                          <td><strong>Tipo:</strong></td>
                          <td>
                            <span className={`badge ${selectedInvoice.type === 'factura' ? 'bg-primary' : 'bg-warning'}`}>
                              {invoiceService.getInvoiceTypeDisplay(selectedInvoice.type)}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Total:</strong></td>
                          <td><strong className="text-success fs-5">{invoiceService.formatCurrency(selectedInvoice.total)}</strong></td>
                        </tr>
                        {selectedInvoice.original_invoice_id && (
                          <tr>
                            <td><strong>Factura Original:</strong></td>
                            <td><code className="text-info">#{selectedInvoice.original_invoice_id}</code></td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Customer Information */}
                  <div className="col-md-6">
                    <h6 className="text-primary">Información del Cliente</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Nombre:</strong></td>
                          <td>{selectedInvoice.order?.user?.full_name || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>{selectedInvoice.order?.user?.email || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Teléfono:</strong></td>
                          <td>{selectedInvoice.order?.user?.phone_number || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Rol:</strong></td>
                          <td>{selectedInvoice.order?.user?.role || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Information */}
                <div className="row mt-4">
                  <div className="col-12">
                    <h6 className="text-primary">Información del Pedido</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <table className="table table-sm">
                          <tbody>
                            <tr>
                              <td><strong>Fecha del Pedido:</strong></td>
                              <td>{selectedInvoice.order?.date ? invoiceService.formatDate(selectedInvoice.order.date) : 'N/A'}</td>
                            </tr>
                            <tr>
                              <td><strong>Método de Entrega:</strong></td>
                              <td>{invoiceService.getDeliveryMethodDisplay(selectedInvoice.order?.delivery_method || '')}</td>
                            </tr>
                            <tr>
                              <td><strong>Método de Pago:</strong></td>
                              <td>{invoiceService.getPaymentMethodDisplay(selectedInvoice.order?.payment_method || '')}</td>
                            </tr>
                            <tr>
                              <td><strong>ID de Pago:</strong></td>
                              <td><code>{selectedInvoice.order?.payment_id || 'N/A'}</code></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="col-md-6">
                        <table className="table table-sm">
                          <tbody>
                            <tr>
                              <td><strong>Estado:</strong></td>
                              <td>
                                <span className={`badge bg-${invoiceService.getStatusColor(selectedInvoice.order?.status || '')}`}>
                                  {invoiceService.getStatusDisplay(selectedInvoice.order?.status || '')}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td><strong>Pagado:</strong></td>
                              <td>
                                <span className={`badge ${selectedInvoice.order?.is_paid ? 'bg-success' : 'bg-danger'}`}>
                                  {selectedInvoice.order?.is_paid ? 'Sí' : 'No'}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td><strong>Tiempo Estimado:</strong></td>
                              <td>{selectedInvoice.order?.estimated_time || 0} min</td>
                            </tr>
                            <tr>
                              <td><strong>Notas:</strong></td>
                              <td>{selectedInvoice.order?.notes || 'Sin notas'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                {((selectedInvoice.order?.details && selectedInvoice.order.details.length > 0) || 
                  (selectedInvoice.order?.inventory_details && selectedInvoice.order.inventory_details.length > 0)) && (
                  <div className="row mt-4">
                    <div className="col-12">
                      <h6 className="text-primary">Detalles del Pedido</h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-striped">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Categoría</th>
                              <th>Cantidad</th>
                              <th>Precio Unitario</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedInvoice.order?.details?.map((detail, index) => (
                              <tr key={`manufactured-${detail.id_key || index}`}>
                                <td>
                                  <div>
                                    <strong>{detail.manufactured_item?.name || 'N/A'}</strong>
                                    {detail.manufactured_item?.description && (
                                      <>
                                        <br />
                                        <small className="text-muted">{detail.manufactured_item.description}</small>
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-secondary">
                                    {detail.manufactured_item?.category?.name || 'N/A'}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge bg-info">{detail.quantity}</span>
                                </td>
                                <td>{invoiceService.formatCurrency(detail.unit_price)}</td>
                                <td>
                                  <strong>{invoiceService.formatCurrency(detail.subtotal)}</strong>
                                </td>
                              </tr>
                            ))}
                            {selectedInvoice.order?.inventory_details?.map((detail, index) => (
                              <tr key={`inventory-${detail.id_key || index}`}>
                                <td>
                                  <div>
                                    <strong>{detail.inventory_item?.name || 'N/A'}</strong>
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-info">
                                    Inventario
                                  </span>
                                </td>
                                <td>
                                  <span className="badge bg-info">{detail.quantity}</span>
                                </td>
                                <td>{invoiceService.formatCurrency(detail.unit_price)}</td>
                                <td>
                                  <strong>{invoiceService.formatCurrency(detail.subtotal)}</strong>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Totals */}
                <div className="row mt-4">
                  <div className="col-md-6 offset-md-6">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="text-primary">Resumen de Totales</h6>
                        <table className="table table-sm">
                          <tbody>
                            <tr>
                              <td><strong>Subtotal:</strong></td>
                              <td className="text-end">{invoiceService.formatCurrency(selectedInvoice.order?.total || 0)}</td>
                            </tr>
                            <tr>
                              <td><strong>Descuento:</strong></td>
                              <td className="text-end text-danger">-{invoiceService.formatCurrency(selectedInvoice.order?.discount || 0)}</td>
                            </tr>
                            <tr className="table-success">
                              <td><strong>Total Final:</strong></td>
                              <td className="text-end"><strong className="fs-5">{invoiceService.formatCurrency(selectedInvoice.order?.final_total || 0)}</strong></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                >
                  <i className="bi bi-file-pdf me-2"></i>
                  Descargar PDF
                </button>
                {selectedInvoice.type === 'factura' && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      handleCancelInvoice(selectedInvoice);
                      setShowModal(false);
                    }}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Anular Factura
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices; 