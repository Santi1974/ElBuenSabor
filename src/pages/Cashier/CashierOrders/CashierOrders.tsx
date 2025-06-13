import { useState, useEffect } from 'react';
import cashierService, { type Order } from '../../../services/cashierService';
import 'bootstrap/dist/css/bootstrap.min.css';

const CashierOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  // Status filters
  const [statusFilters, setStatusFilters] = useState({
    a_confirmar: false,
    en_cocina: false,
    listo: false,
    en_delivery: false,
    entregado: false,
    facturado: false
  });

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage, searchTerm, statusFilters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const offset = (currentPage - 1) * itemsPerPage;
      
      // Obtener los filtros de status activos
      const activeFilters = Object.entries(statusFilters)
        .filter(([_, isActive]) => isActive)
        .map(([status]) => status);
      
      let allOrders: any[] = [];
      let totalCount = 0;
      let hasNextPage = false;
      
      if (activeFilters.length === 0) {
        // Si no hay filtros de status, obtener todos los pedidos
        const response = await cashierService.getAllOrders(offset, itemsPerPage);
        allOrders = response.data;
        totalCount = response.total;
        hasNextPage = response.hasNext;
      } else if (activeFilters.length === 1) {
        // Si hay solo un filtro, usar el endpoint directo
        const response = await cashierService.getAllOrders(offset, itemsPerPage, activeFilters[0]);
        allOrders = response.data;
        totalCount = response.total;
        hasNextPage = response.hasNext;
      } else {
        // Si hay múltiples filtros, hacer múltiples llamadas y combinar resultados
        const responses = await Promise.all(
          activeFilters.map(status => 
            cashierService.getAllOrders(0, 1000, status) // Obtener más resultados para filtrar localmente
          )
        );
        
        // Combinar todos los resultados
        const combinedOrders = responses.flatMap(response => response.data);
        
        // Eliminar duplicados basándose en id_key
        const uniqueOrders = combinedOrders.filter((order, index, self) => 
          index === self.findIndex(o => o.id_key === order.id_key)
        );
        
        // Aplicar paginación manual
        totalCount = uniqueOrders.length;
        allOrders = uniqueOrders.slice(offset, offset + itemsPerPage);
        hasNextPage = (offset + itemsPerPage) < totalCount;
      }
      
      // Aplicar filtro de búsqueda si existe
      if (searchTerm) {
        allOrders = allOrders.filter(order => 
          order.id_key.toString().includes(searchTerm) ||
          order.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user.phone_number.includes(searchTerm) ||
          order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.delivery_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setOrders(allOrders);
      setTotalItems(totalCount);
      setHasNext(hasNextPage);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error al cargar los pedidos. Por favor, intente nuevamente.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName: string) => {
    setStatusFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName as keyof typeof prev]
    }));
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const handleMoveToKitchen = async (orderId: number) => {
    try {
      setProcessingOrderId(orderId);
      await cashierService.moveToKitchen(orderId);
      
      // Refresh the orders list
      await fetchOrders();
      
      // Close the modal if it's open
      if (selectedOrder?.id_key === orderId) {
        closeDetailModal();
      }
      
      alert('Pedido enviado a cocina exitosamente');
    } catch (err) {
      console.error('Error moving order to kitchen:', err);
      alert('Error al enviar el pedido a cocina. Por favor, intente nuevamente.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleMoveToReady = async (orderId: number) => {
    try {
      setProcessingOrderId(orderId);
      await cashierService.moveToReady(orderId);
      
      // Refresh the orders list
      await fetchOrders();
      
      // Close the modal if it's open
      if (selectedOrder?.id_key === orderId) {
        closeDetailModal();
      }
      
      alert('Pedido marcado como listo exitosamente');
    } catch (err) {
      console.error('Error moving order to ready:', err);
      alert('Error al marcar el pedido como listo. Por favor, intente nuevamente.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleMarkAsPaid = async (orderId: number) => {
    try {
      setProcessingOrderId(orderId);
      await cashierService.markAsPaid(orderId);
      
      // Refresh the orders list
      await fetchOrders();
      
      // Close the modal if it's open
      if (selectedOrder?.id_key === orderId) {
        closeDetailModal();
      }
      
      alert('Pedido marcado como pagado exitosamente');
    } catch (err) {
      console.error('Error marking order as paid:', err);
      alert('Error al marcar el pedido como pagado. Por favor, intente nuevamente.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Filter orders based on search term only (status filtering is done on backend)
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    
    try {
      const searchLower = searchTerm.toLowerCase().trim();
      
      // Si el término de búsqueda es solo números, priorizar búsqueda por ID
      if (/^\d+$/.test(searchTerm)) {
        return order.id_key.toString().includes(searchTerm);
      }
      
      // Búsqueda general en todos los campos con validaciones
      return (
        order.id_key.toString().includes(searchTerm) ||
        (order.user?.full_name || '').toLowerCase().includes(searchLower) ||
        (order.user?.phone_number || '').includes(searchTerm) ||
        (order.user?.email || '').toLowerCase().includes(searchLower) ||
        translateStatus(order.status || '').toLowerCase().includes(searchLower) ||
        translateDeliveryMethod(order.delivery_method || '').toLowerCase().includes(searchLower) ||
        translatePaymentMethod(order.payment_method || '').toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error filtering order:', error, order);
      return false; // Si hay error, no incluir este pedido en los resultados
    }
  });

  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Error en fecha';
    }
  };

  // Translate status to Spanish
  const translateStatus = (status: string) => {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'a_confirmar':
        return 'A confirmar';
      case 'en_cocina':
        return 'En cocina';
      case 'listo':
        return 'Listo';
      case 'en_delivery':
        return 'En delivery';
      case 'entregado':
        return 'Entregado';
      case 'facturado':
        return 'Facturado';
      default:
        return status;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    if (!status) return 'bg-light text-dark';
    switch (status.toLowerCase()) {
      case 'a_confirmar':
        return 'bg-warning';
      case 'en_cocina':
        return 'bg-info';
      case 'listo':
        return 'bg-success';
      case 'en_delivery':
        return 'bg-primary';
      case 'entregado':
        return 'bg-secondary';
      case 'facturado':
        return 'bg-secondary';
      default:
        return 'bg-light text-dark';
    }
  };

  // Translate delivery method to Spanish
  const translateDeliveryMethod = (method: string) => {
    if (!method) return '';
    switch (method.toLowerCase()) {
      case 'delivery':
        return 'Delivery';
      case 'pickup':
        return 'Retiro en local';
      default:
        return method;
    }
  };

  // Translate payment method to Spanish
  const translatePaymentMethod = (method: string) => {
    if (!method) return '';
    switch (method.toLowerCase()) {
      case 'credit_card':
        return 'Tarjeta de crédito';
      case 'cash':
        return 'Efectivo';
      case 'transfer':
        return 'Transferencia';
      default:
        return method;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0 text-dark fw-bold">
          <i className="bi bi-receipt me-2"></i>
          Gestión de Pedidos - Cajero
        </h2>
        <div className="badge bg-secondary fs-6">
          {totalItems} pedido{totalItems !== 1 ? 's' : ''} total{totalItems !== 1 ? 'es' : ''}
        </div>
      </div>

      {/* Filters Section - Moved to top */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="bi bi-funnel me-2"></i>
            Filtros por Estado
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-6 col-md-4 col-lg-2">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="a_confirmar" 
                  checked={statusFilters.a_confirmar}
                  onChange={() => handleFilterChange('a_confirmar')}
                />
                <label className="form-check-label" htmlFor="a_confirmar">
                  A confirmar
                </label>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="en_cocina" 
                  checked={statusFilters.en_cocina}
                  onChange={() => handleFilterChange('en_cocina')}
                />
                <label className="form-check-label" htmlFor="en_cocina">
                  En cocina
                </label>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="listo" 
                  checked={statusFilters.listo}
                  onChange={() => handleFilterChange('listo')}
                />
                <label className="form-check-label" htmlFor="listo">
                  Listo
                </label>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="en_delivery" 
                  checked={statusFilters.en_delivery}
                  onChange={() => handleFilterChange('en_delivery')}
                />
                <label className="form-check-label" htmlFor="en_delivery">
                  En delivery
                </label>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="entregado" 
                  checked={statusFilters.entregado}
                  onChange={() => handleFilterChange('entregado')}
                />
                <label className="form-check-label" htmlFor="entregado">
                  Entregado
                </label>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="facturado" 
                  checked={statusFilters.facturado}
                  onChange={() => handleFilterChange('facturado')}
                />
                <label className="form-check-label" htmlFor="facturado">
                  Facturado
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Buscar por ID de pedido, cliente, teléfono..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Resetear a la primera página cuando cambia la búsqueda
              }}
            />
          </div>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="card mb-3" style={{ padding: '5px 10px' }}>
        <div className="card-body p-1">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span className="text-muted">
              Mostrando {filteredOrders.length} de {totalItems} pedidos
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Orders List Section */}
      {/* Loading State */}
      {loading ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted mb-0">Cargando pedidos...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Orders Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Pedido</th>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Cliente</th>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Estado</th>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Método</th>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Total</th>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Fecha</th>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Pago</th>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-5 text-muted">
                          <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                          {searchTerm || Object.values(statusFilters).some(Boolean) ? 
                            'No se encontraron pedidos que coincidan con los filtros' : 
                            'No hay pedidos'
                          }
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr 
                          key={order.id_key} 
                          className="cursor-pointer"
                        >
                          <td className="px-4 py-3" onClick={() => handleOrderClick(order)} style={{cursor: 'pointer'}}>
                            <div className="d-flex flex-column">
                              <span className="fw-semibold text-primary">#{order.id_key || 'N/A'}</span>
                              <small className="text-muted">
                                {order.estimated_time || 0} min estimado
                              </small>
                            </div>
                          </td>
                          <td className="px-4 py-3" onClick={() => handleOrderClick(order)} style={{cursor: 'pointer'}}>
                            <div className="d-flex flex-column">
                              <span className="fw-semibold">{order.user?.full_name || 'Sin nombre'}</span>
                              <small className="text-muted">{order.user?.phone_number || 'Sin teléfono'}</small>
                            </div>
                          </td>
                          <td className="px-4 py-3" onClick={() => handleOrderClick(order)} style={{cursor: 'pointer'}}>
                            <span className={`badge ${getStatusBadgeColor(order.status)}`}>
                              {translateStatus(order.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={() => handleOrderClick(order)} style={{cursor: 'pointer'}}>
                            <div className="d-flex flex-column">
                              <span>{translateDeliveryMethod(order.delivery_method)}</span>
                              <small className="text-muted">{translatePaymentMethod(order.payment_method)}</small>
                            </div>
                          </td>
                          <td className="px-4 py-3" onClick={() => handleOrderClick(order)} style={{cursor: 'pointer'}}>
                            <div className="d-flex flex-column">
                              <span className="fw-semibold">${(order.final_total || 0).toFixed(2)}</span>
                              {(order.discount || 0) > 0 && (
                                <small className="text-success">
                                  Desc: ${(order.discount || 0).toFixed(2)}
                                </small>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3" onClick={() => handleOrderClick(order)} style={{cursor: 'pointer'}}>
                            <span className="text-muted small">{order.date ? formatDate(order.date) : 'Sin fecha'}</span>
                          </td>
                          <td className="px-4 py-3" onClick={() => handleOrderClick(order)} style={{cursor: 'pointer'}}>
                            <span className={`badge ${order.is_paid ? 'bg-success' : 'bg-warning'} small`}>
                              {order.is_paid ? 'Pagado' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {!order.is_paid && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsPaid(order.id_key);
                                }}
                                disabled={processingOrderId === order.id_key}
                                title="Marcar como pagado"
                              >
                                <i className="bi bi-cash"></i>
                                {processingOrderId === order.id_key ? (
                                  <span className="spinner-border spinner-border-sm ms-1" role="status"></span>
                                ) : (
                                  <span className="ms-1 d-none d-md-inline">Pagado</span>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="card mt-3" style={{ padding: '5px 10px' }}>
              <div className="card-body p-1">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <small className="text-muted">
                    Página {currentPage} de {totalPages} - Mostrando {filteredOrders.length} de {totalItems} elementos
                  </small>
                  <nav aria-label="Page navigation">
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </button>
                      </li>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          </li>
                        );
                      })}
                      
                      <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={handleNextPage}
                          disabled={!hasNext}
                        >
                          Siguiente
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-receipt me-2"></i>
                  Detalle del Pedido #{selectedOrder.id_key}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDetailModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Customer Info */}
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-person me-2"></i>
                          Información del Cliente
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-2">
                          <strong>Nombre:</strong> {selectedOrder.user.full_name}
                        </div>
                        <div className="mb-2">
                          <strong>Email:</strong> {selectedOrder.user.email}
                        </div>
                        <div className="mb-2">
                          <strong>Teléfono:</strong> {selectedOrder.user.phone_number}
                        </div>
                        <div className="mb-2">
                          <strong>Fecha del pedido:</strong> {formatDate(selectedOrder.date)}
                        </div>
                        <div className="mb-2">
                          <strong>Tiempo estimado:</strong> {selectedOrder.estimated_time} minutos
                        </div>
                        <div className="mb-2">
                          <strong>Estado:</strong> 
                          <span className={`badge ms-2 ${getStatusBadgeColor(selectedOrder.status)}`}>
                            {translateStatus(selectedOrder.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-truck me-2"></i>
                          Información del Pedido
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-2">
                          <strong>Método de entrega:</strong> {translateDeliveryMethod(selectedOrder.delivery_method)}
                        </div>
                        {selectedOrder.address ? (
                          <>
                            <div className="mb-2">
                              <strong>Dirección:</strong> {selectedOrder.address.street} {selectedOrder.address.street_number}
                            </div>
                            <div className="mb-2">
                              <strong>Localidad:</strong> {selectedOrder.address.locality.name}
                            </div>
                            <div className="mb-2">
                              <strong>Código Postal:</strong> {selectedOrder.address.zip_code}
                            </div>
                            <div className="mb-2">
                              <strong>Referencia:</strong> {selectedOrder.address.name || 'Sin referencia'}
                            </div>
                          </>
                        ) : (
                          <div className="mb-2 text-muted">Retiro en local</div>
                        )}
                        <div className="mb-2">
                          <strong>Método de pago:</strong> {translatePaymentMethod(selectedOrder.payment_method)}
                        </div>
                        <div className="mb-2">
                          <strong>Estado del pago:</strong> 
                          <span className={`badge ms-2 ${selectedOrder.is_paid ? 'bg-success' : 'bg-warning'}`}>
                            {selectedOrder.is_paid ? 'Pagado' : 'Pendiente'}
                          </span>
                        </div>
                        {selectedOrder.notes && (
                          <div className="mb-2">
                            <strong>Notas:</strong> {selectedOrder.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="card">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="bi bi-list-ul me-2"></i>
                      Productos del Pedido
                    </h6>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-borderless mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Producto</th>
                            <th className="text-center">Cantidad</th>
                            <th className="text-end">Precio Unit.</th>
                            <th className="text-end">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Manufactured Items */}
                          {selectedOrder.details.map((detail) => (
                            <tr key={`manufactured-${detail.id_key}`}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-box-seam me-2 text-primary"></i>
                                  <span>{detail.manufactured_item.name}</span>
                                </div>
                              </td>
                              <td className="text-center">{detail.quantity}</td>
                              <td className="text-end">${detail.manufactured_item.price.toFixed(2)}</td>
                              <td className="text-end">${detail.subtotal.toFixed(2)}</td>
                            </tr>
                          ))}
                          
                          {/* Inventory Items */}
                          {selectedOrder.inventory_details.map((detail) => (
                            <tr key={`inventory-${detail.id_key}`}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-archive me-2 text-info"></i>
                                  <span>{detail.inventory_item.name}</span>
                                </div>
                              </td>
                              <td className="text-center">{detail.quantity}</td>
                              <td className="text-end">${detail.unit_price.toFixed(2)}</td>
                              <td className="text-end">${detail.subtotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <td colSpan={3} className="text-end fw-semibold">Subtotal:</td>
                            <td className="text-end fw-semibold">${selectedOrder.total.toFixed(2)}</td>
                          </tr>
                          {selectedOrder.discount > 0 && (
                            <tr>
                              <td colSpan={3} className="text-end fw-semibold text-success">Descuento:</td>
                              <td className="text-end fw-semibold text-success">-${selectedOrder.discount.toFixed(2)}</td>
                            </tr>
                          )}
                          <tr>
                            <td colSpan={3} className="text-end fw-bold">Total Final:</td>
                            <td className="text-end fw-bold">${selectedOrder.final_total.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDetailModal}>
                  Cerrar
                </button>
                {!selectedOrder.is_paid && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => handleMarkAsPaid(selectedOrder.id_key)}
                    disabled={processingOrderId === selectedOrder.id_key}
                  >
                    <i className="bi bi-cash me-2"></i>
                    {processingOrderId === selectedOrder.id_key ? 'Procesando...' : 'Marcar como Pagado'}
                  </button>
                )}
                {selectedOrder.status.toLowerCase() === 'a_confirmar' && (
                  <>
                    <button 
                      type="button" 
                      className="btn btn-info"
                      onClick={() => handleMoveToKitchen(selectedOrder.id_key)}
                      disabled={processingOrderId === selectedOrder.id_key}
                    >
                      <i className="bi bi-arrow-right me-2"></i>
                      {processingOrderId === selectedOrder.id_key ? 'Procesando...' : 'Enviar a Cocina'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-warning"
                      onClick={() => handleMoveToReady(selectedOrder.id_key)}
                      disabled={processingOrderId === selectedOrder.id_key}
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      {processingOrderId === selectedOrder.id_key ? 'Procesando...' : 'Marcar como Listo'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierOrders; 