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

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await cashierService.getAllOrders(offset, itemsPerPage);
      
      setOrders(response.data);
      setTotalItems(response.total);
      setHasNext(response.hasNext);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error al cargar los pedidos. Por favor, intente nuevamente.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
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

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    return (
      order.id_key.toString().includes(searchTerm) ||
      order.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.phone_number.includes(searchTerm) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.delivery_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Translate status to Spanish
  const translateStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'a_confirmar':
        return 'A confirmar';
      case 'a_cocina':
        return 'En cocina';
      case 'listo':
        return 'Listo';
      case 'en_delivery':
        return 'En delivery';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'a_confirmar':
        return 'bg-warning';
      case 'a_cocina':
        return 'bg-info';
      case 'listo':
        return 'bg-success';
      case 'en_delivery':
        return 'bg-primary';
      case 'entregado':
        return 'bg-secondary';
      case 'cancelado':
        return 'bg-danger';
      default:
        return 'bg-light text-dark';
    }
  };

  // Translate delivery method to Spanish
  const translateDeliveryMethod = (method: string) => {
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
              placeholder="Buscar por ID, cliente, estado, método..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6 d-flex justify-content-end align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Mostrar:</span>
            <select 
              className="form-select form-select-sm" 
              style={{width: 'auto'}}
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-muted small">por página</span>
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

      {/* Loading State */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Cargando...</span>
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                          {searchTerm ? 'No se encontraron pedidos que coincidan con la búsqueda' : 'No hay pedidos'}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr 
                          key={order.id_key} 
                          className="cursor-pointer"
                          onClick={() => handleOrderClick(order)}
                          style={{cursor: 'pointer'}}
                        >
                          <td className="px-4 py-3">
                            <div className="d-flex flex-column">
                              <span className="fw-semibold text-primary">#{order.id_key}</span>
                              <small className="text-muted">
                                {order.estimated_time} min estimado
                              </small>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex flex-column">
                              <span className="fw-semibold">{order.user.full_name}</span>
                              <small className="text-muted">{order.user.phone_number}</small>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge ${getStatusBadgeColor(order.status)}`}>
                              {translateStatus(order.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex flex-column">
                              <span>{translateDeliveryMethod(order.delivery_method)}</span>
                              <small className="text-muted">{translatePaymentMethod(order.payment_method)}</small>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex flex-column">
                              <span className="fw-semibold">${order.final_total.toFixed(2)}</span>
                              {order.discount > 0 && (
                                <small className="text-success">
                                  Desc: ${order.discount.toFixed(2)}
                                </small>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-muted small">{formatDate(order.date)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge ${order.is_paid ? 'bg-success' : 'bg-warning'} small`}>
                              {order.is_paid ? 'Pagado' : 'Pendiente'}
                            </span>
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
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted small">
                Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
              </div>
              <nav>
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
                {selectedOrder.status.toLowerCase() === 'a_confirmar' && (
                  <>
                    <button 
                      type="button" 
                      className="btn btn-success"
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